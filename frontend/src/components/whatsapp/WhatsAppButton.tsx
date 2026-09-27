import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
    phoneNumber?: string;
    message?: string;
}

const DEFAULT_PHONE = '250788123456';
const DEFAULT_MESSAGE = 'Hello, I am interested in your property listed on Urugwiro.';

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
    phoneNumber = DEFAULT_PHONE,
    message = DEFAULT_MESSAGE,
}) => {
    const handleClick = () => {
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className="fixed bottom-24 md:bottom-8 right-4 sm:right-6 z-40 flex items-center gap-2.5 rounded-full px-5 py-3 bg-[#25D366] text-white font-bold text-sm shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgba(37,211,102,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={20} />
            <span className="tracking-tight">WhatsApp</span>
            <span className="flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
        </button>
    );
};
