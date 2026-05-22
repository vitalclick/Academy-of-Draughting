import { SITE } from '@/lib/site';

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'
  );
}

function shell(title: string, body: string) {
  return `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,sans-serif;color:#050F25;background:#F4F6FA;padding:24px;margin:0">
  <div style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #E8EDF5;border-radius:14px;padding:32px">
    <div style="font-size:11px;letter-spacing:.12em;color:#4A5876;margin-bottom:18px">${escape(SITE.name.toUpperCase())}</div>
    <h1 style="font-size:22px;margin:0 0 16px;font-weight:500;letter-spacing:-.02em">${escape(title)}</h1>
    ${body}
    <hr style="border:0;border-top:1px solid #E8EDF5;margin:28px 0" />
    <p style="font-size:12px;color:#8693AC;line-height:1.5">${escape(SITE.name)} · ${escape(SITE.email)} · ${escape(SITE.phone)}</p>
  </div></body></html>`;
}

export function applicantConfirmationEmail(args: {
  firstName: string;
  programme: string;
  mode: string;
  campus: string;
  trackingUrl: string;
  applicationId: string;
}) {
  const body = `
    <p style="font-size:15px;line-height:1.6">Hi ${escape(args.firstName)},</p>
    <p style="font-size:15px;line-height:1.6">Thanks — we've received your application for <strong>${escape(args.programme)}</strong> (${escape(args.mode)} · ${escape(args.campus)}). Our admissions team reviews every application within one business day.</p>
    <p style="font-size:15px;line-height:1.6">You can track the status here:</p>
    <p><a href="${escape(args.trackingUrl)}" style="display:inline-block;background:#2D6FF7;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:500">Track application →</a></p>
    <p style="font-size:13px;color:#4A5876;line-height:1.5">Reference: <code>${escape(args.applicationId)}</code></p>
  `;
  return { subject: 'Your application has been received', html: shell('Application received', body) };
}

export function internalAdmissionsAlertEmail(args: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  programme: string;
  mode: string;
  campus: string;
  applicationId: string;
}) {
  const rows = [
    ['Name', `${args.firstName} ${args.lastName}`],
    ['Email', args.email],
    ['Phone', args.phone],
    ['Programme', args.programme],
    ['Mode', args.mode],
    ['Campus', args.campus],
    ['Application ID', args.applicationId],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#4A5876;font-size:12px;letter-spacing:.06em;text-transform:uppercase">${escape(
          k
        )}</td><td style="padding:6px 0;font-size:14px"><strong>${escape(v)}</strong></td></tr>`
    )
    .join('');
  const body = `
    <p style="font-size:14px">A new application has been submitted.</p>
    <table style="border-collapse:collapse;width:100%;margin-top:12px">${rows}</table>
  `;
  return { subject: `New application · ${args.firstName} ${args.lastName}`, html: shell('New application', body) };
}
