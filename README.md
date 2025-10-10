
# CLIP Card Retrieval

This repository provides a complete pipeline for card detection, embedding generation, and retrieval using CLIP and YOLO models. It includes an API, web application, dataset creation, model fine-tuning, and utility scripts for card-based image analysis. 


## Repository Structure

- **CreateYoloDataset.ipynb**: Jupyter notebook for creating a YOLO-compatible datasets from card images and background images, neither of which are included. The resulting dataset will contain images of card objects randomly pasted on a random background. Noise and filters are then applied for more randomness and to make training more robust.

- **generateEmbeddings.py**: Script to generate CLIP embeddings for card images this script will iterate through and generate embeddings for every set of Pokemon cards. This data will then be used as a reference library to match card detections for proper classification. This will take a while, and should be split into multiple sessions to avoid causing harm to the API used. 

- **API/pk-card-detection-API/**: Python API for card detection and retrieval.
	- `main.py`: Main API server.
	- `card_detection.pt`: YOLO model weights for card detection.
	- `MASTER_SET.parquet`: Parquet file containing the reference library generated with generateEmbeddings.py .
	- `dependencies.txt`: List of required Python packages for the API, specific versions were important to reproduce my exact results. Note that my personal device lacks a GPU so package versions were installed with this in mind so that they played nice with torch.
	- `nginx_config`: Example Nginx configuration for deployment on AWS EC2.
	- `README.md`: API-specific documentation for deploying on EC2.
- **App/**: Frontend web application for card retrieval.
	- `index.html`: Main HTML page.
	- `script.js`: Client-side logic for interacting with the API.
- **DatasetsAndModelTuning/**: Resources for dataset management and YOLO model fine-tuning.
	- `YoloFineTuning/`: Contains scripts, notebooks, images, labels, and training results for YOLO model tuning.
		- `trainYolo.ipynb`: Notebook for training YOLO models.
		- `purge.py`, `snapshotWindow.py`, `testWindow.py`: Utility scripts for dataset and training management. Windows test the object detection with your webcam and will display bounding boxes and confidence scores in real time. Snapshot window tested the auto cropping of the detections.
		- `images/`, `labels/`, `runs/`: Data and results folders.
- **ProofOfConcept/**: Notebooks and data for initial experiments and visualizations.
	- `testing_with_single_set.ipynb`: Test notebook for single card set.
	- `TSNE_ploting.ipynb`: Notebook for t-SNE visualization of embeddings.
	- `Data/`: Example datasets in pickle format.
- **Utils/**: Utility scripts for parsing, similarity calculation, and embedding generation.
	- `cardParser.py`: Card metadata parser.
	- `cosineSim.py`: Cosine similarity calculations for embeddings.
	- `generateSetEmbeddings.py`: Generate embeddings for card sets.
	- `img_utils.py`: Image processing utilities.
	- `FilenameToLower.py`: Filename normalization script.

## Getting Started

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/CLIPCardRetreival.git
cd CLIPCardRetreival
```

### 2. Install Dependencies

Install Python dependencies for the API (there may be more packages needed for using other scripts):

```sh
cd API/pk-card-detection-API
pip install -r dependencies.txt
```

### 3. Run the API using uvicorn in a virtual enviroment

```sh
uvicorn main:app
```

You can then follow the ip to the local host, add /docs to the end if you want to interact with the api in the browser. Some endpoints allow for adding files in the browser to get responses for example you can run the entire process by uploading an image to the /pipeline-file endpoint where a card will be detected processed and matched to the reference library top 5.

### 4. Use the Web App

Open `App/index.html` in your browser and connect to the running API. 

In `App/script.js` you may need to edit:

```js
const url = ""
```
To reflect the proper location of your running api.

Finally I launched the web app using a VSCode live server extension.


## Model Training & Dataset Creation

- Use `CreateYoloDataset.ipynb` to generate datasets for YOLO training.
    - This will not work as `Images/Backgrounds` which should contain ~50-100 random background images is empty to avoid unneccessary files. `Images/Cards` which contains images of random cards from the `pokemonapisdk` is also empty for the same reason.
- Fine-tune YOLO models in `DatasetsAndModelTuning/YoloFineTuning/trainYolo.ipynb`.
- Generate CLIP embeddings with `generateEmbeddings.py` and `Utils/generateSetEmbeddings.py`.

## Utilities

- Card parsing, similarity calculation, and image utilities are available in the `Utils/` folder.

## Results & Visualization

- Training results, confusion matrices, and performance curves are stored in `DatasetsAndModelTuning/YoloFineTuning/runs/`.
- t-SNE plots and experiment notebooks are in `ProofOfConcept/`.

## License

This project is licensed under the MIT License.

## Contact

For questions or contributions, contact me. :)
