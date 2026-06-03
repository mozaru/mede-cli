import { afterEach, describe, it, expect } from "vitest";
import {
  clearSharedContainer,
  createContainer,
  getContainer,
  setSharedContainer,
} from "./container.js";

describe("container shared wiring (Q1 single connection)", () => {
  afterEach(() => {
    clearSharedContainer();
  });

  it("builds an independent graph on each createContainer call", () => {
    const first = createContainer();
    const second = createContainer();

    try {
      expect(first).not.toBe(second);
      expect(first.statusService).not.toBe(second.statusService);
    } finally {
      first.dispose();
      second.dispose();
    }
  });

  it("returns a fresh container per call when no session is active", () => {
    const a = getContainer();
    const b = getContainer();

    try {
      expect(a).not.toBe(b);
    } finally {
      a.dispose();
      b.dispose();
    }
  });

  it("returns the shared container to every handler while a session is active", () => {
    const shared = createContainer();
    setSharedContainer(shared);

    try {
      expect(getContainer()).toBe(shared);
      expect(getContainer()).toBe(shared);
      // Same services -> same long-lived connection reused across commands.
      expect(getContainer().cycleService).toBe(shared.cycleService);
    } finally {
      clearSharedContainer();
      shared.dispose();
    }
  });

  it("goes back to per-call containers once the session is cleared", () => {
    const shared = createContainer();
    setSharedContainer(shared);
    clearSharedContainer();
    shared.dispose();

    const a = getContainer();
    const b = getContainer();

    try {
      expect(a).not.toBe(shared);
      expect(a).not.toBe(b);
    } finally {
      a.dispose();
      b.dispose();
    }
  });
});
