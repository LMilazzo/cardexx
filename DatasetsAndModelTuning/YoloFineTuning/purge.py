from pathlib import Path

#Used To destroy all artificially training images to create new training sets

def purgeSubFolder(folder):

    folder = Path(folder)

    for file in folder.iterdir():
        if file.is_file():
            file.unlink()

purgeSubFolder("Datasets\Yolo Fine Tuning\Images\train")
purgeSubFolder("Datasets/Yolo Fine Tuning/Images/valid")
purgeSubFolder("Datasets/Yolo Fine Tuning/Labels/train")
purgeSubFolder("Datasets/Yolo Fine Tuning/Labels/valid")