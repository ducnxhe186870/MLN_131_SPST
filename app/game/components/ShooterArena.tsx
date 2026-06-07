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

      ctx.save();
      ctx.translate(cx, cy);

      // === BỘ ĐỘI GIẢI PHÓNG (Vietnamese Liberation Soldier) ===

      // Pith helmet (mũ cối) - dome shape
      ctx.fillStyle = "#5A6D33";
      ctx.fillRect(-6, -half - 2, 12, 4);
      // Helmet brim
      ctx.fillStyle = "#4A5D23";
      ctx.fillRect(-7, -half + 1, 14, 2);
      // Red star on helmet
      ctx.fillStyle = "#DA251D";
      ctx.fillRect(-1, -half - 1, 2, 2);

      // Face
      ctx.fillStyle = "#FFD5A0";
      ctx.fillRect(-4, -half + 3, 8, 5);
      // Eyes
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(-2, -half + 5, 2, 1);
      ctx.fillRect(1, -half + 5, 2, 1);

      // Collar
      ctx.fillStyle = "#3a4d18";
      ctx.fillRect(-5, -half + 8, 10, 1);

      // Body (olive green uniform)
      ctx.fillStyle = "#4A5D23";
      ctx.fillRect(-6, -half + 9, 12, 7);
      // Pockets
      ctx.fillStyle = "#3a4d18";
      ctx.fillRect(-5, -half + 10, 3, 2);
      ctx.fillRect(2, -half + 10, 3, 2);
      // Belt
      ctx.fillStyle = "#5C4033";
      ctx.fillRect(-6, -half + 15, 12, 2);
      ctx.fillStyle = "#8B7355";
      ctx.fillRect(-1, -half + 15, 2, 2);

      // Legs (olive pants)
      ctx.fillStyle = "#3a4d18";
      ctx.fillRect(-5, -half + 17, 4, 3);
      ctx.fillRect(1, -half + 17, 4, 3);
      // Boots
      ctx.fillStyle = "#2a1a0a";
      ctx.fillRect(-5, -half + 19, 4, 2);
      ctx.fillRect(1, -half + 19, 4, 2);

      ctx.restore();

      // Gun barrel (AK-style) - drawn toward aim direction
      const barrelLen = 14;
      const bx = cx + Math.cos(angle) * (half + 1);
      const by = cy + Math.sin(angle) * (half + 1);
      const bex = cx + Math.cos(angle) * (half + barrelLen);
      const bey = cy + Math.sin(angle) * (half + barrelLen);
      // Gun body
      ctx.strokeStyle = "#3a3020";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bex, bey);
      ctx.stroke();
      // Barrel tip
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bex - Math.cos(angle) * 3, bey - Math.sin(angle) * 3);
      ctx.lineTo(bex, bey);
      ctx.stroke();
      // Muzzle
      ctx.fillStyle = "#666";
      ctx.fillRect(bex - 1, bey - 1, 3, 3);
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

      ctx.save();
      ctx.translate(e.x, e.y);

      // Helmet
      ctx.fillStyle = "#444";
      ctx.fillRect(-5, -half - 3, 10, 3);
      ctx.fillRect(-6, -half, 12, 2);
      // Face
      ctx.fillStyle = "#ddb896";
      ctx.fillRect(-4, -half + 2, 8, 4);
      // Eyes
      ctx.fillStyle = "#cc0000";
      ctx.fillRect(-3, -half + 3, 2, 1);
      ctx.fillRect(1, -half + 3, 2, 1);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(-2, -half + 4, 1, 1);
      ctx.fillRect(2, -half + 4, 1, 1);
      // Body
      ctx.fillStyle = ec;
      ctx.fillRect(-5, -half + 6, 10, 8);
      ctx.fillStyle = "#4a3520";
      ctx.fillRect(-5, -half + 13, 10, 1);
      // Legs & boots
      ctx.fillStyle = ec;
      ctx.fillRect(-4, -half + 14, 3, 3);
      ctx.fillRect(1, -half + 14, 3, 3);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(-4, -half + 16, 3, 2);
      ctx.fillRect(1, -half + 16, 3, 2);

      ctx.restore();

      // Gun barrel aimed at player
      const barrelLen = 10;
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(e.x + Math.cos(angle) * (half + 1), e.y + Math.sin(angle) * (half + 1));
      ctx.lineTo(e.x + Math.cos(angle) * (half + barrelLen), e.y + Math.sin(angle) * (half + barrelLen));
      ctx.stroke();
    }

    function drawFortifiedEnemy(e: Enemy, p: { x: number; y: number }) {
      const half = e.size / 2;
      const ec = levelData.enemyColor;
      const angle = Math.atan2(p.y - e.y, p.x - e.x);

      ctx.save();
      ctx.translate(e.x, e.y);

      // Heavier helmet with chin strap
      ctx.fillStyle = "#333";
      ctx.fillRect(-6, -half - 4, 12, 4);
      ctx.fillRect(-7, -half, 14, 3);
      // Face (partially covered)
      ctx.fillStyle = "#ddb896";
      ctx.fillRect(-4, -half + 3, 8, 3);
      // Focused eyes
      ctx.fillStyle = "#cc0000";
      ctx.fillRect(-3, -half + 4, 2, 1);
      ctx.fillRect(1, -half + 4, 2, 1);
      // Body with ammo vest
      ctx.fillStyle = ec;
      ctx.fillRect(-5, -half + 6, 10, 8);
      ctx.fillStyle = "#3a3520";
      ctx.fillRect(-5, -half + 7, 10, 3);
      // Belt
      ctx.fillStyle = "#4a3520";
      ctx.fillRect(-5, -half + 13, 10, 1);
      // Legs & boots
      ctx.fillStyle = ec;
      ctx.fillRect(-4, -half + 14, 3, 3);
      ctx.fillRect(1, -half + 14, 3, 3);
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(-4, -half + 16, 3, 2);
      ctx.fillRect(1, -half + 16, 3, 2);

      ctx.restore();

      // Gun barrel aimed at player
      const barrelLen = 12;
      ctx.strokeStyle = "#444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(e.x + Math.cos(angle) * (half + 1), e.y + Math.sin(angle) * (half + 1));
      ctx.lineTo(e.x + Math.cos(angle) * (half + barrelLen), e.y + Math.sin(angle) * (half + barrelLen));
      ctx.stroke();
    }

    function drawTankEnemy(e: Enemy, p: { x: number; y: number }) {
      const half = e.size / 2;
      const angle = Math.atan2(p.y - e.y, p.x - e.x);

      ctx.save();
      ctx.translate(e.x, e.y);

      // Tracks
      ctx.fillStyle = "#2a2a1a";
      ctx.fillRect(-half, half - 10, e.size, 10);
      ctx.fillStyle = "#1a1a0a";
      ctx.fillRect(-half - 2, half - 12, e.size + 4, 4);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-half + 6 + i * ((e.size - 12) / 3), half - 5, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Hull
      ctx.fillStyle = "#5a6438";
      ctx.fillRect(-half + 4, -4, e.size - 8, 16);
      ctx.fillStyle = "#4a5428";
      ctx.fillRect(-half + 2, 6, e.size - 4, 8);
      // Turret
      ctx.fillStyle = "#6a7448";
      ctx.fillRect(-8, -12, 16, 12);
      ctx.fillStyle = "#5a6438";
      ctx.fillRect(-6, -10, 12, 8);
      // Marking
      ctx.fillStyle = "#ffffff88";
      ctx.font = "bold 5px monospace";
      ctx.fillText("ARVN", -9, 3);

      ctx.restore();

      // Barrel (rotates toward player)
      const barrelLen = 22;
      ctx.strokeStyle = "#3a3a2a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y - 6);
      ctx.lineTo(e.x + Math.cos(angle) * barrelLen, e.y - 6 + Math.sin(angle) * barrelLen);
      ctx.stroke();
      ctx.fillStyle = "#2a2a1a";
      ctx.fillRect(
        e.x + Math.cos(angle) * barrelLen - 2,
        e.y - 6 + Math.sin(angle) * barrelLen - 2,
        4, 4
      );
    }

    function drawExplosion(ex: number, ey: number, frame: number, scale: number = 1) {
      const colors = ["#FFD700", "#FF6600", "#FF2222", "#FF8800"];
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + frame * 0.3;
        const dist = frame * 5 * scale;
        const px = ex + Math.cos(angle) * dist;
        const py = ey + Math.sin(angle) * dist;
        const sz = (3 + frame * 2) * scale;
        ctx.fillStyle = colors[i % colors.length];
        ctx.globalAlpha = Math.max(0, 1 - frame / 6);
        ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
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
      switch (obs.type) {
        case "sandbag":
          ctx.fillStyle = "#8B7D3C";
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
          ctx.fillStyle = "#6B5D2C";
          for (let i = 0; i < obs.w; i += 12) {
            ctx.fillRect(obs.x + i, obs.y, 10, obs.h);
            ctx.fillStyle = "#7B6D3C";
            ctx.fillRect(obs.x + i + 2, obs.y + 2, 6, obs.h - 4);
            ctx.fillStyle = "#6B5D2C";
          }
          ctx.strokeStyle = "#554D1C";
          ctx.lineWidth = 1;
          ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
          break;

        case "crater":
          ctx.fillStyle = "#2a2215";
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#1a1a0f";
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 3, obs.h / 3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#3a3220";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, obs.h / 2, 0, 0, Math.PI * 2);
          ctx.stroke();
          break;

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
          // Destroyed tank body
          ctx.fillStyle = "#3a3a2a";
          ctx.fillRect(obs.x, obs.y + 15, obs.w, obs.h - 15);
          // Turret
          ctx.fillStyle = "#2a2a1a";
          ctx.fillRect(obs.x + 10, obs.y + 5, obs.w - 20, 20);
          // Barrel
          ctx.fillStyle = "#222";
          ctx.fillRect(obs.x + obs.w - 5, obs.y + 12, 20, 4);
          // Tracks
          ctx.fillStyle = "#1a1a1a";
          ctx.fillRect(obs.x - 2, obs.y + obs.h - 8, obs.w + 4, 8);
          // Damage marks
          ctx.fillStyle = "#111";
          ctx.fillRect(obs.x + 15, obs.y + 20, 6, 6);
          ctx.fillRect(obs.x + 30, obs.y + 25, 4, 4);
          // Smoke from destroyed tank
          ctx.fillStyle = "#44444430";
          ctx.beginPath();
          ctx.arc(obs.x + obs.w / 2, obs.y - 5, 8 + Math.sin(Date.now() * 0.003) * 3, 0, Math.PI * 2);
          ctx.fill();
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

        case "bunker":
          ctx.fillStyle = "#3a3a30";
          ctx.fillRect(obs.x, obs.y + 10, obs.w, obs.h - 10);
          // Roof
          ctx.fillStyle = "#4a4a3a";
          ctx.beginPath();
          ctx.moveTo(obs.x - 5, obs.y + 12);
          ctx.lineTo(obs.x + obs.w / 2, obs.y);
          ctx.lineTo(obs.x + obs.w + 5, obs.y + 12);
          ctx.fill();
          // Opening
          ctx.fillStyle = "#111";
          ctx.fillRect(obs.x + obs.w * 0.3, obs.y + obs.h * 0.5, obs.w * 0.4, obs.h * 0.3);
          break;

        case "barrel":
          ctx.fillStyle = "#4a6a30";
          ctx.fillRect(obs.x + 4, obs.y, obs.w - 8, obs.h);
          ctx.fillStyle = "#3a5a20";
          ctx.fillRect(obs.x + 2, obs.y + 3, obs.w - 4, obs.h - 6);
          // Metal bands
          ctx.fillStyle = "#555";
          ctx.fillRect(obs.x + 2, obs.y + 2, obs.w - 4, 2);
          ctx.fillRect(obs.x + 2, obs.y + obs.h - 4, obs.w - 4, 2);
          break;

        case "wire":
          ctx.strokeStyle = "#666";
          ctx.lineWidth = 1;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            for (let x = obs.x; x < obs.x + obs.w; x += 6) {
              const yOff = Math.sin((x + i * 20) * 0.3) * 4 + i * 5;
              if (x === obs.x) ctx.moveTo(x, obs.y + yOff);
              else ctx.lineTo(x, obs.y + yOff);
            }
            ctx.stroke();
          }
          // Posts
          ctx.fillStyle = "#555";
          ctx.fillRect(obs.x, obs.y - 4, 3, obs.h + 8);
          ctx.fillRect(obs.x + obs.w - 3, obs.y - 4, 3, obs.h + 8);
          ctx.fillRect(obs.x + obs.w / 2, obs.y - 4, 3, obs.h + 8);
          break;

        case "palace": {
          // Dinh Độc Lập — main building
          const px = obs.x, py = obs.y, pw = obs.w, ph = obs.h;
          // Base building
          ctx.fillStyle = "#e8dcc8";
          ctx.fillRect(px, py + 10, pw, ph - 10);
          // Roof/top floor
          ctx.fillStyle = "#d4c8b0";
          ctx.fillRect(px + 20, py, pw - 40, 15);
          // Roof line
          ctx.fillStyle = "#baa888";
          ctx.fillRect(px - 5, py + 8, pw + 10, 4);
          // Windows (grid)
          ctx.fillStyle = "#4a6a8a";
          const winW = 10, winH = 8, gap = 18;
          for (let row = 0; row < 2; row++) {
            for (let col = 0; col < Math.floor((pw - 20) / gap); col++) {
              ctx.fillRect(px + 15 + col * gap, py + 18 + row * 20, winW, winH);
            }
          }
          // Main entrance door
          ctx.fillStyle = "#5a3a1a";
          ctx.fillRect(px + pw / 2 - 12, py + ph - 25, 24, 25);
          ctx.fillStyle = "#4a2a0a";
          ctx.fillRect(px + pw / 2 - 1, py + ph - 25, 2, 25);
          // Columns
          ctx.fillStyle = "#c8bca0";
          ctx.fillRect(px + pw / 2 - 30, py + 12, 4, ph - 12);
          ctx.fillRect(px + pw / 2 + 26, py + 12, 4, ph - 12);
          // Flag pole on top
          ctx.fillStyle = "#888";
          ctx.fillRect(px + pw / 2 - 1, py - 15, 2, 18);
          // Vietnamese flag
          const ft = Date.now() * 0.003;
          ctx.fillStyle = "#DA251D";
          ctx.beginPath();
          ctx.moveTo(px + pw / 2 + 1, py - 15);
          ctx.lineTo(px + pw / 2 + 14 + Math.sin(ft) * 2, py - 11);
          ctx.lineTo(px + pw / 2 + 1, py - 7);
          ctx.fill();
          ctx.fillStyle = "#FFD700";
          ctx.fillRect(px + pw / 2 + 5, py - 13, 2, 2);
          // Shadow
          ctx.fillStyle = "#00000015";
          ctx.fillRect(px, py + ph, pw, 6);
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
          // Burned/destroyed military vehicle
          const vx = obs.x, vy = obs.y, vw = obs.w, vh = obs.h;
          // Chassis
          ctx.fillStyle = "#3a3530";
          ctx.fillRect(vx + 4, vy + vh * 0.4, vw - 8, vh * 0.6);
          // Hood/cab
          ctx.fillStyle = "#4a4540";
          ctx.fillRect(vx + 2, vy + vh * 0.2, vw * 0.4, vh * 0.5);
          // Burn marks
          ctx.fillStyle = "#1a1510";
          ctx.fillRect(vx + vw * 0.3, vy + vh * 0.3, vw * 0.3, vh * 0.3);
          // Wheels
          ctx.fillStyle = "#111";
          ctx.beginPath();
          ctx.arc(vx + 10, vy + vh - 4, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(vx + vw - 10, vy + vh - 4, 5, 0, Math.PI * 2);
          ctx.fill();
          // Smoke
          ctx.fillStyle = "#44444430";
          ctx.beginPath();
          ctx.arc(vx + vw * 0.4, vy, 6 + Math.sin(Date.now() * 0.003) * 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }
    }

    function drawDecoration(dec: MapDecoration) {
      switch (dec.type) {
        case "fire": {
          const t = Date.now() * 0.005;
          const colors = ["#FF4500", "#FF6600", "#FFD700", "#FF2200"];
          for (let i = 0; i < 6; i++) {
            const fx = dec.x + Math.sin(t + i * 1.2) * 4;
            const fy = dec.y - i * 3 + Math.sin(t * 1.5 + i) * 2;
            const sz = 5 - i * 0.6;
            ctx.fillStyle = colors[i % colors.length];
            ctx.globalAlpha = 0.7 - i * 0.1;
            ctx.fillRect(fx - sz / 2, fy - sz / 2, sz, sz);
          }
          ctx.globalAlpha = 1;
          // Glow
          ctx.fillStyle = "#FF660015";
          ctx.beginPath();
          ctx.arc(dec.x, dec.y - 6, 15, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case "smoke": {
          const st = Date.now() * 0.002;
          for (let i = 0; i < 4; i++) {
            const sx = dec.x + Math.sin(st + i * 1.5) * 6;
            const sy = dec.y - i * 8 - (st * 10 + i * 5) % 40;
            const sz = 6 + i * 3;
            ctx.fillStyle = "#555";
            ctx.globalAlpha = 0.15 - i * 0.03;
            ctx.beginPath();
            ctx.arc(sx, sy, sz, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          break;
        }

        case "flag": {
          // Pole
          ctx.fillStyle = "#666";
          ctx.fillRect(dec.x, dec.y - 25, 2, 30);
          // Flag
          const ft = Date.now() * 0.003;
          ctx.fillStyle = "#DA251D";
          ctx.beginPath();
          ctx.moveTo(dec.x + 2, dec.y - 25);
          ctx.lineTo(dec.x + 18 + Math.sin(ft) * 2, dec.y - 20 + Math.sin(ft * 1.3) * 1);
          ctx.lineTo(dec.x + 2, dec.y - 15);
          ctx.fill();
          // Star
          ctx.fillStyle = "#FFD700";
          ctx.fillRect(dec.x + 7, dec.y - 22, 3, 3);
          break;
        }

        case "debris":
          ctx.fillStyle = "#3a3a30";
          ctx.fillRect(dec.x, dec.y, 12, 4);
          ctx.fillRect(dec.x + 3, dec.y - 3, 6, 3);
          ctx.fillStyle = "#4a4a40";
          ctx.fillRect(dec.x + 8, dec.y + 2, 8, 3);
          ctx.fillRect(dec.x - 2, dec.y + 4, 5, 2);
          break;

        case "tree_stump":
          ctx.fillStyle = "#4a3520";
          ctx.fillRect(dec.x - 5, dec.y, 10, 8);
          ctx.fillStyle = "#3a2a15";
          ctx.beginPath();
          ctx.arc(dec.x, dec.y, 7, Math.PI, 0);
          ctx.fill();
          // Rings
          ctx.strokeStyle = "#5a4530";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(dec.x, dec.y, 4, Math.PI, 0);
          ctx.stroke();
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
          ctx.fillStyle = "#2a2a1a";
          ctx.fillRect(tx - 22, ty + 8, 44, 12);
          ctx.fillRect(tx - 24, ty + 6, 48, 4);
          // Track wheels
          ctx.fillStyle = "#1a1a0a";
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(tx - 18 + i * 9, ty + 14, 3, 0, Math.PI * 2);
            ctx.fill();
          }
          // Hull
          ctx.fillStyle = "#4a5a30";
          ctx.fillRect(tx - 18, ty - 2, 36, 12);
          ctx.fillStyle = "#3a4a20";
          ctx.fillRect(tx - 20, ty + 4, 40, 6);
          // Turret
          ctx.fillStyle = "#5a6a38";
          ctx.fillRect(tx - 10, ty - 8, 20, 10);
          ctx.fillStyle = "#4a5a28";
          ctx.fillRect(tx - 8, ty - 6, 16, 6);
          // Barrel (pointing up/forward)
          ctx.fillStyle = "#3a3a2a";
          ctx.fillRect(tx - 2, ty - 22, 4, 16);
          ctx.fillStyle = "#2a2a1a";
          ctx.fillRect(tx - 1, ty - 24, 2, 4);
          // Number 843
          ctx.fillStyle = "#FFD700";
          ctx.font = "bold 7px monospace";
          ctx.fillText("843", tx - 8, ty + 3);
          // Red star on turret
          ctx.fillStyle = "#DA251D";
          ctx.fillRect(tx - 2, ty - 5, 4, 3);
          // Exhaust smoke
          ctx.fillStyle = "#55555540";
          ctx.beginPath();
          ctx.arc(tx, ty + 22 + Math.sin(tt) * 2, 5 + Math.sin(tt * 2) * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#44444425";
          ctx.beginPath();
          ctx.arc(tx + 3, ty + 28 + Math.sin(tt + 1) * 3, 7, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }
    }

    function drawAllyTank843() {
      const ally = s.allyTank;
      if (!ally || !ally.active) return;

      const tx = ally.x, ty = ally.y;
      const tt = Date.now() * 0.001;

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

      // Tracks
      ctx.fillStyle = "#2a2a1a";
      ctx.fillRect(tx - 22, ty + 8, 44, 12);
      ctx.fillRect(tx - 24, ty + 6, 48, 4);
      // Track wheels (animated)
      ctx.fillStyle = "#1a1a0a";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(tx - 18 + i * 9, ty + 14, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // Hull
      ctx.fillStyle = "#4a5a30";
      ctx.fillRect(tx - 18, ty - 2, 36, 12);
      ctx.fillStyle = "#3a4a20";
      ctx.fillRect(tx - 20, ty + 4, 40, 6);
      // Turret
      ctx.fillStyle = "#5a6a38";
      ctx.fillRect(tx - 10, ty - 8, 20, 10);
      ctx.fillStyle = "#4a5a28";
      ctx.fillRect(tx - 8, ty - 6, 16, 6);
      // Barrel (rotating toward nearest enemy)
      const barrelLen = 18;
      ctx.strokeStyle = "#3a3a2a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(tx, ty - 4);
      ctx.lineTo(tx + Math.cos(barrelAngle) * barrelLen, ty - 4 + Math.sin(barrelAngle) * barrelLen);
      ctx.stroke();
      // Muzzle tip
      ctx.fillStyle = "#2a2a1a";
      ctx.fillRect(
        tx + Math.cos(barrelAngle) * barrelLen - 2,
        ty - 4 + Math.sin(barrelAngle) * barrelLen - 2,
        4, 4
      );
      // Number 843
      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 7px monospace";
      ctx.fillText("843", tx - 8, ty + 3);
      // Red star on turret
      ctx.fillStyle = "#DA251D";
      ctx.fillRect(tx - 2, ty - 5, 4, 3);
      // Exhaust smoke
      ctx.fillStyle = "#55555540";
      ctx.beginPath();
      ctx.arc(tx, ty + 22 + Math.sin(tt) * 2, 5 + Math.sin(tt * 2) * 2, 0, Math.PI * 2);
      ctx.fill();
      // Ally glow outline
      ctx.strokeStyle = "#FFD70030";
      ctx.lineWidth = 1;
      ctx.strokeRect(tx - ally.width / 2 - 2, ty - ally.height / 2 - 2, ally.width + 4, ally.height + 4);
    }

    function drawWeather() {
      const AW = sizeRef.current.w, AH = sizeRef.current.h;
      const weather = levelData.map?.weather;
      if (!weather || weather === "clear") return;

      if (weather === "rain") {
        ctx.strokeStyle = "#88aacc30";
        ctx.lineWidth = 1;
        for (let i = 0; i < 60; i++) {
          const rx = (Date.now() * 0.3 + i * 79) % AW;
          const ry = (Date.now() * 0.8 + i * 53) % AH;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 2, ry + 8);
          ctx.stroke();
        }
      } else if (weather === "fog") {
        ctx.fillStyle = "#ffffff08";
        for (let i = 0; i < 8; i++) {
          const fx = (Math.sin(Date.now() * 0.0005 + i * 2) * 100) + i * 100;
          const fy = 50 + i * 70;
          ctx.beginPath();
          ctx.ellipse(fx, fy, 120, 30, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (weather === "night") {
        // Dark overlay
        ctx.fillStyle = "#000000" + "30";
        ctx.fillRect(0, 0, AW, AH);
        // Muzzle flashes / light spots
        const nt = Date.now() * 0.001;
        if (Math.sin(nt * 3) > 0.8) {
          ctx.fillStyle = "#FFD70010";
          ctx.beginPath();
          ctx.arc(
            200 + Math.sin(nt) * 100,
            200 + Math.cos(nt * 0.7) * 80,
            40, 0, Math.PI * 2
          );
          ctx.fill();
        }
      }
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
      // Center dot
      ctx.fillStyle = "#ff4444";
      ctx.fillRect(m.x - 1, m.y - 1, 2, 2);
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
            if (b.isRocket && b.aoeRadius) {
              rocketExplode(b.x, b.y, b.aoeRadius);
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
          if (b.x > obs.x && b.x < obs.x + obs.w && b.y > obs.y && b.y < obs.y + obs.h) return false;
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
            s.bullets.push({
              id: s.nextId++,
              x: ally.x,
              y: ally.y - 14,
              dx: (adx / adist) * ally.bulletSpeed,
              dy: (ady / adist) * ally.bulletSpeed,
            });
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
          // Glow trail (3-segment tracer)
          for (let t = 3; t >= 1; t--) {
            ctx.globalAlpha = alpha * (0.15 / t);
            ctx.fillStyle = "#FFD700";
            const trailSize = size + t * 2;
            ctx.beginPath();
            ctx.arc(b.x - b.dx * t * 1.5, b.y - b.dy * t * 1.5, trailSize / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          // Bullet core with glow
          ctx.globalAlpha = alpha;
          ctx.fillStyle = "#fff";
          ctx.fillRect(b.x - size / 2, b.y - size / 2, size, size);
          ctx.fillStyle = "#FFD700";
          ctx.beginPath();
          ctx.arc(b.x, b.y, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
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
        // Trail
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = bColor;
        ctx.beginPath();
        ctx.arc(b.x - b.dx * 2, b.y - b.dy * 2, bSize + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.08;
        ctx.beginPath();
        ctx.arc(b.x - b.dx * 4, b.y - b.dy * 4, bSize + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // Core
        ctx.fillStyle = bColor;
        ctx.fillRect(b.x - bSize / 2, b.y - bSize / 2, bSize, bSize);
        ctx.fillStyle = "#fff";
        ctx.fillRect(b.x - 1, b.y - 1, 2, 2);
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
