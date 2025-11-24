function esc(s: string) { return s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string)) }

export function formatAPA7(r: any) {
  const authors = (r.authors ?? []).join(', ')
  const year = r.year ? `(${r.year}).` : ''
  const title = r.title ? `${r.title}.` : ''
  const url = r.url ? r.url : ''
  return `${authors} ${year} ${title} ${url}`
}

export function exportReviewToHTML(review: any, references: any[], settings: any) {
  const css = `body{font-family: 'Times New Roman',serif;font-size:12pt;line-height:1.5;margin:1in;} h1,h2{page-break-after:avoid} .ref{margin-left:0.5in;text-indent:-0.5in} sup.cite{font-size:0.8em} .toc a{text-decoration:none} .page{page-break-after:always}`
  const sections = (review.sections ?? []).map((s: any, idx: number) => `<h2 id="sec${idx+1}">${esc(s.title ?? `Section ${idx+1}`)}</h2><div>${(s.content ?? '').replace(/\[(\d+(?:[-,]\d+)?)\]/g, '<sup class="cite">[$1]</sup>')}</div>`).join('\n')
  const toc = (review.outline?.sections ?? []).map((s: any, idx: number) => `<li><a href="#sec${idx+1}">${esc(s.title)}</a></li>`).join('')
  const refs = references.map((r: any, i: number) => `<div class="ref">[${i+1}] ${esc(formatAPA7(r))}</div>`).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${esc(review.title ?? 'Review')}</title><style>${css}</style></head><body>
  <div class="page"><h1>${esc(review.title ?? 'Review')}</h1><p>${esc(review.abstract ?? '')}</p></div>
  <div class="page"><h2>目录</h2><ul class="toc">${toc}</ul></div>
  <div class="page">${sections}</div>
  <div class="page"><h2>参考文献</h2>${refs}</div>
  </body></html>`
  return html
}