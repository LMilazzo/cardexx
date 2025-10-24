from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

#Cosine Similarity functoin used for testing. 

def cSim(input, refrence, top = 1):
    
    if input.ndim == 1:

        input = input.reshape(1, -1)

    results = pd.DataFrame(columns=["id", "sim"])
    
    for index, r in refrence.iterrows():

        ref = r["emb"].reshape(1, -1)

        sim = cosine_similarity(input, ref)
        
        results.loc[len(results)] = [r["id"], sim]
        
    return results.sort_values(by="sim", ascending=False).head(top)

