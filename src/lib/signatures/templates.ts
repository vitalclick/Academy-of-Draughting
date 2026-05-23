// Email signature HTML templates.
//
// Constraints:
// - Table-based layout only (Outlook ignores most modern CSS).
// - Inline styles only — no <style> blocks, no classes.
// - No web fonts; fall back to Arial/Helvetica.
// - Absolute https URLs for logo images so they load in any mail client.
// - Total width ~500–600px so the signature fits the typical compose pane.

import { BRAND, OFFICE_LOCATIONS, ACCREDITATIONS } from './types';
import type { SignatureInput, SignatureOptions } from './types';

const FONT = "'Inter', 'Helvetica Neue', Arial, Helvetica, sans-serif";

// Logos are hosted at a fixed public URL so the image loads in every recipient's
// mail client regardless of which environment generated the signature.
const LOGO_ORIGIN = 'https://academydraughting.com';

function logoUrl(variant: 'navy' | 'white' = 'navy') {
  if (variant === 'white') return `${LOGO_ORIGIN}/assets/logo-light.png`;
  return `${LOGO_ORIGIN}/assets/logo.png`;
}

function esc(s: string | null | undefined) {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function officeLine(value: string) {
  return OFFICE_LOCATIONS.find((o) => o.value === value)?.line ?? OFFICE_LOCATIONS[0].line;
}

function telHref(num: string) {
  return num.replace(/[^\d+]/g, '');
}

type Ctx = { data: SignatureInput; opts: SignatureOptions };

// ---------- Shared building blocks ----------

function nameBlock({ data }: Ctx, color: string = BRAND.navy) {
  const qual = data.qualifications
    ? ` <span style="font-weight:400;color:${BRAND.muted};">${esc(data.qualifications)}</span>`
    : '';
  return `<div style="font-family:${FONT};font-size:16px;font-weight:700;color:${color};line-height:1.2;">${esc(data.full_name)}${qual}</div>
    <div style="font-family:${FONT};font-size:13px;font-weight:500;color:${BRAND.blue};line-height:1.4;margin-top:2px;">${esc(data.role)}</div>`;
}

function contactRows({ data }: Ctx, color: string = BRAND.ink) {
  const rows: string[] = [];
  const linkStyle = `color:${color};text-decoration:none;`;
  if (data.mobile) {
    rows.push(`<div style="font-family:${FONT};font-size:12px;color:${color};line-height:1.6;">M <a href="tel:${esc(telHref(data.mobile))}" style="${linkStyle}">${esc(data.mobile)}</a></div>`);
  }
  if (data.office_phone) {
    rows.push(`<div style="font-family:${FONT};font-size:12px;color:${color};line-height:1.6;">T <a href="tel:${esc(telHref(data.office_phone))}" style="${linkStyle}">${esc(data.office_phone)}</a></div>`);
  }
  rows.push(`<div style="font-family:${FONT};font-size:12px;color:${color};line-height:1.6;">E <a href="mailto:${esc(data.email)}" style="${linkStyle}">${esc(data.email)}</a></div>`);
  const site = data.website || 'academydraughting.com';
  const siteHref = site.startsWith('http') ? site : `https://${site}`;
  rows.push(`<div style="font-family:${FONT};font-size:12px;color:${color};line-height:1.6;">W <a href="${esc(siteHref)}" style="${linkStyle}">${esc(site)}</a></div>`);
  if (data.linkedin) {
    const href = data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`;
    rows.push(`<div style="font-family:${FONT};font-size:12px;color:${color};line-height:1.6;">in <a href="${esc(href)}" style="${linkStyle}">LinkedIn</a></div>`);
  }
  rows.push(`<div style="font-family:${FONT};font-size:12px;color:${BRAND.muted};line-height:1.6;margin-top:4px;">${esc(officeLine(data.office_location))}</div>`);
  return rows.join('');
}

function taglineBar(color: string = BRAND.cyan, bg: string = 'transparent') {
  return `<div style="font-family:${FONT};font-size:10px;font-weight:600;color:${color};letter-spacing:2.5px;text-transform:uppercase;background:${bg};padding:6px 0;">DRAWING OFFICES, TAUGHT RIGHT · SINCE 1981</div>`;
}

function accreditationsStrip(color: string = BRAND.muted) {
  return `<div style="font-family:${FONT};font-size:10px;color:${color};letter-spacing:1px;line-height:1.5;margin-top:6px;">${ACCREDITATIONS.join(' · ')}</div>`;
}

function logoCell(width: number, variant: 'navy' | 'white' = 'navy') {
  return `<img src="${logoUrl(variant)}" alt="The Academy of Advanced Draughting" width="${width}" height="auto" style="display:block;border:0;outline:none;text-decoration:none;width:${width}px;max-width:${width}px;height:auto;" />`;
}

// ---------- Templates ----------

function classicHorizontal(ctx: Ctx): string {
  const { opts } = ctx;
  const logoCol = opts.show_logo
    ? `<td valign="top" width="140" style="padding-right:18px;border-right:2px solid ${BRAND.blue};">${logoCell(120)}</td>`
    : '';
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family:${FONT};max-width:560px;">
    <tr>
      ${logoCol}
      <td valign="top" style="padding-left:${opts.show_logo ? '18px' : '0'};">
        ${nameBlock(ctx)}
        <div style="height:8px;line-height:8px;font-size:0;">&nbsp;</div>
        ${contactRows(ctx)}
        ${opts.show_tagline ? `<div style="margin-top:8px;">${taglineBar(BRAND.blue)}</div>` : ''}
        ${opts.show_accreditations ? accreditationsStrip() : ''}
      </td>
    </tr>
  </table>`;
}

function verticalStack(ctx: Ctx): string {
  const { opts } = ctx;
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family:${FONT};max-width:380px;">
    ${opts.show_logo ? `<tr><td align="left" style="padding-bottom:12px;">${logoCell(160)}</td></tr>` : ''}
    <tr><td>${nameBlock(ctx)}</td></tr>
    <tr><td style="border-top:2px solid ${BRAND.blue};padding-top:10px;">${contactRows(ctx)}</td></tr>
    ${opts.show_tagline ? `<tr><td style="padding-top:8px;">${taglineBar(BRAND.blue)}</td></tr>` : ''}
    ${opts.show_accreditations ? `<tr><td>${accreditationsStrip()}</td></tr>` : ''}
  </table>`;
}

function onNavyCard(ctx: Ctx): string {
  const { opts } = ctx;
  const logoCol = opts.show_logo
    ? `<td valign="top" width="140" style="padding-right:18px;">${logoCell(120, 'white')}</td>`
    : '';
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family:${FONT};background:${BRAND.deepNavy};max-width:580px;border-radius:6px;">
    <tr><td style="padding:20px 22px;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation">
        <tr>
          ${logoCol}
          <td valign="top" style="padding-left:${opts.show_logo ? '18px' : '0'};border-left:${opts.show_logo ? `2px solid ${BRAND.cyan}` : 'none'};">
            <div style="font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;line-height:1.2;">${esc(ctx.data.full_name)}${ctx.data.qualifications ? ` <span style="font-weight:400;color:#C7D7FF;">${esc(ctx.data.qualifications)}</span>` : ''}</div>
            <div style="font-family:${FONT};font-size:13px;font-weight:500;color:${BRAND.cyan};line-height:1.4;margin-top:2px;">${esc(ctx.data.role)}</div>
            <div style="height:10px;line-height:10px;font-size:0;">&nbsp;</div>
            ${contactRows(ctx, '#E6EDFF')}
          </td>
        </tr>
      </table>
      ${opts.show_tagline ? `<div style="margin-top:14px;">${taglineBar(BRAND.cyan)}</div>` : ''}
      ${opts.show_accreditations ? accreditationsStrip('#C7D7FF') : ''}
    </td></tr>
  </table>`;
}

function compactOneLiner(ctx: Ctx): string {
  const { data, opts } = ctx;
  const site = data.website || 'academydraughting.com';
  const parts: string[] = [
    `<strong style="color:${BRAND.navy};">${esc(data.full_name)}</strong>`,
    `<span style="color:${BRAND.blue};">${esc(data.role)}</span>`,
  ];
  if (data.mobile) parts.push(`<a href="tel:${esc(telHref(data.mobile))}" style="color:${BRAND.ink};text-decoration:none;">${esc(data.mobile)}</a>`);
  parts.push(`<a href="mailto:${esc(data.email)}" style="color:${BRAND.ink};text-decoration:none;">${esc(data.email)}</a>`);
  parts.push(`<a href="https://${esc(site.replace(/^https?:\/\//, ''))}" style="color:${BRAND.ink};text-decoration:none;">${esc(site)}</a>`);
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family:${FONT};max-width:640px;">
    ${opts.show_logo ? `<tr><td style="padding-bottom:6px;">${logoCell(110)}</td></tr>` : ''}
    <tr><td style="font-family:${FONT};font-size:12px;color:${BRAND.ink};line-height:1.5;">
      ${parts.join(`<span style="color:${BRAND.line};margin:0 8px;">·</span>`)}
    </td></tr>
    ${opts.show_tagline ? `<tr><td style="padding-top:6px;">${taglineBar(BRAND.blue)}</td></tr>` : ''}
  </table>`;
}

function taglineBanner(ctx: Ctx): string {
  const { opts } = ctx;
  const logoCol = opts.show_logo
    ? `<td valign="top" width="130" style="padding-right:16px;">${logoCell(110)}</td>`
    : '';
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family:${FONT};max-width:580px;">
    <tr>
      ${logoCol}
      <td valign="top">
        ${nameBlock(ctx)}
        <div style="height:8px;line-height:8px;font-size:0;">&nbsp;</div>
        ${contactRows(ctx)}
      </td>
    </tr>
    <tr><td colspan="${opts.show_logo ? 2 : 1}" style="padding-top:12px;">
      <div style="font-family:${FONT};font-size:11px;font-weight:600;color:#ffffff;letter-spacing:3px;text-transform:uppercase;background:${BRAND.blue};padding:9px 14px;text-align:center;">
        DRAWING OFFICES, TAUGHT RIGHT · SINCE 1981
      </div>
    </td></tr>
    ${opts.show_accreditations ? `<tr><td colspan="${opts.show_logo ? 2 : 1}">${accreditationsStrip()}</td></tr>` : ''}
  </table>`;
}

function accreditationsStripTemplate(ctx: Ctx): string {
  const { opts } = ctx;
  const logoCol = opts.show_logo
    ? `<td valign="top" width="130" style="padding-right:16px;border-right:2px solid ${BRAND.blue};">${logoCell(110)}</td>`
    : '';
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family:${FONT};max-width:600px;">
    <tr>
      ${logoCol}
      <td valign="top" style="padding-left:${opts.show_logo ? '16px' : '0'};">
        ${nameBlock(ctx)}
        <div style="height:8px;line-height:8px;font-size:0;">&nbsp;</div>
        ${contactRows(ctx)}
      </td>
    </tr>
    <tr><td colspan="${opts.show_logo ? 2 : 1}" style="padding-top:10px;border-top:1px solid ${BRAND.line};">
      <div style="font-family:${FONT};font-size:9px;color:${BRAND.muted};letter-spacing:1.2px;text-transform:uppercase;line-height:1.6;padding-top:8px;">
        Accredited by · ${ACCREDITATIONS.join(' &nbsp;·&nbsp; ')}
      </div>
      <div style="font-family:${FONT};font-size:9px;color:${BRAND.muted};letter-spacing:1.2px;text-transform:uppercase;margin-top:4px;">
        Specialist draughting since 1981 · SAQA-aligned national qualifications
      </div>
    </td></tr>
    ${opts.show_tagline ? `<tr><td colspan="${opts.show_logo ? 2 : 1}" style="padding-top:8px;">${taglineBar(BRAND.blue)}</td></tr>` : ''}
  </table>`;
}

function multiCampusFooter(ctx: Ctx): string {
  const { opts } = ctx;
  const logoCol = opts.show_logo
    ? `<td valign="top" width="130" style="padding-right:16px;">${logoCell(110)}</td>`
    : '';
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family:${FONT};max-width:600px;">
    <tr>
      ${logoCol}
      <td valign="top">
        ${nameBlock(ctx)}
        <div style="height:8px;line-height:8px;font-size:0;">&nbsp;</div>
        ${contactRows(ctx)}
      </td>
    </tr>
    <tr><td colspan="${opts.show_logo ? 2 : 1}" style="padding-top:10px;border-top:1px solid ${BRAND.line};">
      <div style="font-family:${FONT};font-size:10px;color:${BRAND.navy};font-weight:600;letter-spacing:2px;text-transform:uppercase;padding-top:8px;">
        Johannesburg · Durban · Online
      </div>
    </td></tr>
    ${opts.show_tagline ? `<tr><td colspan="${opts.show_logo ? 2 : 1}" style="padding-top:6px;">${taglineBar(BRAND.blue)}</td></tr>` : ''}
  </table>`;
}

function ctaButton(ctx: Ctx): string {
  const { data, opts } = ctx;
  const logoCol = opts.show_logo
    ? `<td valign="top" width="130" style="padding-right:16px;border-right:2px solid ${BRAND.blue};">${logoCell(110)}</td>`
    : '';
  const ctaHref = `mailto:${esc(data.email)}?subject=${encodeURIComponent('Booking a course consult with ' + data.full_name)}`;
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family:${FONT};max-width:580px;">
    <tr>
      ${logoCol}
      <td valign="top" style="padding-left:${opts.show_logo ? '16px' : '0'};">
        ${nameBlock(ctx)}
        <div style="height:8px;line-height:8px;font-size:0;">&nbsp;</div>
        ${contactRows(ctx)}
        <div style="margin-top:12px;">
          <a href="${ctaHref}" style="display:inline-block;background:${BRAND.blue};color:#ffffff;font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;text-decoration:none;padding:10px 18px;border-radius:3px;">
            Book a course consult →
          </a>
        </div>
        ${opts.show_tagline ? `<div style="margin-top:10px;">${taglineBar(BRAND.blue)}</div>` : ''}
      </td>
    </tr>
  </table>`;
}

function minimalTextOnly(ctx: Ctx): string {
  const { data, opts } = ctx;
  const site = data.website || 'academydraughting.com';
  const contacts: string[] = [];
  if (data.mobile) contacts.push(`<a href="tel:${esc(telHref(data.mobile))}" style="color:${BRAND.ink};text-decoration:none;">${esc(data.mobile)}</a>`);
  if (data.office_phone) contacts.push(`<a href="tel:${esc(telHref(data.office_phone))}" style="color:${BRAND.ink};text-decoration:none;">${esc(data.office_phone)}</a>`);
  contacts.push(`<a href="mailto:${esc(data.email)}" style="color:${BRAND.ink};text-decoration:none;">${esc(data.email)}</a>`);
  contacts.push(`<a href="https://${esc(site.replace(/^https?:\/\//, ''))}" style="color:${BRAND.ink};text-decoration:none;">${esc(site)}</a>`);
  return `<div style="font-family:${FONT};font-size:13px;color:${BRAND.ink};line-height:1.55;max-width:520px;">
    <div style="color:${BRAND.navy};font-weight:700;">${esc(data.full_name)}${data.qualifications ? `, <span style="font-weight:400;color:${BRAND.muted};">${esc(data.qualifications)}</span>` : ''}</div>
    <div style="color:${BRAND.muted};font-size:12px;">${esc(data.role)} · The Academy of Advanced Draughting</div>
    <div style="margin-top:4px;font-size:12px;">${contacts.join(' · ')}</div>
    <div style="margin-top:2px;font-size:11px;color:${BRAND.muted};">${esc(officeLine(data.office_location))}</div>
    ${opts.show_tagline ? `<div style="margin-top:6px;font-size:11px;color:${BRAND.blue};font-style:italic;">Drawing offices, taught right. Since 1981.</div>` : ''}
  </div>`;
}

function boldHeader(ctx: Ctx): string {
  const { data, opts } = ctx;
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="font-family:${FONT};max-width:580px;border:1px solid ${BRAND.line};">
    <tr><td style="background:${BRAND.blue};padding:12px 18px;">
      <div style="font-family:${FONT};font-size:17px;font-weight:700;color:#ffffff;line-height:1.2;">${esc(data.full_name)}</div>
      <div style="font-family:${FONT};font-size:12px;font-weight:600;color:#E6EDFF;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;">${esc(data.role)}</div>
    </td></tr>
    <tr><td style="padding:14px 18px;background:#ffffff;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%">
        <tr>
          ${opts.show_logo ? `<td valign="top" width="120" style="padding-right:14px;">${logoCell(100)}</td>` : ''}
          <td valign="top">
            ${contactRows(ctx)}
          </td>
        </tr>
      </table>
      ${opts.show_tagline ? `<div style="margin-top:10px;">${taglineBar(BRAND.blue)}</div>` : ''}
      ${opts.show_accreditations ? accreditationsStrip() : ''}
    </td></tr>
  </table>`;
}

// ---------- Registry ----------

export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  supportsLogo: boolean;
  render: (ctx: Ctx) => string;
};

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'classic-horizontal',
    name: 'Classic horizontal',
    description: 'Logo left, contact details right with a blueprint-blue divider. The default.',
    supportsLogo: true,
    render: classicHorizontal,
  },
  {
    id: 'vertical-stack',
    name: 'Vertical stack',
    description: 'Logo on top, details beneath. Best for narrow mobile clients.',
    supportsLogo: true,
    render: verticalStack,
  },
  {
    id: 'on-navy-card',
    name: 'On-navy card',
    description: 'Deep-navy block with reversed white logo and cyan tagline. High contrast.',
    supportsLogo: true,
    render: onNavyCard,
  },
  {
    id: 'compact-oneliner',
    name: 'Compact one-liner',
    description: 'Single horizontal line of details. Lowest visual footprint, replies-friendly.',
    supportsLogo: true,
    render: compactOneLiner,
  },
  {
    id: 'tagline-banner',
    name: 'Tagline banner',
    description: 'Standard details with a full-width electric-blue tagline bar across the bottom.',
    supportsLogo: true,
    render: taglineBanner,
  },
  {
    id: 'accreditations-strip',
    name: 'Accreditations strip',
    description: 'Adds an authoritative DHET / QCTO / SAQA accreditations row.',
    supportsLogo: true,
    render: accreditationsStripTemplate,
  },
  {
    id: 'multi-campus',
    name: 'Multi-campus footer',
    description: 'Footer row of every campus we operate from — for staff who sign across sites.',
    supportsLogo: true,
    render: multiCampusFooter,
  },
  {
    id: 'cta-button',
    name: 'Admissions / CTA button',
    description: 'Includes a blue “Book a course consult” call-to-action. For admissions staff.',
    supportsLogo: true,
    render: ctaButton,
  },
  {
    id: 'minimal-text',
    name: 'Minimal text-only',
    description: 'Pure text with brand-colour accents. No images — guaranteed to render anywhere.',
    supportsLogo: false,
    render: minimalTextOnly,
  },
  {
    id: 'bold-header',
    name: 'Bold blue header',
    description: 'Blue header strip with name and role, contact details below. High impact.',
    supportsLogo: true,
    render: boldHeader,
  },
];

export function renderSignature(data: SignatureInput, opts: SignatureOptions): string {
  const tpl = TEMPLATES.find((t) => t.id === opts.template) ?? TEMPLATES[0];
  return tpl.render({ data, opts });
}
