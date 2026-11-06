from pathlib import Path
import json
root = Path(__file__).resolve().parent
html = (root / "src" / "page.html").read_text()
js = (root / "src" / "worker.js").read_text()
if "__HTML__" not in js:
    raise SystemExit("worker.js missing __HTML__ placeholder")
# Ensure secrets are present (worker.js should already contain injected values from deploy;
# re-inject if placeholders remain)
rk = root / "secrets" / "l402-root.key"
vh = root / "secrets" / "402index-verify-hash.txt"
if "__ROOT_KEY__" in js:
    if not rk.exists():
        raise SystemExit("missing secrets/l402-root.key")
    js = js.replace("__ROOT_KEY__", rk.read_text().strip())
if "__VERIFY_HASH__" in js:
    if not vh.exists():
        raise SystemExit("missing secrets/402index-verify-hash.txt")
    js = js.replace("__VERIFY_HASH__", vh.read_text().strip())
out = js.replace("__HTML__", json.dumps(html))
dest = root / "src" / "index.js"
dest.write_text(out)
print(f"wrote {dest} ({dest.stat().st_size} bytes)")
