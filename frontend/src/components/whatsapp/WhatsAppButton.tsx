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
            className="fixed bottom-28 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white font-bold shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-all hover:scale-105 hover:shadow-[0_8px_30px_rgba(37,211,102,0.5)] active:scale-95 sm:right-6 md:bottom-8 md:h-auto md:w-auto md:gap-2.5 md:px-5 md:py-3 md:text-sm"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle size={20} />
            <span className="hidden tracking-tight md:inline">WhatsApp</span>
            <span className="hidden h-2.5 w-2.5 md:flex">
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
        </button>
    );
};
