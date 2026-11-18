set -e
cd /home/claude/galaxy-src
python3 build.py >/dev/null && python3 parse_content.py >/dev/null && python3 patch.py >/dev/null && python3 polish.py && python3 features_patch.py
node -e "const s=require('fs').readFileSync('/home/claude/study-galaxy/index.html','utf8');require('fs').writeFileSync('/tmp/app.js',s.match(/<script id=\"app-script\">([\s\S]*?)<\/script>/)[1])" && node --check /tmp/app.js && echo SYNTAX_OK
