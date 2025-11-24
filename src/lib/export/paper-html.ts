export function exportPaperToHTML(paper: { title: string; abstract: string; keywords: string[]; markdown: string; references: string[] }, settings?: { title?: string }) {
  const title = settings?.title ?? paper.title;
  const css = `
    body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 1in; }
    h1, h2, h3 { font-weight: bold; }
    h1 { text-align: center; margin-bottom: 24px; }
    .abstract { margin-top: 16px; }
    .keywords { margin-top: 8px; }
    sup.cite { font-size: 0.8em; }
    .refs li { margin-bottom: 8px; text-indent: -24px; padding-left: 24px; }
    @media print { a[href]::after { content: ""; } }
  `;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>
    <h1>${title}</h1>
    <div class="abstract"><strong>Abstract</strong><div>${paper.abstract}</div></div>
    <div class="keywords"><strong>Keywords:</strong> ${paper.keywords.join(", ")}</div>
    <hr/>
    <div>${paper.markdown.replace(/\n/g, "<br/>")}</div>
    <h2>References</h2>
    <ol class="refs">${paper.references.map(r => `<li>${r}</li>`).join("")}</ol>
  </body></html>`;
  return html;
}