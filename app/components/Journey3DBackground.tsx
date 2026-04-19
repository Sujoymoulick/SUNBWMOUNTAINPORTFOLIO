"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Journey3DBackgroundProps {
  scrollProgress: number; // 0 to 1
}

export default function Journey3DBackground({ scrollProgress }: Journey3DBackgroundProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    voxels: THREE.Group[];
    path: THREE.Line;
  } | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, 0, 10);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00dbe9, 20, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    /* ── Path ── */
    const pathPoints = [];
    for (let i = 0; i <= 50; i++) {
      const t = i / 50;
      pathPoints.push(new THREE.Vector3(
        Math.sin(t * Math.PI * 2) * 2,
        -t * 30 + 15,
        Math.cos(t * Math.PI * 2) * 2
      ));
    }
    const pathCurve = new THREE.CatmullRomCurve3(pathPoints);
    const pathGeo = new THREE.BufferGeometry().setFromPoints(pathCurve.getPoints(100));
    const pathMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.2 });
    const path = new THREE.Line(pathGeo, pathMat);
    scene.add(path);

    /* ── Voxels ── */
    const voxels: THREE.Group[] = [];
    const milestoneCount = 3;
    const colors = [0x00dbe9, 0xffffff, 0x00dbe9];

    for (let i = 0; i < milestoneCount; i++) {
        const group = new THREE.Group();
        const size = 0.5;
        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshStandardMaterial({ 
            color: colors[i], 
            emissive: colors[i], 
            emissiveIntensity: 0.5,
            wireframe: true 
        });

        for (let j = 0; j < 5; j++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 1
            );
            mesh.rotation.set(Math.random(), Math.random(), Math.random());
            group.add(mesh);
        }
        
        const t = (i + 1) / (milestoneCount + 1);
        const pos = pathCurve.getPointAt(t);
        group.position.copy(pos);
        
        voxels.push(group);
        scene.add(group);
    }

    sceneRef.current = { scene, camera, renderer, voxels, path };

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const { camera, voxels, renderer, scene } = sceneRef.current;

    // Map scrollProgress to camera position along the path
    const targetY = 15 - (scrollProgress * 30);
    camera.position.y += (targetY - camera.position.y) * 0.1;
    camera.position.x = Math.sin(scrollProgress * Math.PI * 2) * 2;
    camera.position.z = 10 + Math.cos(scrollProgress * Math.PI * 2) * 2;
    camera.lookAt(0, targetY - 2, 0);

    voxels.forEach((v, i) => {
        v.rotation.y += 0.01;
        v.rotation.x += 0.005;
        const dist = Math.abs(v.position.y - camera.position.y);
        const scale = Math.max(0.1, 1 - (dist / 10));
        v.scale.set(scale, scale, scale);
    });

    renderer.render(scene, camera);
  }, [scrollProgress]);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
