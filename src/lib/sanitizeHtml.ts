import DOMPurify from "dompurify";

// Renders rich text saved from the admin's Quill editor (Job description,
// Case Study overview/challenge/approach) — Quill's toolbar only ever
// produces this known-safe subset, sanitized again here as defense-in-depth
// before it reaches a visitor's browser.
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "a", "ul", "ol", "li", "blockquote", "h1", "h2", "h3", "span", "code", "pre",
];
const ALLOWED_ATTR = ["href", "target", "rel", "class"];

export function sanitizeHtml(html: string): string {
  // contentEditable (Quill included) converts most typed spaces to a
  // non-breaking space when serializing to HTML — not an intentional
  // "keep these words together" choice, just a browser whitespace-collapse
  // workaround. Left as-is, a long run of them has no valid wrap point and
  // overflows its container; normal spaces let it wrap like ordinary text.
  const normalized = html.replace(/\xa0|&nbsp;/g, " ");
  return DOMPurify.sanitize(normalized, { ALLOWED_TAGS, ALLOWED_ATTR });
}
