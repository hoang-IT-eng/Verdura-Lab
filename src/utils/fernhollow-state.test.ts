import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialState,
  handleEngineLoaded,
  handleIntroDone,
  toggleAudioMute,
  setCtaHover,
  calculateUnitScale,
  calculateHeadlineSize,
  getSoundTooltipText,
  toggleFooterDrawer,
} from './fernhollow-state';

test('createInitialState creates standard initial state', () => {
  const state = createInitialState(false);
  assert.equal(state.loaded, false);
  assert.equal(state.introShown, false);
  assert.equal(state.isMuted, true);
  assert.equal(state.isHoveringCta, false);
});

test('createInitialState handles autostart query flag', () => {
  const state = createInitialState(true);
  assert.equal(state.loaded, true);
  assert.equal(state.introShown, true);
});

test('handleEngineLoaded marks state as loaded', () => {
  const initial = createInitialState(false);
  const next = handleEngineLoaded(initial);
  assert.equal(next.loaded, true);
  assert.equal(next.introShown, false);
});

test('handleIntroDone only animates UI once', () => {
  const initial = createInitialState(false);
  const step1 = handleIntroDone(initial);
  assert.equal(step1.shouldAnimateUi, true);
  assert.equal(step1.state.introShown, true);

  const step2 = handleIntroDone(step1.state);
  assert.equal(step2.shouldAnimateUi, false);
  assert.equal(step2.state.introShown, true);
});

test('toggleAudioMute toggles mute and produces correct ARIA pressed status', () => {
  const initial = createInitialState(false);
  assert.equal(initial.isMuted, true);

  const unmute = toggleAudioMute(initial);
  assert.equal(unmute.isMuted, false);
  assert.equal(unmute.ariaPressed, 'true'); // playing = aria-pressed true
  assert.equal(unmute.state.isMuted, false);

  const remute = toggleAudioMute(unmute.state);
  assert.equal(remute.isMuted, true);
  assert.equal(remute.ariaPressed, 'false'); // muted = aria-pressed false
  assert.equal(remute.state.isMuted, true);
});

test('setCtaHover toggles hover state for hover transition', () => {
  const initial = createInitialState(false);
  const hovered = setCtaHover(initial, true);
  assert.equal(hovered.isHoveringCta, true);
  const unhovered = setCtaHover(hovered, false);
  assert.equal(unhovered.isHoveringCta, false);
});

test('calculateUnitScale enforces 1px at <= 820px and proportional above', () => {
  // Mobile breakpoint
  assert.equal(calculateUnitScale(820, 900), 1);
  assert.equal(calculateUnitScale(375, 667), 1);

  // Desktop 1600x900 base is 1.0
  assert.equal(calculateUnitScale(1600, 900), 1);

  // Scaled desktop 1920x1080 -> min(1920/1600, 1080/900) = min(1.2, 1.2) = 1.2
  assert.equal(calculateUnitScale(1920, 1080), 1.2);

  // Wide but short 1920x800 -> min(1.2, 800/900) = 800/900 ~ 0.8888
  assert.ok(Math.abs(calculateUnitScale(1920, 800) - 800 / 900) < 0.0001);
});

test('calculateHeadlineSize clamps on mobile and scales on desktop', () => {
  // Mobile clamp [64, 96]
  assert.equal(calculateHeadlineSize(300, 800), 64); // 0.19 * 300 = 57 -> 64
  assert.equal(calculateHeadlineSize(400, 800), 76); // 0.19 * 400 = 76 -> 76
  assert.equal(calculateHeadlineSize(600, 800), 96); // 0.19 * 600 = 114 -> 96

  // Desktop 1600x900
  assert.equal(calculateHeadlineSize(1600, 900), 158);
});

test('getSoundTooltipText returns Muted when muted and Playing when active', () => {
  assert.equal(getSoundTooltipText(false), 'Muted');
  assert.equal(getSoundTooltipText(true), 'Playing');
});

test('toggleFooterDrawer opens and closes drawer properly', () => {
  const initial = createInitialState(false);
  assert.equal(initial.isFooterOpen, false);

  const opened = toggleFooterDrawer(initial);
  assert.equal(opened.isFooterOpen, true);

  const closed = toggleFooterDrawer(opened);
  assert.equal(closed.isFooterOpen, false);

  const forceOpened = toggleFooterDrawer(closed, true);
  assert.equal(forceOpened.isFooterOpen, true);

  const forceClosed = toggleFooterDrawer(forceOpened, false);
  assert.equal(forceClosed.isFooterOpen, false);
});


