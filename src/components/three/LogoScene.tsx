"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

type LogoSceneProps = {
  active?: boolean;
  scrollProgress: MutableRefObject<number>;
};

function LogoObject({ scrollProgress }: LogoSceneProps) {
  const logo = useLoader(SVGLoader, "/logo.svg");
  const objectRef = useRef<THREE.Group | null>(null);

  const geometries = useMemo(() => {
    return logo.paths.flatMap((path) =>
      path.toShapes().map((shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 18,
          bevelEnabled: true,
          bevelSegments: 5,
          bevelSize: 3.5,
          bevelThickness: 3.5,
          curveSegments: 20
        });

        geometry.translate(-162.5, -161.725, -9);
        geometry.computeVertexNormals();
        return geometry;
      })
    );
  }, [logo]);

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: "#c8d0d2",
    metalness: 0.92,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    emissive: "#111719",
    emissiveIntensity: 0.18,
    side: THREE.FrontSide
  }), []);

  useEffect(() => {
    return () => {
      geometries.forEach((geometry) => geometry.dispose());
      material.dispose();
    };
  }, [geometries, material]);

  useFrame((state, delta) => {
    const object = objectRef.current;

    if (!object) {
      return;
    }

    const progress = scrollProgress.current;
    const isMobile = state.size.width < 768;
    const settle = Math.min(1, state.clock.elapsedTime / 1.25);
    const easedSettle = 1 - Math.pow(1 - settle, 3);
    const damping = 1 - Math.exp(-delta * 4.5);
    const pointerX = isMobile ? 0 : state.pointer.x;
    const pointerY = isMobile ? 0 : state.pointer.y;
    const targetX = isMobile ? 0.16 : 1.25;
    const targetY = isMobile ? 1.05 : 0.15;
    const baseScale = isMobile ? 0.38 : 0.72;

    object.position.x = THREE.MathUtils.lerp(object.position.x, targetX + pointerX * 0.12, damping);
    object.position.y = THREE.MathUtils.lerp(object.position.y, targetY + pointerY * 0.08 - progress * 0.35, damping);
    object.rotation.x = THREE.MathUtils.lerp(object.rotation.x, -0.12 - pointerY * 0.12 + progress * 0.28, damping);
    object.rotation.y = THREE.MathUtils.lerp(object.rotation.y, 0.32 + pointerX * 0.22 + progress * 0.5, damping);
    object.rotation.z = THREE.MathUtils.lerp(object.rotation.z, -0.06 + progress * 0.12, damping);

    const scale = baseScale * (0.7 + easedSettle * 0.3) * (1 - progress * 0.12);
    object.scale.setScalar(scale);
  });

  return (
    <group ref={objectRef} scale={0.7}>
      <group scale={[0.0115, -0.0115, 0.0115]}>
        {geometries.map((geometry, geometryIndex) => (
          <mesh key={geometryIndex} geometry={geometry} material={material} castShadow receiveShadow />
        ))}
      </group>
    </group>
  );
}

export function LogoScene({ active = true, scrollProgress }: LogoSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.6], fov: 38, near: 0.1, far: 40 }}
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.38} />
      <hemisphereLight args={["#F1F3F0", "#080A0C", 0.72]} />
      <spotLight position={[-4, 5, 6]} color="#ffffff" intensity={82} angle={0.42} penumbra={0.72} />
      <spotLight position={[4, 1, 5]} color="#6EE7B7" intensity={34} angle={0.52} penumbra={0.9} />
      <pointLight position={[-3, -3, 4]} color="#FF6B5F" intensity={22} />
      <directionalLight position={[2, 3, 5]} color="#dce4e6" intensity={1.8} />
      <Suspense fallback={null}>
        <LogoObject scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
}
