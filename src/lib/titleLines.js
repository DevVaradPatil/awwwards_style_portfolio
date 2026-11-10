/**
 * Split a project title into short uppercase lines for elastic display type.
 *
 * ElasticText rows never wrap (a wrapping row would re-flow every frame as
 * letters widen), so long titles are broken into lines here instead. The part
 * after an em dash ("365 — Life Calendar in Dots") is a subtitle and is
 * returned separately for normal text.
 *
 * @param {string} title
 * @param {number} [max=13] Soft limit of characters per line.
 * @returns {{ lines: string[], subtitle: string | null, longest: number }}
 */
export function titleLines(title, max = 13) {
  const [main, ...rest] = title.split(' — ')
  const subtitle = rest.length ? rest.join(' — ') : null
  const words = main.toUpperCase().split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const w of words) {
    if (line && (line + ' ' + w).length > max) {
      lines.push(line)
      line = w
    } else {
      line = line ? `${line} ${w}` : w
    }
  }
  if (line) lines.push(line)
  return { lines, subtitle, longest: Math.max(...lines.map((l) => l.length)) }
}

/**
 * CSS font-size that fits `chars` letters of the display face across ~88% of
 * the viewport at rest, capped for short titles.
 * Anybody uppercase averages ~0.6em per letter at the resting width.
 */
export function fitFontSize(chars, { cap = '11rem', vw = 88 } = {}) {
  const per = Math.max(chars, 4) * 0.6
  return `min(${cap}, ${(vw / per).toFixed(2)}vw)`
}
