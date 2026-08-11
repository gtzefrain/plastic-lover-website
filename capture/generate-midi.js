// Generates a click-track MIDI file for scoring the hero logo entrance:
// one C4 blip each time a letter starts flying in, and one C5 blip when the
// wordmark has fully assembled. Timings are derived directly from
// lib/heroChoreography.ts (12 letters, 0.12s stagger, HERO_SPEED 1) and the
// plBlob keyframe duration in app/globals.css (1.6s), not re-measured from
// video — so they stay exact even though the .mp4 frame times are rounded
// to the nearest 60fps frame.
//
// No MIDI library required: Standard MIDI File format 0 is simple enough to
// build by hand (header chunk + one track chunk of delta-time-prefixed
// events), so this has zero dependencies.

const fs = require("fs");
const path = require("path");

const BPM = 110;
const PPQ = 480; // ticks per quarter note
const TICKS_PER_SECOND = (PPQ * BPM) / 60; // 880

const LETTER_COUNT = 12; // P-l-a-s-t-i-c-L-o-v-e-r
const LETTER_STAGGER_SEC = 0.12; // lib/heroChoreography.ts: d(0.12 * i)
const BLOB_DURATION_SEC = 1.6; // HeroLogo.tsx: plBlob animation duration

const C4 = 60;
const C5 = 72;
const LETTER_NOTE_LEN_SEC = 0.1;
const DONE_NOTE_LEN_SEC = 0.3;

const OUT_PATH = path.join(__dirname, "out", "hero-cues.mid");

function secToTicks(sec) {
  return Math.round(sec * TICKS_PER_SECOND);
}

// Build the cue list in seconds first, so the timing math stays readable
// and independent of the MIDI encoding below.
const cues = [];
for (let i = 0; i < LETTER_COUNT; i++) {
  cues.push({ note: C4, velocity: 100, startSec: i * LETTER_STAGGER_SEC, lenSec: LETTER_NOTE_LEN_SEC });
}
// "Done": the last letter (i=11) starts at 1.32s and its plBlob animation
// takes 1.6s to fully settle -> 2.92s, the moment the wordmark is complete.
const doneSec = (LETTER_COUNT - 1) * LETTER_STAGGER_SEC + BLOB_DURATION_SEC;
cues.push({ note: C5, velocity: 110, startSec: doneSec, lenSec: DONE_NOTE_LEN_SEC });

const events = [];
for (const cue of cues) {
  const onTick = secToTicks(cue.startSec);
  const offTick = secToTicks(cue.startSec + cue.lenSec);
  events.push({ tick: onTick, status: 0x90, note: cue.note, velocity: cue.velocity });
  events.push({ tick: offTick, status: 0x80, note: cue.note, velocity: 0 });
}
events.sort((a, b) => a.tick - b.tick);

function vlq(value) {
  const bytes = [value & 0x7f];
  value >>= 7;
  while (value > 0) {
    bytes.unshift((value & 0x7f) | 0x80);
    value >>= 7;
  }
  return Buffer.from(bytes);
}

function uint32BE(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32BE(n, 0);
  return b;
}

function uint16BE(n) {
  const b = Buffer.alloc(2);
  b.writeUInt16BE(n, 0);
  return b;
}

function metaEvent(deltaTicks, type, data) {
  return Buffer.concat([vlq(deltaTicks), Buffer.from([0xff, type]), vlq(data.length), data]);
}

function channelEvent(deltaTicks, status, a, b) {
  return Buffer.concat([vlq(deltaTicks), Buffer.from([status, a, b])]);
}

const tempoUsPerQuarter = Math.round(60000000 / BPM);
const tempoBytes = Buffer.from([
  (tempoUsPerQuarter >> 16) & 0xff,
  (tempoUsPerQuarter >> 8) & 0xff,
  tempoUsPerQuarter & 0xff,
]);

const chunks = [
  metaEvent(0, 0x03, Buffer.from("Plastic Lover - Hero Entrance Cues", "ascii")),
  metaEvent(0, 0x51, tempoBytes),
  metaEvent(0, 0x58, Buffer.from([4, 2, 24, 8])), // 4/4
];

let lastTick = 0;
for (const ev of events) {
  chunks.push(channelEvent(ev.tick - lastTick, ev.status, ev.note, ev.velocity));
  lastTick = ev.tick;
}
chunks.push(metaEvent(0, 0x2f, Buffer.alloc(0))); // end of track

const trackData = Buffer.concat(chunks);
const track = Buffer.concat([Buffer.from("MTrk"), uint32BE(trackData.length), trackData]);
const header = Buffer.concat([
  Buffer.from("MThd"),
  uint32BE(6),
  uint16BE(0), // format 0: single track
  uint16BE(1),
  uint16BE(PPQ),
]);

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, Buffer.concat([header, track]));

console.log(`Wrote ${OUT_PATH}`);
console.log(`BPM ${BPM}, ${PPQ} PPQ`);
console.log("Cues (seconds):");
for (const cue of cues) {
  const label = cue.note === C5 ? "C5 (done)" : "C4 (letter)";
  console.log(`  ${cue.startSec.toFixed(3)}s  ${label}`);
}
