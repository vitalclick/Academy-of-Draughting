import { SITE } from '@/lib/site';

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // schema.org JSON-LD is safe to inject as text
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: SITE.name,
        alternateName: SITE.short,
        url: SITE.url,
        email: SITE.email,
        telephone: SITE.phone,
        foundingDate: String(SITE.established),
        sameAs: [SITE.social.linkedin],
        address: [
          {
            '@type': 'PostalAddress',
            addressLocality: 'Johannesburg',
            addressRegion: 'Gauteng',
            addressCountry: 'ZA',
          },
          {
            '@type': 'PostalAddress',
            addressLocality: 'Durban',
            addressRegion: 'KwaZulu-Natal',
            addressCountry: 'ZA',
          },
        ],
        description: SITE.description,
      }}
    />
  );
}

export function CourseJsonLd({
  name,
  description,
  id,
}: {
  name: string;
  description: string;
  id: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Course',
        name,
        description,
        provider: {
          '@type': 'EducationalOrganization',
          name: SITE.name,
          url: SITE.url,
        },
        url: `${SITE.url}/courses/${id}`,
        inLanguage: 'en-ZA',
      }}
    />
  );
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; href: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((it, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: it.name,
          item: `${SITE.url}${it.href}`,
        })),
      }}
    />
  );
}
