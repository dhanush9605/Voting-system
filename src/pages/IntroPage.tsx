import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const IntroPage = () => {
    const navigate = useNavigate();
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 3500);

        const navTimer = setTimeout(() => {
            navigate('/home');
        }, 4000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(navTimer);
        };
    }, [navigate]);

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center transition-all duration-1000 ${fadeOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
            style={{
                background: '#ffffff',
            }}
        >
            <style>
                {`
          @keyframes gentleFadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes subtlePulse {
            0%, 100% {
              opacity: 0.6;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.05);
            }
          }

          .brand-text {
            animation: gentleFadeIn 1.2s ease-out forwards;
          }

          .tagline {
            animation: gentleFadeIn 1.2s ease-out 0.3s forwards;
            opacity: 0;
          }

          .ring {
            animation: rotate 20s linear infinite, subtlePulse 3s ease-in-out infinite;
          }

          .shadow-soft {
            box-shadow: 0 2px 30px rgba(0, 0, 0, 0.06);
          }
        `}
            </style>

            <div className="flex flex-col items-center">
                {/* Minimalist icon */}
                <div className="mb-12 relative">
                    {/* Subtle rotating ring */}
                    <div
                        className="ring absolute inset-0 flex items-center justify-center"
                        style={{
                            width: '120px',
                            height: '120px',
                        }}
                    >
                        <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle
                                cx="60"
                                cy="60"
                                r="55"
                                fill="none"
                                stroke="hsl(170, 60%, 50%)"
                                strokeWidth="0.5"
                                opacity="0.3"
                                strokeDasharray="10 5"
                            />
                        </svg>
                    </div>

                    {/* Main icon */}
                    <svg
                        width="120"
                        height="120"
                        viewBox="0 0 120 120"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="minimalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{ stopColor: 'hsl(170, 60%, 45%)', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: 'hsl(170, 60%, 55%)', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>

                        {/* Simple ballot box */}
                        <rect
                            x="35"
                            y="60"
                            width="50"
                            height="35"
                            rx="3"
                            fill="url(#minimalGradient)"
                            opacity="0.9"
                        />

                        {/* Ballot paper */}
                        <rect
                            x="50"
                            y="45"
                            width="20"
                            height="25"
                            rx="2"
                            fill="url(#minimalGradient)"
                        />

                        {/* Minimalist lines on ballot */}
                        <line
                            x1="55"
                            y1="55"
                            x2="65"
                            y2="55"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                        <line
                            x1="55"
                            y1="60"
                            x2="65"
                            y2="60"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                {/* Typography */}
                <div className="text-center space-y-4">
                    <h1
                        className="brand-text text-7xl font-light tracking-tight"
                        style={{
                            color: '#1a1a1a',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Let's Vote
                    </h1>

                    <p
                        className="tagline text-sm font-medium tracking-wide uppercase"
                        style={{
                            color: '#666666',
                            letterSpacing: '0.15em',
                        }}
                    >
                        Simple • Secure • Democratic
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IntroPage;
