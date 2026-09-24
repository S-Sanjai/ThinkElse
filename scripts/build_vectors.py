import json
import numpy as np

GLOVE = "glove.840B.300d\glove.840B.300d.txt"
FREQ = "data/top-50k.txt"
OUT = "data"


with open(FREQ) as f:
    keep = [
        line.strip().lower()
        for line in f
        if line.strip()
    ]

keep = [
    word
    for word in keep
    if word.isalpha() and len(word) > 1
][:50_000]

wanted = set(keep)

words = []
rows = []

with open(GLOVE, encoding="utf-8") as f:
    for line in f:
        parts = line.rstrip().split(" ")

        word = parts[0]

        if word in wanted:
            words.append(word)
            rows.append(
                np.asarray(
                    parts[1:],
                    dtype=np.float32
                )
            )

matrix = np.vstack(rows)

np.save(
    f"{OUT}/vectors.npy",
    matrix
)

with open(f"{OUT}/words.json", "w") as f:
    json.dump(words, f)

print("matrix:", matrix.shape)