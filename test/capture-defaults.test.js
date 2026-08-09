"use strict";

const test = require("node:test");
const assert = require("node:assert");

const { applyCaptureDefaults, DEFAULT_CAPTURE_SCALE } = require("../bin/open-compute-mcp.js");

test("sets the half-size default when the caller said nothing", () => {
  const env = {};
  assert.equal(applyCaptureDefaults(env), true);
  assert.equal(env.OC_CAPTURE_SCALE, DEFAULT_CAPTURE_SCALE);
});

test("an explicit scale always wins — including full resolution", () => {
  const env = { OC_CAPTURE_SCALE: "1.0" };
  assert.equal(applyCaptureDefaults(env), false);
  assert.equal(env.OC_CAPTURE_SCALE, "1.0");
});

test("an explicit max-dim suppresses the scale default", () => {
  // Both knobs compose in the server, so injecting a scale next to a deliberate
  // max-dim would silently shrink twice as far as the caller asked for.
  const env = { OC_CAPTURE_MAX_DIM: "1024" };
  assert.equal(applyCaptureDefaults(env), false);
  assert.equal(env.OC_CAPTURE_SCALE, undefined);
});

test("an empty string counts as a deliberate choice, not as unset", () => {
  const env = { OC_CAPTURE_SCALE: "" };
  assert.equal(applyCaptureDefaults(env), false);
  assert.equal(env.OC_CAPTURE_SCALE, "");
});

test("the default is a valid factor the server will accept", () => {
  const value = Number(DEFAULT_CAPTURE_SCALE);
  assert.ok(value >= 0.05 && value <= 1.0, "must sit inside the server's accepted range");
});
