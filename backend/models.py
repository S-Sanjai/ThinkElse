from pydantic import BaseModel, Field

class ValidateWordRequest(BaseModel):
    word: str
    previous_words: list[str] = []


class ValidateWordResponse(BaseModel):
    valid: bool
    word: str
    reason: str | None = None


class ScoreRequest(BaseModel):
    words: list[str] = Field(
        min_length=10,
        # max_digits=10
    )