import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Building2, Download, FileSpreadsheet, HandCoins, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend,
  LinearScale, LineElement, PointElement, Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { api } from '../../api/endpoints';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CHART_COLORS = ['#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

interface CurrencyTotal {
  currency: string;
  transaction_volume: number;
  completed_revenue: number;
}

interface MonthlyRevenue {
  currency: string;
  month: number;
  amount: number;
}

interface ReportSummary {
  year: number;
  generated_at: string;
  metrics: {
    transactions: number;
    listings: number;
    verified_listings: number;
    offers: number;
    pending_offers: number;
  };
  currency_totals: CurrencyTotal[];
  monthly_revenue: MonthlyRevenue[];
  monthly_users: number[];
  asset_classes: Record<string, number>;
  transaction_statuses: Record<string, number>;
  offer_statuses: Record<string, number>;
}

const REPORT_TYPES = [
  ['listings', 'Listings'], ['customers', 'Customers'], ['conversations', 'Conversations'],
  ['visits', 'Visits'], ['offers', 'Offers'], ['transactions', 'Transactions'], ['expenses', 'Expenses'],
] as const;

const formatAmount = (amount: number, currency: string) =>
  `${new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(amount)} ${currency}`;

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const, labels: { color: '#71717a', boxWidth: 12 } } },
  scales: {
    y: { beginAtZero: true, grid: { color: 'rgba(113,113,122,0.14)' }, ticks: { color: '#71717a' } },
    x: { grid: { display: false }, ticks: { color: '#71717a' } },
  },
};

const AdminReports: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState('');

  const summaryQuery = useQuery({
    queryKey: ['admin-report-summary', year],
    queryFn: async () => (await api.reports.summary(year)).data as ReportSummary,
  });

  const summary = summaryQuery.data;
  const revenueData = useMemo(() => {
    const currencies = [...new Set(summary?.monthly_revenue.map((row) => row.currency) || [])];
    return {
      labels: MONTH_LABELS,
      datasets: currencies.map((currency, index) => ({
        label: `${currency} commission`,
        data: MONTH_LABELS.map((_, monthIndex) => summary?.monthly_revenue.find(
          (row) => row.currency === currency && row.month === monthIndex + 1,
        )?.amount || 0),
        borderColor: CHART_COLORS[index % CHART_COLORS.length],
        backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}22`,
        tension: 0.3,
      })),
    };
  }, [summary]);

  const userData = {
    labels: MONTH_LABELS,
    datasets: [{
      label: 'New users',
      data: summary?.monthly_users || new Array(12).fill(0),
      backgroundColor: '#2563ebaa',
      borderRadius: 4,
    }],
  };

  const assetLabels = ['house', 'land', 'car', 'motorbike', 'hotel', 'commercial', 'service'];
  const assetData = {
    labels: assetLabels.map((label) => label === 'house' ? 'Homes' : label.charAt(0).toUpperCase() + label.slice(1)),
    datasets: [{
      data: assetLabels.map((label) => summary?.asset_classes[label] || 0),
      backgroundColor: assetLabels.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
      borderWidth: 0,
    }],
  };

  const transactionData = {
    labels: ['Completed', 'Pending', 'Cancelled'],
    datasets: [{
      data: ['completed', 'pending', 'cancelled'].map((status) => summary?.transaction_statuses[status] || 0),
      backgroundColor: ['#059669', '#d97706', '#dc2626'],
      borderWidth: 0,
    }],
  };

  const offerStatuses = summary?.offer_statuses || {};
  const acceptedOffers = offerStatuses.accepted || 0;
  const activeOffers = (offerStatuses.new || 0) + (offerStatuses.reviewing || 0) + (offerStatuses.negotiating || 0);
  const offerTotal = summary?.metrics.offers || 0;
  const kpis = summary ? [
    { label: 'Transactions', value: summary.metrics.transactions, icon: HandCoins },
    { label: 'Listings', value: summary.metrics.listings, icon: Building2 },
    { label: 'Verified listings', value: summary.metrics.verified_listings, icon: ShieldCheck },
    { label: 'Offers', value: summary.metrics.offers, icon: Users },
  ] : [];

  const downloadReport = async (type: string) => {
    setExporting(type);
    setExportError('');
    try {
      const response = await api.reports.download(type);
      const url = URL.createObjectURL(response.data as Blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${type}_report.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('The report could not be downloaded. Check your access and try again.');
    } finally {
      setExporting(null);
    }
  };

  if (summaryQuery.isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--color-text-muted)]">Loading financial reports...</div>;
  }

  if (summaryQuery.isError || !summary) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-xl font-bold">Reports are unavailable</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">The reporting API did not return a usable summary.</p>
        <button type="button" onClick={() => summaryQuery.refetch()} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-bold">
          <RefreshCw size={15} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 text-[var(--color-text-main)] lg:p-10">
      <header className="flex flex-col justify-between gap-5 border-b border-[var(--color-border)] pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-emerald)]">Finance & Operations</p>
          <h1 className="mt-1 text-3xl font-bold">Reports & Analytics</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Commission revenue is reported separately for each currency and only after transaction completion.</p>
        </div>
        <label className="text-xs font-bold text-[var(--color-text-muted)]">Reporting year
          <input type="number" min="2000" max={new Date().getFullYear() + 1} value={year} onChange={(event) => setYear(Number(event.target.value))} className="ml-3 w-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2 text-sm text-[var(--color-text-main)]" />
        </label>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Platform totals">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
            <Icon size={18} className="text-[var(--color-brand-emerald)]" />
            <p className="mt-4 text-2xl font-bold font-mono">{value}</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2"><HandCoins size={18} className="text-[var(--color-brand-emerald)]" /><h2 className="text-lg font-bold">Currency totals</h2></div>
        {summary.currency_totals.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {summary.currency_totals.map((row) => (
              <div key={row.currency} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-dim)]">{row.currency}</p>
                <dl className="mt-4 grid grid-cols-2 gap-4">
                  <div><dt className="text-xs text-[var(--color-text-muted)]">Transaction volume</dt><dd className="mt-1 text-lg font-bold">{formatAmount(row.transaction_volume, row.currency)}</dd></div>
                  <div><dt className="text-xs text-[var(--color-text-muted)]">Completed commission</dt><dd className="mt-1 text-lg font-bold text-[var(--color-brand-emerald)]">{formatAmount(row.completed_revenue, row.currency)}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-[var(--color-text-muted)]">No transactions have been recorded.</p>}
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
          <h2 className="flex items-center gap-2 text-base font-bold"><BarChart3 size={17} className="text-[var(--color-brand-emerald)]" /> Monthly completed commission</h2>
          <div className="mt-6 h-[300px]"><Line data={revenueData} options={chartOptions} /></div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
          <h2 className="flex items-center gap-2 text-base font-bold"><Users size={17} className="text-blue-500" /> User signups</h2>
          <div className="mt-6 h-[300px]"><Bar data={userData} options={chartOptions} /></div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
          <h2 className="text-base font-bold">Asset classes</h2>
          <div className="mt-6 h-[260px]"><Doughnut data={assetData} options={{ responsive: true, maintainAspectRatio: false, plugins: chartOptions.plugins }} /></div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
          <h2 className="text-base font-bold">Transaction status</h2>
          <div className="mt-6 h-[260px]"><Doughnut data={transactionData} options={{ responsive: true, maintainAspectRatio: false, plugins: chartOptions.plugins }} /></div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
          <h2 className="text-base font-bold">Offer status</h2>
          <dl className="mt-5 space-y-4">
            <div className="flex justify-between"><dt className="text-sm text-[var(--color-text-muted)]">Accepted</dt><dd className="font-bold">{acceptedOffers}</dd></div>
            <div className="flex justify-between"><dt className="text-sm text-[var(--color-text-muted)]">Active review</dt><dd className="font-bold">{activeOffers}</dd></div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-4"><dt className="text-sm text-[var(--color-text-muted)]">Total</dt><dd className="font-bold">{offerTotal}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
          <div className="flex items-center gap-2"><FileSpreadsheet size={18} className="text-[var(--color-brand-emerald)]" /><h2 className="text-base font-bold">CSV exports</h2></div>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Downloads use your authenticated session and include all records for the selected dataset.</p>
          {exportError && <p className="mt-3 text-sm text-rose-500">{exportError}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            {REPORT_TYPES.map(([type, label]) => (
              <button key={type} type="button" disabled={Boolean(exporting)} onClick={() => downloadReport(type)} className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs font-bold text-[var(--color-text-muted)] hover:border-emerald-500/40 hover:text-[var(--color-text-main)] disabled:opacity-50">
                <Download size={13} /> {exporting === type ? 'Preparing...' : label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminReports;
