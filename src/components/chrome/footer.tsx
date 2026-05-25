'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from './logo';
import { useAida } from './aida-context';
import { SITE } from '@/lib/site';

function WaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.4 3.6A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.6 1.4h.01c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.2zM12 21.7h-.01a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.8 1 1-3.7-.2-.4a9.8 9.8 0 0 1-1.5-5.2c0-5.4 4.4-9.8 9.9-9.8 2.6 0 5.1 1 7 2.9a9.8 9.8 0 0 1 2.9 7c0 5.5-4.4 9.9-9.9 9.9zm5.4-7.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1c-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.4-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.1.2 2 3.1 5 4.4.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3z" />
    </svg>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="footer-col">
      <h4 className="t-mono-xs footer-col-title">{title}</h4>
      <div className="footer-col-links">{children}</div>
    </div>
  );
}

export function SiteFooter() {
  const aida = useAida();
  return (
    <footer className="site-footer section-darker">
      <div className="page">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo tone="light" />
            <p
              className="t-body"
              style={{ marginTop: 20, maxWidth: 380, color: 'var(--ink-on-dark-2)' }}
            >
              Specialist draughting education since {SITE.established}. Career-focused training
              aligned to real engineering and design office environments.
            </p>
            <div className="footer-creds">
              <span className="pill pill-dark">
                <span className="dot" />
                DHET registered
              </span>
              <span className="pill pill-dark">
                <span className="dot" />
                QCTO aligned
              </span>
              <span className="pill pill-dark">
                <span className="dot" />
                SAQA 66881
              </span>
            </div>
          </div>

          <div className="footer-cols">
            <FooterCol title="Study">
              <Link href="/courses/mddop">MDDOP N4/N5</Link>
              <Link href="/courses/bridging">Bridging Course</Link>
              <Link href="/courses">CAD Short Courses</Link>
              <Link href="/courses?mode=Online">Online / Distance Learning</Link>
              <Link href="/contact#faq">FAQ</Link>
            </FooterCol>

            <FooterCol title="Apply">
              <Link href="/apply">Start Application</Link>
              <Link href="/funding">Fees &amp; Funding</Link>
              <Link href="/book">Book a Consultation</Link>
              <Link href="/apply#intake">Intake Dates</Link>
            </FooterCol>

            <FooterCol title="Campus">
              <Link href="/campus/johannesburg">Johannesburg</Link>
              <Link href="/campus/durban">Durban</Link>
              <Link href="/campus/online">Online · Nationwide</Link>
              <Link href="/contact">Visit Us</Link>
            </FooterCol>

            <FooterCol title="Resources">
              <button
                type="button"
                className="footer-link-button"
                onClick={() => aida.setOpen(true)}
              >
                Admissions Chat
              </button>
              <Link href="/career">Career Counsellor</Link>
              <Link href="/portal">Student Portal</Link>
              <Link href="/courses">Programme Recommender</Link>
            </FooterCol>
          </div>
        </div>

        <div className="footer-mid">
          <div className="footer-contact">
            <a href={SITE.whatsappJhb} className="btn btn-sm btn-ghost-dark">
              <WaIcon />
              WhatsApp Johannesburg
            </a>
            <a href={SITE.whatsappDbn} className="btn btn-sm btn-ghost-dark">
              <WaIcon />
              WhatsApp Durban
            </a>
            <a href={`mailto:${SITE.email}`} className="btn btn-sm btn-ghost-dark">
              {SITE.email}
            </a>
            <a href={`tel:${SITE.phone.replace(/\s/g, '')}`} className="btn btn-sm btn-ghost-dark">
              {SITE.phone}
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="fb-left">
            <span className="t-mono-sm" style={{ color: 'var(--ink-on-dark-3)' }}>
              © {SITE.established}—{new Date().getFullYear()} {SITE.name}. All rights reserved.
            </span>
          </div>
          <div className="fb-right">
            <Link href="/privacy" className="t-mono-sm">
              Privacy
            </Link>
            <Link href="/terms" className="t-mono-sm">
              Terms
            </Link>
            <Link href="/popia" className="t-mono-sm">
              POPIA
            </Link>
            <Link href="/data-rights" className="t-mono-sm">
              Data rights
            </Link>
            <span className="t-mono-sm" style={{ color: 'var(--ink-on-dark-3)' }}>
              v0.1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
