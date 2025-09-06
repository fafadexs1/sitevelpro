
"use client";

import React, { useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Não executa a lógica de animação no servidor ou em mobile
    if (isMobile === undefined || isMobile === true) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let w: number, h: number;
    
    const STRAND_COUNT             = 30;
    const BACKGROUND_STRAND_RATIO  = 0.4;
    const MIN_SPEED = 1.0, MAX_SPEED = 3.5;
    const MIN_WIDTH = 1,   MAX_WIDTH = 2;    // linhas bem finas
    const MIN_AMPLITUDE = 20, MAX_AMPLITUDE = 80;
    const FREQUENCY_FACTOR = 0.0025;
    const CLEAR_ALPHA      = 0.15;           // rastro leve
    const FOREGROUND_ALPHA = 0.9;
    const BACKGROUND_ALPHA = 0.5;
    
    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    function random(min: number, max: number){ return Math.random()*(max-min)+min; }
    function randColor(a: number){
      // Cor primária é #34D399 (Emerald Green)
      const g = 180 + Math.floor(Math.random()*40); // 180-220
      const r = 30 + Math.floor(Math.random()*40); // 30-70
      const b = 120 + Math.floor(Math.random()*40); // 120-160
      return `rgba(${r},${g},${b},${a})`;
    }

    class FiberStrand {
      isBg: boolean;
      y!: number;
      baseX!: number;
      x!: number;
      speed!: number;
      lineWidth!: number;
      amplitude!: number;
      frequency!: number;
      phase!: number;
      alpha!: number;
      color!: string;
      prevX!: number;
      prevY!: number;

      constructor(isBg: boolean) {
        this.isBg = isBg;
        this.init();
      }
      init() {
        this.y       = -random(10, h*0.8);
        this.baseX   = random(0, w);
        this.x       = this.baseX;
        this.speed   = random(MIN_SPEED, MAX_SPEED) * (this.isBg?0.7:1);
        this.lineWidth = random(MIN_WIDTH, MAX_WIDTH) * (this.isBg?0.8:1);
        this.amplitude = random(MIN_AMPLITUDE, MAX_AMPLITUDE) * (this.isBg?0.5:1);
        this.frequency = random(0.5,1.5) * FREQUENCY_FACTOR;
        this.phase   = random(0, Math.PI*2);
        this.alpha   = this.isBg?BACKGROUND_ALPHA:FOREGROUND_ALPHA;
        this.color   = randColor(this.alpha);
        this.prevX   = this.x;
        this.prevY   = this.y;
      }
      update() {
        this.prevX = this.x;
        this.prevY = this.y;
        this.y += this.speed;
        this.x  = this.baseX + this.amplitude * Math.sin(this.y*this.frequency + this.phase);
        if (this.prevY > h + this.lineWidth*2) {
          this.init();
          this.y = -random(5,20);
          this.prevY = this.y;
        }
      }
      draw() {
        ctx.beginPath();
        ctx.moveTo(this.prevX, this.prevY);
        ctx.lineTo(this.x, this.y);
        ctx.lineWidth   = this.lineWidth;
        ctx.strokeStyle = this.color;
        ctx.lineCap     = 'butt';
        ctx.stroke();

        const r = this.lineWidth * 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, r, 0, Math.PI*2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    let strands: FiberStrand[] = [];
    function setup() {
      strands = [];
      const bgCount = Math.floor(STRAND_COUNT * BACKGROUND_STRAND_RATIO);
      const fgCount = STRAND_COUNT - bgCount;
      for (let i=0; i<bgCount; i++) strands.push(new FiberStrand(true));
      for (let i=0; i<fgCount; i++) strands.push(new FiberStrand(false));
      strands.sort((a,b)=>(a.isBg ? -1 : 1) - (b.isBg ? -1 : 1));
    }
    setup();

    let animationFrameId: number;
    function loop() {
      ctx.fillStyle = `rgba(10,10,10,${CLEAR_ALPHA})`; // Fundo um pouco mais claro para combinar com o novo tema
      ctx.fillRect(0, 0, w, h);

      strands.forEach(s => { s.update(); s.draw(); });
      animationFrameId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    }
  }, [isMobile]);

  // No servidor (isMobile === undefined) ou em mobile (isMobile === true), renderiza um placeholder simples.
  // A animação complexa do canvas só roda no desktop, após a montagem do componente.
  if (isMobile === undefined || isMobile === true) {
    return (
        <div className="canvas-background-wrapper" style={{ backgroundColor: 'rgb(23, 23, 23)' }} />
    )
  }

  return (
    <>
      <style jsx global>{`
        .canvas-background-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: -20;
          pointer-events: none;
        }
        canvas#canvasBg {
          width: 100%;
          height: 100%;
          display: block;
          will-change: transform;
        }
      `}</style>
      <div className="canvas-background-wrapper">
        <canvas id="canvasBg" ref={canvasRef}></canvas>
      </div>
    </>
  );
}
