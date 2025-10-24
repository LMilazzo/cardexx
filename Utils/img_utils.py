
from PIL import Image, ImageDraw, ImageEnhance
import pillow_heif
import glob
import os
import random
import numpy as np

#Custom Functions for editing and creating images for training etc...

#Adds random noise with max noise level = noise_level
def addNoise(img, noise_level=10):
  
    arr = np.array(img).astype(np.float32)
    
    noise = np.random.normal(0, noise_level, arr.shape)
    
    arr += noise
    arr = np.clip(arr, 0, 255).astype(np.uint8)
    
    return Image.fromarray(arr)

#Adds random brightness transformations to mimic glare and low light enviroments
def adjustBrightness(image, factor=None):
    
    if factor is None:
        factor = random.uniform(0.5, 1.5)
    
    enhancer = ImageEnhance.Brightness(image)
    
    return enhancer.enhance(factor)

#Adds random constrast changes to the image to simulate different 
#lighting and camera settings
def adjustContrast(image, factor=None):
    
    if factor is None:
        factor = random.uniform(0.7, 1.3)
    
    enhancer = ImageEnhance.Contrast(image)
    
    return enhancer.enhance(factor)

#Random pastes a `CARD` image onto a `Background` image to generate YOLO training data
#the minimum size of the card = to min_size
def placeCard(card, background, min_size=100, max_size=None):

    card = card.convert("RGBA")
    background = background.convert("RGBA")

    #All Cards will be placed within a 30-30 degree rotation
    #As detecting and trying to classify sideways cards will most likely fail
    angle = random.uniform(-30, 30)  
    card = card.rotate(angle, expand=True)  

    bg_w, bg_h = background.size

    if max_size is None:
        max_size = min(bg_w, bg_h)

    #Create a scaling feature and apply the scale transformation
    scale = random.randint(min_size, min(max_size, bg_w, bg_h))
    card = card.copy()
    card.thumbnail((scale, scale))  
    card_w, card_h = card.size

    #Calculate max values to keep the entire card confined within the backgroup 
    #image without clipping
    max_x = bg_w - card_w
    max_y = bg_h - card_h
    x = random.randint(0, max_x)
    y = random.randint(0, max_y)

    #Paste the card
    bg_copy = background.copy()
    bg_copy.paste(card, (x, y), card)

    #Save the bounding box of the card
    bbox = (x, y, x + card_w, y + card_h)  # (xmin, ymin, xmax, ymax)

    return bg_copy, bbox

#Draws a red bounding box onto an image (hopefully you pass an image that actually has the right card in it)
def drawBox(img, box):

    dimg = ImageDraw.Draw(img)
    dimg.rectangle(box, outline = "red", width = 2)

    return img

#I took pictures with IPhone for the training and needed to convert from heic to PNG
#This function Mass converts folders of images to the png format
def convert_heic_to_png(input_folder, output_folder):

    os.makedirs(output_folder, exist_ok=True)

    for heic_path in glob.glob(os.path.join(input_folder, "*.HEIC")):
        heif_file = pillow_heif.read_heif(heic_path)
        img = Image.frombytes(heif_file.mode, heif_file.size, heif_file.data)
        base_name = os.path.splitext(os.path.basename(heic_path))[0]
        img.save(os.path.join(output_folder, f"{base_name}.png"))

#Returns a random card from a folder containing card images (used for sampling)
#YOU SHOULD list.dir before calling and pass to list as choices to avoid listing dir every call
def randomCard(choices, path):

    index = random.randint(0, len(choices)-1)

    return Image.open(path + "/" + choices[index])

#Returns a random background from a folder containing bg images (used for sampling)
#YOU SHOULD list.dir before calling and pass to list as choices to avoid listing dir every call
def randomBackground(choices, path):

    index = random.randint(0, len(choices)-1)

    return Image.open(path + "/" + choices[index]).resize((256, 256))

#Yolo has a different format for bounding boxes rather than the previously used coordinates
#This function converts the coordinates to yolo format
def yoloBbox(bbox, image_size):
    
    x_min, y_min, x_max, y_max = bbox
    img_w, img_h = image_size

    x_center = (x_min + x_max) / 2 / img_w
    y_center = (y_min + y_max) / 2 / img_h
    width = (x_max - x_min) / img_w
    height = (y_max - y_min) / img_h

    return round(x_center, 4), round(y_center, 4), round(width, 4), round(height, 4)