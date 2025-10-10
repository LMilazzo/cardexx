#Imports
from pokemontcgsdk import Card, Set, RestClient
from PIL import Image
from io import BytesIO
import requests
import pandas as pd
from sentence_transformers import SentenceTransformer
from Utils.generateSetEmbeddings import generate

#API Set Up
api_key = "api-key"
RestClient.configure(api_key)

model = SentenceTransformer('clip-ViT-L-14')


all_set_names = [
    "base1", "base2", "basep", "base3", "base4", "base5", "gym1", "gym2",
    "neo1", "neo2", "si1", "neo3", "neo4", "base6", "ecard1", "ecard2",
    "ecard3", "ex1", "ex2", "ex3", "np", "ex4", "ex5", "ex6", "pop1",
    "ex7", "ex8", "ex9", "ex10", "pop2", "ex11", "ex12", "pop3", "ex13",
    "ex14", "pop4", "ex15", "pop5", "ex16", "dp1","dp5", "dp6", "pop8", 
    "dp7", "pl1", "pop9", "pl2", "pl3", "pl4", "ru1", "bw7", "bw8", "bw9", 
    "bw10", "xyp", "bw11", "xy0", "xy1", "dpp", "dp2", "pop6","dp3", "dp4", 
    "pop7","hgss1", "hsp", "hgss2", "hgss3","hgss4","bw3", "bw4", "col1", 
    "bwp", "bw1", "mcd11", "bw2", "bw5", "mcd12", "bw6", "dv1", "xy2", 
    "xy3", "xy4", "xy5", "dc1", "xy6", "xy7", "xy8", "xy9","xy2", "xy3",
    "xy4", "xy5", "dc1", "xy6", "xy7", "xy8", "xy9", "g1", "xy10", "xy11",
    "mcd16", "xy12", "sm1", "smp", "sm2", "sm3", "sm35", "sm4", "sm5", "sm6",
    "sm7", "sm75", "sm8", "sm9", "det1", "sm10", "sm11", "sm115", "sma",
    "mcd19", "sm12", "swshp", "swsh1", "swsh2", "swsh3", "swsh35", "swsh4",
    "swsh45", "swsh45sv", "swsh5", "swsh6", "swsh7", "cel25", "cel25c",
    "mcd14", "mcd15", "mcd18", "mcd17", "mcd21", "bp", "swsh8", "fut20",
    "tk1a", "tk1b", "tk2a", "tk2b", "swsh9", "swsh9tg", "swsh10", "swsh10tg",
    "pgo", "swsh11", "swsh11tg", "swsh12", "swsh12tg", "mcd22", "swsh12pt5",
    "swsh12pt5gg", "sv1", "svp", "sv2", "sve", "sv3", "sv3pt5", "sv4", "sv4pt5",
    "sv5", "sv6", "sv6pt5", "sv7", "sv8", "sv8pt5", "sv9", "sv10", "zsv10pt5",
    "rsv10pt5"
    ]

#A list of the sets I processed for my implementation (only about 60% of all cards)
complete = [
    "base1", "base2", "basep", "base3", "base4", "base5", "gym1", "gym2",
    "neo1", "neo2", "si1", "neo3", "neo4", "base6", "ecard1", "ecard2",
    "ecard3", "ex1", "ex2", "ex3", "np", "ex4", "ex5", "ex6", "pop1",
    "ex7", "ex8", "ex9", "ex10", "pop2", "ex11", "ex12", "pop3", "ex13",
    "ex14", "pop4", "ex15", "pop5", "ex16", "dp1",
    "dp5", "dp6", "pop8", "dp7", "pl1", "pop9", "pl2", "pl3", "pl4", "ru1", "bw7", 
    "bw8", "bw9", "bw10", "xyp", "bw11", "xy0", "xy1", "dpp", "dp2", "pop6","dp3", "dp4", "pop7",
    "hgss1", "hsp", "hgss2", "hgss3","hgss4","bw3", "bw4", "col1", "bwp", "bw1", "mcd11", "bw2", 
    "bw5", "mcd12", "bw6", "dv1", "xy2", "xy3", "xy4", "xy5", "dc1", "xy6", "xy7", "xy8", "xy9","xy2", "xy3",
    "xy4", "xy5", "dc1", "xy6", "xy7", "xy8", "xy9", "g1", "xy10", "xy11",
    "mcd16", "xy12", "sm1", "smp", "sm2", "sm3", "sm35", "sm4", "sm5", "sm6"]


if __name__ == "__main__":

    for set in all_set_names:
        generate(set, CLIP_model=model)
        print("Set: ", set, " Complete")
