export type FocusStatus = "running" | "paused" | "completed" | "ended";

export interface FocusSessionState {
  status: FocusStatus;
  elapsedMs: number;
  targetMs: number;
  syncPending: boolean;
}

export function createFocusSessionState(input: { targetMs: number }): FocusSessionState {
  return {
    status: "running",
    elapsedMs: 0,
    targetMs: input.targetMs,
    syncPending: false,
  };
}

export function tick(state: FocusSessionState, deltaMs: number): FocusSessionState {
  if (state.status !== "running") {
    return state;
  }

  return {
    ...state,
    elapsedMs: state.elapsedMs + deltaMs,
  };
}

export function pause(state: FocusSessionState): FocusSessionState {
  if (state.status !== "running") {
    return state;
  }

  return {
    ...state,
    status: "paused",
    syncPending: true,
  };
}

export function resume(state: FocusSessionState): FocusSessionState {
  if (state.status !== "paused") {
    return state;
  }

  return {
    ...state,
    status: "running",
    syncPending: false,
  };
}

export function end(state: FocusSessionState): FocusSessionState {
  if (state.status === "completed" || state.status === "ended") {
    return state;
  }

  return {
    ...state,
    status: "ended",
    syncPending: true,
  };
}

export function complete(state: FocusSessionState): FocusSessionState {
  if (state.status === "completed" || state.status === "ended") {
    return state;
  }

  return {
    ...state,
    status: "completed",
    syncPending: true,
  };
}
