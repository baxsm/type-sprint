import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// jsdom reports 0x0 layout and has no ResizeObserver, which makes Recharts'
// ResponsiveContainer render nothing. give every element a fixed size to measure
// and a no-op observer that fires once so the container settles immediately.
Object.defineProperties(HTMLElement.prototype, {
  offsetWidth: { configurable: true, value: 600 },
  offsetHeight: { configurable: true, value: 200 },
});

HTMLElement.prototype.getBoundingClientRect = () =>
  ({
    width: 600,
    height: 200,
    top: 0,
    left: 0,
    right: 600,
    bottom: 200,
    x: 0,
    y: 0,
    toJSON() {},
  }) as DOMRect;

class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    this.callback(
      [{ target, contentRect: target.getBoundingClientRect() } as ResizeObserverEntry],
      this,
    );
  }
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
