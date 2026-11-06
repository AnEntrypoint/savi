import json
import sys

for path in sys.argv[1:]:
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except Exception:
        print("non-json body")
        continue
    if isinstance(data, dict):
        print("top-level keys: " + ", ".join(sorted(data.keys())))
    elif isinstance(data, list):
        first = data[0] if data else None
        item_keys = sorted(first.keys()) if isinstance(first, dict) else []
        print("top-level array, length %d, item keys: %s" % (len(data), ", ".join(item_keys)))
    else:
        print("top-level " + type(data).__name__)
