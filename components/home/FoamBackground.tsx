"use client"

import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import * as THREE from "three"
import { Environment } from "@react-three/drei"

function FoamMesh() {
    const meshRef = useRef<THREE.Mesh>(null)
    const { viewport, mouse } = useThree()

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uColorStart: { value: new THREE.Color("#ffffff") }, // White
            uColorEnd: { value: new THREE.Color("#e4e4e7") },   // Zinc-200
            uMouse: { value: new THREE.Vector2(0, 0) },
            uPixelRatio: { value: 1 }, // Will be set in useFrame or effect
        }),
        []
    )

    // Shader code
    const vertexShader = `
    varying vec2 vUv;
    varying float vDisplacement;
    
    uniform float uTime;
    uniform vec2 uMouse;

    // Simplex noise function
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                            -0.577350269189626, // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    void main() {
        vUv = uv;
        
        // Interactive displacement based on mouse
        float mouseDist = distance(uv, uMouse * 0.5 + 0.5);
        float mouseEffect = smoothstep(0.5, 0.0, mouseDist);
        
        // Organic flow
        float noise = snoise(uv * 3.0 + uTime * 0.2);
        
        vDisplacement = noise + mouseEffect * 0.5;
        
        vec3 pos = position;
        pos.z += vDisplacement * 0.5;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
    `

    const fragmentShader = `
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    
    varying vec2 vUv;
    varying float vDisplacement;

    void main() {
        vec3 color = mix(uColorStart, uColorEnd, vDisplacement * 0.5 + 0.5);
        gl_FragColor = vec4(color, 1.0);
    }
    `

    useFrame((state) => {
        if (!meshRef.current) return

        const { clock } = state

        // Update uniforms
        uniforms.uTime.value = clock.getElapsedTime()

        // Smooth mouse movement
        uniforms.uMouse.value.lerp(mouse, 0.1)
    })

    return (
        <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1, 128, 128]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    )
}

export function FoamBackground() {
    return (
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 2] }}>
                <ambientLight intensity={1} />
                <FoamMesh />
            </Canvas>
        </div>
    )
}
