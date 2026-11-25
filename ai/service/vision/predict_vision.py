"""
predict_vision.py - one photo in, app-ready result out.

    from predict_vision import VisionInspector
    inspector = VisionInspector()              # load once when the backend starts
    result = inspector.inspect("photo.jpg")    # or the uploaded bytes, or a PIL image

How it works:
  1. ready-made YOLO finds apples / bananas / oranges and draws boxes (fruit type + box).
     It does not know "rotten", so it often calls rotten fruit cake / donut / sandwich: boxes with those
     food-shaped labels are accepted too (box_source = "food-lookalike") unless they sit on a fruit box
  2. overlapping boxes of the same fruit (a bunch) are merged into one group
  3. your trained classifier looks at each cut-out: fresh or rotten (and which fruit it thinks it is)
  4. fruit + freshness come from your classifier; the detector only supplies the box. The v4 classifier has three
     stages per fruit (fresh / semi / rotten); `freshness` stays fresh|rotten for the app, `stage` has all three.
     needs_confirmation = True if the classifier is unsure, the two disagree on the fruit,
     the box was only faintly detected, no box was found, or a food-lookalike box is not 90%+ certain

Each item maps onto the `inspections` table:
  classifier_label -> predicted_label, freshness -> freshness_label, confidence -> confidence_score,
  bbox width/height/area -> bbox_*, mean_rgb -> mean_r/g/b,
  needs_confirmation -> confirmation_status ('needs_review' if True, else 'auto_accepted')
bbox and mean_rgb are also the inputs for the weight-estimation model (next phase).

CLI:  python predict_vision.py path\\to\\photo.jpg     (prints JSON, saves an annotated copy in reports/)
"""
import io
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageOps

from common import CLASSIFIER, DETECTOR, FRUITS, HERE, MODELS, padded_crop

CONFIRM_BELOW = 0.70     # ask the worker when the freshness model is less sure than this
DETECT_CONF = 0.30
MAX_SIDE = 1600          # big phone photos are shrunk first (faster; same answers)
RETRY_CONF = 0.10       # second, weaker try when nothing is found (rotten fruit is harder to spot)
# COCO has no "rotten fruit". On Kaggle photos the detector called rotten apples "cake"/"donut" and rotten
# oranges "donut"/"cake". Boxes with these food-shaped labels count as possible fruit; your freshness model
# then decides what is inside. The classifier has no "not a fruit" answer, so a real cake could slip through:
# that is why a food-lookalike box must be LOOKALIKE_CONFIRM_BELOW-sure or the worker is asked.
FOOD_LOOKALIKES = ["cake", "donut", "sandwich", "hot dog", "pizza", "broccoli", "carrot"]
FOOD_CONF = 0.10
LOOKALIKE_CONFIRM_BELOW = 0.90
# The v4 classifier also knows a middle stage, "semi" (semi-fresh, use soon). The app-facing field `freshness`
# stays "fresh" or "rotten" exactly as before (semi is reported as "fresh"), and the new field `stage` carries
# "fresh" / "semi" / "rotten". With SEMI_NEEDS_CONFIRM a semi-fresh item is also sent for a quick worker check.
SEMI_NEEDS_CONFIRM = True
# A wrong "fresh" is the costly mistake (a spoiled item gets accepted), a wrong "rotten" only costs a recheck.
# So a "fresh" answer must be at least this sure, or the worker is asked. On 2,515 outside photos (FruitVision)
# this cut rotten fruit accepted as fresh from 10.7% to 5.7% for about 7 extra worker checks per 100 photos.
FRESH_CONFIRM_BELOW = 0.90
# Pile / mixed-ripeness guard: the box is cut into 3x3 tiles and each tile is classified. If at least
# this share of tiles disagree with the whole-box verdict (rotten vs not rotten), the box is probably a
# pile or a mix, so the worker is asked. Measured on 49 single-fruit photos: ~5% of correct photos flagged,
# 5 of 6 wrong verdicts caught. Set to 1.01 to switch off.
TILE_DISAGREE_ABOVE = 0.50
MIN_TILE_PX = 48


def _freshness(state):
    """App-facing label: only 'fresh' or 'rotten' (a semi-fresh item counts as fresh; see `stage`)."""
    return "rotten" if state == "rotten" else "fresh"


def _iou_or_contained(a, b):
    ix = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
    iy = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = ix * iy
    area = lambda r: (r[2] - r[0]) * (r[3] - r[1])
    union = area(a) + area(b) - inter
    return inter / union > 0.30 or inter / min(area(a), area(b)) > 0.60


def merge_boxes(boxes):
    """boxes: list of (xyxy, conf). Overlapping ones become one group box (union)."""
    groups = [([list(b)], c) for b, c in boxes]
    merged = True
    while merged:
        merged = False
        for i in range(len(groups)):
            for j in range(i + 1, len(groups)):
                bi = _union(groups[i][0]); bj = _union(groups[j][0])
                if _iou_or_contained(bi, bj):
                    groups[i] = (groups[i][0] + groups[j][0], max(groups[i][1], groups[j][1]))
                    del groups[j]
                    merged = True
                    break
            if merged:
                break
    return [(_union(members), conf, len(members)) for members, conf in groups]


def _union(members):
    return [min(m[0] for m in members), min(m[1] for m in members),
            max(m[2] for m in members), max(m[3] for m in members)]


def _open(image):
    if isinstance(image, Image.Image):
        img = image
    elif isinstance(image, (bytes, bytearray)):
        img = Image.open(io.BytesIO(image))
    else:
        img = Image.open(image)
    if img.format == "JPEG" and max(img.size) > MAX_SIDE:   # decode big JPEGs at reduced size (saves memory)
        s = MAX_SIDE / max(img.size)
        img.draft("RGB", (int(img.width * s), int(img.height * s)))
    return ImageOps.exif_transpose(img).convert("RGB")


def _mean_rgb(img, box):
    """Average colour of the middle 60% of the box (less background than the full box)."""
    x1, y1, x2, y2 = box
    w, h = x2 - x1, y2 - y1
    core = img.crop((x1 + 0.2 * w, y1 + 0.2 * h, x2 - 0.2 * w, y2 - 0.2 * h)).resize((32, 32))
    return [round(float(v)) for v in np.asarray(core, dtype=float).reshape(-1, 3).mean(axis=0)]


class TorchBackend:
    """Runs the .pt models with Ultralytics/PyTorch (used on your laptop)."""
    def __init__(self, detector, classifier):
        from ultralytics import YOLO
        self.det, self.cls = YOLO(str(detector)), YOLO(str(classifier))
        self.det_names, self.cls_names = self.det.names, self.cls.names

    def detect(self, img, class_ids, conf):
        r = self.det.predict(img, classes=list(class_ids), conf=conf, verbose=False)[0]
        return [(int(c), float(p), b) for c, p, b in
                zip(r.boxes.cls.tolist(), r.boxes.conf.tolist(), r.boxes.xyxy.tolist())]

    def classify(self, img):
        r = self.cls.predict(img, imgsz=224, verbose=False)[0]
        return r.names[r.probs.top1], float(r.probs.top1conf)


class VisionInspector:
    """backend="torch" uses the .pt files; backend="onnx" uses models/*.onnx (no PyTorch needed)."""
    def __init__(self, detector=DETECTOR, classifier=CLASSIFIER, backend="torch", models_dir=MODELS):
        if not isinstance(backend, str):          # a ready-made backend object (used by tests)
            self.backend = backend
        elif backend == "onnx":
            from onnx_backend import OnnxBackend
            det, cls = Path(models_dir) / "detector.onnx", Path(models_dir) / "freshness_cls.onnx"
            for f in (det, cls):
                if not f.exists():
                    raise FileNotFoundError(f"{f} not found - run export_onnx.py first.")
            self.backend = OnnxBackend(det, cls)
        else:
            if not Path(classifier).exists():
                raise FileNotFoundError(f"{classifier} not found - run train_freshness.py first.")
            self.backend = TorchBackend(detector, classifier)
        by_name = {name: i for i, name in self.backend.det_names.items()}
        self.ids = {f: by_name[f] for f in FRUITS}
        self.fruit_of = {v: k for k, v in self.ids.items()}
        self.food_ids = {f: by_name[f] for f in FOOD_LOOKALIKES if f in by_name}
        self.food_of = {v: k for k, v in self.food_ids.items()}

    def _classify(self, img):
        label, conf = self.backend.classify(img)              # e.g. "rotten_banana", 0.97
        state, fruit = label.split("_", 1)                    # state: "fresh" | "semi" | "rotten"
        return label, state, fruit, conf

    def _tile_disagreement(self, img, box, state, n=3):
        x1, y1, x2, y2 = [int(v) for v in box]
        w, h = (x2 - x1) / n, (y2 - y1) / n
        if min(w, h) < MIN_TILE_PX:
            return None
        whole_rotten = state == "rotten"
        bad = 0
        for i in range(n):
            for j in range(n):
                t = img.crop((int(x1 + j * w), int(y1 + i * h), int(x1 + (j + 1) * w), int(y1 + (i + 1) * h)))
                if (self._classify(t)[1] == "rotten") != whole_rotten:
                    bad += 1
        return bad / (n * n)

    def _item(self, img, box, det_conf, n, detector_fruit, detector_label, source, extra_reasons=()):
        label, state, cls_fruit, cls_conf = self._classify(padded_crop(img, box))
        # The detector's job is the box. Fruit name and freshness come from your trained
        # model, which is far better at both (it names rotten fruit correctly).
        reasons = list(extra_reasons)
        tile_dis = self._tile_disagreement(img, box, state)
        if tile_dis is not None and tile_dis >= TILE_DISAGREE_ABOVE:
            reasons.append(f"{tile_dis:.0%} of this box looks different from the verdict - a pile or mixed "
                           "fruit? photograph a few fruit at a time")
        if state == "semi" and SEMI_NEEDS_CONFIRM:
            reasons.append("semi-fresh - use soon, please confirm")
        if state == "fresh" and cls_conf < FRESH_CONFIRM_BELOW:
            reasons.append(f"'fresh' only {cls_conf:.0%} sure - please check for rot")
        if source == "fruit":
            if cls_fruit != detector_fruit:
                reasons.insert(0, f"box looked like {detector_fruit}, model says {cls_fruit}")
            if cls_conf < CONFIRM_BELOW:
                reasons.append(f"low confidence ({cls_conf:.0%})")
        elif cls_conf < LOOKALIKE_CONFIRM_BELOW:
            reasons.append(f"box was detected as '{detector_label}', not a fruit label, and the model is only "
                           f"{cls_conf:.0%} sure - check it is really {cls_fruit}")
        x1, y1, x2, y2 = box
        w, h = x2 - x1, y2 - y1
        return dict(
            fruit=cls_fruit, detector_fruit=detector_fruit, freshness=_freshness(state), stage=state,
            confidence=round(cls_conf, 3),
            needs_confirmation=bool(reasons), reason="; ".join(reasons) or None,
            detector_conf=round(det_conf, 3), classifier_label=label,
            classifier_conf=round(cls_conf, 3), boxes_merged=n, tile_disagree=None if tile_dis is None else round(tile_dis, 2),
            box_source=source, detector_label=detector_label,
            bbox=dict(x1=round(x1), y1=round(y1), x2=round(x2), y2=round(y2),
                      width=round(w, 1), height=round(h, 1), area=round(w * h)),
            bbox_norm=dict(width=round(w / img.width, 4), height=round(h / img.height, 4),
                           area=round(w * h / (img.width * img.height), 4)),
            mean_rgb=_mean_rgb(img, box),
        )

    def inspect(self, image):
        img = _open(image)
        img.thumbnail((MAX_SIDE, MAX_SIDE))
        ids = list(self.ids.values())
        dets = self.backend.detect(img, ids, DETECT_CONF)
        # food-shaped boxes (rotten fruit often gets these labels); drop any that sit on a fruit box
        foods = self.backend.detect(img, list(self.food_ids.values()), FOOD_CONF) if self.food_ids else []
        foods = [(c, p, b) for c, p, b in foods if not any(_iou_or_contained(b, fb) for _, _, fb in dets)]
        weak = False
        if not dets and not foods:
            dets = self.backend.detect(img, ids, RETRY_CONF)
            weak = bool(dets)
        by_fruit = {}
        for c, p, b in dets:
            by_fruit.setdefault(self.fruit_of[c], []).append((b, p))

        items = []
        for fruit, boxes in by_fruit.items():
            for box, det_conf, n in merge_boxes(boxes):
                extra = ["fruit only faintly detected - check the box"] if weak else []
                items.append(self._item(img, box, det_conf, n, fruit, fruit, "fruit", extra))
        for box, det_conf, n in merge_boxes([(b, p) for _, p, b in foods]):
            name = max((f for f in foods if _iou_or_contained(box, f[2])), key=lambda f: f[1])
            items.append(self._item(img, box, det_conf, n, None, self.food_of[name[0]], "food-lookalike"))

        if not items:   # nothing found: still give a guess, but the worker must confirm / type it in
            label, state, cls_fruit, cls_conf = self._classify(img)
            items.append(dict(
                fruit=cls_fruit, detector_fruit=None, freshness=_freshness(state), stage=state,
                confidence=round(cls_conf, 3),
                needs_confirmation=True, reason="no fruit box found - please confirm or enter manually",
                detector_conf=0.0, classifier_label=label, classifier_conf=round(cls_conf, 3),
                boxes_merged=0, box_source=None, detector_label=None, bbox=None, bbox_norm=None, mean_rgb=None,
            ))
        items.sort(key=lambda it: -(it["bbox"] or {"area": 0})["area"])
        return dict(image_width=img.width, image_height=img.height, items=items)

    @staticmethod
    def draw(image, result):
        img = _open(image).copy()
        img.thumbnail((MAX_SIDE, MAX_SIDE))
        d = ImageDraw.Draw(img)
        lw = max(2, img.width // 300)
        for it in result["items"]:
            if not it["bbox"]:
                continue
            b = it["bbox"]
            colour = "#d98c00" if it["needs_confirmation"] else ("#1a8f3c" if it["freshness"] == "fresh" else "#c62828")
            d.rectangle([b["x1"], b["y1"], b["x2"], b["y2"]], outline=colour, width=lw)
            text = f"{it.get('stage', it['freshness'])} {it['fruit']} {it['confidence']:.0%}" + (" - CHECK" if it["needs_confirmation"] else "")
            tw = d.textlength(text)
            d.rectangle([b["x1"], max(0, b["y1"] - 14), b["x1"] + tw + 6, max(14, b["y1"])], fill=colour)
            d.text((b["x1"] + 3, max(0, b["y1"] - 13)), text, fill="white")
        return img


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("Usage: python predict_vision.py path\\to\\photo.jpg [more photos...] [--onnx]")
    args = [a for a in sys.argv[1:] if a != "--onnx"]
    inspector = VisionInspector(backend="onnx" if "--onnx" in sys.argv else "torch")
    (HERE / "reports").mkdir(exist_ok=True)
    for path in args:
        result = inspector.inspect(path)
        print(f"\n=== {path}")
        print(json.dumps(result, indent=2))
        out = HERE / "reports" / f"prediction_{Path(path).stem}.jpg"
        VisionInspector.draw(path, result).save(out, quality=90)
        print(f"Annotated copy: {out}")
