"""Settings shared by every vision script."""
from pathlib import Path

HERE = Path(__file__).parent
MODELS = HERE / "models"
DETECTOR = "yolo11s.pt"          # ready-made COCO model; downloads itself on first use
CLASSIFIER = MODELS / "freshness_cls.pt"

FRUITS = ["apple", "banana", "orange"]   # the COCO model knows these three
CROP_PAD = 0.08                  # add 8% around each box so the edges of the fruit stay in the crop
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def coco_ids(model):
    """{'apple': 47, ...} looked up by name, so it works with any COCO-trained YOLO."""
    by_name = {name: i for i, name in model.names.items()}
    return {f: by_name[f] for f in FRUITS}


def padded_crop(img, box, pad=CROP_PAD):
    """Crop a PIL image to box (x1, y1, x2, y2) plus padding, clamped to the image."""
    x1, y1, x2, y2 = box
    w, h = x2 - x1, y2 - y1
    return img.crop((max(0, x1 - w * pad), max(0, y1 - h * pad),
                     min(img.width, x2 + w * pad), min(img.height, y2 + h * pad)))
