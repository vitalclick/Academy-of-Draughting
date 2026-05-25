import {
  getPaymentSummary,
  listEnrollmentOptions,
  listPayments,
  type PaymentWithContext,
} from '@/lib/db/admin';
import { Kpi } from '../_components/viz';
import { RecordPaymentForm } from './record-form';

function rand(n: number) {
  return `R ${Math.round(n).toLocaleString('en-ZA')}`;
}

function payerName(p: PaymentWithContext) {
  const a = p.enrollment?.applicant;
  if (!a) return '—';
  return `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim() || a.email;
}

export default async function FinancePage() {
  const [summary, payments, options] = await Promise.all([
    getPaymentSummary(),
    listPayments({ limit: 100 }),
    listEnrollmentOptions(),
  ]);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            FINANCE<span className="sep">/</span>PAYMENTS
          </div>
          <h1>Payments</h1>
          <p>
            {rand(summary.outstanding)} outstanding · {summary.overdue_count} overdue · manual fee
            ledger.
          </p>
        </div>
      </div>

      <div className="adm-kpi-row">
        <Kpi label="Collected" value={rand(summary.collected)} delta="paid to date" direction="up" sparkSeed={9} />
        <Kpi label="Outstanding" value={rand(summary.outstanding)} delta="pending + overdue" direction="down" sparkSeed={10} />
        <Kpi label="Overdue" value={summary.overdue_count} delta="past due date" direction="down" sparkSeed={11} />
        <Kpi label="On track" value={summary.on_track} delta="pending, not overdue" direction="up" sparkSeed={12} />
      </div>

      <RecordPaymentForm options={options} />

      <div className="adm-card">
        {payments.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--ink-4)', fontSize: 14 }}>
            No payments recorded yet. Use <strong>Record payment</strong> above to add the first entry.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Programme · Cohort</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Due / paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{payerName(p)}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 13 }}>
                        {p.enrollment ? `${p.enrollment.programme} · ${p.enrollment.cohort}` : '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
                        {p.plan ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>
                        {rand(p.amount)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: p.status === 'overdue' ? '#C24545' : 'var(--ink-3)' }}>
                        {p.status === 'paid' && p.paid_at
                          ? new Date(p.paid_at).toLocaleDateString('en-ZA')
                          : p.due_date
                            ? new Date(p.due_date).toLocaleDateString('en-ZA')
                            : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill status-${p.status}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {payments.length > 0 && (
          <div className="adm-pager">
            <span>SHOWING {payments.length} PAYMENT{payments.length === 1 ? '' : 'S'}</span>
          </div>
        )}
      </div>
    </>
  );
}
