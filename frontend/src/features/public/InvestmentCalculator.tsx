import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, DollarSign, Percent } from 'lucide-react';

const InvestmentCalculator: React.FC = () => {
  const [propertyPrice, setPropertyPrice] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [downPaymentPercent, setDownPaymentPercent] = useState('20');
  const [interestRate, setInterestRate] = useState('12');
  const [loanTerm, setLoanTerm] = useState('20');
  const [annualExpenses, setAnnualExpenses] = useState('');

  const results = useMemo(() => {
    const price = Number(propertyPrice) || 0;
    const rent = Number(monthlyRent) || 0;
    const downPercent = Number(downPaymentPercent) || 0;
    const rate = Number(interestRate) || 0;
    const term = Number(loanTerm) || 0;
    const expenses = Number(annualExpenses) || 0;

    if (price <= 0 || rent <= 0) return null;

    const downPayment = price * (downPercent / 100);
    const loanAmount = price - downPayment;
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;

    // Monthly mortgage payment (amortized)
    const monthlyMortgage = monthlyRate > 0
      ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
      : loanAmount / numPayments;

    const annualRent = rent * 12;
    const annualExpensesTotal = expenses || (annualRent * 0.1); // Default 10% for maintenance/vacancy
    const netAnnualIncome = annualRent - annualExpensesTotal - (monthlyMortgage * 12);
    const cashInvested = downPayment + (price * 0.03); // Down payment + closing costs (~3%)

    const grossYield = (annualRent / price) * 100;
    const netYield = (netAnnualIncome / price) * 100;
    const cashOnCashROI = cashInvested > 0 ? (netAnnualIncome / cashInvested) * 100 : 0;
    const capRate = ((annualRent - annualExpensesTotal) / price) * 100;

    // Simple 10-year projection
    const tenYearEquity = loanAmount - (monthlyMortgage * 120) + (price * 0.03 * 10); // Principal paid + appreciation
    const totalROI = cashInvested > 0 ? ((netAnnualIncome * 10 + tenYearEquity) / cashInvested) * 100 : 0;

    return {
      monthlyMortgage: Math.round(monthlyMortgage),
      netAnnualIncome: Math.round(netAnnualIncome),
      grossYield: grossYield.toFixed(1),
      netYield: netYield.toFixed(1),
      cashOnCashROI: cashOnCashROI.toFixed(1),
      capRate: capRate.toFixed(1),
      totalROI: totalROI.toFixed(1),
      cashInvested: Math.round(cashInvested),
    };
  }, [propertyPrice, monthlyRent, downPaymentPercent, interestRate, loanTerm, annualExpenses]);

  const inputClass = 'w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50';
  const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 block';

  return (
    <div className="min-h-screen bg-[var(--color-bg-deep)] text-[var(--color-text-main)]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
            <Calculator size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Calculator</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-xl mx-auto">
            Calculate potential rental yield, cash-on-cash ROI, and total return on investment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-5">
            <h2 className="text-lg font-bold">Property Details</h2>

            <div>
              <label className={labelClass}>Property Price (RWF)</label>
              <input type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(e.target.value)} placeholder="e.g. 150000000" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Monthly Rent (RWF)</label>
              <input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} placeholder="e.g. 500000" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Annual Expenses (RWF, optional)</label>
              <input type="number" value={annualExpenses} onChange={(e) => setAnnualExpenses(e.target.value)} placeholder="Defaults to 10% of rent" className={inputClass} />
            </div>

            <h2 className="text-lg font-bold pt-4">Financing</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Down Payment %</label>
                <input type="number" value={downPaymentPercent} onChange={(e) => setDownPaymentPercent(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Interest Rate %</label>
                <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Loan Term (years)</label>
              <input type="number" value={loanTerm} onChange={(e) => setLoanTerm(e.target.value)} className={inputClass} />
            </div>
          </div>

          {/* Results */}
          <div>
            <h2 className="text-lg font-bold mb-5">Results</h2>
            {results ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign size={18} className="text-emerald-500" />
                    <h3 className="text-sm font-bold">Monthly Mortgage</h3>
                  </div>
                  <p className="text-2xl font-bold text-emerald-500">{results.monthlyMortgage.toLocaleString()} RWF</p>
                </div>

                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-emerald-500" />
                    <h3 className="text-sm font-bold">Net Annual Income</h3>
                  </div>
                  <p className="text-2xl font-bold text-emerald-500">{results.netAnnualIncome.toLocaleString()} RWF</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)] mb-1">Gross Yield</p>
                    <p className="text-xl font-bold">{results.grossYield}%</p>
                  </div>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)] mb-1">Net Yield</p>
                    <p className="text-xl font-bold">{results.netYield}%</p>
                  </div>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)] mb-1">Cash-on-Cash ROI</p>
                    <p className="text-xl font-bold">{results.cashOnCashROI}%</p>
                  </div>
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-dim)] mb-1">Cap Rate</p>
                    <p className="text-xl font-bold">{results.capRate}%</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent size={18} className="text-emerald-500" />
                    <h3 className="text-sm font-bold">10-Year Total ROI</h3>
                  </div>
                  <p className="text-3xl font-bold text-emerald-500">{results.totalROI}%</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Based on {results.cashInvested.toLocaleString()} RWF cash invested
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] p-12 text-center">
                <Calculator size={48} className="mx-auto text-[var(--color-text-dim)] mb-4" />
                <p className="text-sm text-[var(--color-text-muted)]">Enter property price and monthly rent to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;
