// Feature flags.
//
// Deliberately a build-time constant rather than anything configurable: this
// is a solo, statically-built project, and a flag that can be toggled at
// runtime would need plumbing that costs more than it saves.

/**
 * Path finder — pick two artists, see how they connect, with the citation at
 * every hop. Tested in tests/lib/bfs.test.ts.
 *
 * Now gates the whole PathFinder control in GraphView rather than two fragments
 * inside GraphControls, which is where it lived while it was a fourth tab in
 * "Jump to…". Turning it off hides the only way to set the path state that
 * drives PathPanel and the canvas highlight; everything downstream stays wired,
 * so nothing becomes dead code.
 */
export const PATH_FINDER_ENABLED = true;

/**
 * The opening's first beat on a first visit (components/home/Intro.tsx): the
 * Velvet Underground's banana sleeve, the vinyl sliding out of it, copies
 * handed on to the artists it shaped, and Brian Eno's line about it.
 *
 * Was off for a while: a test viewer found two records in a row confusing.
 * Back on (Oct 2026) as one record -- the banana vinyl stays at the centre
 * and becomes the label of the record every artist is pressed into -- with
 * the cover named in plain words for anyone who doesn't know it, and the
 * three handoffs big and named.
 */
export const OPENING_VU_BEAT = true;
