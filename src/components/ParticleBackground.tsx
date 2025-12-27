import { useRef, useEffect } from "react";

export const ParticleBackground = ({ active }: { active: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        const particles: {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
        }[] = [];
        const particleCount = 60;
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
            });
        }
        let animationFrameId: number;
        const render = () => {
            ctx.fillStyle = active
                ? "rgba(15, 23, 42, 0.2)"
                : "rgb(15, 23, 42)";
            ctx.fillRect(0, 0, width, height);
            const speedMultiplier = active ? 4.0 : 0.5;
            const connectionDistance = active ? 150 : 100;
            particles.forEach((p, i) => {
                p.x += p.vx * speedMultiplier;
                p.y += p.vy * speedMultiplier;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = active
                    ? "rgba(52, 211, 153, 0.8)"
                    : "rgba(148, 163, 184, 0.5)";
                ctx.fill();
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = active
                            ? `rgba(52, 211, 153, ${
                                  1 - dist / connectionDistance
                              })`
                            : `rgba(148, 163, 184, ${
                                  0.1 * (1 - dist / connectionDistance)
                              })`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            });
            animationFrameId = requestAnimationFrame(render);
        };
        render();
        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [active]);
    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
        />
    );
};
