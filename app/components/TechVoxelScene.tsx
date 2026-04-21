"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useIntersectionObserver } from "@/app/hooks/useIntersectionObserver";

interface Skill {
  name: string;
  cat: string;
  lvl: number;
}

interface TechVoxelSceneProps {
  skills: Skill[];
}

export default function TechVoxelScene({ skills }: TechVoxelSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const observer = useIntersectionObserver(mountRef, { threshold: 0.1 });
  const isVisible = !!observer?.isIntersecting;

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    /* ── Renderer ─────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    /* ── Scene / Isometric Camera ─────────────────────────────────── */
    const scene = new THREE.Scene();
    
    // Isometric view setup
    const aspect = W / H;
    const frustumSize = 10;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );

    // Standard isometric angle: 35.264 degrees down, 45 degrees left
    camera.position.set(20, 20, 20);
    camera.lookAt(0, 0, 0);

    /* ── Lights ───────────────────────────────────────────────────── */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 512; // Optimized from 1024
    dirLight.shadow.mapSize.height = 512;
    scene.add(dirLight);

    // Cyan point lights for glow
    const glowLight1 = new THREE.PointLight(0x00dbe9, 15, 15);
    glowLight1.position.set(0, 5, 0);
    scene.add(glowLight1);

    /* ── Helper: Texture Creator ──────────────────────────────────── */
    const createVoxelTexture = (text: string, color: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d")!;

      // Background
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Border glow
      ctx.strokeStyle = color;
      ctx.lineWidth = 15;
      ctx.strokeRect(10, 10, 236, 236);

      // Label (Short name)
      ctx.fillStyle = color;
      ctx.font = "bold 80px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const shortName = text.length > 5 ? text.slice(0, 3) : text;
      ctx.fillText(shortName.toUpperCase(), 128, 128);

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    /* ── Floor ────────────────────────────────────────────────────── */
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshPhysicalMaterial({
      color: 0x050505,
      roughness: 0.15,
      metalness: 0.8,
      reflectivity: 0.5,
      transparent: true,
      opacity: 0.4
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    /* ── Voxel Creation & Stacking Logic ──────────────────────────── */
    const voxelGroup = new THREE.Group();
    scene.add(voxelGroup);

    const voxels: THREE.Mesh[] = [];
    const colors = [0x00dbe9, 0x00f0ff, 0x7df4ff, 0x96d1d6, 0xdbfcff];
    
    // Group skills by category to stack them
    const categories = Array.from(new Set(skills.map(s => s.cat)));
    
    skills.forEach((skill, idx) => {
      const color = colors[idx % colors.length];
      const colorStr = "#" + new THREE.Color(color).getHexString();
      
      const geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9);
      const texture  = createVoxelTexture(skill.name, colorStr);
      
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        emissive: color,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.5,
      });

      const voxel = new THREE.Mesh(geometry, material);
      voxel.castShadow = true;
      voxel.receiveShadow = true;

      // Position logic: Isometric grid stacking
      const catIdx = categories.indexOf(skill.cat);
      const rowIdx = idx % 3;
      const colIdx = Math.floor(idx / 3) % 4;
      
      voxel.position.set(
        rowIdx * 1.2 - 1.2,
        (idx % 2) * 1.1, // Stacking height
        colIdx * 1.2 - 1.2
      );

      // Initial state for animation
      voxel.scale.set(0, 0, 0);
      voxel.userData = { 
        baseY: voxel.position.y,
        skillName: skill.name,
        delay: idx * 0.1
      };

      voxels.push(voxel);
      voxelGroup.add(voxel);
    });

    /* ── Mouse Parallax ───────────────────────────────────────────── */
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    /* ── Animation Loop ───────────────────────────────────────────── */
    let raf: number;
    let startTime = performance.now();

    const animate = () => {
      if (!isVisible) {
        if (raf) cancelAnimationFrame(raf);
        return;
      }
      
      raf = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      // Smooth camera drift
      camera.position.x += (20 + mouseX * 5 - camera.position.x) * 0.05;
      camera.position.y += (20 - mouseY * 5 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Animate voxels
      voxels.forEach((v, i) => {
        const { baseY, delay } = v.userData;
        
        // Entrance animation
        if (elapsed > delay && v.scale.x < 1) {
          const s = Math.min(1, v.scale.x + 0.05);
          v.scale.set(s, s, s);
        }

        // Floating effect
        v.position.y = baseY + Math.sin(elapsed * 1.5 + i) * 0.15;
        v.rotation.y = Math.sin(elapsed * 0.5 + i) * 0.1;
      });

      // Flickering glow
      glowLight1.intensity = 15 + Math.sin(elapsed * 3) * 5;

      renderer.render(scene, camera);
    };
    
    if (isVisible) animate();

    /* ── Resize Handler ───────────────────────────────────────────── */
    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      const aspect = w / h;
      
      camera.left = (frustumSize * aspect) / -2;
      camera.right = (frustumSize * aspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = frustumSize / -2;
      camera.updateProjectionMatrix();
      
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    /* ── Cleanup ──────────────────────────────────────────────────── */
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      
      // Thorough disposal
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          } else {
            if (object.material.map) object.material.map.dispose();
            object.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [skills, isVisible]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: "100%", 
        height: "500px", 
        background: "transparent",
        cursor: "grab"
      }} 
    />
  );
}
