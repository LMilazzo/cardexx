from pathlib import Path


def purgeSubFolder(folder):

    folder = Path(folder)

    for file in folder.iterdir():
        if file.is_file():
            print(file)
            break
            file.unlink()

purgeSubFolder("Datasets\Yolo Fine Tuning\Images\train")
purgeSubFolder("Datasets/Yolo Fine Tuning/Images/valid")
purgeSubFolder("Datasets/Yolo Fine Tuning/Labels/train")
purgeSubFolder("Datasets/Yolo Fine Tuning/Labels/valid")