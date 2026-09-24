import json
import numpy as np

class VectorStore:

    def __init__(self, vector_path, words_path):
        self.vectors = np.load(
            vector_path, mmap_mode='r'
        )

        with open(words_path, "r", encoding="utf-8") as f:
            self.words = json.load(f)

        self.index = {
            word: i for i, word in enumerate(self.words)
        }

    @property
    def size(self):
        return len(self.words)

    @property
    def dimensions(self):
        return self.vectors.shape[1]

    def get(self, word: str):
        
        word = word.strip().lower()

        if word not in self.index:
            raise KeyError(f"Word not found: {word}")

        index = self.index[word]

        return self.vectors[index]

    def get_many(self, words: list[str]):

        indices = [
            self.index[word.strip().lower()]
            for word in words
        ]

        return np.asarray(
            self.vectors[indices]
        )