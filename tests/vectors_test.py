from backend.vectors import VectorStore

store = VectorStore("data/vectors.npy", "data/words.json")

print(store.words[:5])
print(store.get("hello"))
print(store.get("hello").shape)
