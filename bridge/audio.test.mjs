import assert from "node:assert/strict";
import test from "node:test";
import { BASS, LEAD, MIX, STEP, clearPitches, comboPitches, midi, sandPitches, tspinPitches } from "./audio.mjs";

test("the loop is a four-bar 8-bit phrase loud enough to hear", () => {
  assert.equal(LEAD.length, 32);
  assert.equal(BASS.length, LEAD.length);
  assert.ok(LEAD.filter((note) => note != null).length >= 20);
  assert.ok(STEP > 0.2 && STEP < 0.4);
  assert.ok(MIX.music >= 0.6);
  assert.ok(MIX.lead >= 0.25);
  assert.ok(MIX.sfx >= 0.8);
});

test("middle C is the expected pitch", () => {
  assert.ok(Math.abs(midi(69) - 440) < 0.001);
});

test("t-spin, combo, and sand each have their own rising chime", () => {
  assert.deepEqual(tspinPitches(), [70, 74, 79, 86]);
  assert.deepEqual(sandPitches(), [62, 67, 74]);
  assert.ok(comboPitches(5).at(-1) > comboPitches(2).at(-1));
  assert.ok(comboPitches(5).length > comboPitches(2).length);
});

test("a line clear rings more notes as more rows disappear", () => {
  assert.deepEqual(clearPitches(1), [72]);
  assert.deepEqual(clearPitches(2), [72, 76]);
  assert.deepEqual(clearPitches(3), [72, 76, 79]);
  assert.deepEqual(clearPitches(4), [72, 76, 79, 84]);
  assert.deepEqual(clearPitches(8), [72, 76, 79, 84]);
});
