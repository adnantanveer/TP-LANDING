import { describe, it, expect } from "vitest";
import { sanitizeSvg } from "./sanitizeSvg";

// Precision/Services/TechStack icons are pasted raw SVG markup from the
// admin panel and rendered via dangerouslySetInnerHTML — this is the only
// thing standing between "an admin pastes an icon from a source they
// didn't fully vet" and it executing script in a visitor's browser.
describe("sanitizeSvg", () => {
  it("passes normal icon markup through unchanged", () => {
    const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"/></svg>';
    expect(sanitizeSvg(icon)).toBe(icon);
  });

  it("strips <script> tags", () => {
    const malicious = '<svg><script>alert("xss")</script></svg>';
    expect(sanitizeSvg(malicious)).not.toContain("<script");
    expect(sanitizeSvg(malicious)).not.toContain("alert");
  });

  it("strips <foreignObject> (a known SVG script-embedding vector)", () => {
    const malicious = '<svg><foreignObject><body onload="alert(1)"></body></foreignObject></svg>';
    expect(sanitizeSvg(malicious)).not.toContain("foreignObject");
  });

  it("strips on* event handler attributes with double or single quotes", () => {
    const malicious = `<svg onload="alert(1)"><circle onclick='alert(2)' /></svg>`;
    const cleaned = sanitizeSvg(malicious);
    expect(cleaned).not.toContain("onload");
    expect(cleaned).not.toContain("onclick");
  });

  it("handles empty/undefined input without throwing", () => {
    expect(sanitizeSvg("")).toBe("");
  });
});
