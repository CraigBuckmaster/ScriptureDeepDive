# Scripture Deep Dive — Tests

## Current Test Infrastructure

### Content Validation (Python)
```bash
python3 _tools/validate.py           # JSON schema + completeness
python3 _tools/validate_sqlite.py    # SQLite integrity + FTS
```

### Mobile App Unit Tests (Jest)
```bash
cd app && npx jest
```

6 unit test files covering: geoMath, panelLabels, referenceParser, timelineLayout, treeBuilder, verseResolver.

## Adding Tests

Add new Jest tests to `app/__tests__/unit/` or `app/__tests__/integration/`.
Add new content validation checks to `validate.py` or `validate_sqlite.py`.
