'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { MOLECULES } from '@/data/ChemistryDatabase';
import type { MoleculeDefinition } from '@/types';

// ─── Atom Sphere ───────────────────────────────────────
function AtomSphere({ x, y, z, color, radius, element, mode }: {
  x: number; y: number; z: number; color: string;
  radius: number; element: string; mode: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += delta * 2;
    }
  });

  const r = mode === 'space-fill' ? radius * 1.5 : mode === 'wireframe' ? radius * 0.6 : radius;

  return (
    <group position={[x, y, z]}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[r, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
          wireframe={mode === 'wireframe'}
          emissive={hovered ? color : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>
      {hovered && (
        <Text position={[0, r + 0.3, 0]} fontSize={0.25} color="white" anchorX="center">
          {element}
        </Text>
      )}
    </group>
  );
}

// ─── Bond Cylinder ─────────────────────────────────────
function BondCylinder({ start, end, order }: {
  start: [number, number, number];
  end:   [number, number, number];
  order: number;
}) {
  const mid = start.map((v, i) => (v + end[i]) / 2) as [number, number, number];
  const dir = new THREE.Vector3(...end).sub(new THREE.Vector3(...start));
  const len = dir.length();
  const quat = new THREE.Quaternion();
  quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());

  const color = order === 2 ? '#4ADE80' : order === 3 ? '#F472B6' : order === 1.5 ? '#FBBF24' : '#94A3B8';

  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.08, 0.08, len, 16]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  );
}

// ─── Molecule Scene ────────────────────────────────────
function MoleculeScene({ molecule, mode }: { molecule: MoleculeDefinition; mode: string }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 8);
  }, [molecule.id]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <pointLight position={[-5, -5, -5]} intensity={0.4} color="#60A5FA" />
      <OrbitControls enablePan enableZoom enableRotate dampingFactor={0.05} enableDamping />

      <group>
        {/* Atoms */}
        {molecule.atoms.map(atom => (
          <AtomSphere
            key={atom.id}
            x={atom.x} y={atom.y} z={atom.z}
            color={atom.cpkColor}
            radius={atom.radius}
            element={atom.element}
            mode={mode}
          />
        ))}

        {/* Bonds */}
        {mode !== 'space-fill' && molecule.bonds.map((bond, i) => {
          const a1 = molecule.atoms[bond.atom1];
          const a2 = molecule.atoms[bond.atom2];
          return (
            <BondCylinder
              key={i}
              start={[a1.x, a1.y, a1.z]}
              end={[a2.x, a2.y, a2.z]}
              order={bond.order}
            />
          );
        })}
      </group>
    </>
  );
}

// ─── Main Component ────────────────────────────────────
export default function MoleculeViewer() {
  const [selected, setSelected]   = useState(MOLECULES[0]);
  const [mode, setMode]           = useState<'ball-stick' | 'space-fill' | 'wireframe'>('ball-stick');

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-0" style={{ minHeight: '500px' }}>

      {/* ── Molecule List ── */}
      <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r overflow-y-auto flex-shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="p-4">
          <h2 className="font-bold mb-3 text-sm uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Molecules
          </h2>
          <div className="flex flex-wrap lg:flex-col gap-2">
            {MOLECULES.map(mol => (
              <button
                key={mol.id}
                onClick={() => setSelected(mol)}
                className="lg:w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                style={{
                  background: selected.id === mol.id ? 'var(--accent)' : 'var(--surface)',
                  color:      selected.id === mol.id ? 'white' : 'var(--text-primary)',
                  border:     `1px solid ${selected.id === mol.id ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                <span className="font-mono text-xs">{mol.formula}</span>
                <span className="truncate">{mol.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3D Canvas ── */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top controls */}
        <div className="flex items-center gap-3 px-4 py-2 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <h3 className="font-bold flex-1">{selected.name} — <span style={{ color: 'var(--accent)' }}>{selected.formula}</span></h3>
          {(['ball-stick', 'space-fill', 'wireframe'] as const).map(m => (
            <button key={m}
              onClick={() => setMode(m)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize"
              style={{
                background: mode === m ? 'var(--accent)' : 'var(--bg-tertiary)',
                color:      mode === m ? 'white' : 'var(--text-secondary)',
              }}>
              {m.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 sim-canvas" style={{ minHeight: '300px' }}>
          <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
            <Suspense fallback={null}>
              <MoleculeScene molecule={selected} mode={mode} />
            </Suspense>
          </Canvas>
        </div>

        {/* Info panel */}
        <div className="p-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-4 flex-shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <div>
            <div className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Geometry</div>
            <div className="text-sm font-bold">{selected.geometry}</div>
          </div>
          <div>
            <div className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Bond Angle</div>
            <div className="text-sm font-bold">{selected.bondAngle}</div>
          </div>
          <div>
            <div className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Dipole Moment</div>
            <div className="text-sm font-bold">{selected.dipole}</div>
          </div>
          <div>
            <div className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Atoms</div>
            <div className="text-sm font-bold">{selected.atoms.length}</div>
          </div>
          <div className="col-span-2 sm:col-span-4">
            <div className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>Description</div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{selected.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
