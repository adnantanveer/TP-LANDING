// Admin-pasted SVG icon markup (see Precision.tsx / Services.tsx, edited
// from Pages → Home → Capabilities/Services) — same trust boundary as the
// Scripts section already accepts raw <script> tags site-wide, so this is
// mostly a sanity strip rather than a real security boundary: drops
// <script>/<foreignObject> and on*="" event handler attributes so a pasted
// icon can't do more than render a shape.
export function sanitizeSvg(markup: string): string {
  return String(markup || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, "")
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "");
}
