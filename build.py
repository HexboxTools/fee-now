from pathlib import Path
root = Path(__file__).resolve().parent
html = (root / "src" / "page.html").read_text()
js = (root / "src" / "worker.js").read_text()
if "__HTML__" not in js:
    raise SystemExit("worker.js missing __HTML__ placeholder")
# JSON-encode so it is a valid JS string literal
import json
out = js.replace("__HTML__", json.dumps(html))
dest = root / "src" / "index.js"
dest.write_text(out)
print(f"wrote {dest} ({dest.stat().st_size} bytes)")
