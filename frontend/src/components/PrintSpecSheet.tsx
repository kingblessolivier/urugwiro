import React from 'react';
import { Printer } from 'lucide-react';
import { Button } from './ui/Button';

interface PrintSpecSheetProps {
    title: string;
    price: number;
    currency: string;
    specs: { label: string; value: string }[];
    description?: string;
}

export const PrintSpecSheet: React.FC<PrintSpecSheetProps> = ({
    title,
    price,
    currency,
    specs,
    description,
}) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            {/* Print button */}
            <div className="print:hidden mb-6 flex justify-end">
                <Button variant="outline" onClick={handlePrint}>
                    <Printer size={14} />
                    <span>Print Spec Sheet</span>
                </Button>
            </div>

            {/* Printable content */}
            <div className="hidden print:block">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-lg font-semibold text-emerald-600 mt-2">
                        {price.toLocaleString()} {currency}
                    </p>
                </div>

                {specs.length > 0 && (
                    <table className="w-full mb-6">
                        <tbody>
                            {specs.map((spec, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="py-2 font-semibold">{spec.label}</td>
                                    <td className="py-2">{spec.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {description && (
                    <div className="mb-6">
                        <h3 className="font-bold mb-2">Description</h3>
                        <p className="text-sm whitespace-pre-line">{description}</p>
                    </div>
                )}

                <div className="mt-8 pt-4 border-t text-xs text-gray-500">
                    <p>Generated on {new Date().toLocaleDateString()} by Urugwiro</p>
                    <p>Visit https://urugwiro.rw for more details</p>
                </div>
            </div>
        </>
    );
};
