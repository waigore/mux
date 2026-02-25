import { describe, expect, it } from "bun:test";
import { getDesktopLaunchMitigations } from "./launchPolicy";

describe("getDesktopLaunchMitigations", () => {
  it("returns disable-gpu-compositing for Linux with --no-sandbox", () => {
    const mitigations = getDesktopLaunchMitigations({
      platform: "linux",
      argv: ["--no-sandbox"],
    });

    expect(mitigations).toEqual(["disable-gpu-compositing"]);
  });

  it("returns no mitigations when Linux has --no-sandbox and --disable-gpu", () => {
    const mitigations = getDesktopLaunchMitigations({
      platform: "linux",
      argv: ["--no-sandbox", "--disable-gpu"],
    });

    expect(mitigations).toEqual([]);
  });

  it("returns no mitigations when Linux has --no-sandbox and --disable-gpu-compositing", () => {
    const mitigations = getDesktopLaunchMitigations({
      platform: "linux",
      argv: ["--no-sandbox", "--disable-gpu-compositing"],
    });

    expect(mitigations).toEqual([]);
  });

  it("returns no mitigations for Linux without --no-sandbox", () => {
    const mitigations = getDesktopLaunchMitigations({
      platform: "linux",
      argv: [],
    });

    expect(mitigations).toEqual([]);
  });

  it("returns no mitigations for macOS with --no-sandbox", () => {
    const mitigations = getDesktopLaunchMitigations({
      platform: "darwin",
      argv: ["--no-sandbox"],
    });

    expect(mitigations).toEqual([]);
  });

  it("returns no mitigations for Windows with --no-sandbox", () => {
    const mitigations = getDesktopLaunchMitigations({
      platform: "win32",
      argv: ["--no-sandbox"],
    });

    expect(mitigations).toEqual([]);
  });

  it("returns no mitigations when no args are passed", () => {
    const mitigations = getDesktopLaunchMitigations({
      platform: "linux",
      argv: [],
    });

    expect(mitigations).toEqual([]);
  });
});
