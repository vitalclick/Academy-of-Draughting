import 'server-only';
import { env, features } from '@/lib/env';

/**
 * Creates or updates a HubSpot contact and associates the application.
 * No-op (with a console log) when HUBSPOT_PRIVATE_APP_TOKEN is not set.
 *
 * Uses the v3 CRM API "create or update" pattern via search.
 */
export async function upsertHubspotContact(args: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  programme: string;
  mode: string;
  campus: string;
  applicationId: string;
}) {
  if (!features.hubspot) {
    console.info(`[hubspot:mock] upsert email=${args.email}`);
    return { mocked: true };
  }
  const headers = {
    Authorization: `Bearer ${env.HUBSPOT_PRIVATE_APP_TOKEN}`,
    'Content-Type': 'application/json',
  };
  const properties = {
    email: args.email,
    firstname: args.firstName,
    lastname: args.lastName,
    phone: args.phone,
    aoad_programme: args.programme,
    aoad_mode: args.mode,
    aoad_campus: args.campus,
    aoad_application_id: args.applicationId,
    lifecyclestage: 'lead',
  };

  // 1. Look up by email
  const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      filterGroups: [
        { filters: [{ propertyName: 'email', operator: 'EQ', value: args.email }] },
      ],
      properties: ['email'],
      limit: 1,
    }),
  });
  if (!searchRes.ok) throw new Error(`hubspot search: ${searchRes.status}`);
  const search = (await searchRes.json()) as { results?: { id: string }[] };
  const existingId = search.results?.[0]?.id;

  if (existingId) {
    const updateRes = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`,
      { method: 'PATCH', headers, body: JSON.stringify({ properties }) }
    );
    if (!updateRes.ok) throw new Error(`hubspot update: ${updateRes.status}`);
    return { mocked: false, id: existingId, created: false };
  }

  const createRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({ properties }),
  });
  if (!createRes.ok) throw new Error(`hubspot create: ${createRes.status}`);
  const created = (await createRes.json()) as { id: string };
  return { mocked: false, id: created.id, created: true };
}

/**
 * Lighter-weight upsert for top-of-funnel leads (funding quotes, lead magnets,
 * consultation bookings). Stamps an intent score and source so sales can
 * prioritise. No-op when HubSpot isn't configured.
 */
export async function upsertHubspotLead(args: {
  email: string;
  firstName?: string;
  phone?: string;
  programme?: string;
  source: string;
  leadScore?: number;
}) {
  if (!features.hubspot) {
    console.info(`[hubspot:mock] lead email=${args.email} source=${args.source}`);
    return { mocked: true };
  }
  const headers = {
    Authorization: `Bearer ${env.HUBSPOT_PRIVATE_APP_TOKEN}`,
    'Content-Type': 'application/json',
  };
  const properties: Record<string, string> = {
    email: args.email,
    lifecyclestage: 'lead',
    aoad_lead_source: args.source,
  };
  if (args.firstName) properties.firstname = args.firstName;
  if (args.phone) properties.phone = args.phone;
  if (args.programme) properties.aoad_programme = args.programme;
  if (typeof args.leadScore === 'number') properties.aoad_lead_score = String(args.leadScore);

  const searchRes = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: args.email }] }],
      properties: ['email'],
      limit: 1,
    }),
  });
  if (!searchRes.ok) throw new Error(`hubspot search: ${searchRes.status}`);
  const search = (await searchRes.json()) as { results?: { id: string }[] };
  const existingId = search.results?.[0]?.id;

  if (existingId) {
    const res = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${existingId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ properties }),
    });
    if (!res.ok) throw new Error(`hubspot lead update: ${res.status}`);
    return { mocked: false, id: existingId, created: false };
  }

  const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({ properties }),
  });
  if (!res.ok) throw new Error(`hubspot lead create: ${res.status}`);
  const created = (await res.json()) as { id: string };
  return { mocked: false, id: created.id, created: true };
}
