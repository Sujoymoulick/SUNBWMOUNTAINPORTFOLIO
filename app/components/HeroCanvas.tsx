"use client";

/**
 * HeroCanvas — Three.js scene driven by AnimationAction
 *
 * Uses the exact AnimationAction API from the docs:
 *  - AnimationMixer + AnimationClip (keyframe tracks)
 *  - action.fadeIn()  / action.fadeOut()
 *  - action.crossFadeTo()
 *  - action.setLoop( THREE.LoopRepeat, Infinity )
 *  - action.play()
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    /* ── Renderer ─────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,          // transparent background
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    /* ── Scene / Camera ───────────────────────────────────────────── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 6);

    /* ── Lights ───────────────────────────────────────────────────── */
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambient);

    const pointA = new THREE.PointLight(0x00dbe9, 8, 20);  // cyan accent
    pointA.position.set(4, 3, 4);
    scene.add(pointA);

    const pointB = new THREE.PointLight(0x7df4ff, 4, 15);
    pointB.position.set(-4, -2, 2);
    scene.add(pointB);

    /* ── Primary Mesh — Torus Knot ────────────────────────────────── */
    const knotGeo = new THREE.TorusKnotGeometry(1.1, 0.38, 180, 22, 2, 3);
    const knotMat = new THREE.MeshPhongMaterial({
      color:     0x00dbe9,
      emissive:  0x003a3f,
      specular:  0xdbfcff,
      shininess: 90,
      wireframe: false,
      transparent: true,
      opacity: 0.92,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    scene.add(knot);

    /* ── Secondary Mesh — Wireframe overlay ───────────────────────── */
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const wire = new THREE.Mesh(knotGeo, wireMat);
    scene.add(wire);

    /* ── Particle field ─────────────────────────────────────────────
      Small dots orbiting in a sphere shell                           */
    const particleCount = 280;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 2.6 + Math.random() * 1.4;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pmat = new THREE.PointsMaterial({
      color: 0x7df4ff,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
    });
    const particles = new THREE.Points(pgeo, pmat);
    scene.add(particles);

    /* ────────────────────────────────────────────────────────────────
      ANIMATION ACTIONS
      Three separate AnimationClips, each controlling a different
      property. We use AnimationAction.crossFadeTo() to switch between
      idle spin and pulse runs, exactly as the docs describe.
    ──────────────────────────────────────────────────────────────── */

    const mixer = new THREE.AnimationMixer(knot);

    // ── Clip 1 — Idle slow rotation (Y-axis, LoopRepeat forever) ──
    const idleTrack = new THREE.QuaternionKeyframeTrack(
      ".quaternion",
      [0, 4],
      [
        ...new THREE.Quaternion().toArray(),
        ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI * 2, 0)).toArray(),
      ]
    );
    const idleClip   = new THREE.AnimationClip("idle", 4, [idleTrack]);
    const idleAction = mixer.clipAction(idleClip);
    idleAction.setLoop(THREE.LoopRepeat, Infinity);
    idleAction.timeScale = 1;

    // ── Clip 2 — Fast spin burst (LoopOnce, clampWhenFinished) ────
    const spinTrack = new THREE.QuaternionKeyframeTrack(
      ".quaternion",
      [0, 1.2],
      [
        ...new THREE.Quaternion().toArray(),
        ...new THREE.Quaternion().setFromEuler(new THREE.Euler(0, Math.PI * 2, 0)).toArray(),
      ]
    );
    const spinClip   = new THREE.AnimationClip("spin", 1.2, [spinTrack]);
    const spinAction = mixer.clipAction(spinClip);
    spinAction.setLoop(THREE.LoopOnce, 1);
    spinAction.clampWhenFinished = false; // auto-disable after one loop

    // ── Clip 3 — Scale pulse (breathe in/out) ─────────────────────
    const times  = [0, 1, 2];
    const values = [1, 1, 1, 1.12, 1.12, 1.12, 1, 1, 1];     // x y z per keyframe
    const scaleTrack = new THREE.VectorKeyframeTrack(".scale", times, values);
    const pulseClip   = new THREE.AnimationClip("pulse", 2, [scaleTrack]);
    const pulseAction = mixer.clipAction(pulseClip);
    pulseAction.setLoop(THREE.LoopRepeat, Infinity);

    // ── Start both idle + pulse on mount ──────────────────────────
    idleAction.fadeIn(1.5).play();        // fadeIn → weight 0 → 1 over 1.5s
    pulseAction.fadeIn(2.0).play();

    // ── Periodic crossFade: every 6 s burst into spin then return ─
    let spinScheduled = false;
    const triggerSpinBurst = () => {
      if (spinScheduled) return;
      spinScheduled = true;

      // CrossFade from idle → spin (0.4 s warp transition)
      spinAction.reset();
      idleAction.crossFadeTo(spinAction, 0.4, true);   // warp=true
      spinAction.play();

      // After spin finishes (1.2 s) crossFade back to idle
      setTimeout(() => {
        spinAction.crossFadeTo(idleAction, 0.6, false);
        idleAction.play();
        spinScheduled = false;
      }, 1200 + 400);   // clip duration + transition
    };

    const burstInterval = setInterval(triggerSpinBurst, 6000);

    /* ── Mouse parallax ─────────────────────────────────────────── */
    let targetX = 0, targetY = 0;
    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth  - 0.5) * 0.8;
      targetY = (e.clientY / window.innerHeight - 0.5) * 0.5;
    };
    window.addEventListener("mousemove", onMouseMove);

    /* ── Clock + render loop ─────────────────────────────────────── */
    const clock = new THREE.Clock();
    let raf: number;

    const animate = () => {
      raf = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Drive the AnimationMixer
      mixer.update(delta);

      // Slow parallax drift (lerp toward mouse position)
      knot.position.x += (targetX - knot.position.x) * 0.04;
      knot.position.y += (-targetY - knot.position.y) * 0.04;

      // Slow Z wobble independent of animation clips
      knot.rotation.z = Math.sin(elapsed * 0.3) * 0.25;

      // Wireframe + particles always rotate gently
      wire.rotation.copy(knot.rotation);
      particles.rotation.y = elapsed * 0.06;
      particles.rotation.x = elapsed * 0.03;

      renderer.render(scene, camera);
    };
    animate();

    /* ── Resize handler ──────────────────────────────────────────── */
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    /* ── Cleanup ────────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(burstInterval);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      // Stop all actions properly using AnimationAction API
      idleAction.stop();
      spinAction.stop();
      pulseAction.stop();
      mixer.stopAllAction();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
