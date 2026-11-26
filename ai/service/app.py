"""
SmartStock AI service - the vision endpoint.

    POST /inspect   photo in (multipart field "file"), JSON out: fruit, freshness, stage, box, confidence
    GET  /health    is the service up and are the models loaded

Run it (from this folder, venv active):
    python -m uvicorn app:app --port 8000
Docs page you can click around in:  http://127.0.0.1:8000/docs

Settings (environment variables, all optional):
    AI_SERVICE_KEY      if set, every /inspect call must send the header  x-api-key: <that value>
    ALLOWED_ORIGINS     comma-separated website addresses allowed to call this from a browser
    MAX_UPLOAD_MB       biggest photo accepted (default 10)
    MAX_CONCURRENT      photos processed at the same time (default 2; keeps memory small on cheap servers)
    MODELS_DIR          folder with detector.onnx and freshness_cls.onnx (default ./models)
    VISION_MODEL_VERSION  text stored in inspections.model_version (default freshness_v4)
"""
import hmac
import io
import os
import sys
import threading
import time
from contextlib import asynccontextmanager
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE / "vision"))          # the vision code (predict_vision.py etc.) lives here

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile       # noqa: E402
from fastapi.middleware.cors import CORSMiddleware                          # noqa: E402
from PIL import Image, UnidentifiedImageError                               # noqa: E402

from predict_vision import VisionInspector                                  # noqa: E402

MODEL_VERSION = os.getenv("VISION_MODEL_VERSION", "freshness_v4")
MODELS_DIR = Path(os.getenv("MODELS_DIR", HERE / "models"))
MAX_BYTES = int(float(os.getenv("MAX_UPLOAD_MB", "10")) * 1024 * 1024)
API_KEY = os.getenv("AI_SERVICE_KEY", "")
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
Image.MAX_IMAGE_PIXELS = 60_000_000               # refuse "decompression bomb" images

state = {"inspector": None}
slots = threading.Semaphore(int(os.getenv("MAX_CONCURRENT", "2")))


@asynccontextmanager
async def lifespan(app):
    state["inspector"] = VisionInspector(backend="onnx", models_dir=MODELS_DIR)   # loaded once, reused
    yield


app = FastAPI(title="SmartStock AI service", version=MODEL_VERSION, lifespan=lifespan)

origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
if origins:
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET", "POST"],
                       allow_headers=["x-api-key", "content-type"])


def _row(item):
    """The values that go into one `inspections` row (see the database schema)."""
    return dict(
        predicted_label=item["classifier_label"],           # e.g. "semi_banana"
        freshness_label=item["freshness"],                  # "fresh" | "rotten" (the table's existing meaning)
        confidence_score=item["confidence"],
        model_version=MODEL_VERSION,
        confirmation_status="needs_review" if item["needs_confirmation"] else "auto_accepted",
    )


@app.get("/health")
def health():
    return {"status": "ok" if state["inspector"] else "starting", "model_version": MODEL_VERSION}


@app.post("/inspect")
def inspect(file: UploadFile = File(...), expected_fruit: str = Form(default=""), x_api_key: str = Header(default="")):
    """expected_fruit (optional): the fruit the worker says this is, e.g. "banana". If the model sees a different
    fruit, the item is sent for a worker check. Strongly recommended: the model only knows apple, banana and
    orange, and a tomato or a papaya will otherwise be called one of those."""
    if API_KEY and not hmac.compare_digest(x_api_key, API_KEY):
        raise HTTPException(401, "missing or wrong x-api-key")
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(415, f"send a JPEG, PNG or WebP photo (got '{file.content_type}')")
    data = file.file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, f"photo is bigger than {MAX_BYTES // (1024 * 1024)} MB")
    try:
        Image.open(io.BytesIO(data)).verify()              # is it really an image?
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, SyntaxError):
        raise HTTPException(400, "that file is not a readable photo")

    start = time.perf_counter()
    with slots:
        try:
            result = state["inspector"].inspect(data)
        except Exception:                                   # never leak internals to the caller
            raise HTTPException(500, "could not analyse this photo")
    expected = expected_fruit.strip().lower()
    for item in result["items"]:
        if expected and item["fruit"] != expected:
            note = f"you said {expected}, the model sees {item['fruit']} - please check"
            item["needs_confirmation"] = True
            item["reason"] = f"{note}; {item['reason']}" if item["reason"] else note
        item["inspection_row"] = _row(item)
    result["model_version"] = MODEL_VERSION
    result["elapsed_ms"] = round((time.perf_counter() - start) * 1000)
    return result
