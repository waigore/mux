import { describe, expect, it, mock } from "bun:test";
import { createWindowResilienceController } from "./windowResilience";

function createMockDeps(options?: { isQuitting?: boolean; isWindowAlive?: boolean }) {
  return {
    reload: mock(() => {
      // intentionally empty for tests
    }),
    isWindowAlive: mock(() => options?.isWindowAlive ?? true),
    isQuitting: mock(() => options?.isQuitting ?? false),
    log: mock(
      (_level: "warn" | "error" | "info", _message: string, _meta?: Record<string, unknown>) => {
        // intentionally empty for tests
      }
    ),
  };
}

describe("createWindowResilienceController", () => {
  it("requestRecovery calls reload and log on first call", () => {
    const deps = createMockDeps();
    const controller = createWindowResilienceController(deps);

    controller.requestRecovery("render-process-gone:crashed:1");

    expect(deps.reload).toHaveBeenCalledTimes(1);
    expect(deps.log).toHaveBeenCalledTimes(1);
    expect(deps.log).toHaveBeenCalledWith(
      "error",
      "[window] Renderer recovery requested: render-process-gone:crashed:1"
    );
  });

  it("requestRecovery is single-flight when already recovering", () => {
    const deps = createMockDeps();
    const controller = createWindowResilienceController(deps);

    controller.requestRecovery("first-reason");
    controller.requestRecovery("second-reason");

    expect(deps.reload).toHaveBeenCalledTimes(1);
    expect(deps.log).toHaveBeenCalledTimes(1);
    expect(deps.log).toHaveBeenCalledWith(
      "error",
      "[window] Renderer recovery requested: first-reason"
    );
  });

  it("requestRecovery is a no-op while quitting", () => {
    const deps = createMockDeps({ isQuitting: true });
    const controller = createWindowResilienceController(deps);

    controller.requestRecovery("any-reason");

    expect(deps.reload).not.toHaveBeenCalled();
    expect(deps.log).not.toHaveBeenCalled();
    expect(controller.isRecovering()).toBe(false);
  });

  it("requestRecovery is a no-op when the window is not alive", () => {
    const deps = createMockDeps({ isWindowAlive: false });
    const controller = createWindowResilienceController(deps);

    controller.requestRecovery("any-reason");

    expect(deps.reload).not.toHaveBeenCalled();
    expect(deps.log).not.toHaveBeenCalled();
    expect(controller.isRecovering()).toBe(false);
  });

  it("markLoadSucceeded resets state so a second recovery can run", () => {
    const deps = createMockDeps();
    const controller = createWindowResilienceController(deps);

    controller.requestRecovery("first");
    controller.markLoadSucceeded();
    controller.requestRecovery("second");

    expect(deps.reload).toHaveBeenCalledTimes(2);
    expect(controller.isRecovering()).toBe(true);
    expect(deps.log).toHaveBeenCalledTimes(3);
    expect(deps.log).toHaveBeenNthCalledWith(
      1,
      "error",
      "[window] Renderer recovery requested: first"
    );
    expect(deps.log).toHaveBeenNthCalledWith(2, "info", "[window] Recovery reload completed");
    expect(deps.log).toHaveBeenNthCalledWith(
      3,
      "error",
      "[window] Renderer recovery requested: second"
    );
  });

  it("markLoadSucceeded logs only when recovering", () => {
    const deps = createMockDeps();
    const controller = createWindowResilienceController(deps);

    controller.markLoadSucceeded();
    expect(deps.log).not.toHaveBeenCalled();

    controller.requestRecovery("renderer-crash");
    controller.markLoadSucceeded();

    expect(deps.log).toHaveBeenCalledTimes(2);
    expect(deps.log).toHaveBeenNthCalledWith(
      1,
      "error",
      "[window] Renderer recovery requested: renderer-crash"
    );
    expect(deps.log).toHaveBeenNthCalledWith(2, "info", "[window] Recovery reload completed");
  });

  it("isRecovering reflects state transitions", () => {
    const deps = createMockDeps();
    const controller = createWindowResilienceController(deps);

    expect(controller.isRecovering()).toBe(false);

    controller.requestRecovery("renderer-crash");
    expect(controller.isRecovering()).toBe(true);

    controller.markLoadSucceeded();
    expect(controller.isRecovering()).toBe(false);
  });
});
