import React, { useMemo, useState } from 'react';
import { Banknote, Calculator, Landmark, Percent, TrendingUp, WalletCards } from 'lucide-react';

const numberFrom = (value: string) => Number(value) || 0;
const formatRwf = (value: number) => `${Math.round(value).toLocaleString()} RWF`;

const InvestmentCalculator: React.FC = () => {
  const [propertyPrice, setPropertyPrice] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [vacancyRate, setVacancyRate] = useState('5');
  const [annualExpenses, setAnnualExpenses] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [interestRate, setInterestRate] = useState('12');
  const [loanTerm, setLoanTerm] = useState('20');
  const [acquisitionCostPercent, setAcquisitionCostPercent] = useState('0');

  const calculation = useMemo(() => {
    const price = numberFrom(propertyPrice);
    const rent = numberFrom(monthlyRent);
    const vacancy = numberFrom(vacancyRate);
    const expenses = numberFrom(annualExpenses);
    const downPercent = numberFrom(downPaymentPercent);
    const annualRate = numberFrom(interestRate);
    const termYears = numberFrom(loanTerm);
    const acquisitionPercent = numberFrom(acquisitionCostPercent);

    if (price <= 0 || rent <= 0) return { results: null, error: null };
    if (vacancy < 0 || vacancy > 100) return { results: null, error: 'Vacancy must be between 0% and 100%.' };
    if (downPercent < 0 || downPercent > 100) return { results: null, error: 'Down payment must be between 0% and 100%.' };
    if (annualRate < 0 || termYears < 1 || acquisitionPercent < 0 || expenses < 0) {
      return { results: null, error: 'Rates, costs, and expenses must be non-negative, and the loan term must be at least one year.' };
    }

    const downPayment = price * (downPercent / 100);
    const acquisitionCosts = price * (acquisitionPercent / 100);
    const initialCash = downPayment + acquisitionCosts;
    const loanAmount = price - downPayment;
    const paymentCount = Math.round(termYears * 12);
    const monthlyRate = annualRate / 100 / 12;

    let monthlyMortgage = 0;
    if (loanAmount > 0) {
      if (monthlyRate > 0) {
        const growth = Math.pow(1 + monthlyRate, paymentCount);
        monthlyMortgage = loanAmount * (monthlyRate * growth) / (growth - 1);
      } else {
        monthlyMortgage = loanAmount / paymentCount;
      }
    }

    const annualGrossRent = rent * 12;
    const effectiveAnnualRent = annualGrossRent * (1 - vacancy / 100);
    const netOperatingIncome = effectiveAnnualRent - expenses;
    const annualDebtService = monthlyMortgage * 12;
    const annualCashFlow = netOperatingIncome - annualDebtService;
    const grossYield = annualGrossRent / price * 100;
    const capRate = netOperatingIncome / price * 100;
    const cashOnCashReturn = initialCash > 0 ? annualCashFlow / initialCash * 100 : null;

    const projectionMonths = Math.min(120, paymentCount);
    let projectedLoanBalance = 0;
    if (loanAmount > 0 && projectionMonths < paymentCount) {
      if (monthlyRate > 0) {
        const growth = Math.pow(1 + monthlyRate, projectionMonths);
        projectedLoanBalance = loanAmount * growth
          - monthlyMortgage * ((growth - 1) / monthlyRate);
      } else {
        projectedLoanBalance = loanAmount - monthlyMortgage * projectionMonths;
      }
    }
    projectedLoanBalance = Math.max(0, projectedLoanBalance);

    return {
      error: null,
      results: {
        monthlyMortgage,
        netOperatingIncome,
        annualCashFlow,
        grossYield,
        capRate,
        cashOnCashReturn,
        initialCash,
        projectedLoanBalance,
        projectedEquity: price - projectedLoanBalance,
        projectionYears: projectionMonths / 12,
      },
    };
  }, [
    acquisitionCostPercent,
    annualExpenses,
    downPaymentPercent,
    interestRate,
    loanTerm,
    monthlyRent,
    propertyPrice,
    vacancyRate,
  ]);

  const inputClass = 'h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500';
  const results = calculation.results;

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)]">
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-[var(--color-brand-emerald)]">
              <Calculator size={22} />
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">Rental Investment Calculator</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
              Estimate mortgage payments, net operating income, annual cash flow, yield, and loan equity from your own assumptions.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.15fr)]">
        <form className="space-y-7" onSubmit={(event) => event.preventDefault()}>
          <fieldset className="space-y-4">
            <legend className="mb-4 text-lg font-bold">Property operations</legend>
            <Field id="property-price" label="Purchase price (RWF)" value={propertyPrice} onChange={setPropertyPrice} inputClass={inputClass} placeholder="150000000" />
            <Field id="monthly-rent" label="Expected monthly rent (RWF)" value={monthlyRent} onChange={setMonthlyRent} inputClass={inputClass} placeholder="500000" />
            <div className="grid grid-cols-2 gap-4">
              <Field id="vacancy-rate" label="Vacancy allowance (%)" value={vacancyRate} onChange={setVacancyRate} inputClass={inputClass} min="0" max="100" />
              <Field id="annual-expenses" label="Annual expenses (RWF)" value={annualExpenses} onChange={setAnnualExpenses} inputClass={inputClass} placeholder="0" />
            </div>
          </fieldset>

          <fieldset className="space-y-4 border-t border-[var(--color-border)] pt-6">
            <legend className="mb-4 text-lg font-bold">Financing assumptions</legend>
            <div className="grid grid-cols-2 gap-4">
              <Field id="down-payment" label="Down payment (%)" value={downPaymentPercent} onChange={setDownPaymentPercent} inputClass={inputClass} min="0" max="100" />
              <Field id="interest-rate" label="Annual interest (%)" value={interestRate} onChange={setInterestRate} inputClass={inputClass} min="0" />
              <Field id="loan-term" label="Loan term (years)" value={loanTerm} onChange={setLoanTerm} inputClass={inputClass} min="1" />
              <Field id="acquisition-cost" label="Acquisition costs (%)" value={acquisitionCostPercent} onChange={setAcquisitionCostPercent} inputClass={inputClass} min="0" />
            </div>
          </fieldset>

          <p className="text-xs leading-5 text-[var(--color-text-dim)]">
            Enter taxes, insurance, maintenance, management, and other recurring costs in annual expenses. The projection assumes no property appreciation or rent growth.
          </p>
        </form>

        <section aria-live="polite">
          <h2 className="mb-5 text-lg font-bold">Estimate</h2>
          {calculation.error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">{calculation.error}</div>
          )}
          {results ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Result label="Monthly mortgage" value={formatRwf(results.monthlyMortgage)} icon={Landmark} />
                <Result label="Initial cash required" value={formatRwf(results.initialCash)} icon={WalletCards} />
                <Result label="Annual NOI" value={formatRwf(results.netOperatingIncome)} icon={Banknote} />
                <Result label="Annual cash flow" value={formatRwf(results.annualCashFlow)} icon={TrendingUp} negative={results.annualCashFlow < 0} />
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Ratio label="Gross yield" value={results.grossYield} />
                <Ratio label="Cap rate" value={results.capRate} />
                <Ratio label="Cash-on-cash return" value={results.cashOnCashReturn} />
              </div>

              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                <div className="flex items-center gap-2 text-[var(--color-brand-emerald)]"><Percent size={18} /><h3 className="text-sm font-bold text-[var(--color-text-main)]">Loan position after {Number.isInteger(results.projectionYears) ? results.projectionYears : results.projectionYears.toFixed(1)} years</h3></div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div><p className="text-xs text-[var(--color-text-muted)]">Estimated loan balance</p><p className="mt-1 text-xl font-bold">{formatRwf(results.projectedLoanBalance)}</p></div>
                  <div><p className="text-xs text-[var(--color-text-muted)]">Equity at unchanged value</p><p className="mt-1 text-xl font-bold">{formatRwf(results.projectedEquity)}</p></div>
                </div>
              </div>

              <p className="text-xs leading-5 text-[var(--color-text-dim)]">Illustrative estimate only. Actual loan terms, fees, taxes, occupancy, expenses, and property values can differ.</p>
            </div>
          ) : !calculation.error ? (
            <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] px-6 py-16 text-center">
              <Calculator size={36} className="mx-auto mb-3 text-[var(--color-text-dim)]" />
              <p className="text-sm text-[var(--color-text-muted)]">Enter a purchase price and expected rent to calculate an estimate.</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputClass: string;
  placeholder?: string;
  min?: string;
  max?: string;
}

const Field = ({ id, label, value, onChange, inputClass, placeholder, min, max }: FieldProps) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-[var(--color-text-muted)]">{label}</label>
    <input id={id} type="number" inputMode="decimal" min={min} max={max} step="any" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={inputClass} />
  </div>
);

const Result = ({ label, value, icon: Icon, negative = false }: { label: string; value: string; icon: React.ComponentType<{ size?: number; className?: string }>; negative?: boolean }) => (
  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)]"><Icon size={17} />{label}</div>
    <p className={`mt-3 text-xl font-bold ${negative ? 'text-red-600 dark:text-red-400' : 'text-[var(--color-text-main)]'}`}>{value}</p>
  </div>
);

const Ratio = ({ label, value }: { label: string; value: number | null }) => (
  <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
    <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
    <p className="mt-1 text-xl font-bold">{value === null ? 'N/A' : `${value.toFixed(1)}%`}</p>
  </div>
);

export default InvestmentCalculator;
