import { afterEach, describe, expect, it, vi } from "vitest";

vi.stubGlobal("customElements", { define: vi.fn() });
const { EmbyLibraryShelf } = await import("../src/components/shelf");

afterEach(() => vi.unstubAllGlobals());

describe("single shelf row", () => {
  it("fits ten small or three large items and recalculates after resizing", () => {
    const shelf = new EmbyLibraryShelf();
    const row = { clientWidth: 1240 };
    Object.defineProperty(shelf, "_row", { value: row });
    vi.stubGlobal("getComputedStyle", () => ({
      paddingLeft: "16px", paddingRight: "16px", columnGap: "12px",
    }));
    const measured = shelf as unknown as { _measure(): void; _columns: number };
    shelf.posterWidth = 110;
    measured._measure();
    expect(measured._columns).toBe(10);

    row.clientWidth = 626;
    shelf.posterWidth = 190;
    measured._measure();
    expect(measured._columns).toBe(3);

    row.clientWidth = 625;
    measured._measure();
    expect(measured._columns).toBe(2);

    row.clientWidth = 132;
    measured._measure();
    expect(measured._columns).toBe(1);
  });

  it("accounts for the wider landscape images", () => {
    const shelf = new EmbyLibraryShelf();
    Object.defineProperty(shelf, "_row", { value: { clientWidth: 850 } });
    vi.stubGlobal("getComputedStyle", () => ({
      paddingLeft: "16px", paddingRight: "16px", columnGap: "12px",
    }));
    const measured = shelf as unknown as { _measure(): void; _columns: number };
    shelf.shape = "still";
    shelf.posterWidth = 150;
    measured._measure();
    expect(measured._columns).toBe(3);
  });
});
