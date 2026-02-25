/**
 * Renderer crash recovery controller.
 *
 * Encapsulates the decision logic for recovering from renderer/GPU process
 * crashes. Designed for dependency injection so the controller itself is
 * pure and testable — all side effects (reload, logging) come through deps.
 *
 * Usage in main.ts:
 *   const resilience = createWindowResilienceController({ ... });
 *   mainWindow.webContents.on("render-process-gone", (_e, details) => {
 *     resilience.requestRecovery(`render-process-gone:${details.reason}:${details.exitCode}`);
 *   });
 *   mainWindow.webContents.on("did-finish-load", () => {
 *     resilience.markLoadSucceeded();
 *   });
 */

export interface WindowResilienceDeps {
  /** Trigger a page reload on the main window. */
  reload: () => void;
  /** Whether the main window still exists and is not destroyed. */
  isWindowAlive: () => boolean;
  /** Whether the app is in the process of quitting. */
  isQuitting: () => boolean;
  /** Structured logger. */
  log: (level: "warn" | "error" | "info", message: string, meta?: Record<string, unknown>) => void;
}

export interface WindowResilienceController {
  /** Request a recovery reload. No-op if already recovering, quitting, or window is dead. */
  requestRecovery: (reason: string) => void;
  /** Signal that the page has successfully loaded (resets recovery state). */
  markLoadSucceeded: () => void;
  /** Whether a recovery reload is currently in progress. */
  isRecovering: () => boolean;
}

export function createWindowResilienceController(
  deps: WindowResilienceDeps
): WindowResilienceController {
  let recoveryInFlight = false;

  function requestRecovery(reason: string) {
    if (recoveryInFlight || deps.isQuitting() || !deps.isWindowAlive()) {
      return;
    }

    recoveryInFlight = true;
    deps.log("error", `[window] Renderer recovery requested: ${reason}`);
    deps.reload();
  }

  function markLoadSucceeded() {
    if (recoveryInFlight) {
      deps.log("info", "[window] Recovery reload completed");
    }
    recoveryInFlight = false;
  }

  function isRecovering() {
    return recoveryInFlight;
  }

  return { requestRecovery, markLoadSucceeded, isRecovering };
}
