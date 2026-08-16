import { describe, expect, it } from "vitest";
import {
  createFocusSessionState,
  tick,
  pause,
  resume,
  end,
  complete,
  type FocusSessionState,
} from "./focus-session";

function runningState(): FocusSessionState {
  return {
    status: "running",
    elapsedMs: 90_000,
    targetMs: 30 * 60_000,
    syncPending: false,
  };
}

describe("focus session state machine", () => {
  it("counts up from zero while running", () => {
    const state = createFocusSessionState({ targetMs: 10_000 });
    expect(state.status).toBe("running");
    expect(state.elapsedMs).toBe(0);

    const next = tick(state, 1_000);
    expect(next.elapsedMs).toBe(1_000);
  });

  it("pauses the timer", () => {
    const next = pause(runningState());
    expect(next.status).toBe("paused");
    expect(next.elapsedMs).toBe(90_000);
  });

  it("resumes without losing elapsed time", () => {
    const paused = pause(runningState());
    const resumed = resume(paused);

    expect(resumed.status).toBe("running");
    expect(resumed.elapsedMs).toBe(90_000);
  });

  it("ends early and marks sync pending", () => {
    const next = end(runningState());
    expect(next.status).toBe("ended");
    expect(next.syncPending).toBe(true);
  });

  it("completes and marks sync pending", () => {
    const next = complete(runningState());
    expect(next.status).toBe("completed");
    expect(next.syncPending).toBe(true);
  });
});
