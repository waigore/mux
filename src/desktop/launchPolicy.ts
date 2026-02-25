// Launch-time mitigations applied via app.commandLine.appendSwitch() before app.whenReady().
// Each mitigation maps 1:1 to a Chromium switch name.

export type DesktopLaunchMitigation = "disable-gpu-compositing";

/**
 * Determine which Chromium launch switches should be applied based on the
 * runtime environment. Pure function — no side effects.
 *
 * Current rules:
 * - Linux + --no-sandbox → disable-gpu-compositing
 *   (Without sandbox process isolation, a GPU compositor crash during rapid
 *    canvas teardown/recreate takes down the entire renderer — white screen.)
 *   Skipped if the user already passed --disable-gpu or --disable-gpu-compositing.
 */
export function getDesktopLaunchMitigations(env: {
  platform: NodeJS.Platform;
  argv: string[];
}): DesktopLaunchMitigation[] {
  const mitigations: DesktopLaunchMitigation[] = [];

  if (env.platform === "linux") {
    const hasNoSandbox = env.argv.includes("--no-sandbox");
    const hasExplicitGpuFlag =
      env.argv.includes("--disable-gpu") || env.argv.includes("--disable-gpu-compositing");

    if (hasNoSandbox && !hasExplicitGpuFlag) {
      mitigations.push("disable-gpu-compositing");
    }
  }

  return mitigations;
}
