from ultralytics import YOLO
import os

#Model Load
model = YOLO("yolov8x.pt")

#Model Tain
results = model.train(
    data = "data.yaml",
    batch = 16,
    epochs=10,
    imgsz=256
)

#load trained model
model = YOLO("runs/detect/train/weights/best.pt")

#Calculate metrics
metrics = model.val(
    data = "data.yaml",
    split = "val",
    imgsz = 256,
    conf = 0.9
)