import { useEffect, useState } from "react";

export const SplashAnimation = ({ trigger }: { trigger: number }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (trigger > 0) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [trigger]);

    if (!isVisible) return null;

    return (
        <>
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
                {/* Radial gradient splash effect */}
                <div className="splash-expand" />
                {/* Particle burst effect */}
                {Array.from({ length: 30 }).map((_, i) => {
                    const angle = (i / 30) * Math.PI * 2;
                    const distance = 500;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;
                    const delay = i * 0.015;
                    return (
                        <div
                            key={i}
                            className="splash-particle"
                            style={
                                {
                                    left: "50%",
                                    top: "50%",
                                    "--x": `${x}px`,
                                    "--y": `${y}px`,
                                    "--delay": `${delay}s`,
                                } as React.CSSProperties
                            }
                        />
                    );
                })}
            </div>
            <style>{`
                .splash-expand {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(
                        circle at center,
                        rgba(52, 211, 153, 0.5) 0%,
                        rgba(52, 211, 153, 0.3) 30%,
                        transparent 70%
                    );
                    animation: splashExpand 1s ease-out forwards;
                }
                .splash-particle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: rgba(52, 211, 153, 0.9);
                    border-radius: 50%;
                    box-shadow: 0 0 8px rgba(52, 211, 153, 0.8);
                    animation: splashParticle 1s ease-out var(--delay) forwards;
                    opacity: 0;
                }
                @keyframes splashExpand {
                    0% {
                        transform: scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(2.5);
                        opacity: 0;
                    }
                }
                @keyframes splashParticle {
                    0% {
                        transform: translate(-50%, -50%) translate(0, 0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) translate(var(--x), var(--y)) scale(0);
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    );
};
