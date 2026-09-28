import React, { useState } from 'react';
import { Calculator, TrendingUp, Home, DollarSign, Percent } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface InvestmentCalculatorProps {
  listingPrice?: number;
  estimatedRent?: number;
}

const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({ listingPrice = 0, estimatedRent = 0 }) => {
  const [purchasePrice, setPurchasePrice] = useState(listingPrice || 200000000);
  const [monthlyRent, setMonthlyRent] = useState(estimatedRent || 1500000);
  const [downPayment, setDownPayment] = useState(20);
  const [interestRate, setInterestRate] = useState(15);
  const [loanTerm, setLoanTerm] = useState(20);
  const [appreciationRate, setAppreciationRate] = useState(5);

  const downPaymentAmount = (purchasePrice * downPayment) / 100;
  const loanAmount = purchasePrice - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTerm * 12;
  const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const annualRent = monthlyRent * 12;
  const grossYield = (annualRent / purchasePrice) * 100;
  const netYield = ((annualRent - monthlyMortgage * 12) / purchasePrice) * 100;
  const futureValue = purchasePrice * Math.pow(1 + appreciationRate / 100, loanTerm);
  const totalProfit = futureValue - purchasePrice + (annualRent - monthlyMortgage * 12) * loanTerm;
  const roi = (totalProfit / downPaymentAmount) * 100;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-[var(--shadow-depth-1)]">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[var(--color-border)]">
        <Calculator size={18} className="text-[var(--color-brand-emerald)]" />
        <h3 className="text-base font-sans font-bold text-[var(--color-text-main)] tracking-tight">
          Investment Calculator
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)] block mb-1.5">Purchase Price (RWF)</label>
            <input
              type="number"
              value={purchasePrice}
              onChange={e => setPurchasePrice(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)] block mb-1.5">Monthly Rent (RWF)</label>
            <input
              type="number"
              value={monthlyRent}
              onChange={e => setMonthlyRent(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)] block mb-1.5">Down Payment (%)</label>
            <input
              type="number"
              value={downPayment}
              onChange={e => setDownPayment(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)] block mb-1.5">Interest Rate (%)</label>
            <input
              type="number"
              value={interestRate}
              onChange={e => setInterestRate(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)] block mb-1.5">Loan Term (years)</label>
            <input
              type="number"
              value={loanTerm}
              onChange={e => setLoanTerm(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-[var(--color-text-dim)] block mb-1.5">Annual Appreciation (%)</label>
            <input
              type="number"
              value={appreciationRate}
              onChange={e => setAppreciationRate(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-[var(--color-input-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <Home size={14} className="text-[var(--color-brand-emerald)]" />
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Monthly Mortgage</span>
            </div>
            <span className="text-xl font-mono font-bold text-[var(--color-text-main)]">
              {Math.round(monthlyMortgage).toLocaleString()} RWF
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <Percent size={14} className="text-[var(--color-brand-emerald)]" />
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Gross Rental Yield</span>
            </div>
            <span className="text-xl font-mono font-bold text-[var(--color-brand-emerald)]">
              {grossYield.toFixed(2)}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-[var(--color-brand-emerald)]" />
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Net Yield (after mortgage)</span>
            </div>
            <span className={cn("text-xl font-mono font-bold", netYield >= 0 ? "text-[var(--color-brand-emerald)]" : "text-red-500")}>
              {netYield.toFixed(2)}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={14} className="text-[var(--color-brand-emerald)]" />
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Projected ROI ({loanTerm} years)</span>
            </div>
            <span className="text-xl font-mono font-bold text-[var(--color-brand-emerald)]">
              {roi.toFixed(1)}%
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-[var(--color-brand-emerald)]" />
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-dim)]">Future Value</span>
            </div>
            <span className="text-xl font-mono font-bold text-[var(--color-text-main)]">
              {Math.round(futureValue).toLocaleString()} RWF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentCalculator;
