import json
import numpy as np
from pathlib import Path


INPUT_FILE = Path("Glove/glove.840B.300d.txt")
OUTPUT_VECTORS = Path("data/vectors.npy")
OUTPUT_WORDS = Path("data/words.json")


def main():

    # =========================================
    # PASS 1
    # Count valid rows and detect dimension
    # =========================================

    print("Pass 1/2: scanning embedding...")

    dimension = None
    valid_rows = 0

    with INPUT_FILE.open(
        "r",
        encoding="utf-8"
    ) as f:

        for line in f:

            parts = line.rstrip().split()

            if len(parts) < 2:
                continue

            current_dimension = len(parts) - 1

            if dimension is None:
                dimension = current_dimension

            if current_dimension != dimension:
                continue

            try:
                np.asarray(
                    parts[1:],
                    dtype=np.float32
                )
            except ValueError:
                continue

            valid_rows += 1

    print(f"Valid entries: {valid_rows:,}")
    print(f"Dimension:     {dimension}")


    # =========================================
    # Create memory-mapped matrix
    # =========================================

    vectors = np.lib.format.open_memmap(
        OUTPUT_VECTORS,
        mode="w+",
        dtype=np.float32,
        shape=(valid_rows, dimension)
    )


    # =========================================
    # PASS 2
    # Actually convert everything
    # =========================================

    print("Pass 2/2: converting...")

    words = []

    row = 0

    with INPUT_FILE.open(
        "r",
        encoding="utf-8"
    ) as f:

        for line in f:

            parts = line.rstrip().split()

            if len(parts) != dimension + 1:
                continue

            word = parts[0]

            try:

                vector = np.asarray(
                    parts[1:],
                    dtype=np.float32
                )

            except ValueError:

                continue

            words.append(word)

            vectors[row] = vector

            row += 1

            if row % 10000 == 0:

                print(
                    f"Converted "
                    f"{row:,} / {valid_rows:,}"
                )


    vectors.flush()


    # =========================================
    # Save vocabulary
    # =========================================

    print("Saving vocabulary...")

    with OUTPUT_WORDS.open(
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            words,
            f,
            ensure_ascii=False
        )


    # =========================================
    # Verify
    # =========================================

    print()
    print("=" * 60)
    print("CONVERSION COMPLETE")
    print("=" * 60)

    print(f"Words:      {len(words):,}")
    print(f"Vectors:    {vectors.shape}")
    print(f"Vector file: {OUTPUT_VECTORS}")
    print(f"Word file:   {OUTPUT_WORDS}")


if __name__ == "__main__":
    main()