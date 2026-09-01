# Genre-to-genre influence flow

Report-only analysis. Computed from every edge in `graphData.edges`: for each
edge, the source artist's `genres[]` crossed with the target artist's
`genres[]` (self-pairs excluded), tallied per ordered genre pair. An edge
means "source was influenced by target," so a count from A → B means artists
tagged A cite artists tagged B as an influence.

**Excluded:** the four container genres (`electronic`, `folk`, `indie`,
`underground`) — stripped from both source and target genre lists before
pairing. **Also excluded:** any pair where the target genre's `emerged` year
is later than the source genre's `emerged` year (an ancestor can't postdate
its descendant).

**Threshold:** only pairs with 5 or more edges are shown, sorted descending.

No project files were changed to produce this — this file is the report
itself.

---

## All pairs (≥ 5 edges), sorted descending

`[TREE]` marks a pair where the two genres already have a `parent` link in
either direction (checked against both `sourceGenre.parent === targetGenre`
and `targetGenre.parent === sourceGenre`).

```
Indie rock (indie-rock, 1990) → Art rock (art-rock, 1967)  · 45 edges
Indie rock (indie-rock, 1990) → Alternative rock (alt-rock, 1987)  · 36 edges
Indie rock (indie-rock, 1990) → Post-punk (post-punk, 1978)  · 31 edges
Post-punk (post-punk, 1978) → Art rock (art-rock, 1967)  · 29 edges
Alternative rock (alt-rock, 1987) → Noise rock (noise-rock, 1981)  · 26 edges
Indie rock (indie-rock, 1990) → Proto-punk (proto-punk, 1967)  · 25 edges
Alternative rock (alt-rock, 1987) → Art rock (art-rock, 1967)  · 23 edges
Indie rock (indie-rock, 1990) → Indie pop (indie-pop, 1983)  · 22 edges
Indie rock (indie-rock, 1990) → Jangle pop (jangle-pop, 1983)  · 21 edges
Art pop (art-pop, 1979) → Art rock (art-rock, 1967)  · 21 edges  [TREE]
Alternative rock (alt-rock, 1987) → Proto-punk (proto-punk, 1967)  · 19 edges
Post-hardcore (post-hardcore, 1985) → Hardcore punk (hardcore-punk, 1980)  · 19 edges  [TREE]
Emo (emo, 1994) → Post-hardcore (post-hardcore, 1985)  · 18 edges  [TREE]
Post-punk (post-punk, 1978) → Proto-punk (proto-punk, 1967)  · 17 edges
Shoegaze (shoegaze, 1988) → Dream pop (dream-pop, 1984)  · 17 edges  [TREE]
Indie rock (indie-rock, 1990) → Noise rock (noise-rock, 1981)  · 17 edges
Noise rock (noise-rock, 1981) → Art rock (art-rock, 1967)  · 17 edges
Post-hardcore (post-hardcore, 1985) → Noise rock (noise-rock, 1981)  · 17 edges
Indie pop (indie-pop, 1983) → Art rock (art-rock, 1967)  · 16 edges
Noise rock (noise-rock, 1981) → Post-punk (post-punk, 1978)  · 16 edges
Post-rock (post-rock, 1991) → Art rock (art-rock, 1967)  · 16 edges
Art rock (art-rock, 1967) → Proto-punk (proto-punk, 1967)  · 15 edges
Post-punk (post-punk, 1978) → Krautrock (krautrock, 1968)  · 15 edges
Chamber pop (chamber-pop, 1996) → Singer-songwriter (singer-songwriter, 1967)  · 15 edges
Indie rock (indie-rock, 1990) → Art pop (art-pop, 1979)  · 14 edges
Shoegaze (shoegaze, 1988) → Post-punk (post-punk, 1978)  · 14 edges
Indie pop (indie-pop, 1983) → Jangle pop (jangle-pop, 1983)  · 14 edges
Alternative rock (alt-rock, 1987) → Indie pop (indie-pop, 1983)  · 14 edges
Indie folk (indie-folk, 2004) → Singer-songwriter (singer-songwriter, 1967)  · 13 edges
Shoegaze (shoegaze, 1988) → Noise rock (noise-rock, 1981)  · 12 edges
Shoegaze (shoegaze, 1988) → Alternative rock (alt-rock, 1987)  · 12 edges
Noise rock (noise-rock, 1981) → Proto-punk (proto-punk, 1967)  · 12 edges
Art pop (art-pop, 1979) → Singer-songwriter (singer-songwriter, 1967)  · 12 edges
Chamber pop (chamber-pop, 1996) → Art rock (art-rock, 1967)  · 12 edges
Chamber pop (chamber-pop, 1996) → Indie rock (indie-rock, 1990)  · 12 edges  [TREE]
Dream pop (dream-pop, 1984) → Art rock (art-rock, 1967)  · 11 edges
Indie pop (indie-pop, 1983) → Proto-punk (proto-punk, 1967)  · 11 edges
Jangle pop (jangle-pop, 1983) → Indie pop (indie-pop, 1983)  · 11 edges
Lo-fi (lo-fi, 1992) → Alternative rock (alt-rock, 1987)  · 11 edges
Alternative rock (alt-rock, 1987) → Post-punk (post-punk, 1978)  · 11 edges
Art pop (art-pop, 1979) → Post-punk (post-punk, 1978)  · 11 edges
Indie pop (indie-pop, 1983) → Singer-songwriter (singer-songwriter, 1967)  · 11 edges
Indie rock (indie-rock, 1990) → Singer-songwriter (singer-songwriter, 1967)  · 11 edges
Indie rock (indie-rock, 1990) → Punk (punk, 1976)  · 11 edges
Indie pop (indie-pop, 1983) → Art pop (art-pop, 1979)  · 10 edges
Noise rock (noise-rock, 1981) → Hardcore punk (hardcore-punk, 1980)  · 10 edges
Synth-pop (synth-pop, 1978) → Art rock (art-rock, 1967)  · 10 edges
Dream pop (dream-pop, 1984) → Art pop (art-pop, 1979)  · 10 edges
Indie rock (indie-rock, 1990) → Psychedelic pop (psychedelic-pop, 1966)  · 10 edges
Post-punk (post-punk, 1978) → Punk (punk, 1976)  · 10 edges  [TREE]
Indie rock (indie-rock, 1990) → Post-hardcore (post-hardcore, 1985)  · 10 edges
Post-rock (post-rock, 1991) → Noise rock (noise-rock, 1981)  · 10 edges
Shoegaze (shoegaze, 1988) → Art rock (art-rock, 1967)  · 9 edges
Shoegaze (shoegaze, 1988) → Gothic rock (goth, 1979)  · 9 edges
Dream pop (dream-pop, 1984) → Indie pop (indie-pop, 1983)  · 9 edges
Alternative rock (alt-rock, 1987) → Hardcore punk (hardcore-punk, 1980)  · 9 edges
Alternative rock (alt-rock, 1987) → Jangle pop (jangle-pop, 1983)  · 9 edges
Post-hardcore (post-hardcore, 1985) → Post-punk (post-punk, 1978)  · 9 edges
Industrial (industrial, 1975) → Krautrock (krautrock, 1968)  · 9 edges  [TREE]
Synth-pop (synth-pop, 1978) → Post-punk (post-punk, 1978)  · 9 edges
Experimental pop (experimental-pop, 1996) → Dream pop (dream-pop, 1984)  · 9 edges
Drone (drone, 1990) → Art rock (art-rock, 1967)  · 9 edges
Alternative rock (alt-rock, 1987) → Punk (punk, 1976)  · 9 edges
Midwest emo (midwest-emo, 1997) → Post-hardcore (post-hardcore, 1985)  · 9 edges
Emo (emo, 1994) → Punk (punk, 1976)  · 9 edges
Noise rock (noise-rock, 1981) → No wave (no-wave, 1978)  · 9 edges  [TREE]
Grunge (grunge, 1989) → Noise rock (noise-rock, 1981)  · 9 edges
Punk (punk, 1976) → Proto-punk (proto-punk, 1967)  · 9 edges  [TREE]
Dance-punk (dance-punk, 1979) → Post-punk (post-punk, 1978)  · 8 edges  [TREE]
Dream pop (dream-pop, 1984) → Noise rock (noise-rock, 1981)  · 8 edges
Alternative rock (alt-rock, 1987) → Post-hardcore (post-hardcore, 1985)  · 8 edges
Industrial (industrial, 1975) → Art rock (art-rock, 1967)  · 8 edges
Art rock (art-rock, 1967) → Singer-songwriter (singer-songwriter, 1967)  · 8 edges
Alt-country (alt-country, 1990) → Singer-songwriter (singer-songwriter, 1967)  · 8 edges
Bedroom pop (bedroom-pop, 2016) → Singer-songwriter (singer-songwriter, 1967)  · 8 edges
Bedroom pop (bedroom-pop, 2016) → Indie rock (indie-rock, 1990)  · 8 edges  [TREE]
Math rock (math-rock, 1994) → Post-hardcore (post-hardcore, 1985)  · 8 edges  [TREE]
Post-hardcore (post-hardcore, 1985) → Punk (punk, 1976)  · 8 edges
Post-rock (post-rock, 1991) → Krautrock (krautrock, 1968)  · 8 edges
Gothic rock (goth, 1979) → Art rock (art-rock, 1967)  · 7 edges
Dream pop (dream-pop, 1984) → Post-punk (post-punk, 1978)  · 7 edges  [TREE]
Dream pop (dream-pop, 1984) → Jangle pop (jangle-pop, 1983)  · 7 edges
Indie rock (indie-rock, 1990) → Shoegaze (shoegaze, 1988)  · 7 edges
Indie rock (indie-rock, 1990) → Dream pop (dream-pop, 1984)  · 7 edges
Hardcore punk (hardcore-punk, 1980) → Proto-punk (proto-punk, 1967)  · 7 edges
Indie rock (indie-rock, 1990) → Gothic rock (goth, 1979)  · 7 edges
Synth-pop (synth-pop, 1978) → Krautrock (krautrock, 1968)  · 7 edges  [TREE]
Art pop (art-pop, 1979) → Proto-punk (proto-punk, 1967)  · 7 edges
Art pop (art-pop, 1979) → Krautrock (krautrock, 1968)  · 7 edges
Art pop (art-pop, 1979) → Gothic rock (goth, 1979)  · 7 edges
Ambient (ambient, 1978) → Art rock (art-rock, 1967)  · 7 edges
Drone (drone, 1990) → Post-punk (post-punk, 1978)  · 7 edges
Experimental pop (experimental-pop, 1996) → Shoegaze (shoegaze, 1988)  · 7 edges
Lo-fi (lo-fi, 1992) → Indie rock (indie-rock, 1990)  · 7 edges  [TREE]
Post-rock (post-rock, 1991) → Shoegaze (shoegaze, 1988)  · 7 edges
Chamber pop (chamber-pop, 1996) → Post-punk (post-punk, 1978)  · 7 edges
Dream pop (dream-pop, 1984) → Proto-punk (proto-punk, 1967)  · 6 edges
Jangle pop (jangle-pop, 1983) → Proto-punk (proto-punk, 1967)  · 6 edges
Dance-punk (dance-punk, 1979) → Art rock (art-rock, 1967)  · 6 edges
Indie rock (indie-rock, 1990) → Power pop (power-pop, 1972)  · 6 edges
Synth-pop (synth-pop, 1978) → Industrial (industrial, 1975)  · 6 edges
Synth-pop (synth-pop, 1978) → Ambient (ambient, 1978)  · 6 edges
Experimental pop (experimental-pop, 1996) → Art rock (art-rock, 1967)  · 6 edges
Lo-fi (lo-fi, 1992) → Singer-songwriter (singer-songwriter, 1967)  · 6 edges
Indie folk (indie-folk, 2004) → Indie rock (indie-rock, 1990)  · 6 edges
Alt-country (alt-country, 1990) → Indie rock (indie-rock, 1990)  · 6 edges
Noise rock (noise-rock, 1981) → Punk (punk, 1976)  · 6 edges
Emo (emo, 1994) → Hardcore punk (hardcore-punk, 1980)  · 6 edges
Emo (emo, 1994) → Indie rock (indie-rock, 1990)  · 6 edges
Emo (emo, 1994) → Math rock (math-rock, 1994)  · 6 edges
Post-rock (post-rock, 1991) → Post-punk (post-punk, 1978)  · 6 edges
Noise rock (noise-rock, 1981) → Industrial (industrial, 1975)  · 6 edges
Alternative rock (alt-rock, 1987) → No wave (no-wave, 1978)  · 6 edges
Experimental pop (experimental-pop, 1996) → Art pop (art-pop, 1979)  · 6 edges
Indie rock (indie-rock, 1990) → Alt-country (alt-country, 1990)  · 6 edges
Jangle pop (jangle-pop, 1983) → Art rock (art-rock, 1967)  · 5 edges
Dream pop (dream-pop, 1984) → Gothic rock (goth, 1979)  · 5 edges
Lo-fi (lo-fi, 1992) → Art rock (art-rock, 1967)  · 5 edges
Hardcore punk (hardcore-punk, 1980) → Art rock (art-rock, 1967)  · 5 edges
Alternative rock (alt-rock, 1987) → Power pop (power-pop, 1972)  · 5 edges
Punk (punk, 1976) → Art rock (art-rock, 1967)  · 5 edges
Noise rock (noise-rock, 1981) → Gothic rock (goth, 1979)  · 5 edges
Alternative rock (alt-rock, 1987) → Gothic rock (goth, 1979)  · 5 edges
Shoegaze (shoegaze, 1988) → Art pop (art-pop, 1979)  · 5 edges
Shoegaze (shoegaze, 1988) → Indie pop (indie-pop, 1983)  · 5 edges
Indie pop (indie-pop, 1983) → Post-punk (post-punk, 1978)  · 5 edges  [TREE]
Indie rock (indie-rock, 1990) → Krautrock (krautrock, 1968)  · 5 edges
Krautrock (krautrock, 1968) → Art rock (art-rock, 1967)  · 5 edges
Industrial (industrial, 1975) → Proto-punk (proto-punk, 1967)  · 5 edges
Post-punk (post-punk, 1978) → Industrial (industrial, 1975)  · 5 edges
IDM (idm, 1992) → Ambient (ambient, 1978)  · 5 edges
Drone (drone, 1990) → Shoegaze (shoegaze, 1988)  · 5 edges
Dance-punk (dance-punk, 1979) → Krautrock (krautrock, 1968)  · 5 edges
Noise rock (noise-rock, 1981) → Krautrock (krautrock, 1968)  · 5 edges
Alternative rock (alt-rock, 1987) → Singer-songwriter (singer-songwriter, 1967)  · 5 edges
Chamber pop (chamber-pop, 1996) → Art pop (art-pop, 1979)  · 5 edges
Slowcore (slowcore, 1990) → Dream pop (dream-pop, 1984)  · 5 edges
Drone (drone, 1990) → Noise rock (noise-rock, 1981)  · 5 edges
Hardcore punk (hardcore-punk, 1980) → Punk (punk, 1976)  · 5 edges  [TREE]
Emo (emo, 1994) → Post-punk (post-punk, 1978)  · 5 edges
Math rock (math-rock, 1994) → Art rock (art-rock, 1967)  · 5 edges
Post-rock (post-rock, 1991) → Post-hardcore (post-hardcore, 1985)  · 5 edges
Slowcore (slowcore, 1990) → Indie rock (indie-rock, 1990)  · 5 edges  [TREE]
Indie rock (indie-rock, 1990) → Synth-pop (synth-pop, 1978)  · 5 edges
Indie pop (indie-pop, 1983) → Psychedelic pop (psychedelic-pop, 1966)  · 5 edges
Bedroom pop (bedroom-pop, 2016) → Alternative rock (alt-rock, 1987)  · 5 edges
```

---

## Already in the tree (parent relationship exists)

18 pairs — the strong influence flow and the genre hierarchy already agree here.

```
Art pop → Art rock  · 21 edges
Post-hardcore → Hardcore punk  · 19 edges
Emo → Post-hardcore  · 18 edges
Shoegaze → Dream pop  · 17 edges
Chamber pop → Indie rock  · 12 edges
Post-punk → Punk  · 10 edges
Industrial → Krautrock  · 9 edges
Noise rock → No wave  · 9 edges
Punk → Proto-punk  · 9 edges
Dance-punk → Post-punk  · 8 edges
Bedroom pop → Indie rock  · 8 edges
Math rock → Post-hardcore  · 8 edges
Dream pop → Post-punk  · 7 edges
Synth-pop → Krautrock  · 7 edges
Lo-fi → Indie rock  · 7 edges
Indie pop → Post-punk  · 5 edges
Hardcore punk → Punk  · 5 edges
Slowcore → Indie rock  · 5 edges
```

## Not yet in the tree (no parent relationship)

128 pairs — strong, threshold-clearing influence flow with no corresponding
edge in the `Genre.parent` hierarchy. This is descriptive, not prescriptive:
a heavy count here doesn't automatically mean the tree is wrong (e.g. many of
these are umbrella-to-umbrella flows like `Indie rock → Art rock` or
`Alternative rock → Noise rock`, which reflect real influence without
implying a parent/child genealogy).

```
Indie rock → Art rock  · 45 edges
Indie rock → Alternative rock  · 36 edges
Indie rock → Post-punk  · 31 edges
Post-punk → Art rock  · 29 edges
Alternative rock → Noise rock  · 26 edges
Indie rock → Proto-punk  · 25 edges
Alternative rock → Art rock  · 23 edges
Indie rock → Indie pop  · 22 edges
Indie rock → Jangle pop  · 21 edges
Alternative rock → Proto-punk  · 19 edges
Post-punk → Proto-punk  · 17 edges
Indie rock → Noise rock  · 17 edges
Noise rock → Art rock  · 17 edges
Post-hardcore → Noise rock  · 17 edges
Indie pop → Art rock  · 16 edges
Noise rock → Post-punk  · 16 edges
Post-rock → Art rock  · 16 edges
Art rock → Proto-punk  · 15 edges
Post-punk → Krautrock  · 15 edges
Chamber pop → Singer-songwriter  · 15 edges
Indie rock → Art pop  · 14 edges
Shoegaze → Post-punk  · 14 edges
Indie pop → Jangle pop  · 14 edges
Alternative rock → Indie pop  · 14 edges
Indie folk → Singer-songwriter  · 13 edges
Shoegaze → Noise rock  · 12 edges
Shoegaze → Alternative rock  · 12 edges
Noise rock → Proto-punk  · 12 edges
Art pop → Singer-songwriter  · 12 edges
Chamber pop → Art rock  · 12 edges
Dream pop → Art rock  · 11 edges
Indie pop → Proto-punk  · 11 edges
Jangle pop → Indie pop  · 11 edges
Lo-fi → Alternative rock  · 11 edges
Alternative rock → Post-punk  · 11 edges
Art pop → Post-punk  · 11 edges
Indie pop → Singer-songwriter  · 11 edges
Indie rock → Singer-songwriter  · 11 edges
Indie rock → Punk  · 11 edges
Indie pop → Art pop  · 10 edges
Noise rock → Hardcore punk  · 10 edges
Synth-pop → Art rock  · 10 edges
Dream pop → Art pop  · 10 edges
Indie rock → Psychedelic pop  · 10 edges
Indie rock → Post-hardcore  · 10 edges
Post-rock → Noise rock  · 10 edges
Shoegaze → Art rock  · 9 edges
Shoegaze → Gothic rock  · 9 edges
Dream pop → Indie pop  · 9 edges
Alternative rock → Hardcore punk  · 9 edges
Alternative rock → Jangle pop  · 9 edges
Post-hardcore → Post-punk  · 9 edges
Synth-pop → Post-punk  · 9 edges
Experimental pop → Dream pop  · 9 edges
Drone → Art rock  · 9 edges
Alternative rock → Punk  · 9 edges
Midwest emo → Post-hardcore  · 9 edges
Emo → Punk  · 9 edges
Grunge → Noise rock  · 9 edges
Dream pop → Noise rock  · 8 edges
Alternative rock → Post-hardcore  · 8 edges
Industrial → Art rock  · 8 edges
Art rock → Singer-songwriter  · 8 edges
Alt-country → Singer-songwriter  · 8 edges
Bedroom pop → Singer-songwriter  · 8 edges
Post-hardcore → Punk  · 8 edges
Post-rock → Krautrock  · 8 edges
Gothic rock → Art rock  · 7 edges
Dream pop → Jangle pop  · 7 edges
Indie rock → Shoegaze  · 7 edges
Indie rock → Dream pop  · 7 edges
Hardcore punk → Proto-punk  · 7 edges
Indie rock → Gothic rock  · 7 edges
Art pop → Proto-punk  · 7 edges
Art pop → Krautrock  · 7 edges
Art pop → Gothic rock  · 7 edges
Ambient → Art rock  · 7 edges
Drone → Post-punk  · 7 edges
Experimental pop → Shoegaze  · 7 edges
Post-rock → Shoegaze  · 7 edges
Chamber pop → Post-punk  · 7 edges
Dream pop → Proto-punk  · 6 edges
Jangle pop → Proto-punk  · 6 edges
Dance-punk → Art rock  · 6 edges
Indie rock → Power pop  · 6 edges
Synth-pop → Industrial  · 6 edges
Synth-pop → Ambient  · 6 edges
Experimental pop → Art rock  · 6 edges
Lo-fi → Singer-songwriter  · 6 edges
Indie folk → Indie rock  · 6 edges
Alt-country → Indie rock  · 6 edges
Noise rock → Punk  · 6 edges
Emo → Hardcore punk  · 6 edges
Emo → Indie rock  · 6 edges
Emo → Math rock  · 6 edges
Post-rock → Post-punk  · 6 edges
Noise rock → Industrial  · 6 edges
Alternative rock → No wave  · 6 edges
Experimental pop → Art pop  · 6 edges
Indie rock → Alt-country  · 6 edges
Jangle pop → Art rock  · 5 edges
Dream pop → Gothic rock  · 5 edges
Lo-fi → Art rock  · 5 edges
Hardcore punk → Art rock  · 5 edges
Alternative rock → Power pop  · 5 edges
Punk → Art rock  · 5 edges
Noise rock → Gothic rock  · 5 edges
Alternative rock → Gothic rock  · 5 edges
Shoegaze → Art pop  · 5 edges
Shoegaze → Indie pop  · 5 edges
Indie rock → Krautrock  · 5 edges
Krautrock → Art rock  · 5 edges
Industrial → Proto-punk  · 5 edges
Post-punk → Industrial  · 5 edges
IDM → Ambient  · 5 edges
Drone → Shoegaze  · 5 edges
Dance-punk → Krautrock  · 5 edges
Noise rock → Krautrock  · 5 edges
Alternative rock → Singer-songwriter  · 5 edges
Chamber pop → Art pop  · 5 edges
Slowcore → Dream pop  · 5 edges
Drone → Noise rock  · 5 edges
Emo → Post-punk  · 5 edges
Math rock → Art rock  · 5 edges
Post-rock → Post-hardcore  · 5 edges
Indie rock → Synth-pop  · 5 edges
Indie pop → Psychedelic pop  · 5 edges
Bedroom pop → Alternative rock  · 5 edges
```

---

## Summary

- Total genre pairs with ≥ 5 edges: **146**
- Already in tree (parent relationship exists): **18**
- Not yet in tree: **128**
- Edges skipped for missing `emerged` year (expected 0, since only the 4 excluded containers lack one): **0**
- Total edges in graph: **995**
