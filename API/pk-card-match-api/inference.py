from fastapi import FastAPI, UploadFile, File, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import time
import faiss
from ultralytics import YOLO
from pydantic import BaseModel
from typing import Optional
import numpy as np
import base64
import cv2
import io
import re

#-------------------------------------------------------------------------

#Setup
app = FastAPI()

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     # allow your frontend origin(s)
    allow_credentials=True,
    allow_methods=["*"],       # allow POST, OPTIONS, etc.
    allow_headers=["*"],
)

encode_model = SentenceTransformer("clip-ViT-L-14")


#-------------------------------------------------------------------------

#Validation Model
class B64String(BaseModel):
    b64_string: str

#Helper for image encoding
def base64_encode(img: np.ndarray) -> str:
    _, buffer = cv2.imencode('.jpg', img)
    b = base64.b64encode(buffer).decode('utf-8')
    return b #the encoded string

#Helper for image decoding to PIL Image
def base64_decode_toImage(b64: str) -> Image:
    
    b64 = re.sub(r'^data:image/\w+;base64,', '', b64)
    image_data = base64.b64decode(b64)
    img = Image.open(io.BytesIO(image_data))
    return img #The PIL Image

#-------------------------------------------------------------------------
# END POINT TO GENERATE THE EMBEDDING FOR AN IMAGE
#-------------------------------------------------------------------------

#Validation model for output
class ImageEmbedding(BaseModel):
    Embedding: list[float]

#Encoding Function
@app.post("/encode-card-from-b64")
async def encodeCard(b64_string: B64String) -> ImageEmbedding:

    img = base64_decode_toImage(b64_string.b64_string)

    emb = encode_model.encode(img)

    return  ImageEmbedding(Embedding=emb.tolist())
