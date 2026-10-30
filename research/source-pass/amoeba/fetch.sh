#!/bin/sh
# Fetch English captions for every matched episode, gently. Re-run to resume.
cd "$(dirname "$0")"
mkdir -p subs
python3 -I -c "import json; [print(e['id']) for e in json.load(open('episodes.json')) if e['artistIds']]" | sort -u > ids.txt
: > failed.txt
while read id; do
  ls subs/$id.*vtt >/dev/null 2>&1 && continue
  yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs "en,en-US,en-GB" --sub-format vtt \
    -o "subs/%(id)s" "https://www.youtube.com/watch?v=$id" >> fetch.log 2>&1
  ls subs/$id.*vtt >/dev/null 2>&1 && echo "ok $id" || { echo "FAIL $id"; echo $id >> failed.txt; }
  sleep 60  # YouTube bot-walled us at 12s (30 Oct 2026)
done < ids.txt
echo "done: $(ls subs | wc -l) caption files, $(wc -l < failed.txt) failed"
