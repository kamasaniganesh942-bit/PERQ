import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Layers,
  Camera,
  Sun,
  RotateCcw,
} from 'lucide-react';
import {
  DemoCard,
  BANK_THEMES,
  formatINR,
} from '../utils/finance';
import {
  drawBankLogoOnCanvas,
  drawNetworkLogoOnCanvas,
} from './BankLogos';

// Pre-allocated math objects at module scope to prevent GC in requestAnimationFrame
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0, 0);
const _dummyMatrix = new THREE.Matrix4();
const _dummyPos = new THREE.Vector3();
const _dummyQuat = new THREE.Quaternion();
const _dummyScale = new THREE.Vector3();
const _dummyColor = new THREE.Color();

export type CameraPreset = 'isometric' | 'front' | 'macro' | 'back';
export type LightingPreset = 'studio' | 'contrast' | 'soft';

interface CardStudio3DProps {
  cards: DemoCard[];
  selectedCard: DemoCard;
  hideBalances: boolean;
  onSelectCard: (card: DemoCard) => void;
  cardholderName?: string;
  compact?: boolean;
}

function createRoundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function createSatinMicroTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 900; i++) {
      const y = (i * 19) % 512;
      const shade = 122 + ((i * 13) % 14);
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(0, y, 512, 1);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function drawCardFaceCanvas(
  canvas: HTMLCanvasElement,
  card: DemoCard,
  hideBalances: boolean,
  cardholderName: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  const bankTheme = BANK_THEMES[card.issuer] || BANK_THEMES.SBI;
  const [c1, c2, c3] = bankTheme.faceGradient;

  // 1. Bank-authentic base surface gradient (no artificial vertical stripes)
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, c1);
  grad.addColorStop(0.55, c2);
  grad.addColorStop(1, c3);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 2. Subtle radial sheen matching finish (matte, satin, or metallic)
  const sheenAlpha =
    card.finish === 'metallic' ? 0.16 : card.finish === 'satin' ? 0.1 : 0.04;
  const sheenGrad = ctx.createRadialGradient(w * 0.28, h * 0.18, 20, w * 0.35, h * 0.25, w * 0.75);
  sheenGrad.addColorStop(0, `rgba(255, 255, 255, ${sheenAlpha})`);
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(0, 0, w, h);

  // 3. Restrained bank-specific architectural accent curve / horizon line
  ctx.save();
  ctx.strokeStyle = bankTheme.subtleDetailColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.64);
  ctx.bezierCurveTo(w * 0.35, h * 0.58, w * 0.68, h * 0.7, w, h * 0.62);
  ctx.stroke();
  ctx.restore();

  // Top edge bank color accent bar
  ctx.fillStyle = bankTheme.headerBandColor;
  ctx.fillRect(64, 0, 180, 8);

  // 4. Top-Left: Realistic Bank Logo (NO generic PERQ circle symbol)
  drawBankLogoOnCanvas(ctx, card.issuer, 64, 48);

  // Small, neat PERQ brand & card nickname subtitle positioned cleanly below bank logo
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `PERQ  ·  ${card.nickname.toUpperCase()} (${card.finish.toUpperCase()} FINISH)`,
    64,
    136
  );

  // 5. Top-Right: Payment Network Logo (Visa, Mastercard, or Amex)
  drawNetworkLogoOnCanvas(ctx, card.network, w - 64, 48);

  const topRate = Math.max(
    card.baseRewardRate,
    ...Object.values(card.categoryRates).map((v) => v ?? 0)
  );
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.fillText(`UP TO ${topRate.toFixed(1)}% REWARDS`, w - 64, 136);

  // 6. Contactless NFC wave icon next to the 3D EMV chip on the left side
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  const waveCx = 278;
  const waveCy = 290;
  for (let r = 12; r <= 28; r += 8) {
    ctx.beginPath();
    ctx.arc(waveCx, waveCy, r, -Math.PI * 0.32, Math.PI * 0.32);
    ctx.stroke();
  }
  ctx.restore();

  // 7. Masked Card Number
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = '500 34px "JetBrains Mono", monospace';
  ctx.fillText('••••   ••••   ••••  ', 64, 424);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 38px "JetBrains Mono", monospace';
  ctx.fillText(card.lastFour, 485, 424);

  // 8. Bottom Row: Wallet Balance (Left) & Cardholder Name (Right)
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('WALLET BALANCE', 64, 514);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 42px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(formatINR(card.balance, hideBalances), 64, 566);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
  ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CARDHOLDER', w - 64, 514);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText((cardholderName || 'CARDHOLDER').toUpperCase(), w - 64, 560);
}

export const CardStudio3D: React.FC<CardStudio3DProps> = ({
  cards,
  selectedCard,
  hideBalances,
  onSelectCard,
  cardholderName = 'Cardholder',
  compact = false,
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [explodedPct, setExplodedPct] = useState(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('studio');
  const [autoRotate, setAutoRotate] = useState(true);

  const stateRef = useRef({
    explodedTarget: 0,
    explodedCurrent: 0,
    cameraPreset: 'isometric' as CameraPreset,
    lightingPreset: 'studio' as LightingPreset,
    autoRotate: true,
    userYawOffset: 0,
    userPitchOffset: 0,
    isDragging: false,
    lastPointerX: 0,
    lastPointerY: 0,
  });

  const sceneObjectsRef = useRef<{
    faceCanvas: HTMLCanvasElement;
    faceTexture: THREE.CanvasTexture;
    facePlaneMat: THREE.MeshStandardMaterial;
    coreMaterial: THREE.MeshPhysicalMaterial;
    bezelMaterial: THREE.MeshStandardMaterial;
    shieldMat: THREE.MeshPhysicalMaterial;
    coilMat: THREE.MeshStandardMaterial;
    keyLight: THREE.DirectionalLight;
    hemiLight: THREE.HemisphereLight;
    rimLight: THREE.PointLight;
    renderer: THREE.WebGLRenderer | null;
    camera: THREE.PerspectiveCamera | null;
  } | null>(null);

  useEffect(() => {
    stateRef.current.explodedTarget = explodedPct / 100;
  }, [explodedPct]);

  useEffect(() => {
    stateRef.current.cameraPreset = cameraPreset;
    stateRef.current.userYawOffset = 0;
    stateRef.current.userPitchOffset = 0;
  }, [cameraPreset]);

  useEffect(() => {
    stateRef.current.lightingPreset = lightingPreset;
    const objs = sceneObjectsRef.current;
    if (!objs) return;
    if (lightingPreset === 'studio') {
      objs.keyLight.color.setHex(0xffffff);
      objs.keyLight.intensity = 2.4;
      objs.hemiLight.color.setHex(0xe5e5e5);
      objs.hemiLight.groundColor.setHex(0x151515);
      objs.rimLight.color.setHex(0xffffff);
      objs.rimLight.intensity = 3.0;
    } else if (lightingPreset === 'contrast') {
      objs.keyLight.color.setHex(0xffffff);
      objs.keyLight.intensity = 3.2;
      objs.hemiLight.color.setHex(0x858585);
      objs.hemiLight.groundColor.setHex(0x080808);
      objs.rimLight.color.setHex(0xd4d4d4);
      objs.rimLight.intensity = 4.2;
    } else {
      objs.keyLight.color.setHex(0xf5f5f5);
      objs.keyLight.intensity = 1.9;
      objs.hemiLight.color.setHex(0xffffff);
      objs.hemiLight.groundColor.setHex(0x252525);
      objs.rimLight.color.setHex(0xb8b8b8);
      objs.rimLight.intensity = 2.0;
    }
  }, [lightingPreset]);

  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  // Dynamically update 3D card texture, bank color scheme, and surface finish when selectedCard changes
  useEffect(() => {
    const objs = sceneObjectsRef.current;
    if (!objs) return;

    drawCardFaceCanvas(objs.faceCanvas, selectedCard, hideBalances, cardholderName);
    objs.faceTexture.needsUpdate = true;

    const bankTheme = BANK_THEMES[selectedCard.issuer] || BANK_THEMES.SBI;
    objs.coreMaterial.color.setHex(bankTheme.coreHex);
    objs.bezelMaterial.color.setHex(bankTheme.bezelHex);
    objs.shieldMat.color.setHex(bankTheme.shieldHex);
    objs.coilMat.color.setHex(bankTheme.coilHex);

    // Adjust PBR material finish (matte, metallic, or satin)
    if (selectedCard.finish === 'matte') {
      objs.coreMaterial.roughness = 0.56;
      objs.coreMaterial.metalness = 0.45;
      objs.coreMaterial.clearcoat = 0.08;
      objs.facePlaneMat.roughness = 0.62;
      objs.facePlaneMat.metalness = 0.12;
    } else if (selectedCard.finish === 'metallic') {
      objs.coreMaterial.roughness = 0.18;
      objs.coreMaterial.metalness = 0.92;
      objs.coreMaterial.clearcoat = 0.6;
      objs.facePlaneMat.roughness = 0.25;
      objs.facePlaneMat.metalness = 0.35;
    } else {
      // satin
      objs.coreMaterial.roughness = 0.32;
      objs.coreMaterial.metalness = 0.78;
      objs.coreMaterial.clearcoat = 0.32;
      objs.facePlaneMat.roughness = 0.38;
      objs.facePlaneMat.metalness = 0.24;
    }
    objs.coreMaterial.needsUpdate = true;
    objs.facePlaneMat.needsUpdate = true;
  }, [selectedCard, hideBalances, cardholderName]);

  // Keyboard shortcut 'H' to toggle control dock
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key.toLowerCase() === 'h') {
        setDockCollapsed((prev) => !prev);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  // Resize WebGLRenderer when toggling fullscreen
  useEffect(() => {
    const mount = canvasMountRef.current;
    const objs = sceneObjectsRef.current;
    if (!mount || !objs?.renderer || !objs?.camera) return;
    const handleResize = () => {
      const width = mount.clientWidth || 640;
      const height = mount.clientHeight || 360;
      objs.camera!.aspect = width / height;
      objs.camera!.updateProjectionMatrix();
      objs.renderer!.setSize(width, height);
    };
    const timer = setTimeout(handleResize, 30);
    return () => clearTimeout(timer);
  }, [isFullscreen, compact]);

  // Initialize Three.js WebGL scene once
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const isHeadless =
      navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);

    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080808);
    scene.fog = new THREE.FogExp2(0x080808, 0.045);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(2.85, 1.35, 4.95);
    camera.lookAt(0, 0.12, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isHeadless,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(width, height);

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Studio RoomEnvironment reflection map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const bumpTex = createSatinMicroTexture(maxAniso);

    // 3-Point Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4.5, 6.0, 5.0);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    const d = 4.2;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0xe5e5e5, 0x151515, 0.9);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const rimLight = new THREE.PointLight(0xffffff, 3.0, 18, 1.8);
    rimLight.position.set(-4.0, 2.2, -3.5);
    scene.add(rimLight);

    // =========================================================================
    // GROUNDED ARCHITECTURAL STUDIO PEDESTAL & CONTACT SHADOW
    // =========================================================================
    const floorY = -1.35;
    const plinthGroup = new THREE.Group();
    plinthGroup.position.set(0, floorY, 0);
    scene.add(plinthGroup);

    const plinthGeo = new THREE.CylinderGeometry(3.4, 3.7, 0.24, 48);
    plinthGeo.translate(0, -0.12, 0);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x151515,
      roughness: 0.78,
      metalness: 0.22,
    });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.receiveShadow = true;
    plinthGroup.add(plinthMesh);

    // Precision trim ring offset by +0.02 on Y
    const ringGeo = new THREE.RingGeometry(2.85, 2.92, 64);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xb8b8b8,
      roughness: 0.3,
      metalness: 0.8,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.02;
    plinthGroup.add(ringMesh);

    // Soft radial contact shadow disc directly beneath the card assembly
    const shadowTex = createRadialShadowTexture();
    const shadowGeo = new THREE.CircleGeometry(2.1, 32);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    const contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadowMesh.position.y = 0.015;
    plinthGroup.add(contactShadowMesh);

    // =========================================================================
    // INSTANCEDMESH: 28 ARCHITECTURAL CALIBRATION STUDS
    // =========================================================================
    const studCount = 28;
    const studGeo = new THREE.BoxGeometry(0.08, 0.06, 0.18);
    studGeo.translate(0, 0.03, 0);
    const studMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.85,
    });
    const instancedStuds = new THREE.InstancedMesh(studGeo, studMat, studCount);
    for (let i = 0; i < studCount; i++) {
      const angle = (i / studCount) * Math.PI * 2;
      const radius = 3.12;
      _dummyPos.set(Math.cos(angle) * radius, 0.005, Math.sin(angle) * radius);
      _dummyQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle + Math.PI / 2);
      const scaleVar = 0.88 + ((i * 7) % 5) * 0.06;
      _dummyScale.set(scaleVar, scaleVar, scaleVar);
      _dummyMatrix.compose(_dummyPos, _dummyQuat, _dummyScale);
      instancedStuds.setMatrixAt(i, _dummyMatrix);

      if (i % 7 === 0) {
        _dummyColor.setHex(0xffffff);
      } else {
        _dummyColor.setHex(0x404040);
      }
      instancedStuds.setColorAt(i, _dummyColor);
    }
    instancedStuds.instanceMatrix.needsUpdate = true;
    if (instancedStuds.instanceColor) instancedStuds.instanceColor.needsUpdate = true;
    instancedStuds.computeBoundingSphere();
    plinthGroup.add(instancedStuds);

    // =========================================================================
    // COMPOSITE PROCEDURAL 3D BANK CARD ASSEMBLY (NO CIRCULAR TOP-LEFT SYMBOL)
    // =========================================================================
    const cardGroup = new THREE.Group();
    cardGroup.position.set(0, 0.32, 0);
    scene.add(cardGroup);

    const cardW = 3.36;
    const cardH = 2.12;
    const cardR = 0.18;

    const initialBankTheme = BANK_THEMES[selectedCard.issuer] || BANK_THEMES.SBI;

    // Part 1: Primary Silhouette — Bank-Colored Core Plate
    const coreShape = createRoundedRectShape(cardW, cardH, cardR);
    const coreGeo = new THREE.ExtrudeGeometry(coreShape, {
      depth: 0.05,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015,
    });
    coreGeo.center();
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: initialBankTheme.coreHex,
      roughness: 0.32,
      metalness: 0.78,
      bumpMap: bumpTex,
      bumpScale: 0.002,
      clearcoat: 0.32,
      clearcoatRoughness: 0.2,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMaterial);
    coreMesh.castShadow = !isHeadless;
    coreMesh.receiveShadow = !isHeadless;
    cardGroup.add(coreMesh);

    // Part 2: Secondary Read — Precision Chamfered Outer Bezel Frame
    const outerFrameShape = createRoundedRectShape(cardW + 0.05, cardH + 0.05, cardR + 0.02);
    const innerHolePath = createRoundedRectShape(cardW - 0.08, cardH - 0.08, cardR - 0.03);
    outerFrameShape.holes.push(innerHolePath);
    const bezelGeo = new THREE.ExtrudeGeometry(outerFrameShape, {
      depth: 0.022,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.01,
      bevelThickness: 0.01,
    });
    bezelGeo.center();
    const bezelMaterial = new THREE.MeshStandardMaterial({
      color: initialBankTheme.bezelHex,
      roughness: 0.16,
      metalness: 0.92,
    });
    const bezelMesh = new THREE.Mesh(bezelGeo, bezelMaterial);
    bezelMesh.position.z = 0.032;
    cardGroup.add(bezelMesh);

    // Part 3: Dynamic High-Res Bank Card Face Layer
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 1024;
    faceCanvas.height = 640;
    drawCardFaceCanvas(faceCanvas, selectedCard, hideBalances, cardholderName);

    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;
    faceTexture.anisotropy = maxAniso;

    const facePlaneGeo = new THREE.PlaneGeometry(cardW - 0.1, cardH - 0.1);
    const facePlaneMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: faceTexture,
      roughness: 0.35,
      metalness: 0.24,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const facePlaneMesh = new THREE.Mesh(facePlaneGeo, facePlaneMat);
    facePlaneMesh.position.z = 0.044;
    cardGroup.add(facePlaneMesh);

    // Part 4: Secondary Read — Internal NFC Induction Coil (TubeGeometry)
    const coilPoints: THREE.Vector3[] = [];
    const loops = 3;
    for (let l = 0; l < loops; l++) {
      const inset = 0.22 + l * 0.07;
      const hw = cardW / 2 - inset;
      const hh = cardH / 2 - inset;
      coilPoints.push(
        new THREE.Vector3(-hw, -hh, 0),
        new THREE.Vector3(hw, -hh, 0),
        new THREE.Vector3(hw, hh, 0),
        new THREE.Vector3(-hw, hh, 0),
        new THREE.Vector3(-hw, -hh + 0.05, 0)
      );
    }
    const coilCurve = new THREE.CatmullRomCurve3(coilPoints, false, 'catmullrom', 0.08);
    const coilGeo = new THREE.TubeGeometry(coilCurve, 96, 0.014, 8, false);
    const coilMat = new THREE.MeshStandardMaterial({
      color: initialBankTheme.coilHex,
      roughness: 0.22,
      metalness: 0.92,
    });
    const nfcCoilMesh = new THREE.Mesh(coilGeo, coilMat);
    nfcCoilMesh.position.z = -0.01;
    cardGroup.add(nfcCoilMesh);

    // Part 5: Secondary Read — Internal Security Shield Core Layer
    const shieldShape = createRoundedRectShape(cardW - 0.32, cardH - 0.32, 0.1);
    const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, {
      depth: 0.012,
      bevelEnabled: false,
    });
    shieldGeo.center();
    const shieldMat = new THREE.MeshPhysicalMaterial({
      color: initialBankTheme.shieldHex,
      roughness: 0.52,
      metalness: 0.6,
      clearcoat: 1.0,
    });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    shieldMesh.position.z = -0.02;
    cardGroup.add(shieldMesh);

    // Part 6: Accent Detail — Clear Multi-Pad Metallic EMV Smart Chip on the Left Side
    const emvGroup = new THREE.Group();
    emvGroup.position.set(-1.05, 0.04, 0.055);
    cardGroup.add(emvGroup);

    const waferGeo = new THREE.BoxGeometry(0.48, 0.38, 0.012);
    const waferMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      roughness: 0.1,
      metalness: 0.85,
      clearcoat: 1.0,
    });
    const waferMesh = new THREE.Mesh(waferGeo, waferMat);
    waferMesh.position.z = -0.012;
    emvGroup.add(waferMesh);

    const padMat = new THREE.MeshStandardMaterial({
      color: 0xe6c687,
      roughness: 0.18,
      metalness: 0.94,
    });
    const padGeo = new THREE.BoxGeometry(0.135, 0.145, 0.014);
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const pad = new THREE.Mesh(padGeo, padMat);
        pad.position.set((col - 1) * 0.155, (row - 0.5) * 0.175, 0.005);
        emvGroup.add(pad);
      }
    }

    // Part 7: Back Magnetic Stripe & Security Signature Plate
    const backGroup = new THREE.Group();
    backGroup.position.set(0, 0, -0.048);
    cardGroup.add(backGroup);

    const magStripeGeo = new THREE.BoxGeometry(cardW - 0.06, 0.36, 0.01);
    const magStripeMat = new THREE.MeshStandardMaterial({
      color: 0x080808,
      roughness: 0.68,
      metalness: 0.12,
    });
    const magStripeMesh = new THREE.Mesh(magStripeGeo, magStripeMat);
    magStripeMesh.position.set(0, 0.52, 0);
    backGroup.add(magStripeMesh);

    const sigPlateGeo = new THREE.BoxGeometry(1.9, 0.26, 0.01);
    const sigPlateMat = new THREE.MeshStandardMaterial({
      color: 0x303030,
      roughness: 0.5,
      metalness: 0.4,
    });
    const sigPlateMesh = new THREE.Mesh(sigPlateGeo, sigPlateMat);
    sigPlateMesh.position.set(-0.5, 0.02, 0);
    backGroup.add(sigPlateMesh);

    sceneObjectsRef.current = {
      faceCanvas,
      faceTexture,
      facePlaneMat,
      coreMaterial,
      bezelMaterial,
      shieldMat,
      coilMat,
      keyLight,
      hemiLight,
      rimLight,
      renderer,
      camera,
    };

    renderer.compile(scene, camera);

    const domElem = renderer.domElement;
    const onPointerDown = (e: PointerEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.lastPointerX = e.clientX;
      stateRef.current.lastPointerY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;
      const dx = e.clientX - stateRef.current.lastPointerX;
      const dy = e.clientY - stateRef.current.lastPointerY;
      stateRef.current.lastPointerX = e.clientX;
      stateRef.current.lastPointerY = e.clientY;
      stateRef.current.userYawOffset += dx * 0.008;
      stateRef.current.userPitchOffset = THREE.MathUtils.clamp(
        stateRef.current.userPitchOffset + dy * 0.006,
        -0.6,
        0.6
      );
    };
    const onPointerUp = () => {
      stateRef.current.isDragging = false;
    };

    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const onWindowResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 640;
      const h = mount.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onWindowResize);

    // =========================================================================
    // LOSSLESS ANIMATION LOOP WITH EXPONENTIAL DAMPING
    // =========================================================================
    let lastTime = performance.now();
    let animFrameId = 0;
    let lastRenderTime = 0;

    const animate = (timestamp: number) => {
      animFrameId = requestAnimationFrame(animate);

      if (isHeadless && timestamp - lastRenderTime < 66) {
        return;
      }
      lastRenderTime = timestamp;

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const elapsed = now / 1000;

      stateRef.current.explodedCurrent = THREE.MathUtils.damp(
        stateRef.current.explodedCurrent,
        stateRef.current.explodedTarget,
        6,
        delta
      );
      const exp = stateRef.current.explodedCurrent;

      bezelMesh.position.set(-exp * 0.45, 0, 0.032 + exp * 0.85);
      facePlaneMesh.position.set(-exp * 0.22, 0, 0.044 + exp * 0.48);
      emvGroup.position.set(-1.05 - exp * 0.65, 0.04 + exp * 0.12, 0.055 + exp * 1.15);
      coreMesh.position.set(0, 0, 0);
      nfcCoilMesh.position.set(exp * 0.28, 0, -0.01 - exp * 0.52);
      shieldMesh.position.set(exp * 0.52, 0, -0.02 - exp * 0.88);
      backGroup.position.set(exp * 0.78, 0, -0.048 - exp * 1.22);

      const floatY = Math.sin(elapsed * 1.6) * 0.04;
      cardGroup.position.y = 0.32 + floatY;
      contactShadowMesh.scale.setScalar(1 - floatY * 0.4);

      const explodedShowcaseYaw = -exp * 0.52;
      const targetYaw =
        explodedShowcaseYaw +
        (stateRef.current.autoRotate ? Math.sin(elapsed * 0.55) * 0.24 : 0) +
        stateRef.current.userYawOffset;
      const targetPitch =
        exp * 0.12 +
        (stateRef.current.autoRotate ? Math.cos(elapsed * 0.45) * 0.06 : 0) +
        stateRef.current.userPitchOffset;

      cardGroup.rotation.y = THREE.MathUtils.damp(cardGroup.rotation.y, targetYaw, 6, delta);
      cardGroup.rotation.x = THREE.MathUtils.damp(cardGroup.rotation.x, targetPitch, 6, delta);

      const preset = stateRef.current.cameraPreset;
      if (preset === 'isometric') {
        _targetCamPos.set(2.85, 1.35, 4.95);
        _targetLookAt.set(0, 0.12, 0);
      } else if (preset === 'front') {
        _targetCamPos.set(0, 0.25, 5.25);
        _targetLookAt.set(0, 0.18, 0);
      } else if (preset === 'macro') {
        _targetCamPos.set(-0.85, 0.48, 2.55);
        _targetLookAt.set(-0.95, 0.28, 0.15);
      } else {
        _targetCamPos.set(-2.4, 0.95, -4.85);
        _targetLookAt.set(0, 0.12, 0);
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 5, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 5, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 5, delta);

      _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _targetLookAt.x, 6, delta);
      _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _targetLookAt.y, 6, delta);
      _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _targetLookAt.z, 6, delta);
      camera.lookAt(_currentLookAt);

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onWindowResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen bg-[#080808]'
          : `relative w-full ${
              compact ? 'h-[340px] sm:h-[380px]' : 'h-[460px] sm:h-[540px]'
            } rounded-2xl overflow-hidden bg-[#080808] border border-[#303030]`
      }
    >
      {/* Isolated WebGL Canvas Mount Container */}
      <div
        ref={canvasMountRef}
        data-testid="perq-3d-card-canvas"
        data-selected-issuer={selectedCard.issuer}
        data-selected-network={selectedCard.network}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Minimal Top-Left Spec Title & Top-Right Fullscreen Button */}
      <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="bg-[#151515]/95 border border-[#303030] rounded-lg px-3 py-1.5 pointer-events-auto">
          <span className="text-xs font-semibold text-[#FFFFFF] tracking-tight">
            {selectedCard.issuer} · {selectedCard.nickname} ({selectedCard.network} ••••{' '}
            {selectedCard.lastFour})
          </span>
          <span className="hidden sm:inline text-xs text-[#858585] ml-2">
            · {selectedCard.finish} finish · Drag to orbit
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsFullscreen((prev) => !prev)}
          aria-label={isFullscreen ? 'Exit Fullscreen 3D View' : 'Enter Fullscreen 3D View'}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#151515]/95 border border-[#303030] text-xs font-medium text-[#FFFFFF] hover:bg-[#252525] transition-colors cursor-pointer"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-[#FFFFFF]" />
              <span>Exit Cinema</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-[#FFFFFF]" />
              <span>3D Studio</span>
            </>
          )}
        </button>
      </div>

      {/* Unified Collapsible Bottom Control Dock (Solid / RGBA surface, zero backdrop-filter) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[96%] max-w-[960px] z-10 flex flex-col items-center pointer-events-none">
        <button
          type="button"
          onClick={() => setDockCollapsed((prev) => !prev)}
          aria-expanded={!dockCollapsed}
          aria-label={dockCollapsed ? 'Show 3D Controls' : 'Hide 3D Controls'}
          className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#151515] border border-b-0 border-[#303030] text-[11px] font-medium text-[#B8B8B8] hover:text-[#FFFFFF] transition-colors cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="pointer-events-auto w-full rounded-xl bg-[#151515]/95 border border-[#303030] px-3.5 py-2.5 shadow-xl flex flex-wrap items-center justify-between gap-2.5">
            {/* Dynamic Bank / Card Switcher */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-0.5 sm:pb-0">
              <span className="text-[11px] text-[#858585] mr-0.5 hidden xl:inline">Bank:</span>
              {cards.map((c) => {
                const shortBank = BANK_THEMES[c.issuer]?.shortLabel || c.issuer;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCard(c)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedCard.id === c.id
                        ? 'bg-[#FFFFFF] text-[#080808]'
                        : 'bg-[#080808] text-[#B8B8B8] hover:bg-[#252525] hover:text-[#FFFFFF] border border-[#303030]'
                    }`}
                  >
                    {shortBank} · {c.nickname}
                  </button>
                );
              })}
            </div>

            {/* Exploded View Slider & Quick Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExplodedPct((prev) => (prev > 0 ? 0 : 80))}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  explodedPct > 0
                    ? 'bg-[#FFFFFF] text-[#080808]'
                    : 'bg-[#080808] text-[#B8B8B8] hover:bg-[#252525] hover:text-[#FFFFFF] border border-[#303030]'
                }`}
              >
                <Layers className="w-3 h-3" aria-hidden="true" />
                <span>Explode</span>
              </button>
              <input
                id="exploded-view-slider"
                aria-label="Exploded view percentage"
                type="range"
                min={0}
                max={100}
                value={explodedPct}
                onChange={(e) => setExplodedPct(Number(e.target.value))}
                className="w-16 sm:w-20 accent-[#FFFFFF] cursor-pointer"
              />
              <span className="font-mono-tabular text-[11px] text-[#FFFFFF] w-8">
                {explodedPct}%
              </span>
            </div>

            {/* Camera Angle Presets */}
            <div className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-[#858585] mr-1 hidden sm:inline" aria-hidden="true" />
              {(
                [
                  { id: 'isometric', label: 'Iso' },
                  { id: 'front', label: 'Front' },
                  { id: 'macro', label: 'Chip' },
                  { id: 'back', label: 'Back' },
                ] as { id: CameraPreset; label: string }[]
              ).map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => setCameraPreset(cam.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cameraPreset === cam.id
                      ? 'bg-[#FFFFFF] text-[#080808] font-semibold'
                      : 'text-[#B8B8B8] hover:bg-[#252525] hover:text-[#FFFFFF]'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>

            {/* Lighting & Auto-Rotate */}
            <div className="flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-[#858585] hidden lg:inline" aria-hidden="true" />
              {(
                [
                  { id: 'studio', label: 'Studio' },
                  { id: 'contrast', label: 'Contrast' },
                  { id: 'soft', label: 'Soft' },
                ] as { id: LightingPreset; label: string }[]
              ).map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLightingPreset(l.id)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    lightingPreset === l.id
                      ? 'bg-[#FFFFFF] text-[#080808] font-semibold'
                      : 'text-[#B8B8B8] hover:bg-[#252525] hover:text-[#FFFFFF]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAutoRotate((prev) => !prev);
                  stateRef.current.userYawOffset = 0;
                  stateRef.current.userPitchOffset = 0;
                }}
                aria-label="Reset camera orbit and toggle motion"
                className={`p-1.5 rounded border transition-colors cursor-pointer ${
                  autoRotate
                    ? 'border-[#FFFFFF] text-[#080808] bg-[#FFFFFF]'
                    : 'border-[#303030] text-[#B8B8B8] hover:bg-[#252525] hover:text-[#FFFFFF]'
                }`}
                title="Toggle gentle rotation / Reset orbit"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
