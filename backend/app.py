from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.models import (
    ValidateWordRequest,
    ValidateWordResponse,
    ScoreRequest,
)

from backend.validation import WordValidator
from backend.vectors import VectorStore
from backend.scoring import cosine_distance, dat_score, pairwise_dist

app = FastAPI(
    root_path="/api/v1",
    title="ThinkElse",
    version="0.1.0",
)

# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Loading ML resources Once

validator = WordValidator("data/words.json")

vector_store = VectorStore("data/vectors.npy", "data/words.json")

# Check health
@app.get("/health")
def health():
    return {
        "status": "ok",
        "vectors": vector_store.size,
        "dim": vector_store.dimensions,
    }

# Validate one word
@app.post("/validate-word", response_model=ValidateWordResponse)
def validate_word(request: ValidateWordRequest):
    valid, reason = validator.check_one(
        request.word,
        request.previous_words
    )
    return {
        "valid": valid,
        "word": request.word.strip().lower(),
        "reason": reason
    }

# Calculate the score
@app.post("/score")
def score(request: ScoreRequest):

    words = [
        word.strip().lower()
        for word in request.words
    ]

    # Validate complete Submission
    valid, errors = validator.check_all(words)

    if not valid:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Invalid word submission",
                "error": errors
            }
        )
    # Get the Vectors
    try:
        vectors = vector_store.get_many(words)

    except KeyError as error:

        raise HTTPException(
            status_code=422,
            detail=str(error)
        )

    # Calculate Score
    result = dat_score(vectors)

    # Add words to response
    result["words"] = words

    return result 