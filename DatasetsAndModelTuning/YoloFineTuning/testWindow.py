from ultralytics import YOLO
import cv2
import os

# Load the model
print("Current directory:", os.getcwd())
model = YOLO("Datasets/YoloFineTuning/runs/detect/train2/weights/best.pt")  # Adjust if needed

# Open webcam
cap = cv2.VideoCapture(0)

# Check camera access
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

while True:
    success, frame = cap.read()
    if not success:
        break

    # Run detection (disable show=True to avoid flashing)
    results = model.predict(source=frame, conf=0.1, verbose=False)

    # Draw results manually
    for result in results:
        for box in result.boxes:
            # Bounding box coordinates
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            # Confidence and class
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            label = f"{model.names[cls]} {conf:.2f}"

            # Draw box and label
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, label, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    # Show frame in a persistent window
    cv2.imshow("YOLOv8 Webcam Detection", frame)

    # Press 'q' to exit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
