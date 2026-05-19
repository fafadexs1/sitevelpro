"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type NodeData = {
  base: THREE.Vector3;
  phase: number;
};

export function HeroNetworkScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(0, 0.2, 9);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const nodes: NodeData[] = [];
    const nodeCount = 72;
    const linePairs: Array<[number, number]> = [];
    const positions = new Float32Array(nodeCount * 3);

    for (let i = 0; i < nodeCount; i += 1) {
      const layer = i % 3;
      const angle = (i / nodeCount) * Math.PI * 2 * 2.2;
      const radius = 1.7 + layer * 1.1 + Math.sin(i * 1.9) * 0.35;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.8;
      const y = Math.sin(angle * 0.8) * 1.35 + (Math.random() - 0.5) * 1.25;
      const z = -1.5 + layer * 1.25 + (Math.random() - 0.5) * 0.9;

      nodes.push({
        base: new THREE.Vector3(x, y, z),
        phase: Math.random() * Math.PI * 2,
      });

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    for (let i = 0; i < nodeCount; i += 1) {
      linePairs.push([i, (i + 1) % nodeCount]);
      if (i % 2 === 0) {
        linePairs.push([i, (i + 9) % nodeCount]);
      }
      if (i % 5 === 0) {
        linePairs.push([i, (i + 19) % nodeCount]);
      }
    }

    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x03bf03,
      size: 0.055,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });

    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);

    const linePositions = new Float32Array(linePairs.length * 2 * 3);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x54d7ff,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    const pulseGeometry = new THREE.SphereGeometry(0.055, 18, 18);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.95,
    });
    const pulses = Array.from({ length: 5 }, () => {
      const mesh = new THREE.Mesh(pulseGeometry, pulseMaterial.clone());
      scene.add(mesh);
      return mesh;
    });

    const group = new THREE.Group();
    group.add(points);
    group.add(lines);
    pulses.forEach((pulse) => group.add(pulse));
    scene.add(group);

    const mouse = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.55;
      mouse.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.35;
    };

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);

    let frameId = 0;
    const timer = new THREE.Timer();
    timer.connect(document);

    const animate = (timestamp?: number) => {
      timer.update(timestamp);
      const elapsed = timer.getElapsed();
      const pointAttribute = pointsGeometry.getAttribute("position") as THREE.BufferAttribute;
      const lineAttribute = lineGeometry.getAttribute("position") as THREE.BufferAttribute;

      nodes.forEach((node, index) => {
        const drift = Math.sin(elapsed * 0.7 + node.phase) * 0.08;
        const x = node.base.x + Math.sin(elapsed * 0.42 + node.phase) * 0.1;
        const y = node.base.y + drift;
        const z = node.base.z + Math.cos(elapsed * 0.35 + node.phase) * 0.08;

        pointAttribute.setXYZ(index, x, y, z);
      });

      linePairs.forEach(([a, b], index) => {
        const aOffset = a * 3;
        const bOffset = b * 3;
        const lineOffset = index * 6;

        lineAttribute.array[lineOffset] = pointAttribute.array[aOffset];
        lineAttribute.array[lineOffset + 1] = pointAttribute.array[aOffset + 1];
        lineAttribute.array[lineOffset + 2] = pointAttribute.array[aOffset + 2];
        lineAttribute.array[lineOffset + 3] = pointAttribute.array[bOffset];
        lineAttribute.array[lineOffset + 4] = pointAttribute.array[bOffset + 1];
        lineAttribute.array[lineOffset + 5] = pointAttribute.array[bOffset + 2];
      });

      pulses.forEach((pulse, index) => {
        const path = linePairs[(Math.floor(elapsed * 9 + index * 13) % linePairs.length)];
        const progress = (elapsed * (0.18 + index * 0.015) + index * 0.19) % 1;
        const from = path[0] * 3;
        const to = path[1] * 3;

        pulse.position.set(
          THREE.MathUtils.lerp(pointAttribute.array[from], pointAttribute.array[to], progress),
          THREE.MathUtils.lerp(pointAttribute.array[from + 1], pointAttribute.array[to + 1], progress),
          THREE.MathUtils.lerp(pointAttribute.array[from + 2], pointAttribute.array[to + 2], progress)
        );

        const material = pulse.material as THREE.MeshBasicMaterial;
        material.opacity = 0.45 + Math.sin(elapsed * 3 + index) * 0.25;
      });

      pointAttribute.needsUpdate = true;
      lineAttribute.needsUpdate = true;

      group.rotation.y = elapsed * 0.055 + mouse.x;
      group.rotation.x = -0.08 + mouse.y;
      group.position.x = 1.35;
      group.position.y = -0.1;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      mount.removeChild(renderer.domElement);
      timer.dispose();
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      pulseGeometry.dispose();
      pulses.forEach((pulse) => (pulse.material as THREE.Material).dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      data-three-scene="hero-network"
    />
  );
}
