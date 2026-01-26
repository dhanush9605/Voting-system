const MeshGradientBackground = ({ className = "fixed inset-0" }: { className?: string }) => {
    return (
        <div className={`${className} -z-10 overflow-hidden bg-background`}>
            {/* Mesh Gradient Container */}
            <div className="absolute inset-0 opacity-40 dark:opacity-30">

                {/* Blob 1: Blue - Top Left */}
                <div
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/30 blur-[100px] animate-blob mix-blend-multiply filter"
                ></div>

                {/* Blob 2: Violet - Top Right */}
                <div
                    className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-500/30 blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply filter"
                ></div>

                {/* Blob 3: Cyan - Bottom Left */}
                <div
                    className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/30 blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply filter"
                ></div>

                {/* Blob 4: Purple - Bottom Right (Drifting) */}
                <div
                    className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-500/20 blur-[120px] animate-pulse mix-blend-multiply filter"
                ></div>
            </div>

            {/* Noise Overlay for texture */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>
    );
};

export default MeshGradientBackground;
