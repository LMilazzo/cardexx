# App Link
[https://cardexx.netlify.app/] 

Please use responsibly and with respect to server limits as the backend is running on a rather small server. 
Additionally the app may not always be running to avoid hosting charges.

## App Overview

An application for scanning/detecting trading cards in real time and classifying them based on which card is seen. 
Main Use case is for quick price checking or finding card ids to efficiently price cards in the fast growing hobby.

## Models
##### **YOLOv8** 
Fine-tuned model to detect card in frames and then crop out the background noise.

##### **clip-ViT-b-16** 
Used to  embed the frames as a vector and cosine similarity is calculated to determine which card is being seen. 

## Repo
##### **API** - Contains Files and models used for the AWS EC2 FastAPI implementation
##### **App** - Contains Files, style sheets and configurations for the main Netlify App implementation
##### **DatasetsAndModelTraining** - Contains files and subdirectories used for general data storage but mostly for the YOLO model training loop
##### **Utils** - Contains general utility functions used throughout this project such as image processing and data handling steps

## Proof of Concept and Ideas
I original came to this project as a way to become familiar with computer vision models, however have found myself using it on my own collections and in public to check prices and easily navigate my way through the ever expanding hobby. 

At its core this is a classification problem where I wanted to originally classify cards I find to learn more about them such as which set they are from and more. Given that there are so many cards released though > 19,000 in just English, a normal classification model would perform extremely poorly even if enough image data was found to train it. 

That is why instead I took the approach of finding a set of 'perfect' digital cards, found on the pokemon tcg api and created embeddings for all 19,000. These embeddings make up the library that new scans are compared to.

Below is a visualization of these embeddings on a set of ~ 40 different cards. The diamonds represent the embeddings of the digital images and the circles are images that I took on an IPhone of the matching cards. Color represents the card ID where points of the same color are images of the same card. This wplot was used in my preliminary exploration and served as my main proof that this system will work as we can see the captured images are correctly grouped around the ground truth images in this TSNE feature reduction plot.

![My Plotly chart](plot.png)