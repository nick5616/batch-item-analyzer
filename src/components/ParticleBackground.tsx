import { useRef, useEffect } from "react";

export const ParticleBackground = ({ active }: { active: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const activeRef = useRef(active);
    const animationFrameRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        activeRef.current = active;
    }, [active]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error("ParticleBackground: Canvas element not found");
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            console.error("ParticleBackground: Could not get 2d context");
            return;
        }

        // Set canvas dimensions
        const setSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setSize();

        const width = canvas.width;
        const height = canvas.height;

        console.log(
            `ParticleBackground: Canvas initialized at ${width}x${height}`
        );

        // Create particles array
        const particles: Array<{
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
        }> = [];

        // Initialize particles
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 3 + 3,
            });
        }

        console.log(
            `ParticleBackground: Created ${particles.length} particles`
        );

        let currentWidth = width;
        let currentHeight = height;

        const render = () => {
            // Update size if needed
            if (
                window.innerWidth !== currentWidth ||
                window.innerHeight !== currentHeight
            ) {
                setSize();
                currentWidth = canvas.width;
                currentHeight = canvas.height;
            }

            // Clear canvas
            ctx.clearRect(0, 0, currentWidth, currentHeight);

            // Draw fade overlay
            ctx.fillStyle = "rgba(15, 23, 42, 0.05)";
            ctx.fillRect(0, 0, currentWidth, currentHeight);

            const isActive = activeRef.current;
            const speed = isActive ? 5.0 : 0.2;
            const connectDist = isActive ? 200 : 120;
            const connectOpacity = isActive ? 0.7 : 0.4;

            // Use VERY bright colors for visibility
            const color = isActive
                ? "rgba(52, 211, 153, 1)"
                : "rgba(255, 255, 255, 0.9)";

            // Update and draw each particle
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Move particle
                p.x += p.vx * speed;
                p.y += p.vy * speed;

                // Bounce
                if (p.x < 0 || p.x > currentWidth) {
                    p.vx *= -1;
                    p.x = Math.max(0, Math.min(currentWidth, p.x));
                }
                if (p.y < 0 || p.y > currentHeight) {
                    p.vy *= -1;
                    p.y = Math.max(0, Math.min(currentHeight, p.y));
                }

                // Draw particle circle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectDist) {
                        const opacity =
                            connectOpacity * (1 - dist / connectDist);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = isActive
                            ? `rgba(52, 211, 153, ${opacity})`
                            : `rgba(255, 255, 255, ${opacity * 0.3})`;
                        ctx.lineWidth = isActive ? 2 : 1;
                        ctx.stroke();
                    }
                }
            }

            animationFrameRef.current = requestAnimationFrame(render);
        };

        // Start rendering
        render();

        const handleResize = () => {
            setSize();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: -10,
                pointerEvents: "none",
                backgroundColor: "transparent",
            }}
        />
    );
};
