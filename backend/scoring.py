import numpy as np

def cosine_distance(a,b):
    a = a/np.linalg.norm(a)
    b = b/np.linalg.norm(b)

    distance = 1.0 - np.dot(a,b)

    return float(
        np.clip(distance, 0.0, 1.0)
    )

def pairwise_dist(matrix):
    normalized = (matrix / np.linalg.norm(matrix, axis=1, keepdims=True))

    similarities = normalized @ normalized.T

    distances = 1.0 - similarities

    return np.clip(distances, 0.0, 1.0)

def dat_score(matrix):
    distances = pairwise_dist(matrix)

    indices = np.triu_indices(len(matrix), k=1)
    stepwise = [float(distances[i, i+1])
                for i in range(len(matrix)-1)
    ]

    return {
        "score": round(
            float(distances[indices].mean())
            ,4
        ),
        "stepwise":[
            round(value,4) for value in stepwise
        ],
        "pairwise":{
            f"{i}|{j}": round(float(distances[i,j]),4)
            for i, j in zip(*indices)
        }
    }

