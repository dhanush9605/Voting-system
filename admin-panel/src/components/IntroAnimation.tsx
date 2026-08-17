import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface IntroAnimationProps {
    onComplete: () => void;
}

const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
    const [complete, setComplete] = useState(false);
    const [decodedText, setDecodedText] = useState("");
    const targetText = "VØRA";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

    // Decoding Effect
    useEffect(() => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDecodedText(targetText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) {
                        return targetText[index];
                    }
                    return characters[Math.floor(Math.random() * characters.length)];
                })
                .join("")
            );

            if (iteration >= targetText.length) {
                clearInterval(interval);
            }

            iteration += 1 / 3; // Slower decoding for dramatic effect
        }, 30);

        // Sequence Timer
        const completeTimer = setTimeout(() => {
            setComplete(true);
            setTimeout(onComplete, 800); // Allow shockwave to finish
        }, 3500);

        return () => {
            clearInterval(interval);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            animate={complete ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
        >
            {/* Cinematic Scan Line */}
            <motion.div
                initial={{ top: "-10%", opacity: 0 }}
                animate={{ top: "110%", opacity: [0, 1, 0] }}
                transition={{ duration: 2, ease: "linear", repeat: 0 }}
                className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-teal-500 to-transparent shadow-[0_0_20px_2px_rgba(20,184,166,0.5)] z-20"
            />

            {/* Shockwave Exit Effect */}
            <AnimatePresence>
                {complete && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 4, opacity: [0, 0.5, 0] }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute w-[50vw] h-[50vw] rounded-full border-[20px] border-teal-500/30 blur-xl z-0"
                    />
                )}
            </AnimatePresence>

            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    className="w-52 h-52 mb-8 flex items-center justify-center"
                >
                    <img src="/logo1.png" alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(13,148,136,0.8)]" style={{ mixBlendMode: 'screen' }} />
                </motion.div>

                {/* Decoding Text */}
                <motion.div
                    initial={{ opacity: 0, filter: "blur(10px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-green-500 font-space select-none">
                        {decodedText}
                    </h1>

                    {/* Retro Glitch/Scan Overlay on Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent animate-pulse opacity-20 pointer-events-none" />
                </motion.div>

                {/* Status Bar */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "200px", opacity: 1 }}
                    transition={{ delay: 1, duration: 1.5, ease: "circOut" }}
                    className="mt-6 h-1 rounded-full bg-gradient-to-r from-transparent via-teal-500 to-transparent"
                />

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.5, 1] }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="mt-2 text-teal-400/60 text-xs tracking-[0.3em] font-mono uppercase"
                >
                    System Initialized
                </motion.p>
            </div>
        </motion.div>
    );
};

export default IntroAnimation;
