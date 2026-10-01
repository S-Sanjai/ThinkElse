import json


class WordValidator:

    def __init__(self, path):
        with open(path, "r", encoding="utf-8") as f:
            self.words = set(json.load(f))

    def check_one(self, word, others=()):

        word = word.strip().lower()

        if not word.isalpha() or len(word) < 2:
            return False, "letters only, at least 2 characters"

        if word not in self.words:
            return False, "not in the word list"

        for other in others:

            if word == other:
                return False, "word already used"

        return True, None

    def check_all(self, words):

        if len(words) != 10:
            return False, [
                "exactly 10 words required"
            ]

        reasons = []

        normalized = [
            word.strip().lower()
            for word in words
        ]

        for i, word in enumerate(normalized):

            valid, reason = self.check_one(
                word,
                normalized[:i]
            )

            if not valid:
                reasons.append(
                    f"{i + 1}. {word}: {reason}"
                )

        return not reasons, reasons