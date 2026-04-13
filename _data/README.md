# _data/ — Local-only source data

This directory holds raw source data that is **downloaded locally** and
**not committed to git**. The files are typically too large to track
and/or belong to upstream datasets that we re-fetch on demand.

## openbible/

- `ancient.jsonl` — ancient-place geocoding data (~11 MB)
- `modern.jsonl` — modern-place geocoding data (~3 MB)

Source: [openbibleinfo/Bible-Geocoding-Data](https://github.com/openbibleinfo/Bible-Geocoding-Data)
License: Creative Commons Attribution 4.0

To fetch these files, run:

```bash
python3 _tools/download_openbible.py
```

Then import them into `content/meta/places.json`:

```bash
python3 _tools/import_openbible_places.py
```

See `_tools/import_openbible_places.py` for full import details.
