'use client';

import React, { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Float, 
  MeshWobbleMaterial, 
  Text,
  Html,
  ContactShadows,
  PresentationControls,
  Stage,
  Environment,
  Bounds
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Rotate3d, Box, Ticket, Radio, Trophy, MousePointer2, Star } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════ */
/*  DATA                                                              */
/* ═══════════════════════════════════════════════════════════════════ */

interface Artifact {
  id: number;
  name: string;
  year: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  position: [number, number, number];
}

const artifacts: Artifact[] = [
  {
    id: 0,
    name: "Xe tăng 390",
    year: "1975",
    description: "Chiếc xe tăng húc đổ cổng chính Dinh Độc Lập vào trưa ngày 30/4/1975, đánh dấu thời khắc non sông thu về một mối. Đây là biểu tượng của sức mạnh đại đoàn kết toàn dân tộc.",
    icon: <Box size={24} />,
    color: "#4A5D4E",
    position: [-4, 0, 0]
  },
  {
    id: 1,
    name: "Tem phiếu mua lương thực",
    year: "1976 - 1986",
    description: "Vật bất ly thân của người dân thời bao cấp, dùng để mua các nhu yếu phẩm cơ bản như gạo, thịt, vải. Nó phản ánh một giai đoạn lịch sử đầy khó khăn nhưng cũng rất kiên cường.",
    icon: <Ticket size={24} />,
    color: "#B45309",
    position: [-1.3, 0, 0]
  },
  {
    id: 2,
    name: "Đài Cassette cổ",
    year: "Thập niên 80",
    description: "Cửa sổ nhìn ra thế giới và nguồn thông tin chính yếu của các gia đình Việt Nam trong thời kỳ khó khăn. Đài cassette thường được coi là báu vật trong nhà.",
    icon: <Radio size={24} />,
    color: "#475569",
    position: [1.3, 0, 0]
  },
  {
    id: 3,
    name: "Huân chương Chiến công",
    year: "1979",
    description: "Biểu tượng cho lòng dũng cảm của các chiến sĩ trong cuộc chiến đấu bảo vệ biên giới phía Bắc và Tây Nam. Vinh danh những người đã ngã xuống vì độc lập dân tộc.",
    icon: <Trophy size={24} />,
    color: "#DA251D",
    position: [4, 0, 0]
  }
];

/* ═══════════════════════════════════════════════════════════════════ */
/*  CUSTOM 3D MODELS                                                  */
/* ═══════════════════════════════════════════════════════════════════ */

function TankModel({ color }: { color: string }) {
  return (
    <group scale={0.4}>
      {/* --- CHASSIS & HULL --- */}
      {/* Lower Hull */}
      <mesh position={[0, -0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.4, 4.6]} />
        <meshStandardMaterial color="#1f2620" metalness={0.4} roughness={0.8} />
      </mesh>

      {/* Fenders/Mudguards left & right */}
      <mesh position={[-1.1, 0.05, 0]} castShadow>
        <boxGeometry args={[0.2, 0.05, 4.8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.6} />
      </mesh>
      <mesh position={[1.1, 0.05, 0]} castShadow>
        <boxGeometry args={[0.2, 0.05, 4.8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.6} />
      </mesh>

      {/* Road Wheels (5 per side, cylinder rotated to face sideways) */}
      {[-1.6, -0.8, 0, 0.8, 1.6].map((zPos, idx) => (
        <group key={`wheels-${idx}`}>
          {/* Left wheel */}
          <mesh position={[-1.1, -0.35, zPos]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
            <meshStandardMaterial color="#111" metalness={0.3} roughness={0.7} />
          </mesh>
          <mesh position={[-1.1, -0.35, zPos]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.17, 12]} />
            <meshStandardMaterial color="#444" metalness={0.5} roughness={0.5} />
          </mesh>
          {/* Right wheel */}
          <mesh position={[1.1, -0.35, zPos]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.35, 0.35, 0.15, 16]} />
            <meshStandardMaterial color="#111" metalness={0.3} roughness={0.7} />
          </mesh>
          <mesh position={[1.1, -0.35, zPos]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.17, 12]} />
            <meshStandardMaterial color="#444" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Idler wheels (front) */}
      <mesh position={[-1.1, -0.2, 2.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[1.1, -0.2, 2.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Drive Sprocket wheels (rear) */}
      <mesh position={[-1.1, -0.15, -2.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.15, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[1.1, -0.15, -2.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.15, 12]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* Tracks belt (wrapping over the wheels) */}
      <mesh position={[-1.1, -0.2, 0]} castShadow>
        <boxGeometry args={[0.16, 0.75, 4.4]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.9} />
      </mesh>
      <mesh position={[1.1, -0.2, 0]} castShadow>
        <boxGeometry args={[0.16, 0.75, 4.4]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.9} />
      </mesh>

      {/* Upper Hull Body */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.4, 4.4]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.5} />
      </mesh>
      
      {/* Front Light (Headlight) */}
      <mesh position={[0.7, 0.25, 2.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
        <meshStandardMaterial color="#bbb" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.7, 0.25, 2.16]}>
        <sphereGeometry args={[0.06, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#fffde6" />
      </mesh>
      <pointLight position={[0.7, 0.25, 2.3]} intensity={1.5} distance={2} color="#fffde6" />
      
      {/* Splash Guard (Front V-shape) */}
      <mesh position={[0, 0.25, 2.3]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 0.1, 0.6]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Driver Hatch & Viewport */}
      <mesh position={[-0.4, 0.36, 1.8]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.5, 0.05, 0.4]} />
        <meshStandardMaterial color="#1e2420" metalness={0.5} roughness={0.6} />
      </mesh>

      {/* --- TURRET (T-54/55 Dome Style) --- */}
      <group position={[0, 0.45, 0.2]}>
        {/* Main Dome */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[1.05, 24, 16, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.5} />
        </mesh>

        {/* Commander Hatch (Left) */}
        <mesh position={[-0.4, 0.82, -0.1]} rotation={[0.08, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.32, 0.1, 16]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.4} />
        </mesh>
        
        {/* Gunner Hatch (Right) */}
        <mesh position={[0.4, 0.82, -0.1]} rotation={[0.08, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.28, 0.08, 16]} />
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Antenna mount and wire */}
        <mesh position={[-0.6, 0.85, -0.5]} castShadow>
          <cylinderGeometry args={[0.04, 0.06, 0.15, 8]} />
          <meshStandardMaterial color="#444" metalness={0.8} />
        </mesh>
        <mesh position={[-0.6, 1.6, -0.5]} rotation={[0.1, 0, -0.05]} castShadow>
          <cylinderGeometry args={[0.008, 0.012, 1.4, 8]} />
          <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Main Gun Barrel (100mm D-10T) */}
        <mesh position={[0, 0.3, 2.1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 3.0, 12]} />
          <meshStandardMaterial color="#2a332c" metalness={0.7} roughness={0.4} />
        </mesh>
        
        {/* Fume Extractor on Barrel (near tip) */}
        <mesh position={[0, 0.3, 3.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.5, 12]} />
          <meshStandardMaterial color="#2a332c" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Coaxial Machine Gun (right of main barrel) */}
        <mesh position={[0.25, 0.3, 1.2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Left Side Markings: Star + 390 */}
        <group position={[-1.02, 0.3, 0.1]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh position={[-0.4, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 5]} />
            <meshStandardMaterial color="#DA251D" />
          </mesh>
          <Text
            position={[0.2, 0.05, 0.02]} 
            fontSize={0.4}
            color="#FFF"
            fontWeight="bold"
            anchorX="center"
            anchorY="middle"
          >
            390
          </Text>
        </group>

        {/* Right Side Markings: Star + 390 */}
        <group position={[1.02, 0.3, 0.1]} rotation={[0, Math.PI / 2, 0]}>
          <mesh position={[-0.4, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 5]} />
            <meshStandardMaterial color="#DA251D" />
          </mesh>
          <Text
            position={[0.2, 0.05, 0.02]} 
            fontSize={0.4}
            color="#FFF"
            fontWeight="bold"
            anchorX="center"
            anchorY="middle"
          >
            390
          </Text>
        </group>
      </group>

      {/* --- REAR ACCESSORIES --- */}
      {/* Dual External Fuel Drums */}
      <mesh position={[-0.5, 0.3, -2.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.8, 12]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.6} />
      </mesh>
      <mesh position={[0.5, 0.3, -2.3]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.8, 12]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.6} />
      </mesh>

      {/* Unditching Log */}
      <mesh position={[0, -0.1, -2.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 1.8, 8]} />
        <meshStandardMaterial color="#5c4033" roughness={1} />
      </mesh>
    </group>
  );
}

function TicketModel({ color }: { color: string }) {
  return (
    <group scale={0.6} rotation={[Math.PI / 10, -Math.PI / 12, 0]}>
      {/* Main Paper Sheet (slightly warm vintage parchment color) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 3.8, 0.04]} />
        <meshStandardMaterial color="#eddcb9" roughness={1.0} metalness={0.0} />
      </mesh>

      {/* Decorative Border Frame (thin red lines stamped on paper) */}
      <mesh position={[0, 0, 0.021]} castShadow>
        <boxGeometry args={[2.4, 0.02, 0.005]} />
        <meshStandardMaterial color="#942525" opacity={0.8} transparent />
      </mesh>
      {/* Top/Bottom borders */}
      <mesh position={[0, 1.75, 0.021]}>
        <boxGeometry args={[2.4, 0.02, 0.005]} />
        <meshStandardMaterial color="#942525" opacity={0.8} transparent />
      </mesh>
      <mesh position={[0, -1.75, 0.021]}>
        <boxGeometry args={[2.4, 0.02, 0.005]} />
        <meshStandardMaterial color="#942525" opacity={0.8} transparent />
      </mesh>
      {/* Left/Right borders */}
      <mesh position={[-1.2, 0, 0.021]}>
        <boxGeometry args={[0.02, 3.52, 0.005]} />
        <meshStandardMaterial color="#942525" opacity={0.8} transparent />
      </mesh>
      <mesh position={[1.2, 0, 0.021]}>
        <boxGeometry args={[0.02, 3.52, 0.005]} />
        <meshStandardMaterial color="#942525" opacity={0.8} transparent />
      </mesh>

      {/* Main Header Text */}
      <Text
        position={[0, 1.4, 0.025]}
        fontSize={0.15}
        color="#801b1b"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        TEM PHIẾU LƯƠNG THỰC
      </Text>
      <Text
        position={[0, 1.15, 0.025]}
        fontSize={0.11}
        color="#801b1b"
        anchorX="center"
        anchorY="middle"
      >
        NĂM 1976 - HÀ NỘI
      </Text>
      
      {/* Divider line */}
      <mesh position={[0, 0.95, 0.021]}>
        <boxGeometry args={[2.0, 0.015, 0.005]} />
        <meshStandardMaterial color="#801b1b" opacity={0.7} transparent />
      </mesh>

      {/* Serial Number & Category */}
      <Text
        position={[-0.8, 0.8, 0.025]}
        fontSize={0.08}
        color="#333"
        anchorX="left"
      >
        SỐ: 049527
      </Text>
      <Text
        position={[0.8, 0.8, 0.025]}
        fontSize={0.08}
        color="#DA251D"
        fontWeight="bold"
        anchorX="right"
      >
        HẠNG A
      </Text>

      {/* Grid of coupons (3 rows x 2 cols) */}
      {[
        { r: 0, c: 0, label: "GẠO", value: "5 KG", detail: "Chỉ tiêu tháng" },
        { r: 0, c: 1, label: "THỊT BÒ", value: "200 G", detail: "Phân phối" },
        { r: 1, c: 0, label: "CHẤT ĐỐT", value: "3 LÍT", detail: "Dầu hỏa" },
        { r: 1, c: 1, label: "NƯỚC MẮM", value: "1 CHAI", detail: "Mậu dịch" },
        { r: 2, c: 0, label: "VẢI BÀN", value: "2 MÉT", detail: "Tiêu chuẩn" },
        { r: 2, c: 1, label: "ĐƯỜNG CÁT", value: "500 G", detail: "Chỉ tiêu" }
      ].map((item) => {
        const x = -0.58 + item.c * 1.16;
        const y = 0.35 - item.r * 0.52;
        return (
          <group key={`${item.r}-${item.c}`} position={[x, y, 0]}>
            {/* Coupon cell border */}
            <mesh position={[0, 0, 0.021]}>
              <boxGeometry args={[1.05, 0.44, 0.002]} />
              <meshStandardMaterial color="#801b1b" opacity={0.4} transparent />
            </mesh>
            
            {/* Coupon Text */}
            <Text
              position={[-0.45, 0.12, 0.023]}
              fontSize={0.075}
              color="#555"
              fontWeight="bold"
              anchorX="left"
            >
              {item.label}
            </Text>
            <Text
              position={[0.45, 0.12, 0.023]}
              fontSize={0.09}
              color="#801b1b"
              fontWeight="bold"
              anchorX="right"
            >
              {item.value}
            </Text>
            <Text
              position={[0, -0.1, 0.023]}
              fontSize={0.055}
              color="#666"
              anchorX="center"
            >
              {item.detail}
            </Text>
            <Text
              position={[0, -0.16, 0.023]}
              fontSize={0.04}
              color="#999"
              anchorX="center"
            >
              * KHÔNG ĐỔI BẰNG TIỀN *
            </Text>
          </group>
        );
      })}

      {/* Official State Red Seal Stamp */}
      <group position={[0.6, 1.25, 0.025]} rotation={[0, 0, 0.2]}>
        {/* Outer Stamp Ring */}
        <mesh castShadow>
          <ringGeometry args={[0.22, 0.25, 32]} />
          <meshStandardMaterial color="#cc2929" roughness={0.8} />
        </mesh>
        {/* Inner Stamp Star */}
        <mesh position={[0, 0, 0.001]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.07, 0.01, 5]} />
          <meshStandardMaterial color="#cc2929" roughness={0.8} />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.035}
          color="#cc2929"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          C.TY L.T
        </Text>
      </group>
      
      {/* Creases */}
      <mesh position={[0, 0, 0.022]}>
        <boxGeometry args={[0.03, 3.4, 0.005]} />
        <meshStandardMaterial color="#fff" opacity={0.2} transparent />
      </mesh>
      <mesh position={[0, 0.55, 0.022]}>
        <boxGeometry args={[2.3, 0.03, 0.005]} />
        <meshStandardMaterial color="#fff" opacity={0.2} transparent />
      </mesh>
    </group>
  );
}

function RadioModel() {
  const tapeSpinRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (tapeSpinRef.current) {
      tapeSpinRef.current.rotation.z = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <group scale={0.65}>
      {/* Main Wood Case */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.0, 1.0]} />
        <meshStandardMaterial color="#36251b" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Front Faceplate - Silver Panel */}
      <mesh position={[0, -0.05, 0.51]} castShadow receiveShadow>
        <boxGeometry args={[3.0, 1.7, 0.05]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Left Speaker Grille */}
      <group position={[-0.85, -0.2, 0.54]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.04, 32]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.02, 32]} />
          <meshStandardMaterial color="#111" roughness={0.9} wireframe={true} />
        </mesh>
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#000" metalness={0.3} roughness={0.8} />
        </mesh>
      </group>

      {/* Right Speaker Grille */}
      <group position={[0.85, -0.2, 0.54]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.04, 32]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.01]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.02, 32]} />
          <meshStandardMaterial color="#111" roughness={0.9} wireframe={true} />
        </mesh>
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#000" metalness={0.3} roughness={0.8} />
        </mesh>
      </group>

      {/* Cassette Deck (Middle Center) */}
      <group position={[0, -0.2, 0.54]}>
        <mesh castShadow>
          <boxGeometry args={[0.74, 0.64, 0.04]} />
          <meshStandardMaterial color="#1e1e1e" metalness={0.5} roughness={0.6} />
        </mesh>
        {/* Glass Window */}
        <mesh position={[0, 0.02, 0.011]}>
          <boxGeometry args={[0.54, 0.38, 0.02]} />
          <meshStandardMaterial color="#fff" transparent opacity={0.35} roughness={0.0} metalness={0.1} />
        </mesh>

        {/* Cassette Tape Inside Window */}
        <group position={[0, 0.02, -0.01]} ref={tapeSpinRef}>
          <mesh>
            <boxGeometry args={[0.44, 0.26, 0.015]} />
            <meshStandardMaterial color="#943131" roughness={0.9} />
          </mesh>
          <mesh position={[-0.1, 0, 0.009]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.01, 8]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <mesh position={[0.1, 0, 0.009]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.01, 8]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        </group>
      </group>

      {/* FM/AM Dial (Top Center) */}
      <group position={[0, 0.45, 0.54]}>
        <mesh castShadow>
          <boxGeometry args={[2.0, 0.35, 0.02]} />
          <meshStandardMaterial color="#111" roughness={0.1} metalness={0.8} />
        </mesh>
        <Text
          position={[0, 0.08, 0.011]}
          fontSize={0.065}
          color="#38bdf8"
          anchorX="center"
        >
          88 . 92 . 96 . 100 . 104 . 108  MHz
        </Text>
        <Text
          position={[0, -0.08, 0.011]}
          fontSize={0.05}
          color="#e2e8f0"
          anchorX="center"
        >
          AM 540 . 700 . 1000 . 1600 KHz
        </Text>
        {/* Red Needle */}
        <mesh position={[0.2, 0, 0.01]} castShadow>
          <boxGeometry args={[0.015, 0.3, 0.005]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Top Buttons (Tape Keys) */}
      <group position={[0, 1.0, 0.1]}>
        {[-0.6, -0.36, -0.12, 0.12, 0.36, 0.6].map((xPos, idx) => (
          <mesh key={`btn-${idx}`} position={[xPos, 0.05, 0.2]} castShadow>
            <boxGeometry args={[0.18, 0.15, 0.25]} />
            <meshStandardMaterial color={idx === 0 ? "#b91c1c" : "#777"} metalness={0.9} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* Dials & Knobs */}
      <group position={[1.2, 0.45, 0.54]}>
        <mesh position={[-0.1, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
          <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.15, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 16]} />
          <meshStandardMaterial color="#222" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Carry Handle */}
      <group position={[0, 1.05, 0]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[2.5, 0.1, 0.25]} />
          <meshStandardMaterial color="#222" metalness={0.3} roughness={0.8} />
        </mesh>
        <mesh position={[-1.2, 0.1, 0]} castShadow>
          <boxGeometry args={[0.1, 0.3, 0.18]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[1.2, 0.1, 0]} castShadow>
          <boxGeometry args={[0.1, 0.3, 0.18]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Telescopic Antenna */}
      <group position={[-1.3, 1.0, -0.3]} rotation={[-0.1, 0, 0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.15, 8]} />
          <meshStandardMaterial color="#444" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.025, 1.1, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.05} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.012, 0.016, 0.9, 8]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.05} />
        </mesh>
        <mesh position={[0, 1.96, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial color="#b91c1c" />
        </mesh>
      </group>
    </group>
  );
}

function MedalModel({ color }: { color: string }) {
  // Upgraded Medal Model: Huân chương Chiến công Việt Nam
  // Cấu tạo chi tiết theo hình ảnh thực tế:
  // - Cuống huân chương ở trên cùng: hình chữ nhật nằm ngang màu đỏ có viền vàng, 2 vạch xanh lá cây và 3 ngôi sao vàng nhỏ.
  // - Dải huân chương hình thang (trapezoid) màu đỏ, có 2 vạch xanh lá cây chạy chéo dọc mép, đính 3 ngôi sao vàng xếp chéo.
  // - Móc treo liên kết: hình ngôi sao vàng 6 cánh rỗng giữa (6-pointed star ring).
  // - Thân huân chương: lá chắn ngũ giác màu vàng hướng đỉnh lên trên làm nền, khẩu súng AK-47 chéo kiếm ở sau ngôi sao vàng 5 cánh lớn.
  // - Trung tâm: vòng tròn đỏ viền vàng với hàng chữ gold hình tròn "HUÂN CHƯƠNG CHIẾN CÔNG" và "★ VIỆT NAM ★", tâm trong có ngôi sao vàng nhỏ trên nền đỏ.

  const ribbonShape = React.useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.35, 0.6);
    s.lineTo(0.35, 0.6);
    s.lineTo(0.55, -0.6);
    s.lineTo(-0.55, -0.6);
    return s;
  }, []);

  const shieldShape = React.useMemo(() => {
    const s = new THREE.Shape();
    const R = 0.72;
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      const x = Math.sin(angle) * R;
      const y = Math.cos(angle) * R;
      if (i === 0) {
        s.moveTo(x, y);
      } else {
        s.lineTo(x, y);
      }
    }
    s.closePath();
    return s;
  }, []);

  const starShape = React.useMemo(() => {
    const s = new THREE.Shape();
    const rOuter = 0.8;
    const rInner = 0.31;
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI * 2) / 10;
      const r = i % 2 === 0 ? rOuter : rInner;
      const x = Math.sin(angle) * r;
      const y = Math.cos(angle) * r;
      if (i === 0) {
        s.moveTo(x, y);
      } else {
        s.lineTo(x, y);
      }
    }
    s.closePath();
    return s;
  }, []);

  const medalTexture = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw red background circle
    ctx.fillStyle = '#cc2929';
    ctx.beginPath();
    ctx.arc(256, 256, 240, 0, Math.PI * 2);
    ctx.fill();

    // Draw outer gold border
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(256, 256, 233, 0, Math.PI * 2);
    ctx.stroke();

    // Draw text
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 28px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const drawArcText = (text: string, radius: number, startAngle: number, endAngle: number, isBottom: boolean) => {
      const chars = text.split('');
      const angleStep = (endAngle - startAngle) / (chars.length - 1);
      
      chars.forEach((char, i) => {
        const angle = startAngle + i * angleStep;
        ctx.save();
        ctx.translate(256 + Math.cos(angle) * radius, 256 + Math.sin(angle) * radius);
        if (isBottom) {
          ctx.rotate(angle - Math.PI / 2);
        } else {
          ctx.rotate(angle + Math.PI / 2);
        }
        ctx.fillText(char, 0, 0);
        ctx.restore();
      });
    };

    // Top text: HUÂN CHƯƠNG CHIẾN CÔNG
    drawArcText("HUÂN CHƯƠNG CHIẾN CÔNG", 170, -Math.PI * 0.82, -Math.PI * 0.18, false);

    // Bottom text: ★ VIỆT NAM ★
    drawArcText("★ VIỆT NAM ★", 170, Math.PI * 0.8, Math.PI * 0.2, true);

    // Draw central star
    const drawStar = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    drawStar(256, 256, 5, 80, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  return (
    <group scale={0.75}>
      {/* 1. Cuống Huân Chương (Ribbon Bar) ở trên cùng */}
      <group position={[0, 1.45, 0]}>
        {/* Nền đỏ của cuống */}
        <mesh castShadow>
          <boxGeometry args={[1.0, 0.28, 0.08]} />
          <meshStandardMaterial color="#cc2929" roughness={0.8} />
        </mesh>
        
        {/* Hai vạch xanh lá cây */}
        {[-0.3, 0.3].map((xPos, idx) => (
          <mesh key={`cuong-green-${idx}`} position={[xPos, 0, 0.05]} castShadow>
            <boxGeometry args={[0.1, 0.28, 0.01]} />
            <meshStandardMaterial color="#16a34a" roughness={0.8} />
          </mesh>
        ))}

        {/* 3 ngôi sao vàng trên cuống */}
        {[-0.2, 0, 0.2].map((xPos, idx) => (
          <mesh key={`cuong-star-${idx}`} position={[xPos, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]} scale={0.5}>
            <coneGeometry args={[0.08, 0.03, 5]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
          </mesh>
        ))}

        {/* Khung viền vàng của cuống (Top & Bottom bars, Left & Right brackets) */}
        <mesh position={[0, 0.15, 0.04]}>
          <boxGeometry args={[1.06, 0.03, 0.02]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.15, 0.04]}>
          <boxGeometry args={[1.06, 0.03, 0.02]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.52, 0, 0.04]}>
          <boxGeometry args={[0.03, 0.32, 0.02]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.52, 0, 0.04]}>
          <boxGeometry args={[0.03, 0.32, 0.02]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* 2. Dải Huân Chương Hình Thang (Trapezoidal Ribbon) */}
      <group position={[0, 0.45, 0]}>
        {/* Nền vải đỏ hình thang */}
        <mesh castShadow receiveShadow position={[0, 0, -0.04]}>
          <extrudeGeometry args={[ribbonShape, { depth: 0.08, bevelEnabled: false }]} />
          <meshStandardMaterial color="#cc2929" roughness={0.8} />
        </mesh>

        {/* Hai vạch xanh lá cây chạy chéo dọc mép */}
        {/* Vạch trái (góc xoay chéo khoảng 9.5 độ = 0.165 rad) */}
        <mesh position={[-0.38, 0, 0.05]} rotation={[0, 0, 0.165]} castShadow>
          <boxGeometry args={[0.1, 1.22, 0.015]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>
        {/* Vạch phải */}
        <mesh position={[0.38, 0, 0.05]} rotation={[0, 0, -0.165]} castShadow>
          <boxGeometry args={[0.1, 1.22, 0.015]} />
          <meshStandardMaterial color="#16a34a" roughness={0.8} />
        </mesh>

        {/* 3 ngôi sao vàng đính chéo trên dải (diagonally: top-right, center, bottom-left) */}
        <group position={[0, 0, 0.06]}>
          {/* Ngôi sao trên-phải */}
          <mesh position={[0.18, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.7}>
            <coneGeometry args={[0.09, 0.03, 5]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} />
          </mesh>
          {/* Ngôi sao chính giữa */}
          <mesh position={[0.0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.7}>
            <coneGeometry args={[0.09, 0.03, 5]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} />
          </mesh>
          {/* Ngôi sao dưới-trái */}
          <mesh position={[-0.18, -0.25, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.7}>
            <coneGeometry args={[0.09, 0.03, 5]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* 3. Móc Treo Liên Kết Hình Ngôi Sao 6 Cánh Rỗng (6-pointed Star Hanger Ring) */}
      <group position={[0, -0.22, 0]}>
        {/* Central Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.08, 0.015, 8, 24]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
        </mesh>
        {/* 6 Points radiating from the ring */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 6;
          const x = Math.sin(angle) * 0.09;
          const y = Math.cos(angle) * 0.09;
          return (
            <mesh
              key={`hanger-point-${i}`}
              position={[x, y, 0]}
              rotation={[0, 0, -angle]}
              castShadow
            >
              <coneGeometry args={[0.025, 0.07, 4]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.05} />
            </mesh>
          );
        })}
      </group>

      {/* 4. Thân Huân Chương (Medal Body) */}
      <group position={[0, -0.75, 0]}>
        {/* A. Lá chắn ngũ giác màu vàng làm nền (Pentagonal Shield Backdrop - pointing upwards) */}
        <mesh position={[0, 0, -0.04]} castShadow receiveShadow>
          <extrudeGeometry args={[shieldShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 }]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Golden border highlighting the shield */}
        <mesh position={[0, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.78, 0.78, 0.02, 5]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* B. Súng AK-47 & Kiếm chéo đặt trên lá chắn */}
        {/* Thanh kiếm chéo (Từ dưới trái lên trên phải - Hilt at bottom-left, blade tip at top-right) */}
        <group rotation={[0, 0, Math.PI / 4]} position={[0, 0, -0.02]}>
          {/* Lưỡi kiếm bạc */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.04, 0.9, 0.02]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.95} roughness={0.05} />
          </mesh>
          {/* Hộ thủ kiếm vàng */}
          <mesh position={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[0.18, 0.04, 0.04]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} />
          </mesh>
          {/* Chuôi kiếm */}
          <mesh position={[0, -0.38, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.2, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.49, 0]} castShadow>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} />
          </mesh>
        </group>

        {/* Khẩu súng AK-47 chéo (Từ trên trái xuống dưới phải - Stock at top-left, muzzle at bottom-right) */}
        <group rotation={[0, 0, -Math.PI / 4]} position={[0, 0, -0.015]}>
          {/* Buttstock (Báng súng gỗ) */}
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.06, 0.25, 0.04]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
          {/* Receiver & Grip (Thân súng & Tay cầm) */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.05, 0.3, 0.05]} />
            <meshStandardMaterial color="#111" metalness={0.7} />
          </mesh>
          {/* Pistol Grip */}
          <mesh position={[0.03, 0.1, 0]} rotation={[0, 0, -0.2]} castShadow>
            <boxGeometry args={[0.02, 0.08, 0.03]} />
            <meshStandardMaterial color="#111" />
          </mesh>
          {/* Băng đạn cong màu đen (Magazine) */}
          <mesh position={[-0.06, 0.18, 0]} rotation={[0, 0, 0.4]} castShadow>
            <boxGeometry args={[0.03, 0.2, 0.03]} />
            <meshStandardMaterial color="#111" metalness={0.6} />
          </mesh>
          {/* Barrel (Nòng súng) */}
          <mesh position={[0, -0.15, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
            <meshStandardMaterial color="#111" metalness={0.8} />
          </mesh>
          {/* Muzzle & Bayonet (Lưỡi lê) */}
          <mesh position={[0, -0.42, 0]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.1, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.9} />
          </mesh>
        </group>

        {/* C. Ngôi sao vàng 5 cánh nổi ở giữa (Gold 5-point star - extruded shape) */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <extrudeGeometry args={[starShape, { depth: 0.05, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 }]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* D. Tâm tròn đỏ viền vàng với chữ in phẳng (Center Medallion with printed texture) */}
        {/* Gold backing cylinder to give the rim thickness */}
        <mesh position={[0, 0, 0.04]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.30, 0.30, 0.008, 32]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Flat enameled circle face with printed texture */}
        {medalTexture && (
          <mesh position={[0, 0, 0.045]} rotation={[0, 0, 0]} castShadow>
            <circleGeometry args={[0.30, 64]} />
            <meshStandardMaterial map={medalTexture} roughness={0.4} metalness={0.2} transparent />
          </mesh>
        )}
      </group>
    </group>
  );
}

function ArtifactModel({ artifact, hovered }: { artifact: Artifact, hovered?: boolean }) {
  const scale = hovered ? 1.1 : 1;
  const yOffset = hovered ? 0.2 : 0;
  
  return (
    <group scale={scale} position={[0, yOffset, 0]}>
      {artifact.id === 0 && <TankModel color={artifact.color} />}
      {artifact.id === 1 && <TicketModel color={artifact.color} />}
      {artifact.id === 2 && <RadioModel />}
      {artifact.id === 3 && <MedalModel color={artifact.color} />}
      {/* Highlight effect when hovered */}
      {hovered && (
        <pointLight position={[0, 0, 2]} intensity={2} color={artifact.color} distance={4} />
      )}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  THREE.JS COMPONENTS                                               */
/* ═══════════════════════════════════════════════════════════════════ */

function Pedestal({ artifact, onSelect, hasSelected }: { artifact: Artifact; onSelect: (a: Artifact) => void; hasSelected: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group position={artifact.position}>
      {/* 3D Custom Artifact Model */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <group 
          ref={groupRef}
          onClick={() => onSelect(artifact)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <ArtifactModel artifact={artifact} hovered={hovered} />
        </group>
      </Float>

      {/* Label inside the 3D space (Outside rotating mesh) using HTML overlay to prevent clipping */}
      {!hasSelected && (
        <Html
          position={[0, -2.9, 1.5]}
          center
          distanceFactor={8}
        >
          <div className="bg-[#2C2A29] text-[#FAF3EB] px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.35)] border border-[#FAF3EB]/15 pointer-events-none select-none">
            {artifact.name}
          </div>
        </Html>
      )}

      {/* Display Base */}
      <mesh position={[0, -2, 0]} receiveShadow>
        <cylinderGeometry args={[1, 1.2, 0.5, 32]} />
        <meshStandardMaterial color="#D1C2A5" metalness={0.2} roughness={0.7} />
      </mesh>
      
      {/* Light coming from bottom */}
      <pointLight position={[0, -1, 0.8]} intensity={0.8} color={artifact.color} distance={5} />
    </group>
  );
}

function Scene({ onSelect, hasSelected }: { onSelect: (a: Artifact) => void; hasSelected: boolean }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 12]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 2} 
        minDistance={6} 
        maxDistance={15}
        makeDefault
      />
      
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <pointLight position={[-10, 5, -10]} intensity={0.8} color="#FFE4B5" />

      <group position={[0, -1, 0]}>
        {artifacts.map((a) => (
          <Pedestal key={a.id} artifact={a} onSelect={onSelect} hasSelected={hasSelected} />
        ))}
      </group>

      <ContactShadows resolution={1024} scale={30} blur={2.5} opacity={0.4} far={10} color="#000000" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                    */
/* ═══════════════════════════════════════════════════════════════════ */

export default function Museum3D() {
  const [selected, setSelected] = useState<Artifact | null>(null);

  return (
    <div className="relative w-full h-[700px] flex flex-col bg-[#F5E6D3] rounded-3xl border-4 border-[#2C2A29] shadow-[15px_15px_0px_0px_#2C2A29] overflow-hidden">
      {/* Instructions Overlay */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
        <h2 className="text-2xl font-serif-heading font-black text-[#2C2A29] uppercase tracking-tighter drop-shadow-md">
          Bảo Tàng Thực Tế Ảo 3D
        </h2>
        <div className="flex items-center gap-2 text-[#DA251D] text-[10px] font-black uppercase tracking-widest mt-1 bg-white/50 px-3 py-1 inline-flex rounded-full">
          <MousePointer2 size={12} /> Xoay để khám phá, Click để xem chi tiết
        </div>
      </div>

      {/* WebGL Canvas */}
      <div className="flex-1 w-full relative cursor-move">
        <Canvas shadows>
          <Suspense fallback={<Html center><div className="text-[#DA251D] font-black animate-pulse px-6 py-3 bg-white/80 rounded-full shadow-lg border-2 border-[#DA251D] whitespace-nowrap">ĐANG TẢI MÔ HÌNH 3D...</div></Html>}>
            <Scene onSelect={setSelected} hasSelected={!!selected} />
          </Suspense>
        </Canvas>
      </div>

      {/* Bottom info bar */}
      <div className="h-16 bg-[#2C2A29] flex items-center justify-between px-8 border-t-2 border-[#2C2A29]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-[#DA251D]">
             <Rotate3d size={16} />
          </div>
          <span className="text-[10px] font-bold text-[#E8D9C5] uppercase tracking-widest">
            Trải nghiệm WebGL Engine 2026
          </span>
        </div>
        <div className="flex gap-2">
           {artifacts.map(a => (
             <div key={a.id} className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
           ))}
        </div>
      </div>

      {/* Real 3D Modal (Physical Modal Overlay) */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-[#2C2A29]/95 backdrop-blur-md"
          >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-full max-w-2xl bg-[#FAF3EB] border-8 border-double border-[#2C2A29] shadow-[20px_20px_0px_0px_rgba(218,37,29,0.3)] p-10 relative grid md:grid-cols-2 gap-8 items-center"
            >
              <button 
                onClick={() => setSelected(null)}
                className="absolute -top-4 -right-4 w-12 h-12 bg-[#DA251D] text-white flex items-center justify-center border-2 border-[#2C2A29] shadow-lg hover:scale-110 transition-transform z-10"
              >
                <X size={24} />
              </button>

              {/* Real 3D Artifact Viewer in Modal */}
              <div className="w-full h-80 bg-[#1E1C1A] border-4 border-[#2C2A29] shadow-inner relative overflow-hidden rounded-lg cursor-move">
                <Canvas
                  shadows
                  camera={{ position: [0, 0, 5], fov: 40 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'block'
                  }}
                >
                  <ambientLight intensity={1} />

                  <pointLight
                    position={[10, 10, 10]}
                    intensity={1.5}
                  />

                  <spotLight
                    position={[-5, 5, 5]}
                    intensity={1}
                    angle={0.5}
                    penumbra={1}
                    castShadow
                  />

                  <Suspense fallback={null}>
                    <Bounds fit clip observe margin={1.5}>
                      <Float
                        speed={3}
                        rotationIntensity={0.8}
                        floatIntensity={0.5}
                      >
                        <group position={[0, 0, 0]}>
                          <ArtifactModel artifact={selected} />
                        </group>
                      </Float>
                    </Bounds>

                    <ContactShadows
                      position={[0, -1.5, 0]}
                      opacity={0.6}
                      scale={10}
                      blur={2.4}
                    />

                    <Environment preset="city" />
                  </Suspense>

                  <OrbitControls
                    enableZoom
                    autoRotate
                    autoRotateSpeed={2}
                    minDistance={3}
                    maxDistance={8}
                  />
                </Canvas>
                <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase text-white/80 border border-white/20 flex items-center gap-2">
                  <Rotate3d size={10} /> Tương tác 3D đa chiều
                </div>
              </div>

              <div className="flex flex-col justify-center h-full">
                 <div className="mb-4 text-[#DA251D]">
                    {selected.name === "Xe tăng 390" && <Box size={32} />}
                    {selected.name === "Tem phiếu mua lương thực" && <Ticket size={32} />}
                    {selected.name === "Đài Cassette cổ" && <Radio size={32} />}
                    {selected.name === "Huân chương Chiến công" && <Trophy size={32} />}
                 </div>

                 <h3 className="text-4xl font-serif-heading font-black text-[#2C2A29] uppercase tracking-tighter mb-2 leading-none">
                   {selected.name}
                 </h3>
                 <span className="text-white font-black text-[10px] uppercase tracking-widest mb-6 bg-[#DA251D] self-start px-3 py-1 rounded-sm shadow-sm inline-block">
                   Năm {selected.year}
                 </span>

                 <div className="bg-[#E8D9C5]/50 p-5 border-l-4 border-[#D1C2A5] mb-8">
                   <p className="font-serif-body text-[#333] leading-relaxed text-justify text-sm">
                     {selected.description}
                   </p>
                 </div>

                 <button 
                    onClick={() => setSelected(null)}
                    className="w-full py-3 border-2 border-[#2C2A29] text-[#2C2A29] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#2C2A29] hover:text-[#FAF3EB] transition-colors flex items-center justify-center gap-3"
                 >
                    <Star size={12} className="animate-spin-slow" /> Trở về Bảo Tàng <Star size={12} className="animate-spin-slow" />
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
        }
        .canvas-container { pointer-events: auto !important; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
