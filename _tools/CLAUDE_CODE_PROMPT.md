# Companion Study — Deep Study Features
# Master Prompt (reusable for every session)

## Setup — ALWAYS run first, every session

```bash
# Clone if not present, pull if already cloned
if [ -d "ScriptureDeepDive" ]; then
  cd ScriptureDeepDive && git pull
else
  git clone https://CraigBuckmaster:{TOKEN}@github.com/CraigBuckmaster/ScriptureDeepDive.git
  cd ScriptureDeepDive
fi
git config user.email "craig@companionstudy.app"
git config user.name "Craig Buckmaster"
```

## Required Reading — every session, in this order

1. `_tools/DEV_GUIDE.md` — project conventions
2. `_tools/NEXT_SESSION_PROMPT.md` — current state, what's been completed
3. `_tools/DEEP_STUDY_FEATURES_PLAN.md` — the COMPLETE 23-phase implementation plan with full specs for every phase

**The plan file is the single source of truth.** Every phase has: files to create, files to modify, data shapes, implementation steps, and effort estimates. Do not ask for additional specs — they are all in the plan.

**Read the "CRITICAL — What Is NOT Changing" section** before modifying any files. All work is additive. No existing components are replaced.

## Determine What's Next

Check `_tools/NEXT_SESSION_PROMPT.md` for the "Deep Study Features" table. Phases marked **Complete** are done. Pick up from the first phase NOT marked complete.

**Session pacing from the plan's execution order:**
- Session A: Phase 0 + 1
- Session B: Phase 2 + 3
- Session C: Phase 4
- Session D: Phase 5 + 6
- Session E: Phase 7
- Session F: Phase 8 + 9 + 10
- Session G: Phase 11 + 16
- Session H: Phase 12
- Session I+J: Phase 13
- Session K: Phase 14
- Session M: Phase 17 + 18
- Session N: Phase 19 + 20
- Session O: Phase 21
- Session P: Phase 22 + 23

Execute the next session's worth of phases (the next group of 1-3 phases that are grouped together). If a session is listed as pairing two phases, do both.

## Execution Rules

1. **Read the plan's phase section completely** before writing any code for that phase
2. **Backward compatibility is mandatory** — old data shapes must still render unchanged. Composite panels detect new data via shape checking, not type changing.
3. **StyleSheet.create()** for all styles — zero inline `style={{ }}` objects
4. **fontFamily.* tokens**, never string literals for fonts
5. **logger.*** for errors, never `console.*`
6. **Commit each phase separately** using the commit convention in the plan
7. After all phases in the session: **push** and **update `_tools/NEXT_SESSION_PROMPT.md`**:
   - Mark completed phases in the Deep Study Features table
   - Update "What's Next" to reference the next session's phases

## Validation — after every phase

```bash
python3 _tools/validate.py          # Content integrity
python3 _tools/build_sqlite.py      # DB build (only if content/schema changed)
python3 _tools/validate_sqlite.py   # DB integrity (only if DB rebuilt)
cd app && npx tsc --noEmit --pretty 2>&1 | head -30  # Type check
```

If a phase is code-only (no content or DB changes), skip the Python validation steps.

## Content Pipeline Phases

Phases that involve content generation (2, 3, 4, 7, 8, 9, 10, 22, 23) follow the standard enrichment pattern:
1. Write generator/migration script to `/tmp/`
2. Syntax-check: `python3 -c "compile(open('/tmp/script.py').read(), '/tmp/script.py', 'exec')"`
3. Run the script
4. Verify section/panel counts
5. `python3 _tools/validate.py`
6. `python3 _tools/build_sqlite.py`
7. `python3 _tools/validate_sqlite.py`
8. `rm /tmp/gen_*.py /tmp/migrate_*.py`
9. Commit and push

## Key Architecture Reminders

- **Two-database architecture:** `scripture.db` = content (replaceable). `user.db` = user data (migrated, never replaced).
- **Panel detection pattern:** Panel type stays the same (hist, cross, lit, tx). Data SHAPE determines rendering: `typeof data === 'string'` → legacy. `data && data.historical` → composite. See comment block in PanelRenderer.tsx.
- **TabbedPanelRenderer:** Built in Phase 1. Use it for all composite panels. If only one tab has data, it renders without a tab bar (transparent upgrade).
- **New user.db tables** require a new migration entry in `userDatabase.ts` with the next version number.
- **App directory:** React Native app lives in `app/` — run npm/expo commands from there, not root.
