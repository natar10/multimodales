#!/usr/bin/env python3
"""Remove background from images using rembg. Output files are saved as PNG with transparency."""

import sys
from pathlib import Path

try:
    from rembg import remove
    from PIL import Image
except ImportError:
    print("Missing dependencies. Install with:")
    print("  pip install rembg pillow")
    sys.exit(1)


def remove_background(input_path: Path, output_path: Path | None = None) -> Path:
    if output_path is None:
        output_path = input_path.with_stem(input_path.stem + "_nobg").with_suffix(".png")

    with open(input_path, "rb") as f:
        result = remove(f.read())

    output_path.write_bytes(result)
    print(f"  {input_path.name} -> {output_path.name}")
    return output_path


def main():
    args = sys.argv[1:]

    if not args:
        print("Usage:")
        print("  python remove_bg.py image.jpg              # single file")
        print("  python remove_bg.py img1.jpg img2.png ...  # multiple files")
        print("  python remove_bg.py public/memes/          # entire folder")
        sys.exit(0)

    paths: list[Path] = []
    for arg in args:
        p = Path(arg)
        if p.is_dir():
            paths.extend(p.glob("*.jpg"))
            paths.extend(p.glob("*.jpeg"))
            paths.extend(p.glob("*.png"))
            paths.extend(p.glob("*.webp"))
        elif p.exists():
            paths.append(p)
        else:
            print(f"Warning: '{arg}' not found, skipping.")

    if not paths:
        print("No images found.")
        sys.exit(1)

    print(f"Processing {len(paths)} image(s)...")
    for p in paths:
        remove_background(p)

    print("Done.")


if __name__ == "__main__":
    main()
