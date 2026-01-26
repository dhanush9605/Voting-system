import { useEffect, useRef } from 'react';

const GradientBlobBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Refs for blobs to manipulate DOM directly for performance (no re-renders)
    const blob1Ref = useRef<HTMLDivElement>(null);
    const blob2Ref = useRef<HTMLDivElement>(null);
    const blob3Ref = useRef<HTMLDivElement>(null);
    const blob4Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;

            // Calculate normalized mouse position (-1 to 1)
            const x = (clientX / innerWidth) * 2 - 1;
            const y = (clientY / innerHeight) * 2 - 1;

            // Apply parallax transforms with different speeds/directions
            // Fast movement as requested

            if (blob1Ref.current) { // Purple
                blob1Ref.current.style.transform = `translate(${x * 100}px, ${y * 100}px) scale(1.1)`;
            }

            if (blob2Ref.current) { // Yellow
                blob2Ref.current.style.transform = `translate(${x * -120}px, ${y * -80}px) scale(0.9)`;
            }

            if (blob3Ref.current) { // Pink
                blob3Ref.current.style.transform = `translate(${x * -60}px, ${y * 150}px) scale(1.0)`;
            }

            if (blob4Ref.current) { // Blue
                blob4Ref.current.style.transform = `translate(${x * 150}px, ${y * -50}px) scale(1.2)`;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 -z-10 w-full h-full overflow-hidden bg-background">
            {/* Blob 1 - Purple */}
            <div
                ref={blob1Ref}
                className="absolute top-0 left-0 w-[45vw] h-[45vw] rounded-full bg-purple-400/30 blur-[100px] mix-blend-multiply filter transition-transform duration-75 ease-out will-change-transform"
            ></div>

            {/* Blob 2 - Yellow */}
            <div
                ref={blob2Ref}
                className="absolute top-0 right-0 w-[45vw] h-[45vw] rounded-full bg-yellow-400/30 blur-[100px] mix-blend-multiply filter transition-transform duration-75 ease-out will-change-transform"
            ></div>

            {/* Blob 3 - Pink */}
            <div
                ref={blob3Ref}
                className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-pink-400/30 blur-[100px] mix-blend-multiply filter transition-transform duration-75 ease-out will-change-transform"
            ></div>

            {/* Blob 4 - Blue */}
            <div
                ref={blob4Ref}
                className="absolute bottom-[-10%] right-[10%] w-[45vw] h-[45vw] rounded-full bg-blue-400/30 blur-[100px] mix-blend-multiply filter transition-transform duration-75 ease-out will-change-transform"
            ></div>
        </div>
    );
};

export default GradientBlobBackground;
