export function pinSvg(color: string, found: boolean): string {
  const fill = found ? "#6b655c" : color;
  const check = found
    ? `<path d="M11 13.2l2 2 4.2-4.4" fill="none" stroke="#f4e6c3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36" aria-hidden="true">
    <path d="M14 1.2C7.4 1.2 2.2 6.6 2.2 13.4c0 8.4 11.8 21 11.8 21s11.8-12.6 11.8-21C25.8 6.6 20.6 1.2 14 1.2z" fill="${fill}" stroke="#2a1f14" stroke-width="1.3"/>
    <circle cx="14" cy="13.4" r="5.4" fill="${found ? "#cfc6b4" : "#f4e6c3"}"/>
    ${check}
  </svg>`;
}

export function clusterHtml(count: number): string {
  return `<div class="rdr-cluster">${count}</div>`;
}
