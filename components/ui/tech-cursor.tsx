"use client";
import React, { useEffect, useRef } from "react";

interface TechImage {
  name: string;
  src: string;
  image: HTMLImageElement;
}

interface Particle {
  x: number;
  y: number;
  alpha: number;
  image: HTMLImageElement;
  size: number;
  update: () => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

const icons: { name: string; src: string }[] = [
  {
    name: "JavaScript",
    src: "data:image/svg+xml;utf8,<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path fill='%23F7DF1E' d='M0 0h24v24H0V0z'/><path d='M22.012 22.046H1.996V1.95h20.016v20.096zM11.854 16.273c-.328-.515-.75-.826-1.464-.826-1.01 0-1.558.544-1.558 1.411 0 .907.518 1.341 1.636 1.83 1.82.784 2.825 1.583 2.825 3.327 0 2.21-1.782 3.109-3.791 3.109-2.001 0-3.323-.974-4.049-2.5l2.253-1.4c.394.815.932 1.488 1.848 1.488 1.054 0 1.564-.475 1.564-1.293 0-.814-.492-1.228-1.733-1.76-1.892-.81-2.73-1.66-2.73-3.21 0-1.921 1.442-3.033 3.518-3.033 1.688 0 2.853.684 3.565 2.062l-1.884 1.395zm10.158 5.773v-9.61h-2.583v7.351c0 1.258-.291 1.82-1.378 1.82-.931 0-1.428-.584-1.428-1.517v-7.654h-2.585v8.03c0 2.378 1.217 3.655 3.541 3.655 1.666 0 2.828-.755 3.37-1.87v1.795h1.063z'/></svg>",
  },
  {
    name: "TypeScript",
    src: "data:image/svg+xml;utf8,<svg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path fill='%233178C6' d='M0 0h24v24H0V0z'/><path fill='%23FFF' d='M13.882 17.658c-1.353.901-2.91 1.353-4.67 1.353-1.253 0-2.383-.242-3.39-.726L6.822 15.65c.875.586 1.956.88 3.245.88 1.295 0 2.072-.459 2.332-1.375.094-.343.14-.682.14-1.02V8.293h-3.41V5.7h9.52v2.593h-3.41v9.365h-1.357z'/></svg>",
  },
  {
    name: "React",
    src: "data:image/svg+xml;utf8,<svg viewBox='-11.5 -10.23174 23 20.46348' xmlns='http://www.w3.org/2000/svg'><circle cx='0' cy='0' r='2.05' fill='%2361dafb'/><g stroke='%2361dafb' stroke-width='1' fill='none'><ellipse rx='11' ry='4.2'/><ellipse rx='11' ry='4.2' transform='rotate(60)'/><ellipse rx='11' ry='4.2' transform='rotate(120)'/></g></svg>",
  },
  {
    name: "Next.js",
    src: "data:image/svg+xml;utf8,<svg viewBox='0 0 24 24' fill='%23FFF' xmlns='http://www.w3.org/2000/svg'><circle cx='12' cy='12' r='11' fill='%23000'/><path d='M18.847 17.653 10.375 7H8v10h2.094v-7.39l7.009 9.07c.642-.236 1.23-.556 1.744-.963v-9.6H17.75v8.463l1.097 1.073zM15 7h-2.094v10h2.094V7z'/></svg>",
  }
];

export const TechCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const techImagesRef = useRef<TechImage[]>([]);

  useEffect(() => {
    // Preload images robustly (with error fallback so Promise.all never hangs)
    const loadImages = async () => {
      techImagesRef.current = (await Promise.all(
        icons.map(({ name, src }) => {
          return new Promise<TechImage | null>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = src;
            img.onload = () => resolve({ name, src, image: img });
            img.onerror = () => {
              console.warn(`Failed to track load image for tech cursor: ${name}`);
              resolve(null); // Resolve with null so Promise.all proceeds
            };
          });
        })
      )).filter((img): img is TechImage => img !== null);
    };

    loadImages().then(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      resize();
      window.addEventListener("resize", resize);

      const particles = particlesRef.current;

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.update();
          p.draw(ctx);
          if (p.alpha <= 0) {
            particles.splice(i, 1);
          }
        }
        requestAnimationFrame(animate);
      };

      animate();

      const onMove = (e: MouseEvent) => {
        if (!techImagesRef.current.length) return;
        
        const randomIcon =
          techImagesRef.current[
            Math.floor(Math.random() * techImagesRef.current.length)
          ];

        const size = 22 + Math.random() * 8;

        const particle: Particle = {
          x: e.clientX,
          y: e.clientY,
          alpha: 1,
          image: randomIcon.image,
          size,
          update() {
            this.y -= 0.4;
            this.alpha -= 0.02;
          },
          draw(ctx: CanvasRenderingContext2D) {
            ctx.globalAlpha = this.alpha;
            ctx.drawImage(
              this.image,
              this.x - this.size / 2,
              this.y - this.size / 2,
              this.size,
              this.size,
            );
            ctx.globalAlpha = 1;
          },
        };

        particles.push(particle);
      };

      window.addEventListener("mousemove", onMove);
      return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("resize", resize);
      };
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[100]"
    />
  );
};
