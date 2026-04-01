# Companion Study — Claude Code Session Prompt

## Setup — ALWAYS run first

```bash
if [ -d "ScriptureDeepDive" ]; then
  cd ScriptureDeepDive && git pull
else
  git clone https://CraigBuckmaster:{TOKEN}@github.com/CraigBuckmaster/ScriptureDeepDive.git
  cd ScriptureDeepDive
fi
git config user.email "craig@companionstudy.app"
git config user.name "Craig Buckmaster"
```

## Required Reading — every session

1. `_tools/DEV_GUIDE.md` — project conventions
2. `_tools/NEXT_SESSION_PROMPT.md` — current state, what's active
3. The relevant plan file for the work being done

## Active Work

| Phase | Plan File | Status |
|-------|-----------|--------|
| 24 | `_tools/DEEP_STUDY_FEATURES_PLAN.md` | Content Library screen — in progress |
| P1 | `_tools/DEEP_STUDY_FEATURES_PLAN.md` | Premium store — blocked on licensing |
| P2 | `_tools/DEEP_STUDY_FEATURES_PLAN.md` | Gate wiring — blocked on P1 |
| T6 | `_tools/THEME_PLAN.md` | Theme legacy cleanup — small |
| 7 | `_tools/ARCH_PLAN.md` | Inline style migration — medium |
| 8A-C | `_tools/ARCH_PLAN.md` | Test/CI/CD/branch protection — sequential |

## Execution Rules

1. **Read the plan section completely** before writing any code
2. **Backward compatibility is mandatory** — old data shapes must still render
3. **`StyleSheet.create()`** for all styles — zero inline `style={{ }}` objects
4. **`const { base } = useTheme()`** for all colors — never import static `base`
5. **`fontFamily.*` tokens**, never string literals for fonts
6. **`logger.*`** for errors, never `console.*`
7. **Commit each phase separately** using the commit convention in the plan
8. After completing work: **push** and **update `_tools/NEXT_SESSION_PROMPT.md`**

## Validation — after every phase

```bash
python3 _tools/validate.py          # Content integrity
python3 _tools/build_sqlite.py      # DB build (only if content/schema changed)
python3 _tools/validate_sqlite.py   # DB integrity (only if DB rebuilt)
cd app && npx tsc --noEmit --pretty 2>&1 | head -30  # Type check
```

## Content Pipeline (for phases involving content generation)

1. Write generator/migration script to `/tmp/`
2. Syntax-check: `python3 -c "compile(open('/tmp/script.py').read(), '/tmp/script.py', 'exec')"`
3. Run script
4. Verify counts
5. Validate → build → validate_sqlite
6. `rm /tmp/gen_*.py /tmp/migrate_*.py`
7. Commit and push

## Key Architecture Reminders

- **Two-database architecture:** `scripture.db` = content (replaceable). `user.db` = user data (migrated, never replaced).
- **Panel detection pattern:** Panel type stays the same. Data SHAPE determines rendering: string → legacy, object with keys → composite.
- **TabbedPanelRenderer:** Use for all composite panels. `defaultTab` prop for initial tab selection.
- **New user.db tables** require a new migration entry in `userDatabase.ts`.
- **App directory:** React Native app lives in `app/` — run npm/expo commands from there.
- **Data shapes:** See `_tools/COMPLETED_PHASES_REFERENCE.md` for all shipped panel data contracts.
