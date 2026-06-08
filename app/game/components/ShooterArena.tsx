"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import type { LevelData, Bullet, Enemy, EnemyBullet, Explosion, Grenade, Obstacle, MapDecoration, WeaponType, AllyTank } from "../data";
import {
  ARENA_W,
  ARENA_H,
  PLAYER_SIZE,
  PLAYER_SPEED,
  BULLET_SPEED,
  BULLET_SIZE,
  ENEMY_SIZE,
  ENEMY_SPEED,
  ENEMIES_PER_WAVE,
  SHOOT_COOLDOWN,
  WEAPONS,
  ENEMY_TYPES,
  ENEMY_SHOOT_RANGE,
  FORTIFIED_ANCHOR_RANGE,
  ENEMY_BULLET_SIZE,
  TANK_BULLET_SIZE,
  ALLY_TANK_843,
  getWaveComposition,
  BOMB_AOE_RADIUS,
  BOMB_FLIGHT_FRAMES,
  BOMB_COOLDOWN,
} from "../data";

/* ═══════════════════════════════════════════════════════════════════ */
/*  SHOOTER ARENA — canvas top-down shooter with mouse aim             */
/* ═══════════════════════════════════════════════════════════════════ */

export default function ShooterArena({
  levelData,
  levelIndex,
  onWaveCleared,
  onAmmoEmpty,
  setHp,
  ammo,
  setAmmo,
  setScore,
  waveNum,
  weaponId,
  upgrades,
  bombs,
  setBombs,
  ownedWeapons,
  onWeaponSwitch,
  paused = false,
}: {
  levelData: LevelData;
  levelIndex: number;
  onWaveCleared: () => void;
  onAmmoEmpty: () => void;
  setHp: React.Dispatch<React.SetStateAction<number>>;
  ammo: number;
  setAmmo: React.Dispatch<React.SetStateAction<number>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  waveNum: number;
  weaponId: string;
  upgrades?: Record<string, number>;
  bombs: number;
  setBombs: React.Dispatch<React.SetStateAction<number>>;
  ownedWeapons: string[];
  onWeaponSwitch: (id: string) => void;
  paused?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: ARENA_W, h: ARENA_H });
  const sizeRef = useRef({ w: ARENA_W, h: ARENA_H });

  // Dynamically resize canvas to fill container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        // Use device pixel ratio 1 for pixel art crispness
        const w = Math.round(width);
        const h = Math.round(height);
        sizeRef.current = { w, h };
        setCanvasSize({ w, h });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const mouseRef = useRef({ x: sizeRef.current.w / 2, y: 0 });
  const mouseDownRef = useRef(false);
  const stateRef = useRef({
    player: { x: sizeRef.current.w / 2, y: sizeRef.current.h / 2 },
    aimAngle: -Math.PI / 2,
    bullets: [] as Bullet[],
    enemyBullets: [] as EnemyBullet[],
    enemies: [] as Enemy[],
    explosions: [] as Explosion[],
    keys: new Set<string>(),
    lastShot: 0,
    nextId: 0,
    waveCleared: false,
    spawnTimer: 0,
    spawned: 0,
    killed: 0,
    enemyCount: ENEMIES_PER_WAVE + waveNum * 2,
    frameId: 0,
    hitFlash: 0,
    spawnedByType: { soldier: 0, fortified: 0, tank: 0 },
    waveComposition: getWaveComposition(levelIndex, waveNum),
    allyTank: levelIndex === 0 ? {
      x: getRoadAxisX(),
      y: ALLY_TANK_843.startY,
      targetY: ALLY_TANK_843.targetY,
      speed: ALLY_TANK_843.speed,
      lastShot: Date.now(),
      shootCooldown: ALLY_TANK_843.shootCooldown,
      bulletSpeed: ALLY_TANK_843.bulletSpeed,
      active: true,
      width: ALLY_TANK_843.width,
      height: ALLY_TANK_843.height,
    } as AllyTank : null as AllyTank | null,
    gateBreached: false,
    // Screen shake
    shakeX: 0,
    shakeY: 0,
    shakeIntensity: 0,
    // Muzzle flash
    muzzleFlash: 0,
    // Floating damage numbers
    damageNumbers: [] as { id: number; x: number; y: number; text: string; color: string; frame: number }[],
    // Hit markers
    hitMarkers: [] as { id: number; x: number; y: number; frame: number }[],
    // Kill combo
    combo: 0,
    comboTimer: 0,
    comboDisplay: 0,
    // Grenades (bombs thrown by player)
    grenades: [] as Grenade[],
    lastBombTime: 0,
    particles: [] as {
      x: number;
      y: number;
      dx: number;
      dy: number;
      size: number;
      color: string;
      life: number;
      maxLife: number;
      type: "leaf" | "casing" | "spark" | "dust" | "splash" | "smoke";
    }[],
  });

  const ammoRef = useRef(ammo);
  ammoRef.current = ammo;

  const weaponRef = useRef(weaponId);
  weaponRef.current = weaponId;

  const upgradesRef = useRef(upgrades || {});
  upgradesRef.current = upgrades || {};

  const onAmmoEmptyRef = useRef(onAmmoEmpty);
  onAmmoEmptyRef.current = onAmmoEmpty;

  const bombsRef = useRef(bombs);
  bombsRef.current = bombs;

  const ownedWeaponsRef = useRef(ownedWeapons);
  ownedWeaponsRef.current = ownedWeapons;

  const onWeaponSwitchRef = useRef(onWeaponSwitch);
  onWeaponSwitchRef.current = onWeaponSwitch;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  function getLevelMapOffsetX() {
    if (levelIndex !== 0) return 0;
    const palace = levelData.map?.obstacles?.find((obs) => obs.type === "palace");
    if (!palace) return 0;
    return sizeRef.current.w / 2 - (palace.x + palace.w / 2);
  }

  function getRoadAxisX() {
    if (levelIndex === 0) return sizeRef.current.w / 2;
    return ALLY_TANK_843.startX + getLevelMapOffsetX();
  }

  const shoot = useCallback(() => {
    const s = stateRef.current;
    if (ammoRef.current <= 0) return;
    const now = Date.now();
    const u = upgradesRef.current;

    // Fire rate upgrade: reduce cooldown by 20% per stack
    const fireRateStacks = u["fire_rate"] || 0;
    const cooldown = SHOOT_COOLDOWN * Math.pow(0.8, fireRateStacks);
    if (now - s.lastShot < cooldown) return;
    s.lastShot = now;

    // Screen shake on shoot
    s.shakeIntensity = Math.max(s.shakeIntensity, 3);
    // Muzzle flash
    s.muzzleFlash = 4;

    // Bullet speed upgrade: +25% per stack
    const bsStacks = u["bullet_speed"] || 0;
    const weapon = WEAPONS.find(w => w.id === weaponRef.current) || WEAPONS[0];
    const speedMult = weapon.bulletSpeedMultiplier ?? 1.0;
    const bSpeed = BULLET_SPEED * (1 + bsStacks * 0.25) * speedMult;

    // Spread upgrade: wider angle per stack
    const spreadBonus = (u["spread_shot"] || 0) * 0.08;

    const baseAngle = s.aimAngle;

    const makeBullet = (angle: number): Bullet => ({
      id: s.nextId++,
      x: s.player.x,
      y: s.player.y,
      dx: Math.cos(angle) * bSpeed,
      dy: Math.sin(angle) * bSpeed,
      spawnX: s.player.x,
      spawnY: s.player.y,
      maxRange: weapon.maxRange,
      isRocket: weapon.isRocket,
      aoeRadius: weapon.aoeRadius,
    });

    if (weapon.id === "circle") {
      for (let i = 0; i < weapon.bulletCount; i++) {
        const angle = baseAngle + (i * Math.PI * 2) / weapon.bulletCount;
        s.bullets.push(makeBullet(angle));
      }
    } else {
      const spread = weapon.spreadAngle + spreadBonus;
      const totalSpread = spread * (weapon.bulletCount - 1);
      const startAngle = baseAngle - totalSpread / 2;
      for (let i = 0; i < weapon.bulletCount; i++) {
        const angle = weapon.bulletCount === 1
          ? baseAngle
          : startAngle + i * spread;
        s.bullets.push(makeBullet(angle));
      }
    }

    // Spawn brass shell casing particle
    const ejectAngle = baseAngle - Math.PI / 2 + (Math.random() - 0.5) * 0.35;
    const ejectSpeed = 1.8 + Math.random() * 1.5;
    s.particles.push({
      x: s.player.x,
      y: s.player.y,
      dx: Math.cos(ejectAngle) * ejectSpeed - Math.cos(baseAngle) * 1.2,
      dy: Math.sin(ejectAngle) * ejectSpeed - Math.sin(baseAngle) * 1.2,
      size: 2,
      color: "#d4af37",
      life: 0,
      maxLife: 40 + Math.random() * 20,
      type: "casing",
    });

    setAmmo((a) => {
      const next = a - 1;
      if (next <= 0 && !stateRef.current.waveCleared) {
        // Defer to avoid state update during render
        setTimeout(() => onAmmoEmptyRef.current(), 0);
      }
      return Math.max(0, next);
    });
  }, [setAmmo]);

  // keyboard + space to shoot
  useEffect(() => {
    const s = stateRef.current;
    s.player = { x: sizeRef.current.w / 2, y: sizeRef.current.h / 2 };
    s.aimAngle = -Math.PI / 2;
    s.bullets = [];
    s.enemyBullets = [];
    s.enemies = [];
    s.explosions = [];
    s.waveCleared = false;
    s.spawnTimer = 0;
    s.spawned = 0;
    s.killed = 0;
    s.hitFlash = 0;
    s.shakeX = 0;
    s.shakeY = 0;
    s.shakeIntensity = 0;
    s.muzzleFlash = 0;
    s.damageNumbers = [];
    s.hitMarkers = [];
    s.combo = 0;
    s.comboTimer = 0;
    s.comboDisplay = 0;
    s.grenades = [];
    s.lastBombTime = 0;
    s.gateBreached = false;
    s.particles = [];
    s.spawnedByType = { soldier: 0, fortified: 0, tank: 0 };
    s.waveComposition = getWaveComposition(levelIndex, waveNum);
    const comp = s.waveComposition;
    s.enemyCount = comp.soldiers + comp.fortified + comp.tanks;
    s.allyTank = levelIndex === 0 ? {
      x: getRoadAxisX(),
      y: ALLY_TANK_843.startY,
      targetY: ALLY_TANK_843.targetY,
      speed: ALLY_TANK_843.speed,
      lastShot: Date.now(),
      shootCooldown: ALLY_TANK_843.shootCooldown,
      bulletSpeed: ALLY_TANK_843.bulletSpeed,
      active: true,
      width: ALLY_TANK_843.width,
      height: ALLY_TANK_843.height,
    } : null;

    function handleKeyDown(e: KeyboardEvent) {
      s.keys.add(e.key);
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault();
      }

      // ---- Throw grenade (E key) ----
      if (e.key === "e" || e.key === "E") {
        if (bombsRef.current > 0 && Date.now() - s.lastBombTime >= BOMB_COOLDOWN) {
          s.lastBombTime = Date.now();
          setBombs((b) => b - 1);
          s.grenades.push({
            id: s.nextId++,
            startX: s.player.x,
            startY: s.player.y,
            targetX: mouseRef.current.x,
            targetY: mouseRef.current.y,
            frame: 0,
            maxFrame: BOMB_FLIGHT_FRAMES,
          });
        }
      }

      // ---- Weapon switch (Q to cycle) ----
      if (e.key === "q" || e.key === "Q") {
        const owned = ownedWeaponsRef.current;
        if (owned.length > 1) {
          const currentIdx = owned.indexOf(weaponRef.current);
          const nextIdx = (currentIdx + 1) % owned.length;
          onWeaponSwitchRef.current(owned[nextIdx]);
        }
      }

      // ---- Weapon switch (number keys 1-9) ----
      const numKey = parseInt(e.key);
      if (!isNaN(numKey) && numKey >= 1 && numKey <= 9) {
        const owned = ownedWeaponsRef.current;
        if (owned[numKey - 1]) {
          onWeaponSwitchRef.current(owned[numKey - 1]);
        }
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      s.keys.delete(e.key);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [waveNum, shoot, levelIndex]);

  // mouse tracking + click/hold to shoot (auto-fire)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function handleMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const scaleX = sizeRef.current.w / rect.width;
      const scaleY = sizeRef.current.h / rect.height;
      mouseRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
      const s = stateRef.current;
      s.aimAngle = Math.atan2(
        mouseRef.current.y - s.player.y,
        mouseRef.current.x - s.player.x
      );
    }
    function handleMouseDown() {
      mouseDownRef.current = true;
      shoot();
    }
    function handleMouseUp() {
      mouseDownRef.current = false;
    }

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);
    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [shoot]);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const s = stateRef.current;

    // Offscreen canvas for night lighting mask
    const maskCanvas = document.createElement("canvas");
    const maskCtx = maskCanvas.getContext("2d");

    const baseObstacles = levelData.map?.obstacles || [];
    const baseDecorations = levelData.map?.decorations || [];

    function getMapOffset() {
      return { x: getLevelMapOffsetX(), y: 0 };
    }

    function getFrontGateObstacle(mapObstacles: Obstacle[]): Obstacle | null {
      if (levelIndex !== 0 || s.gateBreached) return null;
      const gatePillars = mapObstacles
        .filter((obs) => obs.type === "gate")
        .sort((a, b) => a.x - b.x);
      if (gatePillars.length < 2) return null;
      const left = gatePillars[0];
      const right = gatePillars[1];
      const doorX = left.x + left.w;
      const doorW = right.x - doorX;
      const doorY = Math.min(left.y, right.y) + 6;
      const doorH = Math.min(left.h, right.h) - 6;
      if (doorW <= 0 || doorH <= 0) return null;
      return { x: doorX, y: doorY, w: doorW, h: doorH, type: "wall" };
    }

    function getMapObstacles(): Obstacle[] {
      const { x, y } = getMapOffset();
      const shifted = (x === 0 && y === 0)
        ? baseObstacles
        : baseObstacles.map((obs) => ({ ...obs, x: obs.x + x, y: obs.y + y }));
      const frontGate = getFrontGateObstacle(shifted);
      if (!frontGate) return shifted;
      return [...shifted, frontGate];
    }

    function getMapDecorations(): MapDecoration[] {
      const { x, y } = getMapOffset();
      if (x === 0 && y === 0) return baseDecorations;
      return baseDecorations.map((dec) => ({ ...dec, x: dec.x + x, y: dec.y + y }));
    }

    // Dynamic obstacles: includes ally tank bounding box for enemy collision
    function getDynamicObstacles(): Obstacle[] {
      const mapObstacles = getMapObstacles();
      const ally = s.allyTank;
      if (ally && ally.active) {
        return [...mapObstacles, {
          x: ally.x - ally.width / 2,
          y: ally.y - ally.height / 2,
          w: ally.width,
          h: ally.height,
          type: "tank" as const,
        }];
      }
      return mapObstacles;
    }

    function spawnEnemy() {
      const AW = sizeRef.current.w, AH = sizeRef.current.h;
      const comp = s.waveComposition;
      const st = s.spawnedByType;

      // Determine type to spawn (priority: fortified → tank → soldier)
      let etype: "soldier" | "fortified" | "tank";
      if (st.fortified < comp.fortified) {
        etype = "fortified";
      } else if (st.tank < comp.tanks) {
        etype = "tank";
      } else {
        etype = "soldier";
      }

      const config = ENEMY_TYPES[etype];
      let x = 0, y = 0;
      let anchorX: number | undefined;
      let anchorY: number | undefined;

      if (etype === "fortified") {
        // Spawn near a sandbag/bunker (defensive position)
        const defenseObs = getMapObstacles().filter(
          (o) => o.type === "sandbag" || o.type === "bunker"
        );
        if (defenseObs.length > 0) {
          const obs = defenseObs[Math.floor(Math.random() * defenseObs.length)];
          anchorX = obs.x + obs.w / 2;
          anchorY = obs.y + obs.h + config.size;
          x = anchorX;
          y = anchorY;
        } else {
          x = Math.random() * AW;
          y = -config.size;
        }
      } else {
        // Soldiers & tanks spawn from edges
        const side = Math.floor(Math.random() * 4);
        if (side === 0)      { x = Math.random() * AW; y = -config.size; }
        else if (side === 1) { x = Math.random() * AW; y = AH + config.size; }
        else if (side === 2) { x = -config.size;        y = Math.random() * AH; }
        else                 { x = AW + config.size;    y = Math.random() * AH; }
      }

      s.enemies.push({
        id: s.nextId++,
        x, y,
        hp: config.hp,
        type: etype,
        speed: config.speed,
        size: config.size,
        lastShot: Date.now() - Math.random() * config.shootCooldown,
        anchorX, anchorY,
        shootCooldown: config.shootCooldown,
        bulletSpeed: config.bulletSpeed,
      });
      st[etype]++;
      s.spawned++;
    }

    function drawPixelSoldier(cx: number, cy: number, angle: number) {
      const sz = PLAYER_SIZE;
      const half = sz / 2;

      // Walk cycle calculations
      const isMoving = s.keys.has("w") || s.keys.has("W") || s.keys.has("a") || s.keys.has("A") || 
                       s.keys.has("s") || s.keys.has("S") || s.keys.has("d") || s.keys.has("D") ||
                       s.keys.has("ArrowUp") || s.keys.has("ArrowDown") || s.keys.has("ArrowLeft") || s.keys.has("ArrowRight");
      const walkOffset = isMoving ? Math.sin(Date.now() * 0.015) * 3 : 0;
      const bodyBob = isMoving ? Math.abs(Math.sin(Date.now() * 0.015)) * 1.5 : 0;
      
      // Muzzle flash recoil offsets
      const recoil = s.muzzleFlash > 0 ? s.muzzleFlash * 1.5 : 0;

      ctx.save();
      ctx.translate(cx, cy);

      // Draw shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.ellipse(0, half - 2, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // === BỘ ĐỘI GIẢI PHÓNG (Vietnamese Liberation Soldier) ===

      // Pith helmet (mũ cối) - dome shape
      ctx.fillStyle = "#5A6D33";
      ctx.fillRect(-6, -half - 2 + bodyBob, 12, 4);
      // Helmet brim
      ctx.fillStyle = "#4A5D23";
      ctx.fillRect(-7, -half + 1 + bodyBob, 14, 2);
      // Red star on helmet
      ctx.fillStyle = "#DA251D";
      ctx.fillRect(-1, -half - 1 + bodyBob, 2, 2);

      // Face
      ctx.fillStyle = "#FFD5A0";
      ctx.fillRect(-4, -half + 3 + bodyBob, 8, 5);
      // Eyes
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(-2, -half + 5 + bodyBob, 2, 1);
      ctx.fillRect(1, -half + 5 + bodyBob, 2, 1);

      // Collar
      ctx.fillStyle = "#3a4d18";
      ctx.fillRect(-5, -half + 8 + bodyBob, 10, 1);

      // Body (olive green uniform)
      ctx.fillStyle = "#4A5D23";
      ctx.fillRect(-6, -half + 9 + bodyBob, 12, 7);
      // Pockets
      ctx.fillStyle = "#3a4d18";
      ctx.fillRect(-5, -half + 10 + bodyBob, 3, 2);
      ctx.fillRect(2, -half + 10 + bodyBob, 3, 2);
      // Belt
      ctx.fillStyle = "#5C4033";
      ctx.fillRect(-6, -half + 15 + bodyBob, 12, 2);
      ctx.fillStyle = "#8B7355";
      ctx.fillRect(-1, -half + 15 + bodyBob, 2, 2);

      // Legs (olive pants)
      ctx.fillStyle = "#3a4d18";
      ctx.fillRect(-5, -half + 17, 4, 3);
      ctx.fillRect(1, -half + 17, 4, 3);
      // Boots (alternate offsets to simulate steps)
      ctx.fillStyle = "#2a1a0a";
      ctx.fillRect(-5, -half + 19 + walkOffset, 4, 2);
      ctx.fillRect(1, -half + 19 - walkOffset, 4, 2);

      ctx.restore();

      // Gun body (AK-47 style wood stock + steel receiver)
      const gunAngle = angle;
      const gunRecoilX = Math.cos(gunAngle) * (half + 2 - recoil);
      const gunRecoilY = Math.sin(gunAngle) * (half + 2 - recoil);
      
      const gunX = cx + gunRecoilX;
      const gunY = cy + gunRecoilY + bodyBob;
      const muzzleX = cx + Math.cos(gunAngle) * (half + 14);
      const muzzleY = cy + Math.sin(gunAngle) * (half + 14) + bodyBob;

      // Wooden stock (dark brown)
      ctx.strokeStyle = "#5C4033";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(gunAngle) * (half - 3 - recoil), cy + Math.sin(gunAngle) * (half - 3 - recoil) + bodyBob);
      ctx.lineTo(gunX, gunY);
      ctx.stroke();

      // Steel body + barrel (black/steel grey)
      ctx.strokeStyle = "#252830";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(gunX, gunY);
      ctx.lineTo(muzzleX, muzzleY);
      ctx.stroke();

      // AK Curved Magazine (banana mag)
      ctx.strokeStyle = "#1b1d22";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const magAngle = gunAngle + 0.6;
      ctx.moveTo(gunX + Math.cos(gunAngle) * 3, gunY + Math.sin(gunAngle) * 3);
      ctx.quadraticCurveTo(
        gunX + Math.cos(magAngle) * 7,
        gunY + Math.sin(magAngle) * 7,
        gunX + Math.cos(magAngle) * 8 + Math.cos(gunAngle) * 1.5,
        gunY + Math.sin(magAngle) * 8 + Math.sin(gunAngle) * 1.5
      );
      ctx.stroke();

      // Barrel tip sights
      ctx.fillStyle = "#555";
      ctx.fillRect(muzzleX - 1, muzzleY - 1, 3, 3);
    }

    function drawEnemyByType(e: Enemy) {
      const p = stateRef.current.player;
      switch (e.type) {
        case "fortified":
          drawFortifiedEnemy(e, p);
          break;
        case "tank":
          drawTankEnemy(e, p);
          break;
        default:
          drawSoldierEnemy(e, p);
      }
      // HP bar for multi-HP enemies
      if (ENEMY_TYPES[e.type].hp > 1) {
        const maxHp = ENEMY_TYPES[e.type].hp;
        const barW = e.size + 4;
        const bx = e.x - barW / 2;
        const by = e.y - e.size / 2 - 8;
        ctx.fillStyle = "#333";
        ctx.fillRect(bx, by, barW, 3);
        const ratio = e.hp / maxHp;
        ctx.fillStyle = ratio > 0.5 ? "#44cc44" : ratio > 0.25 ? "#ccaa22" : "#cc2222";
        ctx.fillRect(bx, by, barW * ratio, 3);
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, barW, 3);
      }
    }

    function drawSoldierEnemy(e: Enemy, p: { x: number; y: number }) {
      const half = e.size / 2;
      const ec = levelData.enemyColor;
      const angle = Math.atan2(p.y - e.y, p.x - e.x);

      // Walk cycle and bobbing animation
      const walkOffset = Math.sin(Date.now() * 0.012 + e.id) * 2.5;
      const bodyBob = Math.abs(Math.sin(Date.now() * 0.012 + e.id)) * 1.2;

      ctx.save();
      ctx.translate(e.x, e.y);

      // Draw shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.ellipse(0, half - 2, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Helmet
      ctx.fillStyle = "#444";
      ctx.fillRect(-5, -half - 3 + bodyBob, 10, 3);
      ctx.fillRect(-6, -half + bodyBob, 12, 2);
      // Face
      ctx.fillStyle = "#ddb896";
      ctx.fillRect(-4, -half + 2 + bodyBob, 8, 4);
      // Eyes
      ctx.fillStyle = "#cc0000";
      ctx.fillRect(-3, -half + 3 + bodyBob, 2, 1);
      ctx.fillRect(1, -half + 3 + bodyBob, 2, 1);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(-2, -half + 4 + bodyBob, 1, 1);
      ctx.fillRect(2, -half + 4 + bodyBob, 1, 1);
      // Body
      ctx.fillStyle = ec;
      ctx.fillRect(-5, -half + 6 + bodyBob, 10, 8);
      ctx.fillStyle = "#4a3520";
      ctx.fillRect(-5, -half + 13 + bodyBob, 10, 1);
      // Legs & boots
      ctx.fillStyle = ec;
      ctx.fillRect(-4, -half + 14, 3, 3);
      ctx.fillRect(1, -half + 14, 3, 3);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(-4, -half + 16 + walkOffset, 3, 2);
      ctx.fillRect(1, -half + 16 - walkOffset, 3, 2);

      ctx.restore();

      // Rifle body (M16 style black receiver)
      const gunAngle = angle;
      const gunX = e.x + Math.cos(gunAngle) * (half + 1);
      const gunY = e.y + Math.sin(gunAngle) * (half + 1) + bodyBob;
      const muzzleX = e.x + Math.cos(gunAngle) * (half + 12);
      const muzzleY = e.y + Math.sin(gunAngle) * (half + 12) + bodyBob;

      ctx.strokeStyle = "#1a1a1e";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(e.x + Math.cos(gunAngle) * (half - 2), e.y + Math.sin(gunAngle) * (half - 2) + bodyBob);
      ctx.lineTo(gunX, gunY);
      ctx.stroke();

      // Barrel (thin black line)
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gunX, gunY);
      ctx.lineTo(muzzleX, muzzleY);
      ctx.stroke();

      // Straight magazine (M16 20-round mag)
      ctx.strokeStyle = "#252528";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const magAngle = gunAngle + 0.5;
      ctx.moveTo(gunX + Math.cos(gunAngle) * 2, gunY + Math.sin(gunAngle) * 2);
      ctx.lineTo(gunX + Math.cos(magAngle) * 6, gunY + Math.sin(magAngle) * 6);
      ctx.stroke();
    }

    function drawFortifiedEnemy(e: Enemy, p: { x: number; y: number }) {
      const half = e.size / 2;
      const ec = levelData.enemyColor;
      const angle = Math.atan2(p.y - e.y, p.x - e.x);

      // Walk cycle and bobbing animation
      const walkOffset = Math.sin(Date.now() * 0.009 + e.id) * 2;
      const bodyBob = Math.abs(Math.sin(Date.now() * 0.009 + e.id)) * 1.0;

      ctx.save();
      ctx.translate(e.x, e.y);

      // Draw shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.ellipse(0, half - 2, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Heavier helmet with chin strap
      ctx.fillStyle = "#333";
      ctx.fillRect(-6, -half - 4 + bodyBob, 12, 4);
      ctx.fillRect(-7, -half + bodyBob, 14, 3);
      // Face (partially covered)
      ctx.fillStyle = "#ddb896";
      ctx.fillRect(-4, -half + 3 + bodyBob, 8, 3);
      // Focused eyes
      ctx.fillStyle = "#cc0000";
      ctx.fillRect(-3, -half + 4 + bodyBob, 2, 1);
      ctx.fillRect(1, -half + 4 + bodyBob, 2, 1);
      // Body with ammo vest
      ctx.fillStyle = ec;
      ctx.fillRect(-5, -half + 6 + bodyBob, 10, 8);
      ctx.fillStyle = "#3a3520";
      ctx.fillRect(-5, -half + 7 + bodyBob, 10, 3);
      // Belt
      ctx.fillStyle = "#4a3520";
      ctx.fillRect(-5, -half + 13 + bodyBob, 10, 1);
      // Legs & boots
      ctx.fillStyle = ec;
      ctx.fillRect(-4, -half + 14, 3, 3);
      ctx.fillRect(1, -half + 14, 3, 3);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(-4, -half + 16 + walkOffset, 3, 2);
      ctx.fillRect(1, -half + 16 - walkOffset, 3, 2);

      ctx.restore();

      // LMG/Heavy rifle (M60 style)
      const gunAngle = angle;
      const gunX = e.x + Math.cos(gunAngle) * (half + 2);
      const gunY = e.y + Math.sin(gunAngle) * (half + 2) + bodyBob;
      const muzzleX = e.x + Math.cos(gunAngle) * (half + 15);
      const muzzleY = e.y + Math.sin(gunAngle) * (half + 15) + bodyBob;

      // Heavy stock and receiver (dark steel)
      ctx.strokeStyle = "#1a1a1d";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(e.x + Math.cos(gunAngle) * (half - 3), e.y + Math.sin(gunAngle) * (half - 3) + bodyBob);
      ctx.lineTo(gunX, gunY);
      ctx.stroke();

      // Long heavy barrel
      ctx.strokeStyle = "#252528";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(gunX, gunY);
      ctx.lineTo(muzzleX, muzzleY);
      ctx.stroke();

      // Ammo belt / Box mag sticking out
      ctx.fillStyle = "#c29d38"; // brass bullets gold
      ctx.fillRect(gunX - Math.sin(gunAngle) * 3, gunY + Math.cos(gunAngle) * 3, 3, 3);
      ctx.fillStyle = "#2c341b"; // green box
      ctx.fillRect(gunX - Math.sin(gunAngle) * 5, gunY + Math.cos(gunAngle) * 5, 4, 4);

      // Bipod folded at the end of barrel
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(muzzleX - Math.cos(gunAngle) * 3, muzzleY - Math.sin(gunAngle) * 3);
      ctx.lineTo(muzzleX - Math.cos(gunAngle) * 1 - Math.sin(gunAngle) * 2, muzzleY - Math.sin(gunAngle) * 1 + Math.cos(gunAngle) * 2);
      ctx.moveTo(muzzleX - Math.cos(gunAngle) * 3, muzzleY - Math.sin(gunAngle) * 3);
      ctx.lineTo(muzzleX - Math.cos(gunAngle) * 1 + Math.sin(gunAngle) * 2, muzzleY - Math.sin(gunAngle) * 1 - Math.cos(gunAngle) * 2);
      ctx.stroke();
    }

    function drawTankEnemy(e: Enemy, p: { x: number; y: number }) {
      const half = e.size / 2;
      const angle = Math.atan2(p.y - e.y, p.x - e.x);

      const timeSinceShot = Date.now() - e.lastShot;
      const recoilOffset = timeSinceShot < 200 ? Math.max(0, (1.0 - timeSinceShot / 200) * 5) : 0;
      const rockOffset = timeSinceShot < 200 ? Math.sin(timeSinceShot * 0.06) * 1.2 : 0;

      ctx.save();
      ctx.translate(e.x, e.y + rockOffset);

      // Draw shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.beginPath();
      ctx.ellipse(0, half - 3, half * 1.15, half * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tracks
      ctx.fillStyle = "#252528";
      ctx.fillRect(-half, half - 10, e.size, 10);
      ctx.fillStyle = "#151518";
      ctx.fillRect(-half - 2, half - 12, e.size + 4, 3);
      
      // Animated wheels
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-half + 5 + i * ((e.size - 10) / 3), half - 5, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hull (ARVN Steel Grey / Olive Drab hybrid)
      ctx.fillStyle = "#5c6258";
      ctx.fillRect(-half + 4, -4, e.size - 8, 14);
      ctx.fillStyle = "#464a43";
      ctx.fillRect(-half + 2, 6, e.size - 4, 4);

      // Camouflage stripes (yellowish desert/jungle pattern)
      ctx.fillStyle = "#70684c";
      ctx.fillRect(-half + 6, -2, 6, 8);
      ctx.fillRect(half - 12, 2, 5, 6);

      // Turret
      ctx.fillStyle = "#697065";
      ctx.beginPath();
      ctx.ellipse(0, -6, 9, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#535950";
      ctx.beginPath();
      ctx.ellipse(2, -4, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // ARVN markings (yellow stripes or letters)
      ctx.fillStyle = "#ffcc00";
      ctx.font = "bold 5px monospace";
      ctx.textAlign = "center";
      ctx.fillText("ARVN", 0, -5);

      ctx.restore();

      // Barrel pointing at player
      const barrelLen = 22 - recoilOffset;
      const bx = e.x + Math.cos(angle) * 2;
      const by = e.y - 6 + Math.sin(angle) * 2 + rockOffset;
      const bex = e.x + Math.cos(angle) * (2 + barrelLen);
      const bey = e.y - 6 + Math.sin(angle) * (2 + barrelLen) + rockOffset;

      ctx.strokeStyle = "#464a43";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bex, bey);
      ctx.stroke();

      // Muzzle tip
      ctx.fillStyle = "#2d302b";
      ctx.fillRect(
        bex - Math.cos(angle) * 1.5 - 1.5,
        bey - Math.sin(angle) * 1.5 - 1.5,
        3, 3
      );

      // Muzzle flash when shooting
      if (timeSinceShot < 80) {
        const mfx = bex + Math.cos(angle) * 4;
        const mfy = bey + Math.sin(angle) * 4;
        const grad = ctx.createRadialGradient(mfx, mfy, 1, mfx, mfy, 10);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.3, "#ffcc00");
        grad.addColorStop(1, "rgba(255, 50, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mfx, mfy, 10, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawExplosion(ex: number, ey: number, frame: number, scale: number = 1) {
      const colors = ["#ffffff", "#FFD700", "#FF6600", "#FF2222"];
      
      // 1. Draw expanding shockwave ring
      const ringRadius = frame * 10 * scale;
      ctx.strokeStyle = "#FF8800";
      ctx.lineWidth = Math.max(1, 4 - frame * 0.6) * scale;
      ctx.globalAlpha = Math.max(0, 0.8 - frame / 6);
      ctx.beginPath();
      ctx.arc(ex, ey, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Draw central hot flash core
      if (frame < 3) {
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 1 - frame / 3;
        ctx.beginPath();
        ctx.arc(ex, ey, (12 - frame * 3) * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw expanding particle pieces (pixel blocks)
      ctx.globalAlpha = Math.max(0, 1 - frame / 6);
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12 + Math.sin(i * 123) * 0.2;
        const speedMult = 0.6 + (Math.sin(i * 456) + 1) * 0.4;
        const dist = frame * 7 * scale * speedMult;
        const px = ex + Math.cos(angle) * dist;
        const py = ey + Math.sin(angle) * dist;
        const sz = Math.max(1.5, (4 - frame * 0.5) * scale);
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
      }

      // 4. Lingering smoke clouds (expanding and rising)
      if (frame > 2) {
        ctx.fillStyle = "rgba(90, 90, 90, 0.28)";
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI * 2) / 6 + Math.cos(i * 357) * 0.35;
          const dist = frame * 4.2 * scale;
          const sx = ex + Math.cos(angle) * dist;
          const sy = ey + Math.sin(angle) * dist - (frame - 2) * 1.6;
          const sz = (8 + (frame - 2) * 3.8) * scale;
          
          ctx.globalAlpha = Math.max(0, 0.26 - (frame - 2) / 15);
          ctx.beginPath();
          ctx.arc(sx, sy, sz, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1.0;
    }

    function drawGround() {
      const AW = sizeRef.current.w, AH = sizeRef.current.h;
      ctx.fillStyle = levelData.bg;
      ctx.fillRect(0, 0, AW, AH);

      const map = levelData.map;
      const terrain = map?.terrain || "jungle";

      // Terrain-specific ground patterns
      if (terrain === "jungle" || terrain === "highland") {
        // Grass patches
        ctx.fillStyle = levelData.groundColor + "40";
        const seed = waveNum * 7;
        for (let i = 0; i < 24; i++) {
          const bx = ((seed + i * 37) * 97) % AW;
          const by = ((seed + i * 53) * 73) % AH;
          ctx.fillRect(bx, by, 6 + (i % 4) * 2, 4 + (i % 3) * 2);
        }
        // Dirt paths
        ctx.strokeStyle = levelData.groundColor + "25";
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.moveTo(0, AH * 0.4);
        ctx.quadraticCurveTo(AW * 0.3, AH * 0.3, AW * 0.6, AH * 0.5);
        ctx.quadraticCurveTo(AW * 0.8, AH * 0.65, AW, AH * 0.6);
        ctx.stroke();
      } else if (terrain === "urban") {
        const roadAxisX = levelIndex === 0 ? AW / 2 : AW * 0.3;
        // Road grid
        ctx.fillStyle = "#2a2a3a";
        ctx.fillRect(roadAxisX - 15, 0, 30, AH);
        ctx.fillRect(0, AH * 0.45 - 15, AW, 30);
        // Road markings
        ctx.strokeStyle = "#4a4a5a";
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 12]);
        ctx.beginPath();
        ctx.moveTo(roadAxisX, 0);
        ctx.lineTo(roadAxisX, AH);
        ctx.moveTo(0, AH * 0.45);
        ctx.lineTo(AW, AH * 0.45);
        ctx.stroke();
        ctx.setLineDash([]);
        // Rubble
        ctx.fillStyle = levelData.groundColor + "20";
        for (let i = 0; i < 12; i++) {
          const rx = ((waveNum * 11 + i * 61) * 43) % AW;
          const ry = ((waveNum * 13 + i * 47) * 67) % AH;
          ctx.fillRect(rx, ry, 4 + (i % 3) * 3, 3 + (i % 2) * 2);
        }
      } else if (terrain === "mountain") {
        // Rocky terrain
        ctx.fillStyle = levelData.groundColor + "30";
        for (let i = 0; i < 20; i++) {
          const rx = ((waveNum * 19 + i * 41) * 89) % AW;
          const ry = ((waveNum * 23 + i * 59) * 71) % AH;
          const rw = 8 + (i % 5) * 4;
          const rh = 6 + (i % 4) * 3;
          ctx.fillRect(rx, ry, rw, rh);
        }
        // Mountain ridges in background
        ctx.fillStyle = levelData.groundColor + "15";
        ctx.beginPath();
        ctx.moveTo(0, 60);
        ctx.lineTo(120, 20);
        ctx.lineTo(250, 50);
        ctx.lineTo(400, 15);
        ctx.lineTo(550, 45);
        ctx.lineTo(AW, 25);
        ctx.lineTo(AW, 80);
        ctx.lineTo(0, 80);
        ctx.fill();
      } else if (terrain === "rice_field" || terrain === "delta") {
        // Paddy lines
        ctx.strokeStyle = levelData.groundColor + "30";
        ctx.lineWidth = 1;
        for (let y = 0; y < AH; y += 20) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          for (let x = 0; x < AW; x += 40) {
            ctx.lineTo(x + 20, y + (Math.sin(x * 0.02 + waveNum) * 3));
            ctx.lineTo(x + 40, y);
          }
          ctx.stroke();
        }
      } else if (terrain === "coast") {
        // Water edge
        ctx.fillStyle = "#1a3d5c";
        ctx.fillRect(0, AH - 60, AW, 60);
        ctx.fillStyle = "#1a4a6c";
        for (let x = 0; x < AW; x += 30) {
          const wy = AH - 60 + Math.sin(x * 0.05 + Date.now() * 0.002) * 4;
          ctx.fillRect(x, wy, 20, 3);
        }
      }

      // Grid overlay (always, subtle)
      ctx.strokeStyle = levelData.groundColor + "12";
      ctx.lineWidth = 1;
      for (let x = 0; x < AW; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, AH);
        ctx.stroke();
      }
      for (let y = 0; y < AH; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(AW, y);
        ctx.stroke();
      }
    }

    function drawObstacle(obs: Obstacle) {
      // Draw flat pixel drop shadow for standing obstacles
      if (obs.type !== "crater" && obs.type !== "trench" && obs.type !== "wire") {
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        if (obs.type === "palace") {
          ctx.fillRect(obs.x + 4, obs.y + 10 + 4, obs.w, obs.h - 10);
        } else if (obs.type === "sandbag" || obs.type === "wall" || obs.type === "bunker" || obs.type === "vehicle" || obs.type === "tank") {
          ctx.fillRect(obs.x + 3, obs.y + 3, obs.w, obs.h);
        } else if (obs.type === "barrel") {
          ctx.fillRect(obs.x + 4 + 2, obs.y + 2, obs.w - 8, obs.h);
        }
      }

      switch (obs.type) {
        case "sandbag": {
          ctx.fillStyle = "#9C8E4E";
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          
          // Draw individual sandbag textures
          const bagW = 14;
          const rows = Math.ceil(obs.h / 8);
          const cols = Math.ceil(obs.w / bagW);
          for (let r = 0; r < rows; r++) {
            const y = obs.y + r * 8;
            const h = Math.min(8, obs.y + obs.h - y);
            const xOffset = (r % 2) * (bagW / 2);
            for (let c = -1; c <= cols; c++) {
              const x = obs.x + c * bagW + xOffset;
              if (x + bagW <= obs.x || x >= obs.x + obs.w) continue;
              const drawX = Math.max(obs.x, x);
              const drawW = Math.min(x + bagW, obs.x + obs.w) - drawX;
              
              // Base bag color with slight randomness
              ctx.fillStyle = (r + c) % 3 === 0 ? "#A39454" : (r + c) % 3 === 1 ? "#958646" : "#8E7F3F";
              ctx.fillRect(drawX, y, drawW, h);
              
              // Shadow underneath each bag
              ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
              ctx.fillRect(drawX, y + h - 1.5, drawW, 1.5);
              
              // Highlight on top of each bag
              ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
              ctx.fillRect(drawX, y, drawW, 1.5);
              
              // Stitching lines / creases
              ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
              ctx.fillRect(x + bagW - 1, y, 1, h);
            }
          }
          
          // Outer dark borders
          ctx.strokeStyle = "#50461C";
          ctx.lineWidth = 1.2;
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
          break;
        }

        case "crater": {
          const cx = obs.x + obs.w / 2;
          const cy = obs.y + obs.h / 2;
          const rx = obs.w / 2;
          const ry = obs.h / 2;

          // Scorched/burned outer rim
          ctx.fillStyle = "rgba(10, 8, 5, 0.4)";
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx * 1.3, ry * 1.3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Outer crater mound
          ctx.fillStyle = "#362b1d";
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();

          // Inner deep crater hole
          ctx.fillStyle = "#16120b";
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx * 0.7, ry * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();

          // Cracked blast lines
          ctx.strokeStyle = "rgba(0,0,0,0.4)";
          ctx.lineWidth = 2;
          for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8 + Math.sin(i * 99) * 0.2;
            const innerDist = rx * 0.5;
            const outerDist = rx * (1.1 + Math.abs(Math.sin(i * 123)) * 0.3);
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * innerDist, cy + Math.sin(angle) * innerDist);
            ctx.lineTo(cx + Math.cos(angle) * outerDist, cy + Math.sin(angle) * outerDist);
            ctx.stroke();
          }

          // Scattered ash/gravel chunks
          ctx.fillStyle = "#5c4d3c";
          for (let i = 0; i < 6; i++) {
            const gx = cx + Math.cos(i * 2.3) * (rx * 0.8);
            const gy = cy + Math.sin(i * 2.3) * (ry * 0.8);
            ctx.fillRect(gx - 2, gy - 2, 3, 3);
          }
          break;
        }

        case "trench":
          ctx.fillStyle = "#2a2010";
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.fillStyle = "#3a3015";
          ctx.fillRect(obs.x, obs.y, obs.w, 3);
          ctx.fillRect(obs.x, obs.y + obs.h - 3, obs.w, 3);
          ctx.strokeStyle = "#4a401a";
          ctx.lineWidth = 1;
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
          break;

        case "tank":
          // Destroyed tank body (rusty scrap steel camo)
          ctx.fillStyle = "#3e382b";
          ctx.fillRect(obs.x, obs.y + 15, obs.w, obs.h - 15);
          // Highlight panel
          ctx.fillStyle = "#5c5240";
          ctx.fillRect(obs.x + 2, obs.y + 15, obs.w - 4, 3);
          // Turret
          ctx.fillStyle = "#2d281e";
          ctx.fillRect(obs.x + 10, obs.y + 5, obs.w - 20, 20);
          // Barrel (rusty bent)
          ctx.fillStyle = "#1e1a12";
          ctx.fillRect(obs.x + obs.w - 5, obs.y + 12, 22, 4);
          // Tracks
          ctx.fillStyle = "#161614";
          ctx.fillRect(obs.x - 2, obs.y + obs.h - 8, obs.w + 4, 8);
          // Damage cracks/bullet marks
          ctx.fillStyle = "#0c0d0a";
          ctx.fillRect(obs.x + 14, obs.y + 20, 6, 6);
          ctx.fillRect(obs.x + 28, obs.y + 24, 4, 4);
          
          // Spawn rising black smoke particles occasionally
          if (Math.random() < 0.04) {
            s.particles.push({
              x: obs.x + obs.w / 2 + (Math.random() - 0.5) * 8,
              y: obs.y + 6,
              dx: -0.1 - Math.random() * 0.4,
              dy: -0.7 - Math.random() * 0.6,
              size: 5 + Math.random() * 5,
              color: "rgba(50, 50, 50, 0.35)",
              life: 0,
              maxLife: 70 + Math.random() * 30,
              type: "smoke",
            });
          }
          break;

        case "wall":
          // Front gate (closed) at Dinh level before tank ram
          if (levelIndex === 0 && !s.gateBreached && obs.w >= 120 && obs.h <= 30 && obs.y < 180) {
            ctx.fillStyle = "#2f3238";
            ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
            ctx.strokeStyle = "#555b66";
            ctx.lineWidth = 2;
            ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
            ctx.strokeStyle = "#7a818d";
            ctx.lineWidth = 1;
            for (let i = 6; i < obs.w; i += 8) {
              ctx.beginPath();
              ctx.moveTo(obs.x + i, obs.y + 2);
              ctx.lineTo(obs.x + i, obs.y + obs.h - 2);
              ctx.stroke();
            }
            ctx.strokeStyle = "#6a707a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y + obs.h / 2);
            ctx.lineTo(obs.x + obs.w, obs.y + obs.h / 2);
            ctx.stroke();
            break;
          }
          ctx.fillStyle = "#4a4040";
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          // Brick pattern
          ctx.strokeStyle = "#3a3030";
          ctx.lineWidth = 1;
          for (let row = 0; row < obs.h; row += 8) {
            const offset = (row / 8) % 2 === 0 ? 0 : 8;
            for (let col = offset; col < obs.w; col += 16) {
              ctx.strokeRect(obs.x + col, obs.y + row, 16, 8);
            }
          }
          // Damage
          ctx.fillStyle = "#2a2020";
          ctx.fillRect(obs.x + obs.w * 0.3, obs.y, obs.w * 0.15, obs.h * 0.4);
          break;

        case "bunker": {
          const bx = obs.x, by = obs.y, bw = obs.w, bh = obs.h;
          
          // Concrete wall (camou patterns)
          ctx.fillStyle = "#4B4B42";
          ctx.fillRect(bx, by + 12, bw, bh - 12);
          
          // Camouflage stripes
          ctx.fillStyle = "#383B30";
          ctx.fillRect(bx + bw * 0.15, by + 12, bw * 0.25, bh - 12);
          ctx.fillRect(bx + bw * 0.6, by + 12, bw * 0.2, bh - 12);
          
          // Shadow/Crease lines on concrete blocks
          ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
          ctx.fillRect(bx, by + 12, bw, 2);
          ctx.fillRect(bx, by + bh - 3, bw, 3);
          ctx.fillRect(bx + bw / 2 - 1, by + 12, 2, bh - 12);

          // Roof (camou concrete slab)
          ctx.fillStyle = "#5C5C52";
          ctx.beginPath();
          ctx.moveTo(bx - 6, by + 12);
          ctx.lineTo(bx + bw / 2, by);
          ctx.lineTo(bx + bw + 6, by + 12);
          ctx.fill();

          // Camouflage on roof
          ctx.fillStyle = "#444838";
          ctx.beginPath();
          ctx.moveTo(bx + bw * 0.2, by + 12 - (12 * 0.8));
          ctx.lineTo(bx + bw / 2, by);
          ctx.lineTo(bx + bw * 0.5, by + 12);
          ctx.fill();

          // Roof slab edge thickness
          ctx.fillStyle = "#3A3A35";
          ctx.beginPath();
          ctx.moveTo(bx - 6, by + 12);
          ctx.lineTo(bx + bw + 6, by + 12);
          ctx.lineTo(bx + bw + 4, by + 14);
          ctx.lineTo(bx - 4, by + 14);
          ctx.fill();

          // Gun slit opening (dark void)
          ctx.fillStyle = "#0D0D0D";
          ctx.fillRect(bx + bw * 0.25, by + bh * 0.42, bw * 0.5, bh * 0.28);
          
          // Steel embrasure shield inside slit
          ctx.strokeStyle = "#252525";
          ctx.lineWidth = 2;
          ctx.strokeRect(bx + bw * 0.25, by + bh * 0.42, bw * 0.5, bh * 0.28);
          
          // Concrete cracks/bullet chips
          ctx.strokeStyle = "rgba(0,0,0,0.3)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(bx + 12, by + bh - 8);
          ctx.lineTo(bx + 16, by + bh - 14);
          ctx.lineTo(bx + 14, by + bh - 18);
          ctx.stroke();
          break;
        }

        case "barrel": {
          const bx = obs.x + 4;
          const bw = obs.w - 8;
          const by = obs.y;
          const bh = obs.h;

          // Metal cylinder base
          ctx.fillStyle = "#7E8E76";
          ctx.fillRect(bx, by, bw, bh);

          // Highlights & Shadows for cylinder 3D feel
          const grad = ctx.createLinearGradient(bx, by, bx + bw, by);
          grad.addColorStop(0, "rgba(0, 0, 0, 0.45)");
          grad.addColorStop(0.25, "rgba(0, 0, 0, 0.1)");
          grad.addColorStop(0.5, "rgba(255, 255, 255, 0.25)");
          grad.addColorStop(0.75, "rgba(255, 255, 255, 0.05)");
          grad.addColorStop(1, "rgba(0, 0, 0, 0.55)");
          ctx.fillStyle = grad;
          ctx.fillRect(bx, by, bw, bh);

          // Rusted spots
          ctx.fillStyle = "rgba(139, 69, 19, 0.4)";
          ctx.fillRect(bx + bw * 0.2, by + bh * 0.3, 4, 3);
          ctx.fillRect(bx + bw * 0.65, by + bh * 0.6, 3, 4);

          // Ridges (metal bands)
          ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
          ctx.fillRect(bx, by + 4, bw, 2);
          ctx.fillRect(bx, by + bh - 6, bw, 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
          ctx.fillRect(bx, by + 3, bw, 1);
          ctx.fillRect(bx, by + bh - 7, bw, 1);

          // Top rim lid
          ctx.fillStyle = "#5E6E56";
          ctx.fillRect(bx - 1, by - 1, bw + 2, 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
          ctx.fillRect(bx, by - 1, bw * 0.4, 1);
          break;
        }

        case "wire": {
          // Posts
          ctx.fillStyle = "#5A4533"; // wooden post color
          const postW = 4;
          const drawPost = (px: number) => {
            // Draw wooden post
            ctx.fillRect(px, obs.y - 4, postW, obs.h + 8);
            // Post wood details/grain
            ctx.fillStyle = "#413224";
            ctx.fillRect(px + 1, obs.y - 4, 1, obs.h + 8);
            // Post cap shadow
            ctx.fillStyle = "#2D2218";
            ctx.fillRect(px, obs.y - 4, postW, 2);
            ctx.fillStyle = "#5A4533";
          };
          drawPost(obs.x);
          drawPost(obs.x + obs.w - postW);
          drawPost(obs.x + obs.w / 2 - postW / 2);

          // Barbed wire strands
          ctx.strokeStyle = "#7D8C99";
          ctx.lineWidth = 1.2;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            for (let x = obs.x; x < obs.x + obs.w; x += 4) {
              const yOff = Math.sin((x + i * 25) * 0.25) * 4 + i * 5;
              if (x === obs.x) ctx.moveTo(x, obs.y + yOff);
              else ctx.lineTo(x, obs.y + yOff);
            }
            ctx.stroke();

            // Draw barbs (spikes) along the wave
            ctx.fillStyle = "#9EB0C2";
            for (let x = obs.x + 6; x < obs.x + obs.w - 6; x += 15) {
              const yOff = Math.sin((x + i * 25) * 0.25) * 4 + i * 5;
              // Tiny crossing diagonals for spikes
              ctx.fillRect(x - 1, obs.y + yOff - 2, 2, 4);
              ctx.fillRect(x - 2, obs.y + yOff - 1, 4, 2);
            }
          }
          break;
        }

        case "palace": {
          // Dinh Độc Lập — main building
          const px = obs.x, py = obs.y, pw = obs.w, ph = obs.h;
          
          // Base building with subtle vertical grooves
          ctx.fillStyle = "#ebdcc5";
          ctx.fillRect(px, py + 10, pw, ph - 10);
          
          // Detailed wall grooves (columns of Dinh Độc Lập architecture)
          ctx.fillStyle = "#d5c6b0";
          for (let colX = px + 10; colX < px + pw - 10; colX += 20) {
            ctx.fillRect(colX, py + 10, 2, ph - 10);
          }

          // Roof/top floor
          ctx.fillStyle = "#d4c8b0";
          ctx.fillRect(px + 20, py, pw - 40, 15);
          // Roof panels detailing
          ctx.fillStyle = "#baa888";
          ctx.fillRect(px - 6, py + 8, pw + 12, 4);
          ctx.fillRect(px + 16, py - 2, pw - 32, 2);

          // Windows (grid with inner glow/reflection)
          const winW = 11, winH = 9, gap = 18;
          for (let row = 0; row < 2; row++) {
            for (let col = 0; col < Math.floor((pw - 30) / gap); col++) {
              const wx = px + 22 + col * gap;
              const wy = py + 18 + row * 22;
              
              // Dark blue glass base
              ctx.fillStyle = "#2d4a68";
              ctx.fillRect(wx, wy, winW, winH);
              
              // Light blue glass highlight reflection
              ctx.fillStyle = "#4a7ba8";
              ctx.fillRect(wx, wy, winW - 3, 2);
              ctx.fillRect(wx, wy + 2, 2, winH - 2);

              // Faint warm interior lights in windows
              ctx.fillStyle = "rgba(255, 215, 0, 0.15)";
              ctx.fillRect(wx + winW - 4, wy + winH - 4, 3, 3);
            }
          }

          // Main entrance door
          ctx.fillStyle = "#4d2e14";
          ctx.fillRect(px + pw / 2 - 14, py + ph - 25, 28, 25);
          // Golden metal handles / trim
          ctx.fillStyle = "#c29d38";
          ctx.fillRect(px + pw / 2 - 1.5, py + ph - 16, 3, 8);
          // Dark door shadow slit
          ctx.fillStyle = "#2a1505";
          ctx.fillRect(px + pw / 2 - 0.5, py + ph - 25, 1, 25);

          // Grand Pillars (White concrete)
          ctx.fillStyle = "#f5ebd8";
          ctx.fillRect(px + pw / 2 - 34, py + 12, 6, ph - 12);
          ctx.fillRect(px + pw / 2 + 28, py + 12, 6, ph - 12);
          // Pillar shading
          ctx.fillStyle = "#dccdb5";
          ctx.fillRect(px + pw / 2 - 30, py + 12, 2, ph - 12);
          ctx.fillRect(px + pw / 2 + 32, py + 12, 2, ph - 12);

          // Grand balcony rail above entrance
          ctx.fillStyle = "#8c7c66";
          ctx.fillRect(px + pw / 2 - 38, py + ph - 28, 76, 3);

          // Flag pole on top
          ctx.fillStyle = "#94a3b8"; // steel grey pole
          ctx.fillRect(px + pw / 2 - 1, py - 18, 2, 21);
          // Gold pole tip ball
          ctx.fillStyle = "#FFD700";
          ctx.fillRect(px + pw / 2 - 2, py - 20, 4, 2);

          // Realistic waving Vietnamese flag (sine wave animated flag)
          const ft = Date.now() * 0.012;
          const flagX = px + pw / 2 + 1;
          const flagY = py - 18;
          const flagW = 20;
          const flagH = 12;

          ctx.fillStyle = "#DA251D";
          ctx.beginPath();
          ctx.moveTo(flagX, flagY);
          
          // Draw waving top edge
          for (let dx = 0; dx <= flagW; dx += 2) {
            const dy = Math.sin(ft + dx * 0.25) * 1.5;
            ctx.lineTo(flagX + dx, flagY + dy);
          }
          // Draw right wave edge
          const finalTopWaveY = flagY + Math.sin(ft + flagW * 0.25) * 1.5;
          ctx.lineTo(flagX + flagW, finalTopWaveY + flagH);
          
          // Draw waving bottom edge
          for (let dx = flagW; dx >= 0; dx -= 2) {
            const dy = Math.sin(ft + dx * 0.25) * 1.5;
            ctx.lineTo(flagX + dx, flagY + flagH + dy);
          }
          ctx.closePath();
          ctx.fill();

          // Draw waving gold star in the center of the flag
          ctx.fillStyle = "#FFD700";
          const starX = flagX + flagW / 2 - 1.5;
          const starY = flagY + flagH / 2 - 1.5 + Math.sin(ft + (flagW / 2) * 0.25) * 1.5;
          // Render a crisp pixel star
          ctx.fillRect(starX, starY, 3, 3);
          ctx.fillRect(starX + 1, starY - 1, 1, 5);
          ctx.fillRect(starX - 1, starY + 1, 5, 1);

          // Under-building shadow on grass
          ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
          ctx.fillRect(px, py + ph, pw, 8);
          break;
        }

        case "gate": {
          // Trụ cổng Dinh Độc Lập
          const gx = obs.x, gy = obs.y, gw = obs.w, gh = obs.h;
          // Pillar
          ctx.fillStyle = "#d4c8b0";
          ctx.fillRect(gx, gy, gw, gh);
          // Pillar cap
          ctx.fillStyle = "#baa888";
          ctx.fillRect(gx - 2, gy, gw + 4, 5);
          ctx.fillRect(gx - 2, gy + gh - 3, gw + 4, 3);
          // Iron fence sections extending from gate
          ctx.strokeStyle = "#444";
          ctx.lineWidth = 2;
          for (let i = 0; i < 5; i++) {
            const fenceX = gx + gw + 4 + i * 6;
            ctx.beginPath();
            ctx.moveTo(fenceX, gy + 5);
            ctx.lineTo(fenceX, gy + gh);
            ctx.stroke();
          }
          // Top rail
          ctx.strokeStyle = "#555";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(gx + gw, gy + 5);
          ctx.lineTo(gx + gw + 34, gy + 5);
          ctx.stroke();
          break;
        }

        case "vehicle": {
          const vx = obs.x, vy = obs.y, vw = obs.w, vh = obs.h;
          
          // Shadow
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillRect(vx + 2, vy + vh - 4, vw - 4, 6);

          // Wheels (burnt tires)
          ctx.fillStyle = "#161618";
          ctx.fillRect(vx + 6, vy + vh - 6, 8, 6);
          ctx.fillRect(vx + vw - 14, vy + vh - 6, 8, 6);
          // Wheel hubs (rust metal)
          ctx.fillStyle = "#5A3A24";
          ctx.fillRect(vx + 9, vy + vh - 4, 2, 2);
          ctx.fillRect(vx + vw - 11, vy + vh - 4, 2, 2);

          // Chassis/Cab (rusty dark green/brown wreckage)
          ctx.fillStyle = "#3B3D35";
          ctx.fillRect(vx + 4, vy + vh * 0.4, vw - 8, vh * 0.6);
          
          // Camouflage rusted spots
          ctx.fillStyle = "#5A412A";
          ctx.fillRect(vx + 8, vy + vh * 0.45, 6, 4);
          ctx.fillRect(vx + vw - 16, vy + vh * 0.5, 8, 5);

          // Engine hood (front)
          ctx.fillStyle = "#2D3028";
          ctx.fillRect(vx + 2, vy + vh * 0.55, vw * 0.38, vh * 0.3);

          // Windshield frame (bent iron)
          ctx.strokeStyle = "#2A2A2E";
          ctx.lineWidth = 2;
          ctx.strokeRect(vx + vw * 0.36, vy + vh * 0.22, 1, vh * 0.2);
          ctx.strokeRect(vx + vw * 0.72, vy + vh * 0.22, 1, vh * 0.2);
          ctx.beginPath();
          ctx.moveTo(vx + vw * 0.36, vy + vh * 0.22);
          ctx.lineTo(vx + vw * 0.72, vy + vh * 0.22);
          ctx.stroke();

          // Bullet holes
          ctx.fillStyle = "#0A0A0A";
          ctx.fillRect(vx + vw * 0.5, vy + vh * 0.5, 2, 2);
          ctx.fillRect(vx + vw * 0.75, vy + vh * 0.6, 2, 2);
          ctx.fillRect(vx + 12, vy + vh * 0.65, 2, 2);

          // Wreckage details (headlights - broken)
          ctx.fillStyle = "#6A757D";
          ctx.fillRect(vx + 2, vy + vh * 0.65, 2, 2);

          // Smoke puff particles spawned from wreckage
          if (Math.random() < 0.04) {
            s.particles.push({
              x: vx + vw * 0.4 + (Math.random() - 0.5) * 6,
              y: vy + vh * 0.3,
              dx: -0.2 - Math.random() * 0.4,
              dy: -0.8 - Math.random() * 0.6,
              size: 4 + Math.random() * 4,
              color: "rgba(70, 70, 70, 0.35)",
              life: 0,
              maxLife: 60 + Math.random() * 30,
              type: "smoke",
            });
          }
          break;
        }
      }
    }

    function drawDecoration(dec: MapDecoration) {
      switch (dec.type) {
        case "fire": {
          const t = Date.now() * 0.005;
          const colors = ["#FF3D00", "#FF9100", "#FFEA00", "#FF2200"];
          
          // Spawn flickering ember sparks occasionally
          if (Math.random() < 0.12) {
            s.particles.push({
              x: dec.x + (Math.random() - 0.5) * 8,
              y: dec.y - 4,
              dx: (Math.random() - 0.5) * 0.8,
              dy: -0.6 - Math.random() * 0.8,
              size: 1 + Math.random() * 2,
              color: colors[Math.floor(Math.random() * colors.length)],
              life: 0,
              maxLife: 20 + Math.random() * 15,
              type: "spark",
            });
          }

          // Volumetric flame layers
          for (let i = 0; i < 6; i++) {
            const fx = dec.x + Math.sin(t + i * 1.2) * 3.5;
            const fy = dec.y - i * 2.8 + Math.sin(t * 1.5 + i) * 1.5;
            const sz = 5.5 - i * 0.7;
            ctx.fillStyle = colors[i % colors.length];
            ctx.globalAlpha = 0.8 - i * 0.1;
            ctx.fillRect(fx - sz / 2, fy - sz / 2, sz, sz);
          }
          ctx.globalAlpha = 1;

          // Warm fire base glow
          ctx.fillStyle = "rgba(255, 102, 0, 0.12)";
          ctx.beginPath();
          ctx.arc(dec.x, dec.y - 5, 14, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case "smoke": {
          // Spawn smoke particle occasionally
          if (Math.random() < 0.08) {
            s.particles.push({
              x: dec.x + (Math.random() - 0.5) * 6,
              y: dec.y,
              dx: (Math.random() - 0.5) * 0.2,
              dy: -0.3 - Math.random() * 0.5,
              size: 3.5 + Math.random() * 3,
              color: "rgba(85, 85, 85, 0.25)",
              life: 0,
              maxLife: 60 + Math.random() * 30,
              type: "smoke",
            });
          }

          const st = Date.now() * 0.002;
          for (let i = 0; i < 4; i++) {
            const sx = dec.x + Math.sin(st + i * 1.5) * 5;
            const sy = dec.y - i * 7 - (st * 8 + i * 4) % 30;
            const sz = 5 + i * 2.5;
            ctx.fillStyle = "#444444";
            ctx.globalAlpha = 0.18 - i * 0.03;
            ctx.beginPath();
            ctx.arc(sx, sy, sz, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          break;
        }

        case "flag": {
          // Pole
          ctx.fillStyle = "#8a8a8a";
          ctx.fillRect(dec.x, dec.y - 32, 2.5, 38);
          // Gold finial top
          ctx.fillStyle = "#ffd54f";
          ctx.beginPath();
          ctx.arc(dec.x + 1.25, dec.y - 32, 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Flag wave drawing (sine wave offsets)
          const ft = Date.now() * 0.005;
          ctx.fillStyle = "#DA251D";
          const flagH = 14;
          const flagW = 22;
          ctx.beginPath();
          ctx.moveTo(dec.x + 2.5, dec.y - 30);
          for (let px = 0; px <= flagW; px++) {
            const wave = Math.sin(ft + px * 0.25) * 2.2;
            ctx.lineTo(dec.x + 2.5 + px, dec.y - 30 + wave);
          }
          for (let px = flagW; px >= 0; px--) {
            const wave = Math.sin(ft + px * 0.25) * 2.2;
            ctx.lineTo(dec.x + 2.5 + px, dec.y - 30 + flagH + wave);
          }
          ctx.closePath();
          ctx.fill();

          // Star in the middle of the wave
          ctx.save();
          const starX = dec.x + 2.5 + flagW / 2;
          const starWave = Math.sin(ft + (flagW / 2) * 0.25) * 2.2;
          const starY = dec.y - 30 + flagH / 2 + starWave;
          ctx.translate(starX, starY);
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 3.5, -Math.sin((18 + i * 72) * Math.PI / 180) * 3.5);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 1.5, -Math.sin((54 + i * 72) * Math.PI / 180) * 1.5);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
        }

        case "debris":
          ctx.fillStyle = "#2a2a22";
          ctx.fillRect(dec.x, dec.y, 12, 4);
          ctx.fillRect(dec.x + 3, dec.y - 3, 6, 3);
          ctx.fillStyle = "#3e3e34";
          ctx.fillRect(dec.x + 8, dec.y + 2, 8, 3);
          ctx.fillRect(dec.x - 2, dec.y + 4, 5, 2);
          // Highlight edge
          ctx.fillStyle = "#5a5a4d";
          ctx.fillRect(dec.x, dec.y, 12, 1);
          ctx.fillRect(dec.x + 8, dec.y + 2, 8, 1);
          break;

        case "tree_stump":
          ctx.fillStyle = "#42301c";
          ctx.fillRect(dec.x - 5, dec.y, 10, 8);
          ctx.fillStyle = "#352616";
          ctx.beginPath();
          ctx.arc(dec.x, dec.y, 7, Math.PI, 0);
          ctx.fill();
          // Rings
          ctx.strokeStyle = "#5a4228";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(dec.x, dec.y, 4, Math.PI, 0);
          ctx.stroke();
          // bark cracks
          ctx.fillStyle = "#1e150c";
          ctx.fillRect(dec.x - 4, dec.y + 3, 1, 5);
          ctx.fillRect(dec.x + 3, dec.y + 2, 1, 6);
          break;

        case "shell_casing":
          ctx.fillStyle = "#8a7a30";
          ctx.fillRect(dec.x, dec.y, 3, 6);
          ctx.fillRect(dec.x + 5, dec.y + 2, 3, 6);
          ctx.fillRect(dec.x + 2, dec.y + 6, 3, 6);
          ctx.fillStyle = "#9a8a40";
          ctx.fillRect(dec.x + 8, dec.y + 5, 2, 5);
          break;

        case "tank_active": {
          // Xe tăng T-54 số 843 — active, tiến về phía Dinh Độc Lập
          const tx = dec.x, ty = dec.y;
          const tt = Date.now() * 0.001;

          // Tracks
          ctx.fillStyle = "#1e1e13";
          ctx.fillRect(tx - 22, ty + 8, 44, 12);
          ctx.fillRect(tx - 24, ty + 6, 48, 4);

          // Track wheels
          ctx.fillStyle = "#2c2c1e";
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(tx - 18 + i * 9, ty + 14, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          // Hull
          ctx.fillStyle = "#3b4822";
          ctx.fillRect(tx - 18, ty - 2, 36, 12);
          ctx.fillStyle = "#2c3619";
          ctx.fillRect(tx - 20, ty + 4, 40, 6);

          // Camouflage stripes
          ctx.fillStyle = "#4a5d30";
          ctx.fillRect(tx - 12, ty - 2, 8, 12);
          ctx.fillRect(tx + 4, ty + 4, 8, 6);

          // Turret
          ctx.fillStyle = "#455428";
          ctx.fillRect(tx - 10, ty - 8, 20, 10);
          ctx.fillStyle = "#333f1e";
          ctx.fillRect(tx - 8, ty - 6, 16, 6);

          // Barrel (pointing up/forward)
          ctx.fillStyle = "#2f3b1b";
          ctx.fillRect(tx - 2, ty - 22, 4, 16);
          ctx.fillStyle = "#1e2611";
          ctx.fillRect(tx - 2.5, ty - 24, 5, 3);

          // Number 843
          ctx.fillStyle = "#FFD700";
          ctx.font = "bold 6px monospace";
          ctx.fillText("843", tx - 9, ty + 3);

          // Red star on turret
          ctx.fillStyle = "#DA251D";
          ctx.fillRect(tx - 2, ty - 5, 4, 3);

          // Exhaust smoke
          ctx.fillStyle = "rgba(85, 85, 85, 0.25)";
          ctx.beginPath();
          ctx.arc(tx, ty + 22 + Math.sin(tt) * 2, 5 + Math.sin(tt * 2) * 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }
    }

    function drawAllyTank843() {
      const ally = s.allyTank;
      if (!ally || !ally.active) return;

      const tx = ally.x, ty = ally.y;
      const now = Date.now();

      // Find nearest enemy for barrel direction
      let barrelAngle = -Math.PI / 2; // default: point up
      if (s.enemies.length > 0) {
        let nearest = s.enemies[0];
        let nd = Infinity;
        for (const e of s.enemies) {
          if (e.hp <= 0) continue;
          const d = Math.sqrt((e.x - tx) ** 2 + (e.y - ty) ** 2);
          if (d < nd) { nd = d; nearest = e; }
        }
        if (nd < Infinity) {
          barrelAngle = Math.atan2(nearest.y - ty, nearest.x - tx);
        }
      }

      // Calculate recoil kickback and rocking
      const timeSinceShot = now - ally.lastShot;
      const recoilProgress = Math.max(0, 1 - timeSinceShot / 220); // 220ms duration
      const recoilOffset = Math.sin(recoilProgress * Math.PI) * 5.0; // barrel push back
      const chassisRock = Math.sin(recoilProgress * Math.PI) * 2.0;  // chassis rocks backward/vibrates

      // Track offset for track link animation
      const isMoving = !s.gateBreached && (ty > ally.targetY);
      const trackOffset = isMoving ? (now * 0.08) % 12 : 0;

      ctx.save();
      // Apply rocking/vibration translation
      ctx.translate(tx, ty + chassisRock);

      // Left and Right treads
      ctx.fillStyle = "#1e1e13";
      ctx.fillRect(-22, -18, 6, 36);
      ctx.fillRect(16, -18, 6, 36);

      // Track link patterns
      ctx.strokeStyle = "#3e3e2d";
      ctx.lineWidth = 1.5;
      for (let offset = -18; offset <= 18; offset += 6) {
        const linkY = offset + (isMoving ? trackOffset % 6 : 0);
        if (linkY > 18 || linkY < -18) continue;
        // Left
        ctx.beginPath();
        ctx.moveTo(-22, linkY);
        ctx.lineTo(-16, linkY);
        ctx.stroke();
        // Right
        ctx.beginPath();
        ctx.moveTo(16, linkY);
        ctx.lineTo(22, linkY);
        ctx.stroke();
      }

      // Track wheels (animated rotation spokes)
      ctx.fillStyle = "#2c2c1e";
      ctx.strokeStyle = "#0e0e09";
      ctx.lineWidth = 1;
      const numWheels = 5;
      for (let i = 0; i < numWheels; i++) {
        const wheelY = -14 + i * 7.5;
        // Draw Left Wheels
        ctx.beginPath();
        ctx.arc(-19, wheelY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        const wheelAngle = isMoving ? (now * 0.05) : 0;
        ctx.beginPath();
        ctx.moveTo(-19, wheelY);
        ctx.lineTo(-19 + Math.cos(wheelAngle) * 2.5, wheelY + Math.sin(wheelAngle) * 2.5);
        ctx.stroke();

        // Draw Right Wheels
        ctx.beginPath();
        ctx.arc(19, wheelY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(19, wheelY);
        ctx.lineTo(19 + Math.cos(wheelAngle) * 2.5, wheelY + Math.sin(wheelAngle) * 2.5);
        ctx.stroke();
      }

      // Chassis/Hull (Olive/Forest green camo)
      ctx.fillStyle = "#3b4822";
      ctx.fillRect(-16, -14, 32, 28);

      // Camouflage stripes
      ctx.fillStyle = "#4a5d30";
      ctx.fillRect(-10, -10, 8, 20);
      ctx.fillRect(4, -8, 8, 12);
      ctx.fillStyle = "#6d6e35";
      ctx.fillRect(-14, 2, 8, 8);
      ctx.fillRect(6, 6, 8, 6);

      // Front and rear mudguards
      ctx.fillStyle = "#222a14";
      ctx.fillRect(-22, -20, 6, 2);
      ctx.fillRect(16, -20, 6, 2);
      ctx.fillRect(-22, 18, 6, 2);
      ctx.fillRect(16, 18, 6, 2);

      // Red star on hull front
      ctx.fillStyle = "#DA251D";
      ctx.beginPath();
      ctx.arc(0, -10, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(-0.5, -10.5, 1, 1);

      // Turret
      ctx.save();
      ctx.rotate(barrelAngle + Math.PI / 2);
      
      ctx.fillStyle = "#455428";
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#2f3b1b";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Hatch and armor details
      ctx.fillStyle = "#222a14";
      ctx.beginPath();
      ctx.arc(-4, -1, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(4, -1, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Golden "843" on the turret sides
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 6px monospace";
      ctx.fillText("843", -5, 3);

      // Barrel (with recoil offset)
      const barrelLen = 22;
      ctx.fillStyle = "#2f3b1b";
      ctx.fillRect(-2, -barrelLen + recoilOffset, 4, barrelLen);
      ctx.fillStyle = "#1e2611";
      ctx.fillRect(-2.5, -barrelLen * 0.6 + recoilOffset, 5, 3);
      ctx.fillRect(-2.5, -barrelLen + recoilOffset, 5, 2); // Tip muzzle brake

      ctx.restore();
      ctx.restore();

      // Ally glow outline
      ctx.strokeStyle = "#FFD70030";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(tx - ally.width / 2 - 2, ty - ally.height / 2 - 2, ally.width + 4, ally.height + 4);
    }

    function drawWeather() {
      const AW = sizeRef.current.w, AH = sizeRef.current.h;
      const weather = levelData.map?.weather;
      if (!weather || weather === "clear") return;

      if (weather === "rain") {
        ctx.strokeStyle = "rgba(136, 170, 204, 0.28)";
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 65; i++) {
          const rx = (Date.now() * 0.35 + i * 83) % AW;
          const ry = (Date.now() * 0.85 + i * 59) % AH;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 2.5, ry + 10);
          ctx.stroke();
        }
      } else if (weather === "fog") {
        for (let i = 0; i < 5; i++) {
          // Horizontal drift speed varies per layer
          const speed = 0.015 + i * 0.01;
          const drift = (Date.now() * speed) % (AW + 300) - 150;
          const fy = 40 + i * (AH / 5) + Math.sin(Date.now() * 0.001 + i) * 15;
          
          // Draw soft misty cloud
          const grad = ctx.createRadialGradient(drift, fy, 20, drift, fy, 160);
          grad.addColorStop(0, "rgba(225, 235, 245, 0.15)");
          grad.addColorStop(0.5, "rgba(225, 235, 245, 0.06)");
          grad.addColorStop(1, "rgba(225, 235, 245, 0)");
          
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.ellipse(drift, fy, 220, 50, Math.PI * 0.02 * Math.sin(Date.now() * 0.0005 + i), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (weather === "night") {
        const p = s.player;
        if (maskCanvas.width !== AW || maskCanvas.height !== AH) {
          maskCanvas.width = AW;
          maskCanvas.height = AH;
        }

        if (maskCtx) {
          maskCtx.clearRect(0, 0, AW, AH);
          // Dark ambient overlay
          maskCtx.fillStyle = "rgba(4, 4, 18, 0.88)";
          maskCtx.fillRect(0, 0, AW, AH);

          // Set composition to erase dark areas
          maskCtx.globalCompositeOperation = "destination-out";

          // 1. Flashlight on Player
          const playerRadius = 88 + Math.sin(Date.now() * 0.0035) * 5;
          const playerGrad = maskCtx.createRadialGradient(p.x, p.y, 8, p.x, p.y, playerRadius);
          playerGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
          playerGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.55)");
          playerGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          maskCtx.fillStyle = playerGrad;
          maskCtx.beginPath();
          maskCtx.arc(p.x, p.y, playerRadius, 0, Math.PI * 2);
          maskCtx.fill();

          // 2. Bullets glow
          for (const b of s.bullets) {
            const bRadius = b.isRocket ? 35 : 18;
            const bGrad = maskCtx.createRadialGradient(b.x, b.y, 2, b.x, b.y, bRadius);
            bGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
            bGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
            maskCtx.fillStyle = bGrad;
            maskCtx.beginPath();
            maskCtx.arc(b.x, b.y, bRadius, 0, Math.PI * 2);
            maskCtx.fill();
          }

          // 3. Enemy bullets glow
          for (const b of s.enemyBullets) {
            const bRadius = b.fromTank ? 28 : 14;
            const bGrad = maskCtx.createRadialGradient(b.x, b.y, 2, b.x, b.y, bRadius);
            bGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
            bGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
            maskCtx.fillStyle = bGrad;
            maskCtx.beginPath();
            maskCtx.arc(b.x, b.y, bRadius, 0, Math.PI * 2);
            maskCtx.fill();
          }

          // 4. Grenades in flight
          for (const g of s.grenades) {
            const t = g.frame / g.maxFrame;
            const gx = g.startX + (g.targetX - g.startX) * t;
            const groundY = g.startY + (g.targetY - g.startY) * t;
            const arcH = Math.min(120, Math.sqrt((g.targetX - g.startX) ** 2 + (g.targetY - g.startY) ** 2) * 0.4);
            const gy = groundY - Math.sin(t * Math.PI) * arcH;

            const gGrad = maskCtx.createRadialGradient(gx, gy, 2, gx, gy, 28);
            gGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
            gGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
            maskCtx.fillStyle = gGrad;
            maskCtx.beginPath();
            maskCtx.arc(gx, gy, 28, 0, Math.PI * 2);
            maskCtx.fill();
          }

          // 5. Active Fires
          const decs = getMapDecorations();
          for (const dec of decs) {
            if (dec.type === "fire") {
              const fireRadius = 55 + Math.sin(Date.now() * 0.01 + dec.x) * 6;
              const fireGrad = maskCtx.createRadialGradient(dec.x, dec.y - 6, 4, dec.x, dec.y - 6, fireRadius);
              fireGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
              fireGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.45)");
              fireGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
              maskCtx.fillStyle = fireGrad;
              maskCtx.beginPath();
              maskCtx.arc(dec.x, dec.y - 6, fireRadius, 0, Math.PI * 2);
              maskCtx.fill();
            }
          }

          // 6. Explosions
          for (const ex of s.explosions) {
            const expRadius = (ex.scale ?? 1.0) * (22 + ex.frame * 13);
            const expGrad = maskCtx.createRadialGradient(ex.x, ex.y, 4, ex.x, ex.y, expRadius);
            expGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
            expGrad.addColorStop(0.6, "rgba(255, 255, 255, 0.6)");
            expGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
            maskCtx.fillStyle = expGrad;
            maskCtx.beginPath();
            maskCtx.arc(ex.x, ex.y, expRadius, 0, Math.PI * 2);
            maskCtx.fill();
          }

          // 7. Palace window lights (Level 1)
          const palace = levelData.map?.obstacles?.find((obs) => obs.type === "palace");
          if (palace) {
            const px = palace.x + getLevelMapOffsetX();
            const py = palace.y;
            const numCols = 9;
            for (let i = 0; i < numCols; i++) {
              const wx = px + 22 + i * 20;
              const wy1 = py + 30;
              const wy2 = py + 52;
              const wRadius = 14;

              const wGrad1 = maskCtx.createRadialGradient(wx, wy1, 2, wx, wy1, wRadius);
              wGrad1.addColorStop(0, "rgba(255, 255, 255, 0.85)");
              wGrad1.addColorStop(1, "rgba(255, 255, 255, 0)");
              maskCtx.fillStyle = wGrad1;
              maskCtx.beginPath();
              maskCtx.arc(wx, wy1, wRadius, 0, Math.PI * 2);
              maskCtx.fill();

              const wGrad2 = maskCtx.createRadialGradient(wx, wy2, 2, wx, wy2, wRadius);
              wGrad2.addColorStop(0, "rgba(255, 255, 255, 0.85)");
              wGrad2.addColorStop(1, "rgba(255, 255, 255, 0)");
              maskCtx.fillStyle = wGrad2;
              maskCtx.beginPath();
              maskCtx.arc(wx, wy2, wRadius, 0, Math.PI * 2);
              maskCtx.fill();
            }
          }

          // Reset composite
          maskCtx.globalCompositeOperation = "source-over";
        }

        // Project offscreen mask to screen
        ctx.drawImage(maskCanvas, 0, 0);

        // Warm radial light bloom overlay (Yellow / Orange color)
        // Fire bloom
        const decs = getMapDecorations();
        for (const dec of decs) {
          if (dec.type === "fire") {
            const bloomRadius = 45 + Math.sin(Date.now() * 0.01 + dec.x) * 5;
            const bloomGrad = ctx.createRadialGradient(dec.x, dec.y - 6, 2, dec.x, dec.y - 6, bloomRadius);
            bloomGrad.addColorStop(0, "rgba(255, 120, 0, 0.38)");
            bloomGrad.addColorStop(0.4, "rgba(255, 80, 0, 0.16)");
            bloomGrad.addColorStop(1, "rgba(255, 50, 0, 0)");
            ctx.fillStyle = bloomGrad;
            ctx.beginPath();
            ctx.arc(dec.x, dec.y - 6, bloomRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Explosion bloom
        for (const ex of s.explosions) {
          const bloomRadius = (ex.scale ?? 1.0) * (32 + ex.frame * 16);
          const bloomGrad = ctx.createRadialGradient(ex.x, ex.y, 2, ex.x, ex.y, bloomRadius);
          bloomGrad.addColorStop(0, "rgba(255, 255, 220, 0.68)");
          bloomGrad.addColorStop(0.3, "rgba(255, 140, 0, 0.42)");
          bloomGrad.addColorStop(0.7, "rgba(255, 60, 0, 0.18)");
          bloomGrad.addColorStop(1, "rgba(255, 0, 0, 0)");
          ctx.fillStyle = bloomGrad;
          ctx.beginPath();
          ctx.arc(ex.x, ex.y, bloomRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Player flashlight bloom
        const flashGrad = ctx.createRadialGradient(p.x, p.y, 6, p.x, p.y, 76);
        flashGrad.addColorStop(0, "rgba(255, 240, 180, 0.20)");
        flashGrad.addColorStop(0.5, "rgba(255, 230, 150, 0.09)");
        flashGrad.addColorStop(1, "rgba(255, 220, 100, 0)");
        ctx.fillStyle = flashGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 76, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawParticles(pass: "ground" | "air") {
      for (const p of s.particles) {
        const isGround = p.type === "casing" || p.type === "splash" || p.type === "dust";
        if (pass === "ground" && !isGround) continue;
        if (pass === "air" && isGround) continue;

        ctx.save();
        if (p.type === "leaf") {
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.05);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "casing") {
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.life * 0.25);
          ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2);
        } else if (p.type === "spark") {
          const alpha = 1 - p.life / p.maxLife;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.dx * 1.5, p.y - p.dy * 1.5);
          ctx.stroke();
        } else if (p.type === "dust") {
          const alpha = (1 - p.life / p.maxLife) * 0.5;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size + p.life * 0.1, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === "splash") {
          const alpha = 1 - p.life / p.maxLife;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size + p.life * 0.8, (p.size + p.life * 0.8) * 0.4, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === "smoke") {
          const alpha = (1 - p.life / p.maxLife) * 0.45;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size + p.life * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      ctx.globalAlpha = 1.0;
    }

    function drawCrosshair() {
      const m = mouseRef.current;
      ctx.strokeStyle = "#FFD700aa";
      ctx.lineWidth = 1;
      // Outer circle
      ctx.beginPath();
      ctx.arc(m.x, m.y, 10, 0, Math.PI * 2);
      ctx.stroke();
      // Cross
      ctx.beginPath();
      ctx.moveTo(m.x - 14, m.y);
      ctx.lineTo(m.x - 6, m.y);
      ctx.moveTo(m.x + 6, m.y);
      ctx.lineTo(m.x + 14, m.y);
      ctx.moveTo(m.x, m.y - 14);
      ctx.lineTo(m.x, m.y - 6);
      ctx.moveTo(m.x, m.y + 6);
      ctx.lineTo(m.x, m.y + 14);
      ctx.stroke();
    }

    function spawnObstacleSparks(x: number, y: number, type: string) {
      let colors = ["#ffc107", "#ff9800", "#ff5722"]; // default spark colors
      if (type === "wall" || type === "gate" || type === "palace") {
        colors = ["#d32f2f", "#f44336", "#e57373", "#757575"]; // brick red / grey cement
      } else if (type === "sandbag") {
        colors = ["#bcaaa4", "#8d6e63", "#a1887f", "#d7ccc8"]; // sandy brown / khaki
      } else if (type === "barrel") {
        colors = ["#78909c", "#ffd54f", "#cfd8dc", "#546e7a"]; // metal grey / yellow spark
      } else if (type === "bunker") {
        colors = ["#757575", "#616161", "#9e9e9e", "#ffeb3b"]; // concrete grey + sparks
      } else if (type === "vehicle" || type === "tank") {
        colors = ["#4e342e", "#ff5722", "#ffd54f", "#cfd8dc"]; // rust + flame sparks + metal
      }
      
      const numSparks = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numSparks; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.0 + Math.random() * 2.5;
        s.particles.push({
          x,
          y,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed - 0.5, // slightly upwards
          size: 1.5 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: 20 + Math.floor(Math.random() * 15),
          type: "spark",
        });
      }
    }

    function spawnCharacterSparks(x: number, y: number, isTank: boolean) {
      let colors = ["#b71c1c", "#d32f2f", "#ff1744"]; // Red blood splatters for soldiers
      if (isTank) {
        colors = ["#4a5a30", "#ffd54f", "#ff9100", "#78909c"]; // metal green + orange flame + metallic sparks for tank
      }
      const numSparks = 6 + Math.floor(Math.random() * 5);
      for (let i = 0; i < numSparks; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 3.0;
        s.particles.push({
          x,
          y,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed - 0.3,
          size: 1.5 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: 25 + Math.floor(Math.random() * 20),
          type: "spark",
        });
      }
    }

    function spawnTreadDust(x: number, y: number) {
      s.particles.push({
        x,
        y,
        dx: (Math.random() - 0.5) * 0.5,
        dy: Math.random() * 0.2,
        size: 3 + Math.random() * 3,
        color: "rgba(160, 140, 115, 0.45)", // sandy dust color
        life: 0,
        maxLife: 30 + Math.random() * 20,
        type: "dust",
      });
    }

    let running = true;

    function gameLoop() {
      if (!running) return;

      if (pausedRef.current) {
        s.frameId = requestAnimationFrame(gameLoop);
        return;
      }

      const AW = sizeRef.current.w, AH = sizeRef.current.h;
      const p = s.player;
      const u = upgradesRef.current;

      // Speed upgrade: +15% per stack
      const speedStacks = u["speed_up"] || 0;
      const pSpeed = PLAYER_SPEED * (1 + speedStacks * 0.15);

      // Bonus score per kill
      const bonusScore = (u["damage_up"] || 0) * 50;

      // ---- Auto-fire when mouse is held ----
      if (mouseDownRef.current || s.keys.has(" ")) {
        shoot();
      }

      // ---- Update screen shake ----
      if (s.shakeIntensity > 0) {
        s.shakeX = (Math.random() - 0.5) * s.shakeIntensity * 2;
        s.shakeY = (Math.random() - 0.5) * s.shakeIntensity * 2;
        s.shakeIntensity *= 0.85;
        if (s.shakeIntensity < 0.3) { s.shakeIntensity = 0; s.shakeX = 0; s.shakeY = 0; }
      }

      // ---- Update muzzle flash ----
      if (s.muzzleFlash > 0) s.muzzleFlash--;

      // ---- Update combo timer ----
      if (s.comboTimer > 0) {
        s.comboTimer--;
        if (s.comboTimer <= 0) {
          s.combo = 0;
        }
      }
      if (s.comboDisplay > 0) s.comboDisplay--;

      // Rocket AoE explosion helper
      function rocketExplode(rx: number, ry: number, radius: number) {
        s.explosions.push({ id: s.nextId++, x: rx, y: ry, frame: 0, scale: 2.5 });
        s.shakeIntensity = Math.max(s.shakeIntensity, 10);
        for (const e of s.enemies) {
          if (e.hp <= 0) continue;
          const ddx = e.x - rx;
          const ddy = e.y - ry;
          const edist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (edist < radius + e.size / 2) {
            s.hitMarkers.push({ id: s.nextId++, x: e.x, y: e.y, frame: 0 });
            e.hp--;
            if (e.hp <= 0) {
              s.killed++;
              s.combo++;
              s.comboTimer = 120;
              s.comboDisplay = 60;
              const comboBonus = (Math.min(s.combo, 10) - 1) * 25;
              const typeConfig = ENEMY_TYPES[e.type];
              const totalKillScore = typeConfig.scoreValue + bonusScore + comboBonus;
              setScore((sc) => sc + totalKillScore);
              s.explosions.push({ id: s.nextId++, x: e.x, y: e.y, frame: 0 });
              s.damageNumbers.push({
                id: s.nextId++, x: e.x, y: e.y - 10,
                text: s.combo > 1 ? `+${totalKillScore} x${s.combo}` : `+${totalKillScore}`,
                color: "#FFD700", frame: 0,
              });
            }
          }
        }
      }

      // ---- Input (with obstacle collision) ----
      const oldX = p.x;
      const oldY = p.y;

      if (s.keys.has("w") || s.keys.has("W") || s.keys.has("ArrowUp"))
        p.y = Math.max(PLAYER_SIZE / 2, p.y - pSpeed);
      if (s.keys.has("s") || s.keys.has("S") || s.keys.has("ArrowDown"))
        p.y = Math.min(AH - PLAYER_SIZE / 2, p.y + pSpeed);
      if (s.keys.has("a") || s.keys.has("A") || s.keys.has("ArrowLeft"))
        p.x = Math.max(PLAYER_SIZE / 2, p.x - pSpeed);
      if (s.keys.has("d") || s.keys.has("D") || s.keys.has("ArrowRight"))
        p.x = Math.min(AW - PLAYER_SIZE / 2, p.x + pSpeed);

      // Check player collision with solid obstacles (including ally tank)
      const playerObs = getDynamicObstacles();
      const half = PLAYER_SIZE / 2;
      const isPlayerColliding = (x: number, y: number) => {
        for (const obs of playerObs) {
          if (obs.type === "crater" || obs.type === "wire") continue; // non-blocking
          if (
            x + half > obs.x && x - half < obs.x + obs.w &&
            y + half > obs.y && y - half < obs.y + obs.h
          ) {
            return true;
          }
        }
        return false;
      };

      const wasColliding = isPlayerColliding(oldX, oldY);
      const isCollidingNow = isPlayerColliding(p.x, p.y);

      // If player started inside an obstacle (responsive spawn edge case),
      // allow movement so they can escape instead of getting permanently stuck.
      if (isCollidingNow && !wasColliding) {
        p.x = oldX;
        p.y = oldY;
      }

      // Update aim angle live
      s.aimAngle = Math.atan2(
        mouseRef.current.y - p.y,
        mouseRef.current.x - p.x
      );

      // ---- Spawn enemies ----
      if (s.spawned < s.enemyCount && !s.waveCleared) {
        s.spawnTimer++;
        if (s.spawnTimer >= 35) {
          s.spawnTimer = 0;
          spawnEnemy();
        }
      }

      // ---- Move bullets (with obstacle collision) ----
      s.bullets = s.bullets.filter((b) => {
        const mapObstacles = getMapObstacles();
        b.x += b.dx;
        b.y += b.dy;
        // Range-limited bullets (shotgun)
        if (b.maxRange != null && b.spawnX != null && b.spawnY != null) {
          const traveled = Math.sqrt(
            (b.x - b.spawnX) ** 2 + (b.y - b.spawnY) ** 2
          );
          if (traveled > b.maxRange) return false;
        }
        // Check obstacle collision (player bullets pass through ally tank — use static obstacles)
        for (const obs of mapObstacles) {
          if (obs.type === "crater" || obs.type === "wire") continue;
          if (
            b.x > obs.x && b.x < obs.x + obs.w &&
            b.y > obs.y && b.y < obs.y + obs.h
          ) {
            spawnObstacleSparks(b.x, b.y, obs.type);
            if (b.isRocket && b.aoeRadius) {
              rocketExplode(b.x, b.y, b.aoeRadius);
            } else {
              // Spawn mini spark explosion on obstacle hit
              s.explosions.push({ id: s.nextId++, x: b.x, y: b.y, frame: 0, scale: 0.35 });
            }
            return false;
          }
        }
        return b.x > -10 && b.x < AW + 10 && b.y > -10 && b.y < AH + 10;
      });

      // ---- Move enemy bullets (uses dynamic obstacles — blocked by ally tank) ----
      const dynObs = getDynamicObstacles();
      s.enemyBullets = s.enemyBullets.filter((b) => {
        b.x += b.dx;
        b.y += b.dy;
        for (const obs of dynObs) {
          if (obs.type === "crater" || obs.type === "wire") continue;
          if (b.x > obs.x && b.x < obs.x + obs.w && b.y > obs.y && b.y < obs.y + obs.h) {
            spawnObstacleSparks(b.x, b.y, obs.type);
            // Spawn mini spark explosion on obstacle hit
            s.explosions.push({ id: s.nextId++, x: b.x, y: b.y, frame: 0, scale: 0.35 });
            return false;
          }
        }
        return b.x > -10 && b.x < AW + 10 && b.y > -10 && b.y < AH + 10;
      });

      // ---- Enemy bullet -> player collision ----
      for (const b of s.enemyBullets) {
        const bSize = b.fromTank ? TANK_BULLET_SIZE : ENEMY_BULLET_SIZE;
        const dx = b.x - p.x;
        const dy = b.y - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < PLAYER_SIZE / 2 + bSize) {
          b.x = -999;
          setHp((h) => Math.max(0, h - 1));
          s.hitFlash = 10;
          s.shakeIntensity = Math.max(s.shakeIntensity, 8);
          s.combo = 0; // reset combo on hit
          s.explosions.push({ id: s.nextId++, x: p.x, y: p.y, frame: 0 });
          // Spawn blood splatters for player soldier
          spawnCharacterSparks(p.x, p.y, false);
        }
      }
      s.enemyBullets = s.enemyBullets.filter((b) => b.x > -10);

      // ---- Move enemies (type-specific AI) ----
      const now = Date.now();
      const moveObs = getDynamicObstacles(); // enemies blocked by ally tank too
      for (const e of s.enemies) {
        if (e.hp <= 0) continue;
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // --- Movement ---
        if (e.type === "fortified") {
          // Stay near anchor, don't chase
          if (e.anchorX !== undefined && e.anchorY !== undefined) {
            const adx = e.anchorX - e.x;
            const ady = e.anchorY - e.y;
            const anchorDist = Math.sqrt(adx * adx + ady * ady);
            if (anchorDist > FORTIFIED_ANCHOR_RANGE) {
              e.x += (adx / anchorDist) * e.speed;
              e.y += (ady / anchorDist) * e.speed;
            }
          }
        } else if (e.type === "tank") {
          // ---- SMART TANK AI ----
          const PREFERRED_DIST = 200;
          const TOO_CLOSE = 130;
          const TOO_FAR = 280;

          let desiredAngle: number;

          if (dist < TOO_CLOSE) {
            // Back away from player
            desiredAngle = Math.atan2(e.y - p.y, e.x - p.x);
          } else if (dist > TOO_FAR) {
            // Advance toward player
            desiredAngle = Math.atan2(p.y - e.y, p.x - e.x);
          } else {
            // At good range: strafe/flank
            const baseAngle = Math.atan2(p.y - e.y, p.x - e.x);
            const strafeDir = ((e.id % 2) * 2 - 1);
            const timeFactor = Math.sin(now * 0.001 + e.id * 1.7);
            desiredAngle = baseAngle + (Math.PI / 2) * strafeDir + timeFactor * 0.3;
          }

          // Multi-angle pathfinding
          const tryAngles = [0, Math.PI / 6, -Math.PI / 6, Math.PI / 3, -Math.PI / 3, Math.PI / 2, -Math.PI / 2];
          for (const offset of tryAngles) {
            const tryAngle = desiredAngle + offset;
            const newX = e.x + Math.cos(tryAngle) * e.speed;
            const newY = e.y + Math.sin(tryAngle) * e.speed;
            if (newX < e.size / 2 || newX > AW - e.size / 2 ||
                newY < e.size / 2 || newY > AH - e.size / 2) continue;
            let blocked = false;
            for (const obs of moveObs) {
              if (obs.type === "crater" || obs.type === "wire") continue;
              const half = e.size / 2;
              if (newX + half > obs.x && newX - half < obs.x + obs.w &&
                  newY + half > obs.y && newY - half < obs.y + obs.h) {
                blocked = true;
                break;
              }
            }
            if (!blocked) {
              e.x = newX;
              e.y = newY;
              // Spawn tread dust for moving tank
              if (Math.random() < 0.15) {
                spawnTreadDust(e.x - 10, e.y + 10);
                spawnTreadDust(e.x + 10, e.y + 10);
              }
              break;
            }
          }
        } else if (dist > 1) {
          // Soldiers: move toward player
          const newX = e.x + (dx / dist) * e.speed;
          const newY = e.y + (dy / dist) * e.speed;
          let blocked = false;
          for (const obs of moveObs) {
            if (obs.type === "crater" || obs.type === "wire") continue;
            const half = e.size / 2;
            if (newX + half > obs.x && newX - half < obs.x + obs.w &&
                newY + half > obs.y && newY - half < obs.y + obs.h) {
              blocked = true;
              break;
            }
          }
          if (blocked) {
            const perpX = e.x + (dy / dist) * e.speed * 1.5;
            const perpY = e.y + (-dx / dist) * e.speed * 1.5;
            let perpBlocked = false;
            for (const obs of moveObs) {
              if (obs.type === "crater" || obs.type === "wire") continue;
              const half = e.size / 2;
              if (perpX + half > obs.x && perpX - half < obs.x + obs.w &&
                  perpY + half > obs.y && perpY - half < obs.y + obs.h) {
                perpBlocked = true;
                break;
              }
            }
            if (!perpBlocked) { e.x = perpX; e.y = perpY; }
          } else {
            e.x = newX;
            e.y = newY;
          }
        }

        // --- Contact damage (soldiers only, tanks crush) ---
        const contactDist = PLAYER_SIZE / 2 + e.size / 2 - 4;
        if (e.type !== "fortified" && dist < contactDist) {
          e.hp = 0;
          s.killed++;
          setHp((h) => Math.max(0, h - 1));
          s.hitFlash = 10;
          s.shakeIntensity = Math.max(s.shakeIntensity, 8);
          s.combo = 0;
          s.explosions.push({ id: s.nextId++, x: e.x, y: e.y, frame: 0 });
          // Spawn blood splatters
          spawnCharacterSparks(e.x, e.y, false);
        }

        // --- Enemy shooting ---
        if (e.shootCooldown > 0 && dist < ENEMY_SHOOT_RANGE && e.hp > 0) {
          if (now - e.lastShot >= e.shootCooldown) {
            e.lastShot = now;
            const shootDx = (dx / dist) * e.bulletSpeed;
            const shootDy = (dy / dist) * e.bulletSpeed;
            // Slight inaccuracy
            const inaccuracy = (Math.random() - 0.5) * 0.15;
            const cosI = Math.cos(inaccuracy);
            const sinI = Math.sin(inaccuracy);
            s.enemyBullets.push({
              id: s.nextId++,
              x: e.x,
              y: e.y,
              dx: shootDx * cosI - shootDy * sinI,
              dy: shootDx * sinI + shootDy * cosI,
              fromTank: e.type === "tank",
            });

            // Muzzle flash smoke for enemy tanks
            if (e.type === "tank") {
              const angle = Math.atan2(dy, dx);
              const barrelLen = 22;
              const bx = e.x + Math.cos(angle) * barrelLen;
              const by = e.y - 6 + Math.sin(angle) * barrelLen;
              
              for (let i = 0; i < 8; i++) {
                const smokeAngle = angle + (Math.random() - 0.5) * 0.5;
                const smokeSpeed = 1.5 + Math.random() * 2.5;
                s.particles.push({
                  x: bx,
                  y: by,
                  dx: Math.cos(smokeAngle) * smokeSpeed,
                  dy: Math.sin(smokeAngle) * smokeSpeed,
                  size: 4 + Math.random() * 4,
                  color: i % 2 === 0 ? "rgba(255, 68, 0, 0.75)" : "rgba(80, 80, 80, 0.45)",
                  life: 0,
                  maxLife: 20 + Math.random() * 15,
                  type: "smoke",
                });
              }
            }
          }
        }
      }

      // ---- Bullet-enemy collision (multi-HP support + rocket AoE) ----
      for (const b of s.bullets) {
        if (b.x < -10) continue;
        for (const e of s.enemies) {
          if (e.hp <= 0) continue;
          const dx = b.x - e.x;
          const dy = b.y - e.y;
          const hitRadius = e.size / 2 + (b.isRocket ? 8 : BULLET_SIZE);
          if (Math.sqrt(dx * dx + dy * dy) < hitRadius) {
            if (b.isRocket && b.aoeRadius) {
              rocketExplode(b.x, b.y, b.aoeRadius);
            } else {
              // Hit marker
              s.hitMarkers.push({ id: s.nextId++, x: b.x, y: b.y, frame: 0 });
              // Spawn impact sparks
              s.explosions.push({ id: s.nextId++, x: b.x, y: b.y, frame: 0, scale: 0.45 });
              // Character splatter sparks
              spawnCharacterSparks(b.x, b.y, e.type === "tank");
              e.hp--;
              if (e.hp <= 0) {
                s.killed++;
                // Combo system
                s.combo++;
                s.comboTimer = 120; // ~2 seconds at 60fps
                const comboMultiplier = Math.min(s.combo, 10);
                const comboBonus = (comboMultiplier - 1) * 25;
                s.comboDisplay = 60;
                const typeConfig = ENEMY_TYPES[e.type];
                const totalKillScore = typeConfig.scoreValue + bonusScore + comboBonus;
                setScore((sc) => sc + totalKillScore);
                s.explosions.push({ id: s.nextId++, x: e.x, y: e.y, frame: 0 });
                // Damage number (kill)
                const killText = s.combo > 1
                  ? `+${totalKillScore} x${s.combo}`
                  : `+${totalKillScore}`;
                s.damageNumbers.push({
                  id: s.nextId++, x: e.x, y: e.y - 10,
                  text: killText, color: "#FFD700", frame: 0,
                });
                // Bigger shake on kill
                s.shakeIntensity = Math.max(s.shakeIntensity, 5);
              } else {
                // Damage number (hit)
                s.damageNumbers.push({
                  id: s.nextId++, x: b.x, y: b.y - 5,
                  text: "HIT", color: "#ffffff", frame: 0,
                });
              }
            }
            b.x = -999;
            break;
          }
        }
      }

      s.enemies = s.enemies.filter((e) => e.hp > 0);
      s.bullets = s.bullets.filter((b) => b.x > -10);
      s.explosions = s.explosions
        .map((ex) => ({ ...ex, frame: ex.frame + 0.3 }))
        .filter((ex) => ex.frame < 6);
      // Update damage numbers
      s.damageNumbers = s.damageNumbers
        .map((dn) => ({ ...dn, frame: dn.frame + 1, y: dn.y - 0.8 }))
        .filter((dn) => dn.frame < 40);
      // Update hit markers
      s.hitMarkers = s.hitMarkers
        .map((hm) => ({ ...hm, frame: hm.frame + 1 }))
        .filter((hm) => hm.frame < 10);

      // ---- Update grenades (arc trajectory) ----
      s.grenades = s.grenades
        .map((g) => ({ ...g, frame: g.frame + 1 }))
        .filter((g) => {
          if (g.frame >= g.maxFrame) {
            rocketExplode(g.targetX, g.targetY, BOMB_AOE_RADIUS);
            return false;
          }
          return true;
        });

      // ---- Update particles ----
      s.particles = s.particles
        .map((p) => {
          let nx = p.x + p.dx;
          let ny = p.y + p.dy;
          let ndx = p.dx;
          let ndy = p.dy;

          if (p.type === "leaf") {
            // Leaf swaying back and forth
            nx += Math.sin(p.life * 0.15) * 0.5;
          } else if (p.type === "casing") {
            ndy += 0.18; // gravity
            ndx *= 0.95; // friction
            ndy *= 0.95;
          } else if (p.type === "spark") {
            ndy += 0.08; // gravity
            ndx *= 0.92;
            ndy *= 0.92;
          } else if (p.type === "dust") {
            ndx *= 0.9;
            ndy *= 0.9;
          } else if (p.type === "smoke") {
            ndy -= 0.05; // slowly rise
            ndx *= 0.96;
            ndy *= 0.96;
          }

          return {
            ...p,
            x: nx,
            y: ny,
            dx: ndx,
            dy: ndy,
            life: p.life + 1,
          };
        })
        .filter((p) => p.life < p.maxLife && p.x > -50 && p.x < AW + 50 && p.y > -50 && p.y < AH + 50);

      // Rain splashes spawning
      const weather = levelData.map?.weather;
      if (weather === "rain" && Math.random() < 0.6) {
        s.particles.push({
          x: Math.random() * AW,
          y: Math.random() * AH,
          dx: 0,
          dy: 0,
          size: 1 + Math.random() * 2,
          color: "rgba(136, 170, 204, 0.4)",
          life: 0,
          maxLife: 15 + Math.random() * 10,
          type: "splash",
        });
      }

      // Leaf drift spawning
      const terrain = levelData.map?.terrain;
      if (terrain === "jungle" || terrain === "highland" || terrain === "rice_field") {
        if (Math.random() < 0.1) {
          const spawnFromTop = Math.random() < 0.7;
          const lx = spawnFromTop ? Math.random() * AW : AW + 10;
          const ly = spawnFromTop ? -10 : Math.random() * AH * 0.6;
          const leafColors = ["#2e7d32", "#1b5e20", "#388e3c", "#4caf50", "#81c784", "#a1887f", "#8d6e63"];
          s.particles.push({
            x: lx,
            y: ly,
            dx: -1.0 - Math.random() * 1.5,
            dy: 0.8 + Math.random() * 1.2,
            size: 3 + Math.random() * 3,
            color: leafColors[Math.floor(Math.random() * leafColors.length)],
            life: 0,
            maxLife: 120 + Math.random() * 80,
            type: "leaf",
          });
        }
      }

      // ---- Ally Tank 843 update ----
      const ally = s.allyTank;
      if (ally && ally.active) {
        ally.x = getRoadAxisX();
        const frontGate = getFrontGateObstacle(getMapObstacles());
        if (!s.gateBreached && frontGate) {
          const tankFrontY = ally.y - ally.height / 2;
          const gateBottomY = frontGate.y + frontGate.h;
          if (tankFrontY > gateBottomY) {
            ally.y -= ally.speed;
            // Spawn tread dust for moving ally tank
            if (Math.random() < 0.15) {
              spawnTreadDust(ally.x - 14, ally.y + 14);
              spawnTreadDust(ally.x + 14, ally.y + 14);
            }
          } else {
            s.gateBreached = true;
            s.shakeIntensity = Math.max(s.shakeIntensity, 14);
            s.explosions.push({
              id: s.nextId++,
              x: frontGate.x + frontGate.w / 2,
              y: frontGate.y + frontGate.h / 2,
              frame: 0,
              scale: 2.2,
            });
            // Objective clear: tank 843 rams the front gate of Independence Palace
            s.enemies = [];
            s.enemyBullets = [];
            if (!s.waveCleared) {
              s.waveCleared = true;
              setTimeout(() => onWaveCleared(), 400);
            }
          }
        } else if (ally.y > ally.targetY) {
          // Continue advancing into palace after the gate is broken
          ally.y -= ally.speed;
          // Spawn tread dust for moving ally tank
          if (Math.random() < 0.15) {
            spawnTreadDust(ally.x - 14, ally.y + 14);
            spawnTreadDust(ally.x + 14, ally.y + 14);
          }
        }
        // Shoot at nearest enemy
        if (s.enemies.length > 0 && now - ally.lastShot >= ally.shootCooldown) {
          let nearest: Enemy | null = null;
          let nearDist = Infinity;
          for (const e of s.enemies) {
            if (e.hp <= 0) continue;
            const edx = e.x - ally.x;
            const edy = e.y - ally.y;
            const ed = Math.sqrt(edx * edx + edy * edy);
            if (ed < nearDist) { nearDist = ed; nearest = e; }
          }
          if (nearest && nearDist < 400) {
            ally.lastShot = now;
            const adx = nearest.x - ally.x;
            const ady = nearest.y - ally.y;
            const adist = Math.sqrt(adx * adx + ady * ady);
            
            // Correct barrel end point
            const barrelAngle = Math.atan2(ady, adx);
            const barrelLen = 22;
            const bx = ally.x + Math.cos(barrelAngle) * barrelLen;
            const by = ally.y - 4 + Math.sin(barrelAngle) * barrelLen;

            s.bullets.push({
              id: s.nextId++,
              x: bx,
              y: by,
              dx: (adx / adist) * ally.bulletSpeed,
              dy: (ady / adist) * ally.bulletSpeed,
            });

            // Muzzle flash / smoke
            for (let i = 0; i < 8; i++) {
              const smokeAngle = barrelAngle + (Math.random() - 0.5) * 0.5;
              const smokeSpeed = 1.5 + Math.random() * 2.5;
              s.particles.push({
                x: bx,
                y: by,
                dx: Math.cos(smokeAngle) * smokeSpeed,
                dy: Math.sin(smokeAngle) * smokeSpeed,
                size: 4 + Math.random() * 4,
                color: i % 2 === 0 ? "rgba(255, 140, 0, 0.75)" : "rgba(80, 80, 80, 0.45)",
                life: 0,
                maxLife: 20 + Math.random() * 15,
                type: "smoke",
              });
            }
          }
        }
      }

      // ---- Wave clear ----
      if (s.killed >= s.enemyCount && s.enemies.length === 0 && !s.waveCleared) {
        s.waveCleared = true;
        setTimeout(() => onWaveCleared(), 600);
      }

      // ──── DRAW ────
      // Apply screen shake
      ctx.save();
      ctx.translate(s.shakeX, s.shakeY);

      drawGround();

      // Decorations (below everything) — skip tank_active when ally tank is active
      const decorations = getMapDecorations();
      for (const dec of decorations) {
        if (dec.type === "tank_active" && s.allyTank?.active) continue;
        drawDecoration(dec);
      }

      // Draw ground particles (casing, splashes, tread dust)
      drawParticles("ground");

      // Obstacles
      const mapObstacles = getMapObstacles();
      for (const obs of mapObstacles) drawObstacle(obs);

      // Ally Tank 843 (draws on top of obstacles, provides cover)
      drawAllyTank843();

      // Bullets (player) — with shotgun fade, rocket visuals, improved trails
      for (const b of s.bullets) {
        if (b.isRocket) {
          // Rocket rendering
          const angle = Math.atan2(b.dy, b.dx);
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(angle);
          ctx.fillStyle = "#8B4513";
          ctx.fillRect(-8, -3, 16, 6);
          ctx.fillStyle = "#cc3300";
          ctx.beginPath();
          ctx.moveTo(8, -3);
          ctx.lineTo(12, 0);
          ctx.lineTo(8, 3);
          ctx.fill();
          ctx.fillStyle = "#FF6600";
          ctx.fillRect(-12, -2, 5, 4);
          ctx.fillStyle = "#FFD700";
          ctx.fillRect(-14, -1, 3, 2);
          ctx.restore();
          // Smoke trail (multiple)
          for (let t = 1; t <= 4; t++) {
            ctx.fillStyle = `rgba(85,85,85,${0.25 - t * 0.05})`;
            ctx.beginPath();
            ctx.arc(b.x - b.dx * t * 2, b.y - b.dy * t * 2, 3 + t, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          let alpha = 1.0;
          let size = BULLET_SIZE;
          // Shotgun fade near max range
          if (b.maxRange && b.spawnX != null && b.spawnY != null) {
            const traveled = Math.sqrt((b.x - b.spawnX) ** 2 + (b.y - b.spawnY) ** 2);
            alpha = Math.max(0.3, 1 - traveled / b.maxRange);
            size = Math.max(2, BULLET_SIZE * alpha);
          }
          // Glowing laser line tracer
          ctx.strokeStyle = "#FFD700";
          ctx.lineWidth = size + 2;
          ctx.globalAlpha = alpha * 0.3;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - b.dx * 1.5, b.y - b.dy * 1.5);
          ctx.stroke();

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = size;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - b.dx * 0.8, b.y - b.dy * 0.8);
          ctx.stroke();
          
          ctx.globalAlpha = 1.0;
        }
      }

      // Grenades in flight (arc trajectory)
      for (const g of s.grenades) {
        const t = g.frame / g.maxFrame;
        const gx = g.startX + (g.targetX - g.startX) * t;
        const groundY = g.startY + (g.targetY - g.startY) * t;
        const arcH = Math.min(120, Math.sqrt((g.targetX - g.startX) ** 2 + (g.targetY - g.startY) ** 2) * 0.4);
        const gy = groundY - Math.sin(t * Math.PI) * arcH;

        // Shadow on ground (scales with height)
        const shadowAlpha = 0.25 - Math.sin(t * Math.PI) * 0.15;
        const shadowScale = 0.3 + (1 - Math.sin(t * Math.PI)) * 0.7;
        ctx.globalAlpha = shadowAlpha;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(gx, groundY, 8 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Landing zone indicator at target
        const pulseT = (Date.now() % 600) / 600;
        ctx.globalAlpha = 0.5 - pulseT * 0.3;
        ctx.strokeStyle = "#ff4400";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(g.targetX, g.targetY, BOMB_AOE_RADIUS * (0.5 + pulseT * 0.5), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // Grenade body (spinning)
        const spinAngle = (g.frame / g.maxFrame) * Math.PI * 6;
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(spinAngle);
        ctx.fillStyle = "#3a5a20";
        ctx.fillRect(-5, -4, 10, 8);
        ctx.fillStyle = "#2a4a10";
        ctx.fillRect(-4, -3, 8, 2);
        ctx.fillRect(-4, 1, 8, 2);
        // Fuse
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(2, -7);
        ctx.stroke();
        // Fuse spark
        if (g.frame % 6 < 3) {
          ctx.fillStyle = "#FFD700";
          ctx.fillRect(1, -8, 2, 2);
        }
        ctx.restore();
      }

      // Bullets (enemy — red/orange with trails)
      for (const b of s.enemyBullets) {
        const bSize = b.fromTank ? TANK_BULLET_SIZE : ENEMY_BULLET_SIZE;
        const bColor = b.fromTank ? "#ff4400" : "#ff2222";
        // Laser glow trail
        ctx.strokeStyle = bColor;
        ctx.lineWidth = bSize + 2;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.dx * 1.5, b.y - b.dy * 1.5);
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = bSize;
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x - b.dx * 0.8, b.y - b.dy * 0.8);
        ctx.stroke();
        
        ctx.globalAlpha = 1.0;
      }

      // Enemies
      for (const e of s.enemies) drawEnemyByType(e);

      // Explosions
      for (const ex of s.explosions) drawExplosion(ex.x, ex.y, ex.frame, ex.scale);

      // Hit markers (X flash on hit)
      for (const hm of s.hitMarkers) {
        const hmAlpha = Math.max(0, 1 - hm.frame / 10);
        const hmSize = 6 + hm.frame * 0.5;
        ctx.globalAlpha = hmAlpha;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(hm.x - hmSize, hm.y - hmSize);
        ctx.lineTo(hm.x + hmSize, hm.y + hmSize);
        ctx.moveTo(hm.x + hmSize, hm.y - hmSize);
        ctx.lineTo(hm.x - hmSize, hm.y + hmSize);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Floating damage numbers
      for (const dn of s.damageNumbers) {
        const dnAlpha = Math.max(0, 1 - dn.frame / 40);
        const scale = dn.frame < 5 ? 1 + (5 - dn.frame) * 0.1 : 1;
        ctx.globalAlpha = dnAlpha;
        ctx.fillStyle = dn.color;
        ctx.font = `bold ${Math.round(10 * scale)}px 'Pixelcraft', monospace`;
        ctx.textAlign = "center";
        ctx.fillText(dn.text, dn.x, dn.y);
        ctx.textAlign = "start";
        ctx.globalAlpha = 1;
      }

      // Player
      drawPixelSoldier(p.x, p.y, s.aimAngle);

      // Draw air particles (leaves, sparks, smoke)
      drawParticles("air");

      // Muzzle flash effect
      if (s.muzzleFlash > 0) {
        const flashDist = PLAYER_SIZE / 2 + 14;
        const fx = p.x + Math.cos(s.aimAngle) * flashDist;
        const fy = p.y + Math.sin(s.aimAngle) * flashDist;
        const flashSize = 4 + s.muzzleFlash * 2;
        ctx.globalAlpha = s.muzzleFlash / 4;
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(fx, fy, flashSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(fx, fy, flashSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Aim line (faint)
      ctx.strokeStyle = "#FFD70030";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(
        p.x + Math.cos(s.aimAngle) * (PLAYER_SIZE / 2 + 14),
        p.y + Math.sin(s.aimAngle) * (PLAYER_SIZE / 2 + 14)
      );
      ctx.lineTo(
        p.x + Math.cos(s.aimAngle) * 60,
        p.y + Math.sin(s.aimAngle) * 60
      );
      ctx.stroke();
      ctx.setLineDash([]);

      // Crosshair
      drawCrosshair();

      // Combo display
      if (s.combo > 1 && s.comboDisplay > 0) {
        const comboAlpha = Math.min(1, s.comboDisplay / 20);
        const comboScale = s.comboDisplay > 50 ? 1 + (s.comboDisplay - 50) * 0.03 : 1;
        ctx.globalAlpha = comboAlpha;
        ctx.fillStyle = s.combo >= 5 ? "#ff4444" : s.combo >= 3 ? "#FFD700" : "#4fc3f7";
        ctx.font = `bold ${Math.round(14 * comboScale)}px 'Pixelcraft', monospace`;
        ctx.textAlign = "center";
        const comboText = s.combo >= 10 ? `COMBO x${s.combo}!!!` : s.combo >= 5 ? `COMBO x${s.combo}!` : `COMBO x${s.combo}`;
        ctx.fillText(comboText, AW / 2, 50);
        ctx.textAlign = "start";
        ctx.globalAlpha = 1;
      }

      // Weather effects (on top of everything)
      drawWeather();

      // Hit flash (red overlay when player takes damage)
      if (s.hitFlash > 0) {
        ctx.fillStyle = `rgba(255, 0, 0, ${s.hitFlash * 0.03})`;
        ctx.fillRect(0, 0, AW, AH);
        s.hitFlash--;
      }

      // End screen shake
      ctx.restore();

      // HUD on canvas (outside shake transform)
      ctx.fillStyle = "#ffffff88";
      ctx.font = "9px 'Pixelcraft', monospace";
      ctx.fillText(`WAVE ${waveNum + 1}  HA: ${s.killed}/${s.enemyCount}`, 10, AH - 10);

      // ---- Weapon Selector HUD (bottom-center) ----
      const owned = ownedWeaponsRef.current;
      if (owned.length > 0) {
        const slotW = 60;
        const slotH = 50;
        const gap = 6;
        const totalW = owned.length * (slotW + gap) - gap;
        const startX = (AW - totalW) / 2;
        const startY = AH - slotH - 10;

        for (let i = 0; i < owned.length; i++) {
          const wid = owned[i];
          const weaponData = WEAPONS.find((w) => w.id === wid);
          const isActive = wid === weaponRef.current;
          const slotX = startX + i * (slotW + gap);

          // Slot background
          ctx.fillStyle = isActive ? "rgba(255,215,0,0.25)" : "rgba(0,0,0,0.5)";
          ctx.fillRect(slotX, startY, slotW, slotH);
          // Slot border
          ctx.strokeStyle = isActive ? "#FFD700" : "#444";
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.strokeRect(slotX, startY, slotW, slotH);

          // Weapon emoji
          ctx.font = "22px monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = "#fff";
          ctx.fillText(weaponData?.emoji ?? "?", slotX + slotW / 2, startY + 28);

          // Number key hint
          ctx.font = "8px 'Pixelcraft', monospace";
          ctx.fillStyle = isActive ? "#FFD700" : "#888";
          ctx.fillText(`${i + 1}`, slotX + slotW / 2, startY + slotH - 6);

          ctx.textAlign = "start";
        }

        // Q / E hints centered below slots
        ctx.font = "7px 'Pixelcraft', monospace";
        ctx.fillStyle = "#ffffff44";
        ctx.textAlign = "center";
        ctx.fillText("[Q] đổi súng    [E] ném lựu đạn", AW / 2, startY - 5);
        ctx.textAlign = "start";
      }

      // ---- Bomb count HUD (bottom-center, left of weapon slots) ----
      {
        const slotH = 50;
        const yBase = AH - slotH - 10;
        ctx.font = "9px 'Pixelcraft', monospace";
        ctx.fillStyle = bombsRef.current > 0 ? "#ff9944" : "#555";
        ctx.textAlign = "center";
        ctx.fillText(`💣 ×${bombsRef.current}`, AW / 2, yBase - 18);
        ctx.textAlign = "start";
      }

      s.frameId = requestAnimationFrame(gameLoop);
    }

    s.frameId = requestAnimationFrame(gameLoop);
    return () => {
      running = false;
      cancelAnimationFrame(s.frameId);
    };
  }, [waveNum, levelData, levelIndex, onWaveCleared, setHp, setScore, shoot]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        className="border-0 cursor-none block"
        style={{
          imageRendering: "pixelated",
          width: "100%",
          height: "100%",
          background: "#000",
        }}
      />
    </div>
  );
}
