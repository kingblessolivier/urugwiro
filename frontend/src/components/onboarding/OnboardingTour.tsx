import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

interface TourStep {
    target: string;
    title: string;
    content: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
    onNavigate?: (view: any) => void;
}

const TOUR_STEPS: TourStep[] = [
    {
        target: '[data-tour="logo"]',
        title: 'Welcome to Urugwiro',
        content: 'Your trusted partner for verified real estate across Rwanda. Let us show you around.',
        position: 'bottom',
    },
    {
        target: '[data-tour="search"]',
        title: 'Smart Search',
        content: 'Search by location, property type, price, or keywords. Use AI intent search for natural language queries.',
        position: 'bottom',
    },
    {
        target: '[data-tour="explore"]',
        title: 'Explore Properties',
        content: 'Browse verified listings with detailed specs, photos, 3D tours, and neighborhood info.',
        position: 'top',
    },
    {
        target: '[data-tour="sell"]',
        title: 'List Your Property',
        content: 'List your property for sale or rent. Upload photos, set pricing, and reach verified buyers.',
        position: 'top',
    },
    {
        target: '[data-tour="auth"]',
        title: 'Get Started',
        content: 'Sign in to save properties, make offers, schedule viewings, and access exclusive features.',
        position: 'left',
    },
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onNavigate }) => {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (isActive) {
            updateTargetRect();
            window.addEventListener('resize', updateTargetRect);
            window.addEventListener('scroll', updateTargetRect);
            return () => {
                window.removeEventListener('resize', updateTargetRect);
                window.removeEventListener('scroll', updateTargetRect);
            };
        }
    }, [isActive, currentStep]);

    const updateTargetRect = useCallback(() => {
        const step = TOUR_STEPS[currentStep];
        if (step) {
            const element = document.querySelector(step.target);
            if (element) {
                setTargetRect(element.getBoundingClientRect());
            }
        }
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleComplete = () => {
        setIsActive(false);
        try {
            localStorage.setItem('urugwiro_onboarding_complete', 'true');
        } catch {
            // localStorage not available
        }
    };

    if (!isActive || !targetRect) return null;

    const step = TOUR_STEPS[currentStep];
    const padding = 12;
    const tooltipWidth = 340;

    let tooltipStyle: React.CSSProperties = {};
    const position = step.position || 'bottom';

    switch (position) {
        case 'bottom':
            tooltipStyle = {
                top: targetRect.bottom + padding,
                left: Math.min(
                    Math.max(16, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
                    window.innerWidth - tooltipWidth - 16
                ),
            };
            break;
        case 'top':
            tooltipStyle = {
                bottom: window.innerHeight - targetRect.top + padding,
                left: Math.min(
                    Math.max(16, targetRect.left + targetRect.width / 2 - tooltipWidth / 2),
                    window.innerWidth - tooltipWidth - 16
                ),
            };
            break;
        case 'left':
            tooltipStyle = {
                top: Math.max(16, Math.min(window.innerHeight - 160, targetRect.top + targetRect.height / 2 - 80)),
                right: window.innerWidth - targetRect.left + padding,
                width: tooltipWidth,
            };
            break;
        case 'right':
        default:
            tooltipStyle = {
                top: Math.max(16, Math.min(window.innerHeight - 160, targetRect.top + targetRect.height / 2 - 80)),
                left: targetRect.right + padding,
                width: tooltipWidth,
            };
            break;
    }

    return (
        <div className="fixed inset-0 z-[10000]" role="dialog" aria-label="Onboarding tour">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleComplete} />

            {/* Highlight cutout */}
            <div
                className="absolute border-2 border-emerald-500 rounded-xl transition-all duration-300 pointer-events-none"
                style={{
                    top: targetRect.top - 4,
                    left: targetRect.left - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                }}
            />

            {/* Tooltip */}
            <div
                className="absolute bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5 shadow-2xl transition-all duration-300"
                style={tooltipStyle}
            >
                {/* Close button */}
                <button
                    type="button"
                    onClick={handleComplete}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-[var(--color-text-dim)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
                    aria-label="Close tour"
                >
                    <X size={16} />
                </button>

                {/* Content */}
                <h3 className="text-sm font-bold text-[var(--color-text-main)] mb-2 pr-6">{step.title}</h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-4">{step.content}</p>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {TOUR_STEPS.map((_, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    'h-1.5 rounded-full transition-all duration-300',
                                    idx === currentStep ? 'w-6 bg-emerald-500' : 'w-1.5 bg-[var(--color-border)]'
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <Button variant="ghost" size="sm" onClick={handlePrev}>
                                <ChevronLeft size={14} />
                                <span>Back</span>
                            </Button>
                        )}
                        <Button variant="primary" size="sm" onClick={handleNext}>
                            <span>{currentStep === TOUR_STEPS.length - 1 ? 'Done' : 'Next'}</span>
                            {currentStep < TOUR_STEPS.length - 1 && <ChevronRight size={14} />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
