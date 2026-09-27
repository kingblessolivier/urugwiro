import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign } from 'lucide-react';
import { Button } from './ui/Button';

interface MortgageCalculatorProps {
    price: number;
    currency?: string;
}

export const MortgageCalculator: React.FC<MortgageCalculatorProps> = ({ price, currency = 'RWF' }) => {
    const [downPaymentPercent, setDownPaymentPercent] = useState(10);
    const [interestRate, setInterestRate] = useState(15);
    const [loanTermYears, setLoanTermYears] = useState(20);

    const results = useMemo(() => {
        const downPayment = price * (downPaymentPercent / 100);
        const loanAmount = price - downPayment;
        const monthlyRate = interestRate / 100 / 12;
        const numPayments = loanTermYears * 12;

        if (monthlyRate === 0) {
            return {
                downPayment,
                loanAmount,
                monthlyPayment: loanAmount / numPayments,
                totalInterest: 0,
            };
        }

        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
            (Math.pow(1 + monthlyRate, numPayments) - 1);
        const totalInterest = monthlyPayment * numPayments - loanAmount;

        return { downPayment, loanAmount, monthlyPayment, totalInterest };
    }, [price, downPaymentPercent, interestRate, loanTermYears]);

    return (
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <div className="flex items-center gap-2 mb-4">
                <Calculator size={18} className="text-[var(--color-brand-emerald)]" />
                <h3 className="text-base font-bold text-[var(--color-text-main)]">Mortgage Calculator</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-[var(--color-text-muted)]">Down Payment</label>
                        <span className="text-xs font-bold text-[var(--color-brand-emerald)]">{downPaymentPercent}%</span>
                    </div>
                    <input
                        type="range"
                        min={5}
                        max={50}
                        step={1}
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-[var(--color-text-muted)]">Interest Rate (annual)</label>
                        <span className="text-xs font-bold text-[var(--color-brand-emerald)]">{interestRate}%</span>
                    </div>
                    <input
                        type="range"
                        min={5}
                        max={25}
                        step={0.5}
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-[var(--color-text-muted)]">Loan Term</label>
                        <span className="text-xs font-bold text-[var(--color-brand-emerald)]">{loanTermYears} years</span>
                    </div>
                    <input
                        type="range"
                        min={5}
                        max={30}
                        step={1}
                        value={loanTermYears}
                        onChange={(e) => setLoanTermYears(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                    />
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--color-border)] space-y-3">
                <div className="flex justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">Down Payment</span>
                    <span className="text-sm font-bold text-[var(--color-text-main)]">
                        {results.downPayment.toLocaleString()} {currency}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">Loan Amount</span>
                    <span className="text-sm font-bold text-[var(--color-text-main)]">
                        {results.loanAmount.toLocaleString()} {currency}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-xs text-[var(--color-text-muted)]">Total Interest</span>
                    <span className="text-sm font-bold text-[var(--color-text-main)]">
                        {results.totalInterest.toLocaleString()} {currency}
                    </span>
                </div>
                <div className="pt-3 border-t border-[var(--color-border)]">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-[var(--color-text-main)]">Monthly Payment</span>
                        <span className="text-lg font-bold text-[var(--color-brand-emerald)]">
                            {results.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currency}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
