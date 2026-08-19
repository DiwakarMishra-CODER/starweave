# README screenshots

Seven images, referenced from the root `README.md`. All exported at 1800px wide,
JPEG q92 (~2.5MB total). Full-resolution originals are in `_originals/`, which is
gitignored — they are ~63MB and have no business in git history.

| File | Page | What it shows |
|---|---|---|
| `hero-constellation.jpg` | `/` | Whole graph at cloud zoom, all seven realms, evidence filter visible |
| `detail-zoom.jpg` | `/` | Zoomed in — photos, names and realm colours resolved |
| `focus-panel.jpg` | `/` | My Bloody Valentine focused, panel open, **source quote expanded** |
| `genres-timeline.jpg` | `/genres` | Shoegaze hovered, ancestor chain lit back to garage rock |
| `scenes-timeline.jpg` | `/scenes` | All 14 scenes, density-weighted axis |
| `artist-page.jpg` | `/artist/cocteau-twins` | Hero, audio preview, bio |
| `browse.jpg` | `/browse` | Artist grid, sorted by influence |

## To regenerate after a redesign

```bash
cd docs/images
sips -Z 1800 -s format jpeg -s formatOptions 92 "<source>.png" --out <name>.jpg
```

macOS screenshot filenames contain a narrow no-break space (U+202F) before "PM",
so a literal path copied from `ls` will fail — match them with a glob instead.

## Known nit

A browser extension badge (the dark "N" circle, bottom-left) sits over the last
line of the evidence filter in `hero-constellation.jpg`, `detail-zoom.jpg` and
`focus-panel.jpg`. Harmless, but if you ever retake these, disable extensions or
use a clean Chrome profile first.

## Still worth adding: a demo video

A still cannot show the zoom crossfade, the camera settling on a cluster, or the
graph thinning when the evidence filter flips. Those are the parts worth seeing.

**Use video, not a GIF.** GIF is capped at 256 colours and this UI is almost all
subtle dark gradients — the nebula and the crossfade band into visible stripes,
which ruins the exact thing the clip is for. Ten seconds of GIF would also land
near 15MB, over GitHub's limit. H.264 handles gradients properly and is smaller.

### How to get it playing on GitHub

A video committed into the repo and referenced as `![demo](demo.mp4)` does NOT
play — it renders as a dead link, and `<video>` tags are stripped by GitHub's
HTML sanitiser. The only route that works:

1. Record with Cmd+Shift+5, **Record Selected Portion**, just the browser window.
2. On github.com, open any issue (close it afterwards) or the README web editor.
3. **Drag the file into the comment box.** GitHub uploads it and gives you a
   `https://github.com/user-attachments/assets/...` URL.
4. Paste that URL into the root `README.md` **on its own line**, with no Markdown
   image syntax around it.

Limit is 10MB on free plans, 100MB on paid. The file then lives on GitHub's CDN
rather than in the repo, so a local clone or an npm mirror shows a bare link —
acceptable for a repo people read on github.com.

### Compressing

No `ffmpeg` on this machine. Either QuickTime > File > Export As > 1080p, or:

```bash
brew install ffmpeg
ffmpeg -i raw.mov -vf "scale=1280:-2" -c:v libx264 -crf 26 -preset slow -an demo.mp4
```

`-an` drops the audio track — not needed, and it costs size.

### Sequence, roughly 10 seconds

1. Fully zoomed out on the constellation (2s)
2. Scroll-zoom into a realm until photos and names resolve (3s)
3. Click a hub - Cocteau Twins or My Bloody Valentine - let the camera settle (2s)
4. Click **In their own words** and let the graph thin from 1,041 to 544 (3s)

Step 4 is the strongest few seconds the project has. Use a clean Chrome profile
so the extension badge does not sit over the evidence filter.
