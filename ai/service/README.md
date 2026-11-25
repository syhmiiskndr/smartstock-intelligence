# SmartStock AI service (vision)

One photo in, JSON out: which fruit, fresh / semi-fresh / rotten, where it is in the photo, and whether a worker
should double-check. Runs the two ONNX models from `ml/vision` with onnxruntime (no PyTorch needed).

## Run it on your computer (Windows, PowerShell)

```powershell
cd ai\service
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python tests\test_service.py        # should end with: ALL SERVICE CHECKS PASSED
python -m uvicorn app:app --port 8000
```

Then open http://127.0.0.1:8000/docs - click **POST /inspect**, **Try it out**, choose a photo, **Execute**.

The two model files are **not in Git** (too big, see `.gitignore`). Copy them into `ai/service/models/`:
`detector.onnx` and `freshness_cls.onnx` (made by `python export_onnx.py` in `ml/vision`).

## Calling it

`POST /inspect` - multipart form: `file` (JPEG/PNG/WebP, max 10 MB) and optional `expected_fruit` (e.g. `banana`).

**Always send `expected_fruit` when the worker has already picked the product.** The model only knows apple,
banana and orange; a tomato or papaya would otherwise be called one of those. With `expected_fruit`, a different
fruit is sent for a worker check instead of being accepted.

Result (shortened):

```json
{
  "model_version": "freshness_v4", "elapsed_ms": 340, "image_width": 1200, "image_height": 900,
  "items": [{
    "fruit": "banana", "freshness": "fresh", "stage": "semi",
    "confidence": 0.97, "needs_confirmation": true, "reason": "semi-fresh - use soon, please confirm",
    "bbox": {"x1": 120, "y1": 80, "x2": 640, "y2": 700, "width": 520, "height": 620, "area": 322400},
    "bbox_norm": {"width": 0.43, "height": 0.69, "area": 0.30}, "mean_rgb": [201, 180, 60],
    "inspection_row": {"predicted_label": "semi_banana", "freshness_label": "fresh", "confidence_score": 0.97,
                       "model_version": "freshness_v4", "confirmation_status": "needs_review"}
  }]
}
```

- `freshness` is only `fresh` or `rotten` (a semi-fresh item counts as `fresh`). `stage` is `fresh`, `semi` or `rotten`.
- `needs_confirmation: true` means show it to a worker (unsure, semi-fresh, fruit not clearly found, wrong fruit...).
- `inspection_row` has the values for the `inspections` table. `bbox` / `mean_rgb` feed the weight estimate later.
- Several fruits in one photo come back as several `items`, biggest first.
- Errors: 400 not a photo, 401 wrong key, 413 too big, 415 wrong file type, 500 could not analyse.

## Settings (environment variables, all optional)

| Name | What it does |
|---|---|
| `AI_SERVICE_KEY` | if set, callers must send header `x-api-key` with this value |
| `ALLOWED_ORIGINS` | comma-separated website addresses allowed to call it from a browser |
| `MAX_UPLOAD_MB` | biggest photo (default 10) |
| `MAX_CONCURRENT` | photos processed at once (default 2) |
| `MODELS_DIR` | where the `.onnx` files are (default `./models`) |
| `VISION_MODEL_VERSION` | text saved in `inspections.model_version` (default `freshness_v4`) |

Keep `AI_SERVICE_KEY` on the server side. Do not put it in the website code, because anyone can read that.

## Known limits (measured in `ml/vision`)

- Only apple, banana, orange. Use `expected_fruit`.
- On 2,515 outside banana/orange photos (before the pile check below): about 5.7% of rotten fruit was accepted as
  fresh without a worker check, and about 21% of photos were sent to a worker. With the pile check at 0.67, about
  27% are sent to a worker and about 1.1% of rotten photos are accepted as fresh.
- Piles and crowded trays are not supported. The detector merges fruit into giant boxes and one verdict covers
  the whole box. Each item has `tile_disagree` (share of 3x3 tiles that disagree with the verdict); at 0.67 or
  more the item is sent to a worker. This catches only some piles. Ask workers to photograph a few fruit at a
  time, and do not use a merged box for weight estimates (`boxes_merged` > 1 means several fruit in one box).
- Fruit that is tiny in a cluttered photo is unreliable (45% in the stress test). Ask for the fruit to fill the frame.
- Uploading the photo to storage (`inspections.image_url`) is not done here.
