# App Link
[https://cardexx.netlify.app/] 

Please use responsibly and with respect to server limits as the backend is running on a rather small server. 
Additionally the app may not always be running to avoid hosting charges.

## App Overview

An application for scanning/detecting trading cards in real time and classifying them based on which can is seen.

## Models

This application makes use of a fine-tuned YOLOv8 model to detect card in frames and then crop out the background noise. clip-ViT-b-16 is then used to 
embed the frames as a vector and cosine similarity is calculated to determine which card is being seen. 

## Other Files

Also included in this repo are notebooks that were used for dataset creation and testing.


<iframe src="TSNE_PLOTLY.html" width="800" height="600"></iframe>