# Companion Study — Session Handoff

> **This file is for Claude session bootstrap only.**
> For conventions and pipeline: `_tools/DEV_GUIDE.md`
> For work items: GitHub Kanban (see below)

## Repository Access

```bash
git clone https://CraigBuckmaster:{YOUR_TOKEN}@github.com/CraigBuckmaster/ScriptureDeepDive.git
git config user.email "craig@companionstudy.app"
git config user.name "Craig Buckmaster"
git config http.sslVerify false
```

## Kanban Integration

The **Companion Study Kanban** is the single source of truth for all work items. Every task — features, content, architecture, debt — is a GitHub issue on this board.

**Project ID:** `PVT_kwHOAQG2984BTkG9`

Token needs `repo` + `read:project` + `write:project` scopes.

### Field IDs (for GraphQL mutations)

| Field | ID | Options |
|-------|----|---------| 
| Status | `PVTSSF_lAHOAQG2984BTkG9zhAyQPM` | Backlog=`f75ad846`, Ready=`61e4505c`, In progress=`47fc9ee4`, In review=`df73e18b`, Done=`98236657` |
| Priority | `PVTSSF_lAHOAQG2984BTkG9zhAyRLc` | P0=`79628723`, P1=`0a877460`, P2=`da944a9c` |
| Size | `PVTSSF_lAHOAQG2984BTkG9zhAyRLg` | XS=`6c6483d2`, S=`f784b110`, M=`7515a9f1`, L=`817d0097`, XL=`db339eb2` |

### Workflow
1. Read the issue body for full context
2. Move the issue to **In Progress** via GraphQL mutation
3. Do the work
4. Commit with `Closes #N` in the message
5. Move to **Done**, post a completion comment, close the issue

## Session Startup

1. Clone repo, configure git (above)
2. Read `_tools/DEV_GUIDE.md` for conventions and pipeline
3. Check the kanban for current work — prioritize In Progress items, then Ready, then Backlog by priority
4. Each feature issue contains a **complete dev plan** with session breakdowns, schemas, and file inventories — read before starting
