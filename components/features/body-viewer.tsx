"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type BodyPartStatus = "pain" | "recovered" | "active";

export type MarkedParts = Record<string, BodyPartStatus>;

export const BODY_PARTS = [
  {
    id: "head",
    label: "Head",
    icon: "🧠",
    zMin: 2.2,
    zMax: 3.2,
    xMin: -0.5,
    xMax: 0.5,
  },
  {
    id: "neck",
    label: "Neck",
    icon: "🔗",
    zMin: 1.6,
    zMax: 2.2,
    xMin: -0.35,
    xMax: 0.35,
  },
  {
    id: "left_shoulder",
    label: "Left Shoulder",
    icon: "💪",
    zMin: 0.6,
    zMax: 1.6,
    xMin: 0.6,
    xMax: 1.42,
  },
  {
    id: "right_shoulder",
    label: "Right Shoulder",
    icon: "💪",
    zMin: 0.6,
    zMax: 1.6,
    xMin: -1.42,
    xMax: -0.6,
  },
  {
    id: "chest",
    label: "Chest",
    icon: "🫁",
    zMin: 0.2,
    zMax: 1.6,
    xMin: -0.6,
    xMax: 0.6,
  },
  {
    id: "left_arm",
    label: "Left Arm",
    icon: "🦾",
    zMin: -1.5,
    zMax: 0.6,
    xMin: 0.7,
    xMax: 1.42,
  },
  {
    id: "right_arm",
    label: "Right Arm",
    icon: "🦾",
    zMin: -1.5,
    zMax: 0.6,
    xMin: -1.42,
    xMax: -0.7,
  },
  {
    id: "abdomen",
    label: "Abdomen",
    icon: "🫃",
    zMin: -0.8,
    zMax: 0.2,
    xMin: -0.7,
    xMax: 0.7,
  },
  {
    id: "lower_back",
    label: "Lower Back",
    icon: "🦴",
    zMin: -1.8,
    zMax: -0.8,
    xMin: -0.7,
    xMax: 0.7,
  },
  {
    id: "left_hip",
    label: "Left Hip",
    icon: "🦵",
    zMin: -2.5,
    zMax: -1.5,
    xMin: 0.1,
    xMax: 0.9,
  },
  {
    id: "right_hip",
    label: "Right Hip",
    icon: "🦵",
    zMin: -2.5,
    zMax: -1.5,
    xMin: -0.9,
    xMax: -0.1,
  },
  {
    id: "left_thigh",
    label: "Left Thigh",
    icon: "🦵",
    zMin: -3.8,
    zMax: -2.5,
    xMin: 0.0,
    xMax: 0.85,
  },
  {
    id: "right_thigh",
    label: "Right Thigh",
    icon: "🦵",
    zMin: -3.8,
    zMax: -2.5,
    xMin: -0.85,
    xMax: 0.0,
  },
  {
    id: "left_knee",
    label: "Left Knee",
    icon: "🦿",
    zMin: -4.4,
    zMax: -3.8,
    xMin: 0.0,
    xMax: 0.75,
  },
  {
    id: "right_knee",
    label: "Right Knee",
    icon: "🦿",
    zMin: -4.4,
    zMax: -3.8,
    xMin: -0.75,
    xMax: 0.0,
  },
  {
    id: "left_leg",
    label: "Left Lower Leg",
    icon: "🦵",
    zMin: -5.4,
    zMax: -4.4,
    xMin: 0.0,
    xMax: 0.7,
  },
  {
    id: "right_leg",
    label: "Right Lower Leg",
    icon: "🦵",
    zMin: -5.4,
    zMax: -4.4,
    xMin: -0.7,
    xMax: 0.0,
  },
  {
    id: "feet",
    label: "Feet",
    icon: "🦶",
    zMin: -5.9,
    zMax: -5.4,
    xMin: -0.9,
    xMax: 0.9,
  },
];

const BASE_COLOR = new THREE.Color(0x7a9cc4);
const PAIN_COLOR = new THREE.Color(0xff3b3b);
const RECV_COLOR = new THREE.Color(0x22c55e);
const ACT_COLOR = new THREE.Color(0xd4f45a);
const HOVER_COLOR = new THREE.Color(0xfbbf24);

export type BodyViewerHandle = {
  hoverPart: (id: string | null) => void;
};

interface BodyViewerProps {
  markedParts: MarkedParts;
  background?: string;
}

const BodyViewer = forwardRef<BodyViewerHandle, BodyViewerProps>(
  function BodyViewer({ markedParts, background = "#0a0d14" }, ref) {
    const mountRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef<{
      geometry: THREE.BufferGeometry | null;
      positions: Float32Array | null;
    }>({ geometry: null, positions: null });
    const markedRef = useRef(markedParts);

    useEffect(() => {
      markedRef.current = markedParts;
    }, [markedParts]);

    function getVertexIndices(
      part: (typeof BODY_PARTS)[0],
      positions: Float32Array,
    ) {
      const out: number[] = [];
      for (let i = 0; i < positions.length / 3; i++) {
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        if (
          z >= part.zMin &&
          z <= part.zMax &&
          x >= part.xMin &&
          x <= part.xMax
        ) {
          out.push(i);
        }
      }
      return out;
    }

    function repaint(marked: MarkedParts) {
      const { geometry, positions } = stateRef.current;
      if (!geometry || !positions) return;
      const colors = geometry.attributes.color.array as Float32Array;
      for (let i = 0; i < positions.length / 3; i++) {
        colors[i * 3] = BASE_COLOR.r;
        colors[i * 3 + 1] = BASE_COLOR.g;
        colors[i * 3 + 2] = BASE_COLOR.b;
      }
      Object.entries(marked).forEach(([partId, type]) => {
        const part = BODY_PARTS.find((p) => p.id === partId);
        if (!part) return;
        const color =
          type === "pain"
            ? PAIN_COLOR
            : type === "active"
              ? ACT_COLOR
              : RECV_COLOR;
        getVertexIndices(part, positions).forEach((i) => {
          colors[i * 3] = color.r;
          colors[i * 3 + 1] = color.g;
          colors[i * 3 + 2] = color.b;
        });
      });
      geometry.attributes.color.needsUpdate = true;
    }

    function paintHover(partId: string | null) {
      const { geometry, positions } = stateRef.current;
      if (!geometry || !positions) return;
      repaint(markedRef.current);
      if (!partId || markedRef.current[partId]) return;
      const part = BODY_PARTS.find((p) => p.id === partId);
      if (!part) return;
      const colors = geometry.attributes.color.array as Float32Array;
      getVertexIndices(part, positions).forEach((i) => {
        colors[i * 3] = HOVER_COLOR.r;
        colors[i * 3 + 1] = HOVER_COLOR.g;
        colors[i * 3 + 2] = HOVER_COLOR.b;
      });
      geometry.attributes.color.needsUpdate = true;
    }

    useImperativeHandle(ref, () => ({ hoverPart: paintHover }));

    useEffect(() => {
      const el = mountRef.current;
      if (!el || el.childElementCount > 0) return;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(el.clientWidth, el.clientHeight);
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(background);

      const camera = new THREE.PerspectiveCamera(
        36,
        el.clientWidth / el.clientHeight,
        0.01,
        100,
      );
      camera.position.set(0, 0, 8);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.07;
      controls.minDistance = 3;
      controls.maxDistance = 18;
      controls.minPolarAngle = Math.PI / 2;
      controls.maxPolarAngle = Math.PI / 2;
      controls.target.set(0, 0, 0);

      scene.add(new THREE.AmbientLight(0xffffff, 0.8));
      const key = new THREE.DirectionalLight(0xffffff, 2.5);
      key.position.set(4, 6, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x4488ff, 1.2);
      rim.position.set(-5, 3, -4);
      scene.add(rim);
      const bot = new THREE.DirectionalLight(0x223355, 0.8);
      bot.position.set(0, -5, 2);
      scene.add(bot);

      const loader = new GLTFLoader();
      loader.load("/human_figure/scene.gltf", (gltf) => {
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const s = 4 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(s);
        model.position.set(-center.x * s, -center.y * s, -center.z * s);

        model.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return;
          const mesh = child as THREE.Mesh;
          const geo = mesh.geometry;
          const posAttr = geo.attributes.position;
          const count = posAttr.count;
          const colorArr = new Float32Array(count * 3);
          for (let i = 0; i < count; i++) {
            colorArr[i * 3] = BASE_COLOR.r;
            colorArr[i * 3 + 1] = BASE_COLOR.g;
            colorArr[i * 3 + 2] = BASE_COLOR.b;
          }
          geo.setAttribute("color", new THREE.BufferAttribute(colorArr, 3));
          mesh.material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.55,
            metalness: 0.15,
          });
          stateRef.current.geometry = geo;
          stateRef.current.positions = posAttr.array as Float32Array;
          repaint(markedRef.current);
        });

        scene.add(model);
      });

      const onResize = () => {
        camera.aspect = el.clientWidth / el.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(el.clientWidth, el.clientHeight);
      };
      window.addEventListener("resize", onResize);

      let raf: number;
      const animate = () => {
        raf = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (el.contains(renderer.domElement))
          el.removeChild(renderer.domElement);
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      repaint(markedParts);
    }, [markedParts]); // eslint-disable-line react-hooks/exhaustive-deps

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
  },
);

export default BodyViewer;
