/**
 * Pure state machine and responsive geometry helpers for Fernhollow hero.
 */

export interface FernhollowState {
  loaded: boolean;
  introShown: boolean;
  isMuted: boolean;
  isHoveringCta: boolean;
  isFooterOpen: boolean;
}

export function createInitialState(isAutostart: boolean = false): FernhollowState {
  return {
    loaded: isAutostart,
    introShown: isAutostart,
    isMuted: true,
    isHoveringCta: false,
    isFooterOpen: false,
  };
}

export function handleEngineLoaded(state: FernhollowState): FernhollowState {
  return {
    ...state,
    loaded: true,
  };
}

export function handleIntroDone(state: FernhollowState): { state: FernhollowState; shouldAnimateUi: boolean } {
  if (state.introShown) {
    return { state, shouldAnimateUi: false };
  }
  return {
    state: {
      ...state,
      introShown: true,
    },
    shouldAnimateUi: true,
  };
}

export function toggleAudioMute(state: FernhollowState): { state: FernhollowState; isMuted: boolean; ariaPressed: string } {
  const nextMuted = !state.isMuted;
  return {
    state: {
      ...state,
      isMuted: nextMuted,
    },
    isMuted: nextMuted,
    ariaPressed: String(!nextMuted),
  };
}

export function setCtaHover(state: FernhollowState, isHovering: boolean): FernhollowState {
  return {
    ...state,
    isHoveringCta: isHovering,
  };
}

/**
 * Responsive unit calculation matching:
 * --u: min(calc(100vw/1600), calc(100vh/900)), which becomes 1px at 820px and below.
 */
export function calculateUnitScale(width: number, height: number): number {
  if (width <= 820) {
    return 1;
  }
  return Math.min(width / 1600, height / 900);
}

/**
 * Mobile headline size clamp(64px, 19vw, 96px)
 */
export function calculateHeadlineSize(width: number, height: number): number {
  if (width <= 820) {
    const raw = 0.19 * width;
    return Math.min(96, Math.max(64, raw));
  }
  const u = calculateUnitScale(width, height);
  return 158 * u;
}

/**
 * Tooltip text helper for sound state
 */
export function getSoundTooltipText(isAudioPlaying: boolean): string {
  return isAudioPlaying ? 'Playing' : 'Muted';
}

export function toggleFooterDrawer(state: FernhollowState, force?: boolean): FernhollowState {
  return {
    ...state,
    isFooterOpen: typeof force === 'boolean' ? force : !state.isFooterOpen,
  };
}


