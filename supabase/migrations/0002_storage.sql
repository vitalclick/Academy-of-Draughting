-- Storage bucket for applicant documents
-- Bucket is private; access via signed URLs minted by the server.

insert into storage.buckets (id, name, public)
values ('applicant-documents', 'applicant-documents', false)
on conflict (id) do nothing;

-- No anon read/write policies on the bucket. The service role uploads + mints
-- signed URLs; applicants never get direct credentials.
