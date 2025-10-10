
#Imports
from pokemontcgsdk import Card, Set, RestClient
from PIL import Image
from io import BytesIO
import requests
import pandas as pd
from sentence_transformers import SentenceTransformer
from Utils.cardParser import extractCore
import time
from requests.exceptions import ConnectionError, Timeout, HTTPError

"""
Utility functions to pull a set of cards from the 'pokemontcgsdk' and generate a dataset of those cards
containing core information as well as a vectorization of the image of each card
"""

def get_image(url, max_retries=5, delay=2, timeout=10, headers=None):
    
    if headers is None:
        headers = {"User-Agent": "Mozilla/5.0"}

    for attempt in range(1, max_retries + 1):
        try:
            response = requests.get(url, timeout=timeout, headers=headers)
            response.raise_for_status()  # raise for 4xx/5xx errors
            return response
        except (ConnectionError, Timeout) as e:
            print(f"[Attempt {attempt}] Connection error: {e}. Retrying in {delay}s...")
            time.sleep(delay)
        except HTTPError as e:
            # Don't retry for HTTP errors like 404
            print(f"HTTP error {e.response.status_code} for URL: {url}")
            raise
    # If all retries fail
    raise Exception(f"Failed to fetch URL after {max_retries} attempts: {url}")

def generate(set_to_generate, CLIP_model):

    print("Generating Set: ", set_to_generate)

    try:

        set = Card.where(q=f"set.id:{set_to_generate}")
    
    except Exception as e:
        print("Error fetching set: ", set_to_generate, " Error: " )
        return

    setdf = pd.DataFrame(columns=["id", "name", "rarity", "superType", "set_id", "img_path_large", "img_path_small", "card_class_dump"])

    for card in set:
        setdf.loc[len(setdf)] = extractCore(card)

    Set_Embeddings = []

    for index, card in setdf.iterrows():
        response = get_image(card["img_path_small"]).content
        img = Image.open(BytesIO(response))
        embedding = CLIP_model.encode(img)
        Set_Embeddings.append(embedding)
        time.sleep(0.5)

    setdf["embedding"] = Set_Embeddings

    setdf.to_parquet(f"Datasets/parquets/{set_to_generate}_card_data.parquet")