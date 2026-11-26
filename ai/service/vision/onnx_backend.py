"""
onnx_backend.py - run the two vision models WITHOUT PyTorch (for the deployed AI service).

Needs only numpy, pillow and onnxruntime, which keeps the server small and cheap.
Make the .onnx files once with:  python export_onnx.py
"""
import ast
from pathlib import Path

import numpy as np
from PIL import Image


def _session(path):
    import onnxruntime as ort
    opts = ort.SessionOptions()
    opts.intra_op_num_threads = 2
    opts.enable_cpu_mem_arena = False        # lower memory use on small servers
    sess = ort.InferenceSession(str(path), opts, providers=["CPUExecutionProvider"])
    meta = sess.get_modelmeta().custom_metadata_map          # Ultralytics stores names/imgsz here
    names = {int(k): v for k, v in ast.literal_eval(meta["names"]).items()}
    imgsz = ast.literal_eval(meta["imgsz"])
    return sess, names, imgsz


def _nms(boxes, scores, iou=0.7):
    order = scores.argsort()[::-1]
    keep = []
    while order.size:
        i = order[0]
        keep.append(i)
        xx1 = np.maximum(boxes[i, 0], boxes[order[1:], 0]); yy1 = np.maximum(boxes[i, 1], boxes[order[1:], 1])
        xx2 = np.minimum(boxes[i, 2], boxes[order[1:], 2]); yy2 = np.minimum(boxes[i, 3], boxes[order[1:], 3])
        inter = np.clip(xx2 - xx1, 0, None) * np.clip(yy2 - yy1, 0, None)
        area = lambda b: (b[:, 2] - b[:, 0]) * (b[:, 3] - b[:, 1])
        ov = inter / (area(boxes[i:i + 1]) + area(boxes[order[1:]]) - inter + 1e-9)
        order = order[1:][ov <= iou]
    return keep


class OnnxBackend:
    def __init__(self, detector_onnx, classifier_onnx):
        self.det, self.det_names, det_sz = _session(detector_onnx)
        self.cls, self.cls_names, cls_sz = _session(classifier_onnx)
        self.det_size = int(det_sz[0])
        self.cls_size = int(cls_sz[0])

    # ---- detector: letterbox like Ultralytics (keep aspect, pad to a multiple of 32 with grey 114)
    def detect(self, img, class_ids, conf):
        w0, h0 = img.size
        r = min(self.det_size / h0, self.det_size / w0)
        nw, nh = round(w0 * r), round(h0 * r)
        dw, dh = (self.det_size - nw) % 32 / 2, (self.det_size - nh) % 32 / 2
        left, top = round(dw - 0.1), round(dh - 0.1)
        W, H = nw + left + round(dw + 0.1), nh + top + round(dh + 0.1)
        canvas = Image.new("RGB", (W, H), (114, 114, 114))
        canvas.paste(img.resize((nw, nh), Image.Resampling.BILINEAR), (left, top))
        x = np.asarray(canvas, dtype=np.float32).transpose(2, 0, 1)[None] / 255.0

        out = self.det.run(None, {self.det.get_inputs()[0].name: x})[0][0]   # (4 + classes, N)
        boxes_cxcywh, scores = out[:4].T, out[4:].T
        best = scores.argmax(1)
        best_conf = scores[np.arange(len(best)), best]
        keep = (best_conf > conf) & np.isin(best, list(class_ids))
        if not keep.any():
            return []
        b, c, s = boxes_cxcywh[keep], best[keep], best_conf[keep]
        xyxy = np.stack([b[:, 0] - b[:, 2] / 2, b[:, 1] - b[:, 3] / 2,
                         b[:, 0] + b[:, 2] / 2, b[:, 1] + b[:, 3] / 2], 1)
        shifted = xyxy + (c[:, None] * 7680.0)                  # per-class NMS, like Ultralytics
        idx = _nms(shifted, s)[:300]
        xyxy = (xyxy[idx] - [left, top, left, top]) / r
        xyxy[:, [0, 2]] = xyxy[:, [0, 2]].clip(0, w0)
        xyxy[:, [1, 3]] = xyxy[:, [1, 3]].clip(0, h0)
        return [(int(c[i]), float(s[i]), [float(v) for v in xy]) for i, xy in zip(idx, xyxy)]

    # ---- classifier: shorter side to 224, centre crop 224, scale 0-1 (Ultralytics' recipe)
    def classify(self, img):
        S = self.cls_size
        w, h = img.size
        if w <= h:
            nw, nh = S, int(S * h / w)
        else:
            nw, nh = int(S * w / h), S
        im = img.resize((nw, nh), Image.Resampling.BILINEAR)
        top, left = int(round((nh - S) / 2.0)), int(round((nw - S) / 2.0))
        im = im.crop((left, top, left + S, top + S))
        x = np.asarray(im, dtype=np.float32).transpose(2, 0, 1)[None] / 255.0
        probs = self.cls.run(None, {self.cls.get_inputs()[0].name: x})[0][0]
        k = int(probs.argmax())
        return self.cls_names[k], float(probs[k])
