import numpy as np

from backend.vectors import VectorStore
from backend.scoring import cosine_distance, pairwise_dist, dat_score

def test_scoring_with_vectors():
    store = VectorStore("data/vectors.npy", "data/words.json")

    cat = store.get("cat")
    dog = store.get("dog")
    calculator = store.get("calculator")

    # Real embeddings from the project data
    matrix = np.vstack([cat, dog, calculator])
    # print("Matrix\n", matrix)

    # cosine distance should be valid in [0, 1]
    d = cosine_distance(cat, dog)
    assert 0.0 <= d <= 1.0
    print("cosine_distance",d)

    # pairwise distance should be square and diagonal == 0
    pairwise = pairwise_dist(matrix)
    assert pairwise.shape == (3, 3)
    assert np.allclose(np.diag(pairwise), 0.0, atol=1e-6)
    print("Pairwise\n",pairwise)

    result = dat_score(matrix)
    print("Result", result)
    assert "score" in result
    assert "stepwise" in result
    assert "pairwise" in result

test_scoring_with_vectors()