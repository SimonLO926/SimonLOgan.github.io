import assert from "node:assert/strict";
import test from "node:test";
import { BASS, LEAD, STEP, clearPitches, midi } from "./audio.mjs";

test("the loop is a sparse four-bar phrase", () => {
  assert.equal(LEAD.length, 32);
  assert.equal(BASS.length, LEAD.length);
  assert.ok(LEAD.filter((note) => note != null).length <= 16);
  assert.ok(STEP > 0.25 && STEP < 0.4);
});

test("middle C is the expected pitch", () => {
  assert.ok(Math.abs(midi(69) - 440) < 0.001);
});

test("a line clear rings more notes as more rows disappear", () => {
  assert.deepEqual(clearPitches(1), [72]);
  assert.deepEqual(clearPitches(2), [72, 76]);
  assert.deepEqual(clearPitches(3), [72, 76, 79]);
  assert.deepEqual(clearPitches(4), [72, 76, 79, 84]);
  assert.deepEqual(clearPitches(8), [72, 76, 79, 84]);
});
