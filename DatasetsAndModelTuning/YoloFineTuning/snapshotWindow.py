from ultralytics import YOLO
import cv2
import os

# Load the model
model = YOLO("runs/detect/train2/weights/best.pt")

# Open webcam
cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)  # set width
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)  # set height

# Directory to save snapshots
snapshot_dir = "windowTesting/snapshots"
os.makedirs(snapshot_dir, exist_ok=True)
snapshot_count = 0
snapshot_taken = False

while True:
    success, frame = cap.read()
    if not success:
        break

    # Run detection (returns a list of results, one per image - here just one frame)
    results = model.predict(source=frame, conf=0.75, verbose=False)  # verbose=False to reduce output

    # Process detections
    for result in results:
        # result.boxes.xyxy contains bounding boxes in [x1, y1, x2, y2] format
        boxes = result.boxes.xyxy.cpu().numpy() if hasattr(result, "boxes") else []
        
        for box in boxes:
            x1, y1, x2, y2 = map(int, box)

            # Crop detected card from frame
            cropped = frame[y1:y2, x1:x2]
            crop_resized = cv2.resize(cropped, (720, 1280), interpolation=cv2.INTER_CUBIC)

            # Save cropped image
            snapshot_path = os.path.join(snapshot_dir, f"card_{snapshot_count}.png")
            cv2.imwrite(snapshot_path, cropped)
            print(f"Saved snapshot: {snapshot_path}")
            snapshot_count += 1            

            # Optional: draw box on original frame for display
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

            snapshot_taken = True
            break
        
        if snapshot_taken:
            break
    if snapshot_taken:
        break

    # Show frame with bounding boxes
    cv2.imshow("YOLO Detection", frame)

    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
