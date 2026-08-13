"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type LocationGlobeProps = {
  active?: boolean;
  reducedMotion?: boolean;
};

const markerLatitude = -23.962;
const markerLongitude = -46.363;
const baseRotationY = -0.72;
const cameraHome = new THREE.Vector3(0, 0, 4.35);
const targetHome = new THREE.Vector3(0, 0, 0);

function latLonToVector3(latitude: number, longitude: number, radius: number) {
  const phi = THREE.MathUtils.degToRad(90 - latitude);
  const theta = THREE.MathUtils.degToRad(longitude + 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function Globe({ active = true, reducedMotion = false }: LocationGlobeProps) {
  const globeRef = useRef<THREE.Group | null>(null);
  const pulseRef = useRef<THREE.Mesh | null>(null);
  const [earthMap, earthNormalMap] = useLoader(THREE.TextureLoader, [
    "/earth-atmos-2048.jpg",
    "/earth-normal-2048.jpg"
  ]);

  const marker = useMemo(() => {
    const normal = latLonToVector3(markerLatitude, markerLongitude, 1).normalize();
    const stemPosition = normal.clone().multiplyScalar(1.49);
    const dotPosition = normal.clone().multiplyScalar(1.62);
    const stemQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    const ringQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

    return { dotPosition, normal, ringQuaternion, stemPosition, stemQuaternion };
  }, []);

  useEffect(() => {
    earthMap.colorSpace = THREE.SRGBColorSpace;
    earthMap.anisotropy = 8;
    earthNormalMap.anisotropy = 4;
    earthMap.needsUpdate = true;
    earthNormalMap.needsUpdate = true;
  }, [earthMap, earthNormalMap]);

  useFrame((state, delta) => {
    const globe = globeRef.current;

    if (!active || !globe) {
      return;
    }

    const damping = 1 - Math.exp(-delta * 3.6);
    const pointerX = reducedMotion ? 0 : state.pointer.x;
    const pointerY = reducedMotion ? 0 : state.pointer.y;
    const drift = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.22) * 0.035;

    globe.rotation.x = THREE.MathUtils.lerp(globe.rotation.x, -0.08 + pointerY * 0.06, damping);
    globe.rotation.y = THREE.MathUtils.lerp(globe.rotation.y, baseRotationY + pointerX * 0.08 + drift, damping);

    if (pulseRef.current && !reducedMotion) {
      const pulse = 1 + (Math.sin(state.clock.elapsedTime * 2.8) + 1) * 0.16;
      pulseRef.current.scale.setScalar(pulse);
      const material = pulseRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.4 - (pulse - 1) * 0.7;
    }
  });

  return (
    <group ref={globeRef} rotation={[-0.08, baseRotationY, -0.025]}>
      <mesh>
        <sphereGeometry args={[1.34, 64, 64]} />
        <meshPhongMaterial
          map={earthMap}
          normalMap={earthNormalMap}
          normalScale={new THREE.Vector2(0.32, 0.32)}
          color="#d5dad7"
          specular="#b9d9cf"
          shininess={12}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.365, 28, 18]} />
        <meshBasicMaterial color="#d5dedb" wireframe transparent opacity={0.1} />
      </mesh>

      <mesh scale={1.045}>
        <sphereGeometry args={[1.34, 48, 48]} />
        <meshBasicMaterial color="#6ee7b7" transparent opacity={0.035} side={THREE.BackSide} />
      </mesh>

      <mesh position={marker.stemPosition} quaternion={marker.stemQuaternion}>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 10]} />
        <meshBasicMaterial color="#ff6b5f" />
      </mesh>

      <mesh position={marker.dotPosition}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshBasicMaterial color="#ff6b5f" toneMapped={false} />
      </mesh>

      <mesh ref={pulseRef} position={marker.normal.clone().multiplyScalar(1.38)} quaternion={marker.ringQuaternion}>
        <ringGeometry args={[0.07, 0.095, 32]} />
        <meshBasicMaterial color="#ff6b5f" transparent opacity={0.32} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function GlobeFallback() {
  return (
    <mesh>
      <sphereGeometry args={[1.34, 40, 40]} />
      <meshPhysicalMaterial color="#263233" metalness={0.45} roughness={0.6} />
    </mesh>
  );
}

function GlobeControls({ active = true }: LocationGlobeProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const returnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const returningRef = useRef(false);
  const { camera, invalidate } = useThree();

  useEffect(() => {
    return () => {
      if (returnTimerRef.current) {
        clearTimeout(returnTimerRef.current);
      }
    };
  }, []);

  useFrame((_, delta) => {
    const controls = controlsRef.current;

    if (!active || !controls || !returningRef.current) {
      return;
    }

    const damping = 1 - Math.exp(-delta * 4.8);
    camera.position.lerp(cameraHome, damping);
    controls.target.lerp(targetHome, damping);
    controls.update();

    if (camera.position.distanceToSquared(cameraHome) < 0.000004) {
      camera.position.copy(cameraHome);
      controls.target.copy(targetHome);
      controls.update();
      returningRef.current = false;
      return;
    }

    invalidate();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={active}
      enableDamping
      dampingFactor={0.085}
      enablePan={false}
      enableZoom={false}
      rotateSpeed={0.58}
      minPolarAngle={0.35}
      maxPolarAngle={Math.PI - 0.35}
      onStart={() => {
        returningRef.current = false;

        if (returnTimerRef.current) {
          clearTimeout(returnTimerRef.current);
          returnTimerRef.current = null;
        }
      }}
      onEnd={() => {
        returnTimerRef.current = setTimeout(() => {
          returningRef.current = true;
          invalidate();
        }, 700);
      }}
    />
  );
}

export function LocationGlobe({ active = true, reducedMotion = false }: LocationGlobeProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.35], fov: 38, near: 0.1, far: 20 }}
      dpr={[1, 1.5]}
      frameloop={active && !reducedMotion ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className={reducedMotion ? undefined : "cursor-grab active:cursor-grabbing"}
      style={{ touchAction: reducedMotion ? "auto" : "none" }}
    >
      <ambientLight intensity={0.68} />
      <hemisphereLight args={["#f1f3f0", "#080a0c", 1.05]} />
      <spotLight position={[-3, 4, 5]} color="#f1f3f0" intensity={9} angle={0.55} penumbra={0.9} />
      <pointLight position={[3, -2, 4]} color="#6ee7b7" intensity={1.4} />
      <Suspense fallback={<GlobeFallback />}>
        <Globe active={active} reducedMotion={reducedMotion} />
      </Suspense>
      {reducedMotion ? null : <GlobeControls active={active} />}
    </Canvas>
  );
}
