#!/usr/bin/env bash
#
# scrub-api-key.sh — Remove the leaked Google Maps API key from git history.
#
# Prerequisites:
#   pip install git-filter-repo
#
# Usage:
#   1. Ensure you are on the master branch with a clean working tree.
#   2. Run this script from the repository root:
#        bash scripts/scrub-api-key.sh
#   3. After the rewrite, force-push and notify the team to re-clone:
#        git push origin master --force
#
# WARNING: This rewrites all commit history. Every team member must
#          delete their local clone and re-clone after the force push.
#          All open PRs will need to be re-created.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
EXPRESSIONS_FILE="$(mktemp)"

# The leaked key — replace with REDACTED in every historical blob.
cat > "$EXPRESSIONS_FILE" <<'EOF'
AIzaSyBIAraIZ1bAOGPpE0_BMX1QJ0CvTRdtiVI==>REDACTED_GOOGLE_MAPS_KEY
EOF

echo "==> Verifying git-filter-repo is installed..."
if ! command -v git-filter-repo &>/dev/null; then
  echo "ERROR: git-filter-repo not found. Install with: pip install git-filter-repo"
  exit 1
fi

echo "==> Current branch: $(git branch --show-current)"
echo "==> Commits containing the key before scrub:"
git log --all --oneline -S "AIzaSyBIAraIZ1bAOGPpE0_BMX1QJ0CvTRdtiVI" || true

echo ""
echo "==> Running git filter-repo --replace-text ..."
git filter-repo --replace-text "$EXPRESSIONS_FILE" --force

rm -f "$EXPRESSIONS_FILE"

echo ""
echo "==> Verifying key is removed from history..."
REMAINING=$(git log --all --oneline -S "AIzaSyBIAraIZ1bAOGPpE0_BMX1QJ0CvTRdtiVI" | wc -l)
if [ "$REMAINING" -gt 0 ]; then
  echo "WARNING: Key still found in $REMAINING commit(s)!"
  git log --all --oneline -S "AIzaSyBIAraIZ1bAOGPpE0_BMX1QJ0CvTRdtiVI"
  exit 1
else
  echo "SUCCESS: API key removed from all commits."
fi

echo ""
echo "==> Next steps:"
echo "  1. Rotate the key in Google Cloud Console."
echo "  2. Force push:  git push origin master --force"
echo "  3. Notify all team members to delete and re-clone the repo."
echo "  4. Update .env and EAS secrets with the new rotated key."
