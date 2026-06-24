// theme.jsx — design tokens and CSS-vars setup.
// Different "directions" (notion / editorial / dense) are passed in as props
// to <KnowledgeCanvas>; tweaks override on top.

window.CL_THEME_PRESETS = {
  notion: {
    name: 'notion',
    label: 'Notion-clean',
    bodyFont: 'Inter',
    serif: false,
    accent: '#5B5BD6',
    density: 'comfy',
    radius: 8,
    badge: 'pill',
    bg: '#ffffff',
    surface: '#fbfaf8',
    ink: '#28272A',
    inkSoft: '#5C5B61',
    inkFaint: '#8A8990',
    line: '#E9E8E5',
    lineSoft: '#F1F0EC',
    chip: '#F4F2EE',
    accentTint: '#EDEDFC',
    success: '#16A34A',
    danger: '#DC2626',
    diffAdd: '#E6F4EA',
    diffAddInk: '#137333',
    diffDel: '#FCE8E6',
    diffDelInk: '#A50E0E',
  },
  editorial: {
    name: 'editorial',
    label: 'Editorial-serif',
    bodyFont: 'Source Serif 4',
    serif: true,
    accent: '#7A2E2E',
    density: 'comfy',
    radius: 2,
    badge: 'underline',
    bg: '#FBF8F2',
    surface: '#F5F1E8',
    ink: '#1F1A14',
    inkSoft: '#5A5147',
    inkFaint: '#8F857A',
    line: '#E5DFD2',
    lineSoft: '#EFEAE0',
    chip: '#EFEAE0',
    accentTint: '#F1E4E0',
    success: '#3F6F3F',
    danger: '#8B2A2A',
    diffAdd: '#EAEFD9',
    diffAddInk: '#3F6F3F',
    diffDel: '#F2DCD4',
    diffDelInk: '#8B2A2A',
  },
  dense: {
    name: 'dense',
    label: 'Dev-tool-dense',
    bodyFont: 'IBM Plex Sans',
    serif: false,
    accent: '#0969DA',
    density: 'compact',
    radius: 4,
    badge: 'square',
    bg: '#FFFFFF',
    surface: '#F6F8FA',
    ink: '#1F2328',
    inkSoft: '#59636E',
    inkFaint: '#818B98',
    line: '#D1D9E0',
    lineSoft: '#E7ECF0',
    chip: '#EAEEF2',
    accentTint: '#DDF4FF',
    success: '#1A7F37',
    danger: '#CF222E',
    diffAdd: '#DAFBE1',
    diffAddInk: '#1A7F37',
    diffDel: '#FFEBE9',
    diffDelInk: '#CF222E',
  },
};

// Convert a preset to CSS variables on a scoped element.
window.cl_themeStyle = function (theme, dark) {
  const t = theme;
  if (dark) {
    // dark variant — re-tone the tokens
    return {
      '--cl-bg': '#191918',
      '--cl-surface': '#202020',
      '--cl-ink': '#E8E6E3',
      '--cl-ink-soft': '#A8A6A3',
      '--cl-ink-faint': '#777573',
      '--cl-line': '#2E2D2B',
      '--cl-line-soft': '#252422',
      '--cl-chip': '#2A2927',
      '--cl-accent': t.accent,
      '--cl-accent-tint': t.name === 'editorial' ? '#3A2422' : t.name === 'dense' ? '#0D2A4A' : '#28244A',
      '--cl-success': t.success,
      '--cl-danger': t.danger,
      '--cl-diff-add': t.name === 'dense' ? '#0F3A21' : '#1F3A26',
      '--cl-diff-add-ink': '#A3D9B1',
      '--cl-diff-del': t.name === 'dense' ? '#3A1518' : '#3A2422',
      '--cl-diff-del-ink': '#F5A3A3',
      '--cl-radius': t.radius + 'px',
      '--cl-body-font': `"${t.bodyFont}", ${t.serif ? 'Georgia, serif' : 'system-ui, sans-serif'}`,
    };
  }
  return {
    '--cl-bg': t.bg,
    '--cl-surface': t.surface,
    '--cl-ink': t.ink,
    '--cl-ink-soft': t.inkSoft,
    '--cl-ink-faint': t.inkFaint,
    '--cl-line': t.line,
    '--cl-line-soft': t.lineSoft,
    '--cl-chip': t.chip,
    '--cl-accent': t.accent,
    '--cl-accent-tint': t.accentTint,
    '--cl-success': t.success,
    '--cl-danger': t.danger,
    '--cl-diff-add': t.diffAdd,
    '--cl-diff-add-ink': t.diffAddInk,
    '--cl-diff-del': t.diffDel,
    '--cl-diff-del-ink': t.diffDelInk,
    '--cl-radius': t.radius + 'px',
    '--cl-body-font': `"${t.bodyFont}", ${t.serif ? 'Georgia, serif' : 'system-ui, sans-serif'}`,
  };
};

// Density → padding scale
window.cl_densityScale = function (d) {
  return d === 'compact' ? { row: 6, gap: 10, pad: 10, prose: 14 }
    : d === 'comfy' ? { row: 14, gap: 24, pad: 24, prose: 17 }
    : { row: 10, gap: 16, pad: 16, prose: 15 };
};
