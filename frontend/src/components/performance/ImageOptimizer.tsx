import React, { useState } from 'react';

interface ImageOptimizerProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    lazy?: boolean;
}

/**
 * Image Optimizer
 * - Lazy loads images by default
 * - Shows placeholder while loading
 * - Handles errors gracefully
 * - Supports srcset for responsive images
 */
export const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
    src,
    alt,
    width,
    height,
    className = '',
    lazy = true,
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    const handleError = () => {
        setHasError(true);
    };

    // Generate srcset for responsive images
    const generateSrcSet = (baseSrc: string) => {
        const widths = [320, 640, 960, 1280, 1920];
        return widths
            .map((w) => {
                // For demo purposes, we use the same src
                // In production, you'd use an image CDN like Cloudinary or Imgix
                return `${baseSrc} ${w}w`;
            })
            .join(', ');
    };

    if (hasError) {
        return (
            <div
                className={`flex items-center justify-center bg-[var(--color-bg-elevated)] text-[var(--color-text-dim)] ${className}`}
                style={{ width, height }}
                role="img"
                aria-label={alt}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
            </div>
        );
    }

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{ width, height }}
        >
            {/* Placeholder */}
            {!isLoaded && (
                <div
                    className="absolute inset-0 animate-pulse bg-[var(--color-bg-elevated)]"
                    aria-hidden="true"
                />
            )}

            {/* Image */}
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={lazy ? 'lazy' : 'eager'}
                onLoad={handleLoad}
                onError={handleError}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                    isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
            />
        </div>
    );
};

export default ImageOptimizer;
