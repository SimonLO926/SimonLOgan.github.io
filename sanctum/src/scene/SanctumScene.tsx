import { Environment, Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Component, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import type { Preview } from '../data/doors'
import { sceneBus } from './store'

const LACQUER = {
  color: '#16110e',
  metalness: 0.62,
  roughness: 0.24,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1.25,
  sheen: 0.35,
  sheenColor: '#7a4630',
} as const

const GOLD = {
  color: '#e4c48a',
  metalness: 1,
  roughness: 0.2,
  envMapIntensity: 1.5,
} as const

const STICK_LAYOUT = (() => {
  const rings = [
    { count: 7, radius: 0.1 },
    { count: 12, radius: 0.28 },
    { count: 15, radius: 0.46 },
  ]
  const colors = ['#6d4a32', '#5a3d2b', '#7b5640', '#4a3326']
  const out: { x: number; z: number; h: number; color: string }[] = []
  for (const ring of rings) {
    for (let i = 0; i < ring.count; i += 1) {
      const angle = (i / ring.count) * Math.PI * 2 + out.length * 0.17
      out.push({
        x: Math.cos(angle) * ring.radius,
        z: Math.sin(angle) * ring.radius,
        h: 1.08 + ((i * 5 + ring.count) % 6) * 0.035,
        color: colors[(i + ring.count) % colors.length],
      })
    }
  }
  return out
})()

const ringVert = `
  varying vec3 vPos;
  varying vec3 vNormal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vPos = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const ringFrag = `
  varying vec3 vPos;
  varying vec3 vNormal;
  uniform float uTime;
  uniform vec3 uColor;
  void main() {
    vec3 n = normalize(vNormal);
    float fres = pow(1.0 - abs(dot(normalize(n), vec3(0.0, 0.15, 1.0))), 1.7);
    float sweep = pow(max(sin(vPos.x * 1.7 + vPos.y * 0.8 + uTime * 0.65), 0.0), 14.0);
    vec3 col = uColor * (0.18 + fres * 0.95 + sweep * 1.35);
    gl_FragColor = vec4(col, 1.0);
  }
`

function GoldRing({ radius, tilt, speed }: { radius: number; tilt: number; speed: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color('#f0d7a4') } }), [])
  useFrame((_, dt) => {
    uniforms.uTime.value += dt
    if (ref.current) ref.current.rotation.z += dt * speed
  })
  return (
    <mesh ref={ref} rotation={[tilt, 0.2, 0]}>
      <torusGeometry args={[radius, 0.008, 24, 220]} />
      <shaderMaterial uniforms={uniforms} vertexShader={ringVert} fragmentShader={ringFrag} />
    </mesh>
  )
}

function StickTube({ hero }: { hero: boolean }) {
  const rig = useRef<THREE.Group>(null)
  const sticks = useRef<(THREE.Group | null)[]>([])
  const energy = useRef(0)
  const wasShaking = useRef(false)
  const heroRef = useRef(hero)
  heroRef.current = hero

  useLayoutEffect(() => {
    sticks.current.forEach((stick, index) => {
      const layout = STICK_LAYOUT[index]
      stick?.position.set(layout.x, 0, layout.z)
    })
  }, [])

  useFrame((state, dt) => {
    if (sceneBus.shaking && !wasShaking.current) energy.current = 1
    wasShaking.current = sceneBus.shaking
    energy.current *= Math.exp(-dt * 1.45)
    const t = state.clock.elapsedTime
    if (rig.current) {
      rig.current.rotation.z = Math.sin(t * 46) * 0.09 * energy.current
      rig.current.rotation.x = Math.cos(t * 38) * 0.05 * energy.current
      rig.current.position.y = Math.abs(Math.sin(t * 52)) * 0.05 * energy.current
    }
    sticks.current.forEach((stick, index) => {
      if (!stick) return
      const layout = STICK_LAYOUT[index]
      const raised = !heroRef.current && index === sceneBus.raised
      const proud = heroRef.current && index === 4 ? 0.28 : 0
      const target = layout.h * 0.08 + (raised ? 0.72 : 0) + proud
      stick.position.y = THREE.MathUtils.damp(stick.position.y, target, 3.4, dt)
    })
  })

  return (
    <group ref={rig}>
      <mesh>
        <cylinderGeometry args={[0.8, 0.86, 1.52, 48, 1, true]} />
        <meshPhysicalMaterial {...LACQUER} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.82, 0.016, 16, 90]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position={[0, -0.74, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.84, 0.02, 12, 64]} />
        <meshStandardMaterial color="#3a2a1e" metalness={0.4} roughness={0.45} />
      </mesh>
      {STICK_LAYOUT.map((layout, index) => (
        <group key={index} ref={(node) => { sticks.current[index] = node }}>
          <mesh position={[0, layout.h / 2, 0]}>
            <cylinderGeometry args={[0.018, 0.015, layout.h, 6]} />
            <meshStandardMaterial color={layout.color} roughness={0.72} metalness={0.04} />
          </mesh>
          <mesh position={[0, layout.h + 0.02, 0]}>
            <sphereGeometry args={[0.02, 10, 10]} />
            <meshStandardMaterial color={index % 7 === 0 ? '#e6c98a' : '#2a2118'} metalness={index % 7 === 0 ? 1 : 0.2} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Torii() {
  const paper = useRef<THREE.Group>(null)
  useFrame((state, dt) => {
    if (!paper.current) return
    const open = sceneBus.lidOpen ? 1 : 0.96
    paper.current.scale.y = THREE.MathUtils.damp(paper.current.scale.y, open, 3, dt)
    paper.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7) * 0.015
  })
  const red = { color: '#b42318', roughness: 0.46, metalness: 0.08 }
  return (
    <group scale={0.92} position={[0, -0.2, 0]}>
      <mesh position={[-0.62, 0.05, 0]}><cylinderGeometry args={[0.07, 0.09, 1.55, 16]} /><meshStandardMaterial {...red} /></mesh>
      <mesh position={[0.62, 0.05, 0]}><cylinderGeometry args={[0.07, 0.09, 1.55, 16]} /><meshStandardMaterial {...red} /></mesh>
      <mesh position={[-0.62, -0.78, 0]}><cylinderGeometry args={[0.16, 0.18, 0.08, 16]} /><meshStandardMaterial color="#2a241e" roughness={0.8} /></mesh>
      <mesh position={[0.62, -0.78, 0]}><cylinderGeometry args={[0.16, 0.18, 0.08, 16]} /><meshStandardMaterial color="#2a241e" roughness={0.8} /></mesh>
      <mesh position={[0, 0.72, 0]}><boxGeometry args={[1.55, 0.08, 0.1]} /><meshStandardMaterial color="#1a120e" roughness={0.55} /></mesh>
      <mesh position={[0, 0.86, 0]}><boxGeometry args={[1.72, 0.1, 0.16]} /><meshStandardMaterial {...red} /></mesh>
      <mesh position={[0, 1.02, 0]} rotation={[0, 0, 0]}><boxGeometry args={[1.95, 0.12, 0.22]} /><meshStandardMaterial color="#9d1f16" roughness={0.42} /></mesh>
      <group ref={paper} position={[0, 0.05, 0.16]}>
        <mesh position={[0, 0, -0.008]}>
          <planeGeometry args={[0.4, 0.86]} />
          <meshStandardMaterial color="#8c1f1a" roughness={0.6} />
        </mesh>
        <mesh>
          <planeGeometry args={[0.34, 0.78]} />
          <meshStandardMaterial color="#f6f0e4" roughness={0.82} />
        </mesh>
      </group>
    </group>
  )
}

function CardFan() {
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.12
  })
  return (
    <group ref={group}>
      {[-0.55, 0, 0.55].map((rot, index) => (
        <mesh key={rot} position={[(index - 1) * 0.42, (index === 1 ? 0.08 : 0), index === 1 ? 0.2 : 0]} rotation={[0.08, rot * 0.45, rot * 0.08]}>
          <boxGeometry args={[0.72, 1.12, 0.025]} />
          <meshPhysicalMaterial color={index === 1 ? '#1a1614' : '#120f0d'} metalness={0.7} roughness={0.22} clearcoat={1} clearcoatRoughness={0.08} sheen={0.8} sheenColor="#d9d4ea" />
        </mesh>
      ))}
    </group>
  )
}

function Armillary() {
  const group = useRef<THREE.Group>(null)
  const sun = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.08
    if (sun.current) {
      const a = (sceneBus.sun * Math.PI) / 180
      sun.current.position.set(Math.cos(a) * 1.16, Math.sin(a * 0.15) * 0.08, Math.sin(a) * 1.16)
    }
  })
  return (
    <group ref={group} rotation={[0.35, 0, 0.2]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.16, 0.012, 16, 120]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh rotation={[1.15, 0.4, 0.2]}>
        <torusGeometry args={[1.16, 0.007, 12, 100]} />
        <meshStandardMaterial color="#f4efe6" metalness={0.85} roughness={0.22} />
      </mesh>
      <mesh rotation={[0.2, 0.5, Math.PI / 2]}>
        <torusGeometry args={[1.16, 0.007, 12, 100]} />
        <meshStandardMaterial color="#9aafc4" metalness={0.8} roughness={0.28} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshStandardMaterial color="#d7c4a2" metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh ref={sun}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#ffe0b0" />
      </mesh>
    </group>
  )
}

function Luopan() {
  const needle = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!needle.current) return
    needle.current.rotation.y = THREE.MathUtils.damp(needle.current.rotation.y, sceneBus.needle, 2.2, dt)
  })
  return (
    <group rotation={[0.55, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[1.28, 1.28, 0.08, 72]} />
        <meshPhysicalMaterial color="#17201b" metalness={0.48} roughness={0.32} clearcoat={0.9} clearcoatRoughness={0.15} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.02, 64]} />
        <meshStandardMaterial color="#0e1411" metalness={0.7} roughness={0.3} />
      </mesh>
      <group ref={needle}>
        <mesh position={[0, 0.09, 0.36]}>
          <boxGeometry args={[0.018, 0.012, 0.72]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
        <mesh position={[0, 0.1, 0.7]}>
          <sphereGeometry args={[0.03, 12, 12]} />
          <meshBasicMaterial color="#f3ead7" />
        </mesh>
      </group>
    </group>
  )
}

function Steles() {
  return (
    <group>
      {[-0.96, -0.32, 0.32, 0.96].map((x, index) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, -0.04 * index, 0]}>
            <boxGeometry args={[0.34, 1.72 - index * 0.04, 0.1]} />
            <meshPhysicalMaterial {...LACQUER} />
          </mesh>
          <mesh position={[0, 0.15, 0.055]}>
            <boxGeometry args={[0.012, 1.15, 0.008]} />
            <meshStandardMaterial {...GOLD} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function PalaceRing() {
  const group = useRef<THREE.Group>(null)
  const mats = useRef<(THREE.MeshPhysicalMaterial | null)[]>([])
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.06
    mats.current.forEach((material, index) => {
      if (!material) return
      const lit = index === ((sceneBus.life % 12) + 12) % 12
      material.emissive.set(lit ? '#6a4a22' : '#000000')
      material.emissiveIntensity = lit ? 0.45 : 0
    })
  })
  return (
    <group ref={group}>
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 1.28, Math.sin(angle) * 0.12, Math.sin(angle) * 1.28]} rotation={[0, -angle + Math.PI / 2, 0]}>
            <boxGeometry args={[0.36, 0.52, 0.035]} />
            <meshPhysicalMaterial ref={(node) => { mats.current[index] = node }} color="#14110f" metalness={0.55} roughness={0.28} clearcoat={1} />
          </mesh>
        )
      })}
    </group>
  )
}

function Smoke() {
  const ref = useRef<THREE.Points>(null)
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const count = 70
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 0.18
      positions[i * 3 + 1] = Math.random() * 1.6
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.18
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [])
  useFrame((_, dt) => {
    const attr = ref.current?.geometry.getAttribute('position') as THREE.BufferAttribute | undefined
    if (!attr) return
    for (let i = 0; i < attr.count; i += 1) {
      let y = attr.getY(i) + dt * 0.16
      if (y > 1.7) y = 0
      attr.setY(i, y)
      attr.setX(i, attr.getX(i) + Math.sin(y * 4 + i) * dt * 0.02)
    }
    attr.needsUpdate = true
  })
  return (
    <points ref={ref} position={[0.2, 0.2, 0.15]} geometry={geom}>
      <pointsMaterial color="#efe2d2" size={0.028} transparent opacity={0.32} depthWrite={false} />
    </points>
  )
}

function Shaft() {
  const map = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, 'rgba(255,220,170,0)')
    gradient.addColorStop(0.4, 'rgba(255,210,150,0.22)')
    gradient.addColorStop(1, 'rgba(255,210,150,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 256)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
  if (!map) return null
  return (
    <mesh position={[0.35, 1.5, -0.6]} rotation={[0.08, 0, 0.12]}>
      <planeGeometry args={[1.6, 4.4]} />
      <meshBasicMaterial map={map} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

const ACCENT: Record<string, string> = {
  hall: '#ffb15e',
  sticks: '#ffb15e',
  omikuji: '#ff7a62',
  oracle: '#d5d0ea',
  zodiac: '#fff4df',
  fengshui: '#b7d0b0',
  bazi: '#ffb15e',
  ziwei: '#d7b4ee',
}

function World({ artifact, still, mobile }: { artifact: string; still: boolean; mobile: boolean }) {
  const rig = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const desired = useRef(new THREE.Vector3())
  const look = useRef(new THREE.Vector3())

  useLayoutEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((state, dt) => {
    const px = still ? 0 : pointer.current.x
    const py = still ? 0 : pointer.current.y
    desired.current.set(mobile ? 0 : 0.15, 0.32, mobile ? 8.3 : 6.15)
    look.current.set(mobile ? 0 : 0.15, 0.05, 0)
    const blend = 1 - Math.exp(-dt * 2.4)
    state.camera.position.lerp(desired.current, blend)
    state.camera.lookAt(look.current)
    if (rig.current) {
      const bob = still ? 0 : Math.sin(state.clock.elapsedTime * 0.55) * 0.035
      rig.current.position.x = (mobile ? 0 : 1.05) + px * 0.12
      rig.current.position.y = -0.08 + bob + py * -0.06
      rig.current.rotation.y = (still ? 0.4 : state.clock.elapsedTime * 0.08) + px * 0.18
      rig.current.rotation.x = py * 0.04
    }
  })

  return (
    <>
      <color attach="background" args={['#080705']} />
      <fog attach="fog" args={['#080705', 8.5, 16]} />
      <hemisphereLight args={['#f3e0c8', '#1a120e', 0.42]} />
      <directionalLight position={[3.4, 4.6, 2.6]} intensity={2.6} color="#fff3df" />
      <directionalLight position={[-4.2, 1.2, -2]} intensity={1.15} color="#93a8c4" />
      <pointLight position={[1.4, 0.3, 1.6]} intensity={8} distance={7} color={ACCENT[artifact] ?? '#ffb15e'} />
      <Environment frames={1} resolution={128}>
        <mesh scale={12}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#140f0c" side={THREE.BackSide} />
        </mesh>
        <mesh position={[3.2, 2.4, -1]}>
          <sphereGeometry args={[1.1, 16, 16]} />
          <meshBasicMaterial color="#ffb56a" />
        </mesh>
        <mesh position={[-3.5, 0.4, -2]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial color="#7f96b4" />
        </mesh>
      </Environment>
      <group ref={rig}>
        <Shaft />
        <GoldRing radius={1.72} tilt={1.15} speed={0.05} />
        <GoldRing radius={2.05} tilt={1.42} speed={-0.035} />
        {(artifact === 'hall' || artifact === 'sticks') && <StickTube hero={artifact === 'hall'} />}
        {artifact === 'omikuji' && <Torii />}
        {artifact === 'oracle' && <CardFan />}
        {artifact === 'zodiac' && <Armillary />}
        {artifact === 'fengshui' && <Luopan />}
        {artifact === 'bazi' && <Steles />}
        {artifact === 'ziwei' && <PalaceRing />}
        {(artifact === 'hall' || artifact === 'sticks') && <Smoke />}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.22, 0]}>
          <circleGeometry args={[3.4, 72]} />
          <meshStandardMaterial color="#0c0a08" metalness={0.82} roughness={0.32} />
        </mesh>
        <Sparkles count={mobile ? 18 : 36} scale={[4.2, 2.6, 3]} size={1.4} speed={0.25} color="#e6c98a" opacity={0.45} />
      </group>
    </>
  )
}

function CssSanctum() {
  return (
    <div className="css-sanctum" aria-hidden="true">
      <i className="css-ring" />
      <i className="css-ring inner" />
      <i className="css-core" />
    </div>
  )
}

class Boundary extends Component<{ children: ReactNode }, { bad: boolean }> {
  state = { bad: false }
  static getDerivedStateFromError() {
    return { bad: true }
  }
  render() {
    return this.state.bad ? <CssSanctum /> : this.props.children
  }
}

export function SanctumScene({
  artifact,
  still,
  mobile,
}: {
  artifact: Preview
  still: boolean
  mobile: boolean
}) {
  const webgl = useMemo(() => {
    try {
      const canvas = document.createElement('canvas')
      return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch {
      return false
    }
  }, [])

  if (!webgl) return <CssSanctum />

  return (
    <Boundary>
      <Canvas
        camera={{ position: [0.15, 0.32, 6.15], fov: 28 }}
        dpr={[1, mobile ? 1.25 : 1.6]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.08
          gl.setClearColor('#080705')
        }}
      >
        <World artifact={artifact} still={still} mobile={mobile} />
      </Canvas>
    </Boundary>
  )
}
