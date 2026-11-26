"""
Checks the AI service end to end with a TestClient (no server needed).
Run from the ai/service folder:   python tests/test_service.py
Needs the two .onnx files in ./models.
"""
import io
import os
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))

from fastapi.testclient import TestClient      # noqa: E402
from PIL import Image                           # noqa: E402

os.environ["MAX_UPLOAD_MB"] = "1"
import app as service                           # noqa: E402


def jpeg(size=(320, 240), colour="orange"):
    buf = io.BytesIO()
    Image.new("RGB", size, colour).save(buf, "JPEG")
    return buf.getvalue()


def post(client, data, ctype="image/jpeg", headers=None):
    return client.post("/inspect", files={"file": ("photo.jpg", data, ctype)}, headers=headers or {})


with TestClient(service.app) as c:
    r = c.get("/health"); assert r.status_code == 200 and r.json()["status"] == "ok", r.text
    print("health ok:", r.json())

    r = post(c, jpeg()); assert r.status_code == 200, r.text
    body = r.json()
    for key in ("image_width", "image_height", "items", "model_version", "elapsed_ms"):
        assert key in body, key
    it = body["items"][0]
    for key in ("fruit", "freshness", "stage", "confidence", "needs_confirmation", "bbox", "inspection_row"):
        assert key in it, key
    assert it["freshness"] in ("fresh", "rotten") and it["stage"] in ("fresh", "semi", "rotten")
    assert set(it["inspection_row"]) == {"predicted_label", "freshness_label", "confidence_score",
                                         "model_version", "confirmation_status"}
    print("plain orange picture ->", it["stage"], it["fruit"], f"{it['confidence']:.0%}",
          "| asks worker:", it["needs_confirmation"], "| took", body["elapsed_ms"], "ms")

    r = c.post("/inspect", files={"file": ("p.jpg", jpeg(), "image/jpeg")}, data={"expected_fruit": "banana"})
    it2 = r.json()["items"][0]
    if it2["fruit"] != "banana":
        assert it2["needs_confirmation"] and "you said banana" in it2["reason"] and it2["inspection_row"]["confirmation_status"] == "needs_review"
    print("expected_fruit check ok")
    assert post(c, jpeg(), "text/plain").status_code == 415;                       print("wrong type -> 415 ok")
    assert post(c, b"this is not an image").status_code == 400;                   print("fake image -> 400 ok")
    assert post(c, jpeg((2600, 2600), "white") + os.urandom(1_200_000)).status_code == 413; print("too big -> 413 ok")
    assert post(c, jpeg(), "image/png").status_code in (200, 400);                 # PNG label on a JPEG still decodes
    assert c.post("/inspect").status_code == 422;                                  print("no file -> 422 ok")

    service.API_KEY = "secret"
    assert post(c, jpeg()).status_code == 401
    assert post(c, jpeg(), headers={"x-api-key": "wrong"}).status_code == 401
    assert post(c, jpeg(), headers={"x-api-key": "secret"}).status_code == 200;    print("api key rules ok")
    service.API_KEY = ""
print("\nALL SERVICE CHECKS PASSED")
