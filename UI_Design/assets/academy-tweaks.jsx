/* ============================================================
   Academy Tweaks — palette + density + headline variant
   Mounts as window.AcademyTweaks
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "electric-blue",
  "density": "regular",
  "headline": "italic",
  "showBadges": true
}/*EDITMODE-END*/;

const PALETTES = {
  'electric-blue': {
    label: 'Electric Blue',
    swatch: ['#071B3B', '#2D6FF7', '#3DD9D6'],
    vars: {
      '--blue-700': '#1E4FCC', '--blue-600': '#2860EA', '--blue-500': '#2D6FF7',
      '--blue-400': '#5A8CFF', '--blue-300': '#93B3FF', '--blue-200': '#C7D7FF',
      '--blue-100': '#E6EDFF',
      '--cyan-500': '#3DD9D6', '--cyan-400': '#6FE6E2',
    },
  },
  'cobalt': {
    label: 'Cobalt',
    swatch: ['#071B3B', '#356BE0', '#48C9F0'],
    vars: {
      '--blue-700': '#1B3F9C', '--blue-600': '#2455C8', '--blue-500': '#356BE0',
      '--blue-400': '#6890F0', '--blue-300': '#9CB7F7', '--blue-200': '#C7D7FF',
      '--blue-100': '#E6EDFF',
      '--cyan-500': '#48C9F0', '--cyan-400': '#7CD8F5',
    },
  },
  'cad-amber': {
    label: 'CAD Amber',
    swatch: ['#071B3B', '#F08914', '#3DD9D6'],
    vars: {
      '--blue-700': '#B85C00', '--blue-600': '#D87000', '--blue-500': '#F08914',
      '--blue-400': '#F5A647', '--blue-300': '#FAC988', '--blue-200': '#FCE3C2',
      '--blue-100': '#FEF1E0',
      '--cyan-500': '#3DD9D6', '--cyan-400': '#6FE6E2',
    },
  },
  'heritage-red': {
    label: 'Heritage Red',
    swatch: ['#071B3B', '#D62B52', '#48C9F0'],
    vars: {
      '--blue-700': '#9D1B3A', '--blue-600': '#BD2447', '--blue-500': '#D62B52',
      '--blue-400': '#E66280', '--blue-300': '#F0A0B6', '--blue-200': '#F8CFD9',
      '--blue-100': '#FCE9EE',
      '--cyan-500': '#48C9F0', '--cyan-400': '#7CD8F5',
    },
  },
};

function applyPalette(name) {
  const p = PALETTES[name] || PALETTES['electric-blue'];
  const root = document.documentElement.style;
  Object.entries(p.vars).forEach(([k, v]) => root.setProperty(k, v));
}

function AcademyTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => { applyPalette(t.palette); }, [t.palette]);
  React.useEffect(() => { document.documentElement.setAttribute('data-density', t.density); }, [t.density]);
  React.useEffect(() => { document.documentElement.setAttribute('data-headline', t.headline); }, [t.headline]);
  React.useEffect(() => { document.documentElement.setAttribute('data-badges', t.showBadges ? 'on' : 'off'); }, [t.showBadges]);

  return (
    <TweaksPanel title="Academy · Tweaks">
      <TweakSection label="Accent palette" />
      <TweakSelect
        label="Palette"
        value={t.palette}
        options={Object.entries(PALETTES).map(([v, p]) => ({ value: v, label: p.label }))}
        onChange={v => setTweak('palette', v)}
      />

      <TweakSection label="Layout" />
      <TweakRadio
        label="Density"
        value={t.density}
        options={[
          { value: 'tight', label: 'Tight' },
          { value: 'regular', label: 'Regular' },
          { value: 'roomy', label: 'Roomy' },
        ]}
        onChange={v => setTweak('density', v)}
      />

      <TweakSection label="Type" />
      <TweakRadio
        label="Headline accent"
        value={t.headline}
        options={[
          { value: 'italic', label: 'Italic' },
          { value: 'solid', label: 'Solid' },
          { value: 'under', label: 'Under' },
        ]}
        onChange={v => setTweak('headline', v)}
      />

      <TweakSection label="Intelligence layer" />
      <TweakToggle
        label="Show AI badges"
        value={t.showBadges}
        onChange={v => setTweak('showBadges', v)}
      />
    </TweaksPanel>
  );
}

const tweakStyle = document.createElement('style');
tweakStyle.textContent = `
  [data-density="tight"] .section { padding-top: 64px; padding-bottom: 64px; }
  [data-density="tight"] .hero-inner { padding-top: 56px; padding-bottom: 80px; min-height: 600px; }
  [data-density="roomy"] .section { padding-top: 128px; padding-bottom: 128px; }
  [data-density="roomy"] .hero-inner { padding-top: 112px; padding-bottom: 144px; min-height: 820px; }

  [data-headline="solid"] .hero-title .accent,
  [data-headline="solid"] .sec-head-title em,
  [data-headline="solid"] .cta-title em {
    font-style: normal !important;
    background: none !important;
    -webkit-background-clip: initial !important;
    background-clip: initial !important;
    color: var(--blue-500) !important;
  }
  [data-headline="solid"] .hero-title .accent { color: var(--cyan-400) !important; }

  [data-headline="under"] .hero-title .accent,
  [data-headline="under"] .sec-head-title em,
  [data-headline="under"] .cta-title em {
    font-style: normal !important;
    background: none !important;
    -webkit-background-clip: initial !important;
    background-clip: initial !important;
    color: inherit !important;
    text-decoration: underline;
    text-decoration-color: var(--blue-500);
    text-underline-offset: 0.16em;
    text-decoration-thickness: 3px;
  }

  [data-badges="off"] .pill-ai,
  [data-badges="off"] .ai-card .ai-label,
  [data-badges="off"] .cc-rec { display: none !important; }
`;
document.head.appendChild(tweakStyle);

window.AcademyTweaks = AcademyTweaks;
