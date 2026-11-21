"use client";

import { useEffect, useRef } from "react";
import "./motion.css";

export function StudioOrbit() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;
    if (!element || !("IntersectionObserver" in window)) return;

    let active = true;
    let inView = false;
    let started = false;
    let update = () => {};
    let dispose = () => {};
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");

    async function start() {
      if (!element || started || !inView || preference.matches) return;
      started = true;
      const THREE = await import("three");
      if (!active || !element.isConnected) return;
      const canvas = document.createElement("canvas");
      const renderer = new THREE.WebGLRenderer({
        canvas, antialias: true, alpha: true, powerPreference: "low-power",
      });
      renderer.setClearColor(0, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1.82, 1.82, 1.13, -1.13, 0.1, 10);
      camera.position.z = 4;
      const ring = new THREE.Group();
      const major = 1.18;
      const minor = 0.32;
      const positions: number[] = [];
      const colors: number[] = [];
      const brass = new THREE.Color("#ad8549");
      const highlight = new THREE.Color("#ffe5ac");
      const color = new THREE.Color();
      function point(u: number, v: number) {
        const radius = major + minor * Math.cos(v);
        positions.push(radius * Math.cos(u), radius * Math.sin(u), minor * Math.sin(v));
        const gleam = 0.5 + 0.5 * Math.cos(u - 1.2) * Math.cos(v + 0.6);
        color.lerpColors(brass, highlight, gleam ** 3);
        colors.push(color.r, color.g, color.b);
      }
      const turn = Math.PI * 2;
      for (let row = 0; row < 12; row++) {
        for (let col = 0; col < 96; col++) {
          point(turn * col / 96, turn * row / 12);
          point(turn * (col + 1) / 96, turn * row / 12);
        }
      }
      for (let col = 0; col < 40; col++) {
        for (let row = 0; row < 32; row++) {
          point(turn * col / 40, turn * row / 32);
          point(turn * col / 40, turn * (row + 1) / 32);
        }
      }
      const lattice = new THREE.BufferGeometry();
      lattice.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      lattice.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
      const lineMaterial = new THREE.LineBasicMaterial({ vertexColors: true });
      const latticeLines = new THREE.LineSegments(lattice, lineMaterial);
      const surface = new THREE.TorusGeometry(major, minor * 0.97, 32, 96);
      const depthMaterial = new THREE.MeshBasicMaterial({ colorWrite: false });
      const occluder = new THREE.Mesh(surface, depthMaterial);
      occluder.renderOrder = -1;
      ring.add(occluder, latticeLines);
      scene.add(ring);
      element.append(canvas);

      let frame = 0;
      let angle = 0;
      let previous = 0;
      let contextLost = false;
      const shouldAnimate = () => active && inView && !document.hidden && !preference.matches && !contextLost;
      function render() {
        ring.rotation.set(1.04 + 0.07 * Math.sin(angle), 0.16 * Math.sin(angle * 0.6), -0.26 + 0.06 * Math.cos(angle), "ZYX");
        latticeLines.rotation.z = angle;
        renderer.render(scene, camera);
      }
      function animate(time: number) {
        if (!shouldAnimate()) return;
        frame = requestAnimationFrame(animate);
        if (time - previous < 33) return;
        angle += Math.min(time - previous, 60) * 0.000065;
        previous = time;
        render();
      }
      update = () => {
        cancelAnimationFrame(frame);
        if (!shouldAnimate()) return;
        previous = performance.now();
        frame = requestAnimationFrame(animate);
      };
      const resize = () => {
        if (contextLost || !element) return;
        const width = element.clientWidth;
        const height = element.clientHeight;
        if (!width || !height) return;
        const aspect = width / height;
        camera.top = Math.max(1.10, 1.62 / aspect);
        camera.bottom = -camera.top;
        camera.right = camera.top * aspect;
        camera.left = -camera.right;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        render();
        element.dataset.rendered = "true";
      };
      const onLoss = () => {
        contextLost = true;
        delete element.dataset.rendered;
        update();
      };
      canvas.addEventListener("webglcontextlost", onLoss);
      const sizing = new ResizeObserver(resize);
      sizing.observe(element);
      resize();
      update();
      dispose = () => {
        sizing.disconnect();
        cancelAnimationFrame(frame);
        canvas.removeEventListener("webglcontextlost", onLoss);
        lattice.dispose();
        lineMaterial.dispose();
        surface.dispose();
        depthMaterial.dispose();
        renderer.dispose();
        canvas.remove();
        delete element.dataset.rendered;
      };
    }

    const sync = () => { void start().catch(() => {}); update(); };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      active = false;
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      dispose();
    };
  }, []);

  return (
    <div className="studio-orbit" ref={host} aria-hidden="true">
      <span className="studio-orbit__still"><i /><i /><i /><i /><i /></span>
    </div>
  );
}
