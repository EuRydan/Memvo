"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useScroll, useMotionValue } from "framer-motion";
import Image from 'next/image';
import { Logo } from '@/components/Logo';
import Link from 'next/link';

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
    src: string;
    index: number;
    total: number;
    phase: AnimationPhase;
    target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}

// --- FlipCard Component ---
const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

function FlipCard({
    src,
    index,
    total,
    phase,
    target,
}: FlipCardProps) {
    return (
        <motion.div
            animate={{
                x: target.x,
                y: target.y,
                rotate: target.rotation,
                scale: target.scale,
                opacity: target.opacity,
            }}
            transition={{
                type: "spring",
                stiffness: 40,
                damping: 15,
            }}
            style={{
                position: "absolute",
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                transformStyle: "preserve-3d",
                perspective: "1000px",
            }}
            className="cursor-pointer group"
        >
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: "preserve-3d" }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ rotateY: 180 }}
            >
                {/* Front Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-200"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <img
                        src={src}
                        alt={`hero-${index}`}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
                </div>

                {/* Back Face */}
                <div
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-900 flex flex-col items-center justify-center p-4 border border-gray-700"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <div className="text-center">
                        <div className="flex justify-center mb-1">
                          <Logo className="h-4 w-auto text-[#f4c5a8]" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 20;
const MAX_SCROLL = 3000;

// Wedding & Party Images for Memvor
const IMAGES = [
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=300&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?w=300&q=80",
    "https://images.unsplash.com/photo-1731596153022-4cedafe3330a?w=300&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=300&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=300&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=300&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=300&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=300&q=80",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=300&q=80",
    "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=300&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=300&q=80",
    "https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?w=300&q=80",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=300&q=80",
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=300&q=80",
    "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=300&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=80",
    "https://images.unsplash.com/photo-1508215885820-4585e56135c8?w=300&q=80",
    "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=300&q=80",
    "https://images.unsplash.com/photo-1525268771113-32d9e9021a97?w=300&q=80",
];

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export function IntroAnimation() {
    const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const stickyRef = useRef<HTMLDivElement>(null);

    // --- Container Size ---
    useEffect(() => {
        if (!stickyRef.current) return;

        const handleResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                setContainerSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        };

        const observer = new ResizeObserver(handleResize);
        observer.observe(stickyRef.current);

        setContainerSize({
            width: stickyRef.current.offsetWidth,
            height: stickyRef.current.offsetHeight,
        });

        return () => observer.disconnect();
    }, []);

    // --- Scroll Logic (Framer Motion) ---
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const virtualScroll = useTransform(scrollYProgress, [0, 1], [0, MAX_SCROLL]);

    const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
    const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });

    const scrollRotate = useTransform(virtualScroll, [600, 3000], [0, 360]);
    const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

    // --- Mouse Parallax ---
    const mouseX = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

    useEffect(() => {
        const container = stickyRef.current;
        if (!container) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const normalizedX = (relativeX / rect.width) * 2 - 1;
            mouseX.set(normalizedX * 100);
        };
        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX]);

    // --- Intro Sequence ---
    useEffect(() => {
        const timer1 = setTimeout(() => setIntroPhase("line"), 500);
        const timer2 = setTimeout(() => setIntroPhase("circle"), 2500);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    // --- Random Scatter Positions ---
    const scatterPositions = useMemo(() => {
        return IMAGES.map(() => ({
            x: (Math.random() - 0.5) * 1500,
            y: (Math.random() - 0.5) * 1000,
            rotation: (Math.random() - 0.5) * 180,
            scale: 0.6,
            opacity: 0,
        }));
    }, []);

    // --- Render Loop (Manual Calculation for Morph) ---
    const [morphValue, setMorphValue] = useState(0);
    const [rotateValue, setRotateValue] = useState(0);
    const [parallaxValue, setParallaxValue] = useState(0);

    useEffect(() => {
        const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
        const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
        const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
        return () => {
            unsubscribeMorph();
            unsubscribeRotate();
            unsubscribeParallax();
        };
    }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

    const contentOpacity = useTransform(smoothMorph, [0.8, 1], [0, 1]);
    const contentY = useTransform(smoothMorph, [0.8, 1], [20, 0]);

    return (
        <div ref={containerRef} className="relative h-[300vh] w-full bg-[#fafafa]">
            <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#fafafa]">

            {/* ── Grid Background ── */}
                <div
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{
                        backgroundImage: 'linear-gradient(to right, #e8e8e8 1px, transparent 1px), linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)',
                        backgroundSize: '6rem 4rem',
                    }}
                >
                    <div className="absolute inset-0" style={{
                        background: 'radial-gradient(circle 800px at 100% 200px, rgba(213,197,255,0.45), transparent)',
                    }} />
                </div>

                {/* Orbs */}
                <div className="absolute top-[-80px] right-[-100px] w-[480px] h-[480px] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(244,197,168,0.65) 0%, rgba(200,184,224,0.4) 60%, transparent 80%)',
                        filter: 'blur(80px)',
                        animation: 'drift 20s ease-in-out infinite alternate',
                    }} />
                <div className="absolute bottom-[-60px] left-[-80px] w-[380px] h-[380px] rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(186,210,255,0.5) 0%, rgba(200,184,224,0.35) 60%, transparent 80%)',
                        filter: 'blur(70px)',
                        animation: 'drift2 16s ease-in-out infinite alternate',
                    }} />


                {/* Intro Text (Fades out) */}
                <div className="absolute z-20 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 w-full px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                        animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
                        transition={{ duration: 1 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-px bg-[#939393]" />
                            <span className="text-[11px] font-semibold tracking-[0.2em] text-[#939393] uppercase">
                                Álbuns de celebração
                            </span>
                            <div className="w-5 h-px bg-[#939393]" />
                        </div>

                        <h1 className="max-w-[340px] sm:max-w-xl"
                            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                            <span className="block text-[2.4rem] sm:text-[4rem] font-bold leading-[1.05] tracking-[-0.03em] text-[#0a0a0a]">
                                Cada momento,
                            </span>
                            <span className="block text-[2.4rem] sm:text-[4rem] font-bold leading-[1.05] tracking-[-0.03em]"
                                style={{
                                    background: 'linear-gradient(135deg, #c8956a 0%, #9b7fc0 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}>
                                compartilhado.
                            </span>
                        </h1>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={introPhase === "circle" && morphValue < 0.5 ? { opacity: 0.5 - morphValue } : { opacity: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mt-12 text-xs font-bold tracking-[0.2em] text-gray-500"
                    >
                        ROLE PARA EXPLORAR
                    </motion.p>
                </div>

                {/* Arc Active Content (Fades in) */}
                <motion.div
                    style={{ opacity: contentOpacity, y: contentY }}
                    className="absolute top-[18%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4"
                >
                    <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }} className="text-3xl md:text-5xl font-bold tracking-tight text-[#0a0a0a] mb-4">
                        Simples para você,<br/>mágico para seus convidados
                    </h2>
                    <p className="text-sm md:text-base text-[#676f7b] max-w-lg leading-relaxed mb-6">
                        Reúna todas as fotos e vídeos do seu evento em um único lugar. Seus convidados compartilham instantaneamente, sem precisar baixar aplicativos ou fazer login.
                    </p>
                    
                    <div className="pointer-events-auto">
                        <Link
                            href="/pricing"
                            className="inline-flex items-center gap-3 bg-[#0a0a0a] text-white px-8 py-4 rounded-full font-semibold hover:opacity-85 transition-all active:scale-95 group z-20 relative"
                            style={{ boxShadow: '0 6px 24px rgba(0,0,0,0.22)' }}
                        >
                            <span>Ver planos e preços</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                    </div>
                </motion.div>

                {/* Main Container */}
                <div className="relative flex items-center justify-center w-full h-full">
                    {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
                        let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

                        if (introPhase === "scatter") {
                            target = scatterPositions[i];
                        } else if (introPhase === "line") {
                            const lineSpacing = 70;
                            const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
                            const lineX = i * lineSpacing - lineTotalWidth / 2;
                            target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
                        } else {
                            const isMobile = containerSize.width < 768;
                            const minDimension = Math.min(containerSize.width, containerSize.height);

                            const circleRadius = isMobile 
                                ? Math.min(minDimension * 0.45, 220) 
                                : Math.min(minDimension * 0.35, 350);
                            
                            const baseScale = isMobile ? 0.7 : 1;

                            const circleAngle = (i / TOTAL_IMAGES) * 360;
                            const circleRad = (circleAngle * Math.PI) / 180;
                            const circlePos = {
                                x: Math.cos(circleRad) * circleRadius,
                                y: Math.sin(circleRad) * circleRadius,
                                rotation: circleAngle + 90,
                            };

                            const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
                            const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);

                            const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
                            const arcCenterY = arcApexY + arcRadius;

                            const spreadAngle = isMobile ? 100 : 130;
                            const startAngle = -90 - (spreadAngle / 2);
                            const step = spreadAngle / (TOTAL_IMAGES - 1);

                            const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
                            const maxRotation = spreadAngle * 0.8;
                            const boundedRotation = -scrollProgress * maxRotation;

                            const currentArcAngle = startAngle + (i * step) + boundedRotation;
                            const arcRad = (currentArcAngle * Math.PI) / 180;

                            const arcPos = {
                                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                                rotation: currentArcAngle + 90,
                                scale: isMobile ? 1.0 : 1.8,
                            };

                            target = {
                                x: lerp(circlePos.x, arcPos.x, morphValue),
                                y: lerp(circlePos.y, arcPos.y, morphValue),
                                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                                scale: lerp(baseScale, arcPos.scale, morphValue),
                                opacity: 1,
                            };
                        }

                        return (
                            <FlipCard
                                key={i}
                                src={src}
                                index={i}
                                total={TOTAL_IMAGES}
                                phase={introPhase}
                                target={target}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
