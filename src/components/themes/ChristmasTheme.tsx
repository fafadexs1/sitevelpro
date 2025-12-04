"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function ChristmasTheme() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Snowfall Logic (Optimized)
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Array<{
            x: number;
            y: number;
            radius: number;
            speedY: number;
            speedX: number;
            opacity: number;
        }> = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            const particleCount = Math.min(Math.floor(window.innerWidth / 8), 100);
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 2 + 1,
                    speedY: Math.random() * 1 + 0.5,
                    speedX: Math.random() * 0.5 - 0.25,
                    opacity: Math.random() * 0.5 + 0.3,
                });
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';

            particles.forEach((p) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.fill();
            });
        };

        const updateParticles = () => {
            particles.forEach((p) => {
                p.y += p.speedY;
                p.x += p.speedX;

                if (p.y > canvas.height) {
                    p.y = -10;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x > canvas.width) {
                    p.x = 0;
                } else if (p.x < 0) {
                    p.x = canvas.width;
                }
            });
        };

        const animate = () => {
            drawParticles();
            updateParticles();
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        createParticles();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const [isShaking, setIsShaking] = React.useState(false);
    const [showTooltip, setShowTooltip] = React.useState(false);

    // Periodic Shake and Message Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setIsShaking(true);
            setShowTooltip(true);

            // Stop shaking after 1s
            setTimeout(() => setIsShaking(false), 1000);

            // Hide tooltip after 4s
            setTimeout(() => setShowTooltip(false), 4000);
        }, 10000); // Every 10 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {/* Snowfall Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
                style={{ pointerEvents: 'none' }}
            />

            {/* CSS Christmas Lights - Lightweight & Animated */}
            <div className="fixed top-0 left-0 w-full z-[40] pointer-events-none flex justify-center overflow-hidden" style={{ height: '40px' }}>
                <ul className="christmas-lights whitespace-nowrap">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <li key={i} className={i % 2 === 0 ? 'even' : 'odd'}></li>
                    ))}
                </ul>
            </div>

            {/* Santa Hat on Bottom Left */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={isShaking ? { y: 0, opacity: 1, rotate: [0, -10, 10, -10, 10, 0] } : { y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[60] block pointer-events-auto"
            >
                <div className="relative group cursor-pointer" onClick={() => setShowTooltip(!showTooltip)}>
                    <div className="text-5xl md:text-7xl drop-shadow-2xl filter hover:scale-110 transition-transform duration-300">🎅</div>
                    <div className={`absolute -top-16 left-0 bg-white text-black p-3 rounded-xl shadow-2xl transition-all duration-300 transform ${showTooltip ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'} text-sm font-medium w-40 text-center pointer-events-none border border-gray-100 block`}>
                        <span className="block text-lg mb-1">🎄</span>
                        Feliz Natal da Equipe Velpro!
                        <div className="absolute bottom-[-6px] left-8 w-3 h-3 bg-white transform rotate-45 border-r border-b border-gray-100"></div>
                    </div>
                </div>
            </motion.div>

            <style jsx>{`
                .christmas-lights {
                    text-align: center;
                    white-space: nowrap;
                    overflow: hidden;
                    position: absolute;
                    top: -10px; /* Pull up slightly to not block menu */
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    pointer-events: none;
                    display: flex;
                    justify-content: center;
                }

                .christmas-lights li {
                    position: relative;
                    list-style: none;
                    margin: 0 12px; /* Spacing between lights */
                    padding: 0;
                    display: inline-block;
                    width: 12px;
                    height: 20px;
                    border-radius: 50%;
                    top: 10px;
                    background: #fff;
                    animation-name: flash;
                    animation-duration: 2s;
                    animation-iteration-count: infinite;
                    animation-fill-mode: both;
                }

                /* Wire */
                .christmas-lights li:before {
                    content: "";
                    position: absolute;
                    background: transparent;
                    width: 30px; /* Wire length */
                    height: 10px;
                    border-radius: 50%;
                    top: -8px;
                    left: -15px;
                    border-bottom: 2px solid #222; /* The wire */
                    z-index: -1;
                }

                /* Colors and Delays */
                .christmas-lights li:nth-child(4n+1) {
                    background: #ff3333; /* Red */
                    box-shadow: 0 2px 10px rgba(255, 51, 51, 0.5);
                    animation-delay: 0s;
                }
                .christmas-lights li:nth-child(4n+2) {
                    background: #33ff33; /* Green */
                    box-shadow: 0 2px 10px rgba(51, 255, 51, 0.5);
                    animation-delay: 0.5s;
                }
                .christmas-lights li:nth-child(4n+3) {
                    background: #ffff33; /* Yellow */
                    box-shadow: 0 2px 10px rgba(255, 255, 51, 0.5);
                    animation-delay: 1s;
                }
                .christmas-lights li:nth-child(4n+4) {
                    background: #3333ff; /* Blue */
                    box-shadow: 0 2px 10px rgba(51, 51, 255, 0.5);
                    animation-delay: 1.5s;
                }

                @keyframes flash {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                        filter: brightness(1.2);
                    }
                    50% {
                        opacity: 0.4;
                        transform: scale(0.9);
                        filter: brightness(0.8);
                    }
                }
            `}</style>
        </div>
    );
}
