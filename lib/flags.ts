// Feature flags.
//
// Deliberately a build-time constant rather than anything configurable: this
// is a solo, statically-built project, and a flag that can be toggled at
// runtime would need plumbing that costs more than it saves.

/**
 * Path finder — pick two artists, see how they connect, with the citation at
 * every hop. Complete, tested (see tests/lib/bfs.test.ts) and working; held
 * back from the UI only so it can be introduced on its own rather than
 * competing with everything else in the launch.
 *
 * Flipping this to true is the entire release: it reveals the Path tab in
 * GraphControls, which is the only way to set the path state that drives
 * PathPanel and the canvas highlight. Everything downstream stays wired, so
 * nothing here is dead code.
 */
export const PATH_FINDER_ENABLED = false;
