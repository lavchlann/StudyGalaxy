# Source for Study Galaxy

These are the build scripts and content the site is generated from. They are kept here so the project is never tied to one machine.

- `content/` the lesson, example and quiz text for each chapter
- `formulas_*.py` the formula sheets (QCAA 2025, CC BY 4.0)
- `fx_*.js`, `draw.js`, `*.css` the app code
- `build_all.sh` then `web_build.py` produce the website files in the repo root

The scripts were written to run in Claude's workspace, so some paths are absolute (`/home/claude/...`, `/tmp/work/content`). Ask Claude to rebuild and push updates rather than running them by hand.
