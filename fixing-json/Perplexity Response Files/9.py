ed Code

import zipfile, os
from pathlib import Path

out = Path.home() / "output" / "lmcc-code-additions"
zip_path = Path.home() / "output" / "lmcc-code-additions.zip"

with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for f in sorted(out.iterdir()):
        zf.write(f, f.name)

print("zip size:", zip_path.stat().st_size // 1024, "KB")