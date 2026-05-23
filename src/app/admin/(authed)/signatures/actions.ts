'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { currentAdmin } from '@/lib/auth/admin';
import { supabaseAdmin } from '@/lib/supabase/server';
import { signatureInputSchema, signatureOptionsSchema } from '@/lib/signatures/types';

type SignatureRecord = {
  full_name: string;
  role: string;
  qualifications: string | null;
  email: string;
  mobile: string | null;
  office_phone: string | null;
  office_location: string;
  linkedin: string | null;
  website: string;
  template: string;
  show_logo: boolean;
  show_tagline: boolean;
  show_accreditations: boolean;
};

function parsePayload(formData: FormData): SignatureRecord {
  const data = signatureInputSchema.parse({
    full_name: String(formData.get('full_name') ?? '').trim(),
    role: String(formData.get('role') ?? '').trim(),
    qualifications: String(formData.get('qualifications') ?? '').trim() || null,
    email: String(formData.get('email') ?? '').trim(),
    mobile: String(formData.get('mobile') ?? '').trim() || null,
    office_phone: String(formData.get('office_phone') ?? '').trim() || null,
    office_location: String(formData.get('office_location') ?? 'johannesburg'),
    linkedin: String(formData.get('linkedin') ?? '').trim() || null,
    website: String(formData.get('website') ?? '').trim() || 'academydraughting.com',
  });
  const opts = signatureOptionsSchema.parse({
    template: String(formData.get('template') ?? 'classic-horizontal'),
    show_logo: formData.get('show_logo') === 'on',
    show_tagline: formData.get('show_tagline') === 'on',
    show_accreditations: formData.get('show_accreditations') === 'on',
  });
  return {
    full_name: data.full_name,
    role: data.role,
    qualifications: data.qualifications ?? null,
    email: data.email,
    mobile: data.mobile ?? null,
    office_phone: data.office_phone ?? null,
    office_location: data.office_location,
    linkedin: data.linkedin ?? null,
    website: data.website,
    template: opts.template,
    show_logo: opts.show_logo,
    show_tagline: opts.show_tagline,
    show_accreditations: opts.show_accreditations,
  };
}

export async function saveSignatureAction(formData: FormData) {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');
  const sb = supabaseAdmin();
  if (!sb) redirect('/admin/signatures?error=' + encodeURIComponent('Supabase is not configured'));

  const payload = parsePayload(formData);
  const { error } = await sb.from('signatures').insert({
    ...payload,
    created_by: admin.userId,
  });
  if (error) {
    redirect('/admin/signatures?error=' + encodeURIComponent(error.message));
  }
  revalidatePath('/admin/signatures');
  redirect('/admin/signatures?saved=1');
}

export async function updateSignatureAction(id: string, formData: FormData) {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');
  const sb = supabaseAdmin();
  if (!sb) redirect(`/admin/signatures?id=${id}&error=` + encodeURIComponent('Supabase is not configured'));

  const payload = parsePayload(formData);
  const { error } = await sb.from('signatures').update(payload).eq('id', id);
  if (error) {
    redirect(`/admin/signatures?id=${id}&error=` + encodeURIComponent(error.message));
  }
  revalidatePath('/admin/signatures');
  redirect(`/admin/signatures?id=${id}&saved=1`);
}

export async function deleteSignatureAction(id: string) {
  const admin = await currentAdmin();
  if (!admin) throw new Error('Not authenticated');
  const sb = supabaseAdmin();
  if (!sb) throw new Error('Supabase is not configured');
  const { error } = await sb.from('signatures').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/signatures');
}
