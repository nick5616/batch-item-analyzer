import { useRef, useEffect } from "react";

export const ParticleBackground = ({ active }: { active: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<
        {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
        }[]
    >([]);
    const activeRef = useRef(active);
    const animationFrameRef = useRef<number | undefined>(undefined);

    // Update active ref when it changes
    useEffect(() => {
        activeRef.current = active;
    }, [active]);

    // Main effect - initialize and render
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        // Set canvas size
        const setCanvasSize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            return { width, height };
        };

        let { width, height } = setCanvasSize();

        // Initialize particles if not already done
        if (particlesRef.current.length === 0) {
            const particleCount = 50;
            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    size: Math.random() * 3 + 3, // 3-6px size
                });
            }
        }

        const particles = particlesRef.current;

        const render = () => {
            // Update dimensions if needed
            if (
                canvas.width !== window.innerWidth ||
                canvas.height !== window.innerHeight
            ) {
                const newSize = setCanvasSize();
                width = newSize.width;
                height = newSize.height;
            }

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Very subtle fade for trail effect
            ctx.fillStyle = "rgba(15, 23, 42, 0.02)";
            ctx.fillRect(0, 0, width, height);

            const isActive = activeRef.current;
            const speedMultiplier = isActive ? 5.0 : 0.2;
            const connectionDistance = isActive ? 200 : 120;
            const connectionOpacity = isActive ? 0.7 : 0.4;

            // Very bright, visible colors
            const particleColor = isActive
                ? "rgba(52, 211, 153, 1)"
                : "rgba(200, 200, 220, 1)"; // Almost white - maximum visibility

            // Draw particles
            particles.forEach((p, i) => {
                // Update position
                p.x += p.vx * speedMultiplier;
                p.y += p.vy * speedMultiplier;

                // Bounce off edges
                if (p.x <= 0 || p.x >= width) {
                    p.vx *= -1;
                    p.x = Math.max(0, Math.min(width, p.x));
                }
                if (p.y <= 0 || p.y >= height) {
                    p.vy *= -1;
                    p.y = Math.max(0, Math.min(height, p.y));
                }

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = particleColor;
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        const opacity =
                            connectionOpacity * (1 - dist / connectionDistance);
                        ctx.strokeStyle = isActive
                            ? `rgba(52, 211, 153, ${opacity})`
                            : `rgba(148, 163, 184, ${opacity})`;
                        ctx.lineWidth = isActive ? 2 : 1;
                        ctx.stroke();
                    }
                }
            });

            animationFrameRef.current = requestAnimationFrame(render);
        };

        // Start render loop
        render();

        // Handle resize
        const handleResize = () => {
            setCanvasSize();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = undefined;
            }
        };
    }, []); // Run once on mount

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{
                width: "100vw",
                height: "100vh",
                zIndex: -10,
                position: "fixed",
                top: 0,
                left: 0,
                display: "block",
            }}
        />
    );
};
