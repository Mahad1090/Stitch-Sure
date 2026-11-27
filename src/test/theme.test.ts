import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(p, "utf8");
const css = read("src/styles.css");

describe("Theme", () => {
  it("meets every contrast target in light and dark (includes D5A M-10, form borders)", () => {
    expect(() => execFileSync(process.execPath, ["scripts/contrast.mjs"], { stdio: "pipe" })).not.toThrow();
  });

  it("draws text fields with the input token", () => {
    for (const file of ["input", "textarea"])
      expect(read(`src/components/ui/${file}.tsx`)).toContain("border-input");
    expect(css).toMatch(/--input:\s*#5b6b82/);
  });

  it("uses the team's rose: accents, solid rose fill with dark text, deep links", () => {
    expect(css).toMatch(/--brand:\s*#d76188/);
    expect(css).toMatch(/--primary:\s*#d76188/);
    expect(css).toMatch(/--link:\s*#c63263/);
    expect(css).not.toMatch(/data-colour|data-tone|inset 0 0 0 2px/);
  });

  it("has one light and one dark token block and no remote fonts or decoration", () => {
    expect(css.match(/:root\s*\{/g)).toHaveLength(2);
    expect(css + read("src/routes/__root.tsx")).not.toMatch(/googleapis|data:image|Caveat/);
    // The only script font is the self-hosted wordmark.
    expect(css.match(/Sacramento/g)).toHaveLength(1);
  });
});
