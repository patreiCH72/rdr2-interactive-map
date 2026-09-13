export function pinSvg(color: string, found: boolean): string {
  const inner = found
    ? `<circle cx="14" cy="13.4" r="6.1" fill="#16a34a" stroke="#14532d" stroke-width="1.2"/>
    <path d="M10.7 13.5l2.3 2.4 4.7-5.4" fill="none" stroke="#052e16" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10.7 13.5l2.3 2.4 4.7-5.4" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<circle cx="14" cy="13.4" r="5.4" fill="#f4e6c3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36" aria-hidden="true">
    <path d="M14 1.2C7.4 1.2 2.2 6.6 2.2 13.4c0 8.4 11.8 21 11.8 21s11.8-12.6 11.8-21C25.8 6.6 20.6 1.2 14 1.2z" fill="${color}" stroke="#2a1f14" stroke-width="1.3"/>
    ${inner}
  </svg>`;
}

export function clusterHtml(count: number): string {
  return `<div class="rdr-cluster">${count}</div>`;
}
