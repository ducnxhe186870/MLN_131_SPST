import { PDF_QUESTION_BANK } from '@/lib/pdfQuestionBank';

/* ═══════════════════════════════════════════════════════════════════ */
/*  TYPES & GAME DATA                                                  */
/* ═══════════════════════════════════════════════════════════════════ */

export interface GameQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: "sandbag" | "crater" | "trench" | "tank" | "wall" | "bunker" | "barrel" | "wire" | "palace" | "gate" | "vehicle";
}

export interface MapDecoration {
  x: number;
  y: number;
  type: "fire" | "smoke" | "flag" | "debris" | "tree_stump" | "shell_casing" | "tank_active";
}

export interface MapTheme {
  terrain: "jungle" | "urban" | "rice_field" | "mountain" | "coast" | "delta" | "highland";
  weather: "clear" | "rain" | "fog" | "night";
  obstacles: Obstacle[];
  decorations: MapDecoration[];
}

export interface LevelData {
  name: string;
  emoji: string;
  bg: string;
  groundColor: string;
  enemyColor: string;
  questions: GameQuestion[];
  map?: MapTheme;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  spawnX?: number;
  spawnY?: number;
  maxRange?: number;
  isRocket?: boolean;
  aoeRadius?: number;
}

export interface EnemyBullet {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  fromTank: boolean;
}

export type EnemyType = "soldier" | "fortified" | "tank";

export interface EnemyTypeConfig {
  type: EnemyType;
  speed: number;
  size: number;
  hp: number;
  shootCooldown: number;
  bulletSpeed: number;
  scoreValue: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  type: EnemyType;
  speed: number;
  size: number;
  lastShot: number;
  anchorX?: number;
  anchorY?: number;
  shootCooldown: number;
  bulletSpeed: number;
}

export interface Explosion {
  id: number;
  x: number;
  y: number;
  frame: number;
  scale?: number;
}

export interface Grenade {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  frame: number;
  maxFrame: number;
}

export interface AllyTank {
  x: number;
  y: number;
  targetY: number;
  speed: number;
  lastShot: number;
  shootCooldown: number;
  bulletSpeed: number;
  active: boolean;
  width: number;
  height: number;
}

export interface WeaponType {
  id: string;
  name: string;
  emoji: string;
  bulletCount: number;    // số đường đạn bắn ra cùng lúc
  spreadAngle: number;    // góc lệch giữa các đường đạn (radian), 0 = circle
  cost: number;           // giá mua bằng score
  description: string;
  maxRange?: number;
  bulletSpeedMultiplier?: number;
  isRocket?: boolean;
  aoeRadius?: number;
}

/* ── Constants ─────────────────────────────────────────────────────── */

export const ARENA_W = 960;
export const ARENA_H = 640;
export const PLAYER_SIZE = 22;
export const PLAYER_SPEED = 3.2;
export const BULLET_SPEED = 7;
export const BULLET_SIZE = 4;
export const ENEMY_SIZE = 20;
export const ENEMY_SPEED = 1.3;
export const ENEMIES_PER_WAVE = 6;
export const SHOOT_COOLDOWN = 180;
export const WAVES_PER_LEVEL = 5;

export const ENEMY_TYPES: Record<EnemyType, EnemyTypeConfig> = {
  soldier: {
    type: "soldier",
    speed: 1.3,
    size: 20,
    hp: 1,
    shootCooldown: 2500,
    bulletSpeed: 3,
    scoreValue: 50,
  },
  fortified: {
    type: "fortified",
    speed: 0.3,
    size: 20,
    hp: 2,
    shootCooldown: 1800,
    bulletSpeed: 3.5,
    scoreValue: 80,
  },
  tank: {
    type: "tank",
    speed: 0.5,
    size: 36,
    hp: 5,
    shootCooldown: 3000,
    bulletSpeed: 4,
    scoreValue: 150,
  },
};

export const ENEMY_SHOOT_RANGE = 300;
export const FORTIFIED_ANCHOR_RANGE = 60;
export const ENEMY_BULLET_SIZE = 3;
export const TANK_BULLET_SIZE = 6;

export const ALLY_TANK_843 = {
  startX: 400,
  startY: 500,
  targetY: 130,
  speed: 0.12,
  shootCooldown: 2500,
  bulletSpeed: 5,
  width: 44,
  height: 28,
};

export const BOMB_INITIAL_COUNT = 3;
export const BOMB_AOE_RADIUS = 90;
export const BOMB_FLIGHT_FRAMES = 50;
export const BOMB_COOLDOWN = 1200;

export interface WaveComposition {
  soldiers: number;
  fortified: number;
  tanks: number;
}

export function getWaveComposition(levelIndex: number, waveNum: number): WaveComposition {
  if (levelIndex === 0) {
    // Level 1: Chiến dịch HCM — lính địch tử thủ, có xe tăng
    return {
      soldiers: 3 + waveNum,
      fortified: 2 + Math.floor(waveNum / 2),
      tanks: waveNum >= 2 ? 1 + Math.floor(waveNum / 3) : 0,
    };
  }
  // Default cho các level khác (backwards compatible)
  return {
    soldiers: ENEMIES_PER_WAVE + waveNum * 2,
    fortified: 0,
    tanks: 0,
  };
}

export const WEAPONS: WeaponType[] = [
  {
    id: "single",
    name: "SÚNG TRƯỜNG",
    emoji: "🔫",
    bulletCount: 1,
    spreadAngle: 0,
    cost: 0,
    description: "Bắn 1 viên đạn",
  },
  {
    id: "double",
    name: "SÚNG ĐÔI",
    emoji: "🔫🔫",
    bulletCount: 2,
    spreadAngle: 0.15,
    cost: 300,
    description: "Bắn 2 viên đạn",
  },
  {
    id: "shotgun",
    name: "SHOTGUN",
    emoji: "🔫💨",
    bulletCount: 5,
    spreadAngle: 0.35,
    cost: 450,
    description: "Bắn 5 viên tầm ngắn",
    maxRange: 150,
  },
  {
    id: "triple",
    name: "LIÊN THANH",
    emoji: "💥",
    bulletCount: 3,
    spreadAngle: 0.2,
    cost: 600,
    description: "Bắn 3 viên đạn hình quạt",
  },
  {
    id: "rocket",
    name: "RPG",
    emoji: "🚀",
    bulletCount: 1,
    spreadAngle: 0,
    cost: 800,
    description: "Tên lửa chậm, nổ diện rộng",
    bulletSpeedMultiplier: 0.5,
    isRocket: true,
    aoeRadius: 60,
  },
  {
    id: "circle",
    name: "VÒNG TRÒN",
    emoji: "💫",
    bulletCount: 8,
    spreadAngle: 0, // 0 = full circle (2*PI / bulletCount)
    cost: 1000,
    description: "Bắn 8 viên đạn vòng tròn",
  },
];

/* ── Level data ────────────────────────────────────────────────────── */

export const SHARED_GAME_QUESTIONS: GameQuestion[] = PDF_QUESTION_BANK.map((item) => ({
  question: item.question,
  options: [...item.options],
  correctIndex: item.correctIndex,
}));

export const GAME_LEVELS: LevelData[] = [
  /* ──────── LEVEL 1: CHIẾN DỊCH HCM — Xe tăng húc Dinh Độc Lập ──────── */
  {
    name: "GIẢI PHÓNG SÀI GÒN",
    emoji: "🚩",
    bg: "#2a3a2a",
    groundColor: "#3a5a3a",
    enemyColor: "#8B7355",
    map: {
      terrain: "urban",
      weather: "clear",
      obstacles: [
        // === DINH ĐỘC LẬP (tòa nhà chính phía trên) ===
        { x: 280, y: 20, w: 240, h: 80, type: "palace" },
        // Cổng Dinh (2 trụ cổng)
        { x: 300, y: 110, w: 20, h: 30, type: "gate" },
        { x: 480, y: 110, w: 20, h: 30, type: "gate" },
        // Hàng rào 2 bên
        { x: 120, y: 100, w: 60, h: 15, type: "wall" },
        { x: 600, y: 100, w: 60, h: 15, type: "wall" },

        // === TUYẾN PHÒNG THỦ 1 (gần Dinh, ~170y) ===
        { x: 150, y: 170, w: 50, h: 20, type: "sandbag" },
        { x: 600, y: 170, w: 50, h: 20, type: "sandbag" },
        { x: 370, y: 180, w: 60, h: 20, type: "sandbag" },

        // === TUYẾN PHÒNG THỦ 2 (giữa, ~280-320y) ===
        { x: 350, y: 280, w: 60, h: 40, type: "bunker" },
        { x: 80, y: 320, w: 50, h: 40, type: "bunker" },
        { x: 700, y: 300, w: 50, h: 20, type: "sandbag" },
        { x: 200, y: 290, w: 80, h: 16, type: "trench" },
        { x: 500, y: 290, w: 80, h: 16, type: "trench" },

        // === CHƯỚNG NGẠI VẬT ĐẠI LỘ (~360-420y) ===
        { x: 300, y: 380, w: 40, h: 20, type: "sandbag" },
        { x: 500, y: 400, w: 40, h: 20, type: "sandbag" },
        { x: 350, y: 360, w: 100, h: 12, type: "wire" },

        // === XE CHÁY ===
        { x: 180, y: 420, w: 55, h: 30, type: "vehicle" },
        { x: 550, y: 380, w: 55, h: 30, type: "vehicle" },

        // === HỐ BOM & CÔNG SỰ (~450-540y) ===
        { x: 200, y: 480, w: 50, h: 50, type: "crater" },
        { x: 650, y: 450, w: 40, h: 40, type: "crater" },
        { x: 100, y: 540, w: 60, h: 20, type: "sandbag" },
      ],
      decorations: [
        // Xe tăng 843 tiến về cổng Dinh (sẽ trở thành ally tank)
        { x: 400, y: 500, type: "tank_active" },
        // Cờ giải phóng
        { x: 395, y: 15, type: "flag" },
        // Khói lửa chiến trận
        { x: 150, y: 220, type: "smoke" },
        { x: 550, y: 350, type: "fire" },
        { x: 350, y: 450, type: "debris" },
        { x: 650, y: 170, type: "smoke" },
        { x: 250, y: 380, type: "fire" },
        { x: 450, y: 500, type: "debris" },
        { x: 100, y: 300, type: "shell_casing" },
      ],
    },
    questions: SHARED_GAME_QUESTIONS,
  },
  /* ──────── LEVEL 2: THỐNG NHẤT ──────── */
  {
    name: "THỐNG NHẤT",
    emoji: "🏛️",
    bg: "#2d5016",
    groundColor: "#3a6b1e",
    enemyColor: "#cc2222",
    map: {
      terrain: "jungle",
      weather: "clear",
      obstacles: [
        { x: 120, y: 80, w: 60, h: 20, type: "sandbag" },
        { x: 500, y: 120, w: 50, h: 50, type: "crater" },
        { x: 300, y: 400, w: 80, h: 16, type: "trench" },
        { x: 600, y: 350, w: 40, h: 20, type: "sandbag" },
        { x: 80, y: 300, w: 50, h: 50, type: "crater" },
      ],
      decorations: [
        { x: 150, y: 200, type: "tree_stump" },
        { x: 550, y: 450, type: "debris" },
        { x: 400, y: 50, type: "shell_casing" },
        { x: 650, y: 200, type: "tree_stump" },
      ],
    },
    questions: SHARED_GAME_QUESTIONS,
  },
  /* ──────── LEVEL 3: BIÊN GIỚI ──────── */
  {
    name: "BIÊN GIỚI",
    emoji: "⚔️",
    bg: "#2a3a1a",
    groundColor: "#4A5D23",
    enemyColor: "#dd7722",
    map: {
      terrain: "mountain",
      weather: "fog",
      obstacles: [
        { x: 80, y: 60, w: 70, h: 30, type: "sandbag" },
        { x: 350, y: 150, w: 80, h: 16, type: "trench" },
        { x: 550, y: 250, w: 60, h: 60, type: "crater" },
        { x: 200, y: 380, w: 50, h: 40, type: "bunker" },
        { x: 600, y: 450, w: 70, h: 30, type: "sandbag" },
        { x: 100, y: 200, w: 40, h: 40, type: "crater" },
      ],
      decorations: [
        { x: 300, y: 80, type: "flag" },
        { x: 450, y: 400, type: "smoke" },
        { x: 150, y: 480, type: "shell_casing" },
        { x: 500, y: 100, type: "debris" },
      ],
    },
    questions: SHARED_GAME_QUESTIONS,
  },
  /* ──────── LEVEL 4: KINH TẾ & ĐỔI MỚI ──────── */
  {
    name: "KINH TẾ & ĐỔI MỚI",
    emoji: "📜",
    bg: "#1a3a5c",
    groundColor: "#1a5276",
    enemyColor: "#8833aa",
    map: {
      terrain: "urban",
      weather: "clear",
      obstacles: [
        { x: 100, y: 100, w: 80, h: 60, type: "wall" },
        { x: 500, y: 80, w: 60, h: 40, type: "wall" },
        { x: 300, y: 300, w: 50, h: 50, type: "bunker" },
        { x: 150, y: 420, w: 40, h: 30, type: "barrel" },
        { x: 580, y: 400, w: 80, h: 60, type: "wall" },
      ],
      decorations: [
        { x: 250, y: 150, type: "debris" },
        { x: 450, y: 350, type: "debris" },
        { x: 620, y: 100, type: "smoke" },
      ],
    },
    questions: SHARED_GAME_QUESTIONS,
  },
  /* ──────── LEVEL 5: ĐIỆN BIÊN PHỦ ──────── */
  {
    name: "ĐIỆN BIÊN PHỦ",
    emoji: "🏔️",
    bg: "#3d2b1f",
    groundColor: "#5c4033",
    enemyColor: "#2266aa",
    map: {
      terrain: "highland",
      weather: "fog",
      obstacles: [
        { x: 100, y: 80, w: 80, h: 16, type: "trench" },
        { x: 300, y: 60, w: 60, h: 40, type: "bunker" },
        { x: 550, y: 120, w: 70, h: 16, type: "trench" },
        { x: 150, y: 250, w: 80, h: 30, type: "sandbag" },
        { x: 400, y: 300, w: 60, h: 60, type: "crater" },
        { x: 600, y: 350, w: 50, h: 40, type: "bunker" },
        { x: 250, y: 450, w: 60, h: 16, type: "trench" },
        { x: 500, y: 480, w: 50, h: 20, type: "sandbag" },
        { x: 80, y: 400, w: 60, h: 60, type: "crater" },
      ],
      decorations: [
        { x: 200, y: 150, type: "flag" },
        { x: 450, y: 200, type: "smoke" },
        { x: 350, y: 400, type: "fire" },
        { x: 600, y: 50, type: "debris" },
        { x: 100, y: 500, type: "shell_casing" },
      ],
    },
    questions: SHARED_GAME_QUESTIONS,
  },
  /* ──────── LEVEL 6: ĐƯỜNG TRƯỜNG SƠN ──────── */
  {
    name: "ĐƯỜNG TRƯỜNG SƠN",
    emoji: "🌿",
    bg: "#0d2b0d",
    groundColor: "#1a4d1a",
    enemyColor: "#cc6600",
    map: {
      terrain: "jungle",
      weather: "rain",
      obstacles: [
        { x: 100, y: 50, w: 50, h: 50, type: "crater" },
        { x: 350, y: 100, w: 40, h: 20, type: "sandbag" },
        { x: 550, y: 200, w: 60, h: 60, type: "crater" },
        { x: 200, y: 300, w: 70, h: 50, type: "tank" },
        { x: 450, y: 400, w: 60, h: 20, type: "sandbag" },
        { x: 80, y: 450, w: 50, h: 50, type: "crater" },
        { x: 620, y: 100, w: 40, h: 30, type: "barrel" },
        { x: 300, y: 200, w: 100, h: 16, type: "trench" },
      ],
      decorations: [
        { x: 180, y: 120, type: "tree_stump" },
        { x: 400, y: 50, type: "tree_stump" },
        { x: 600, y: 350, type: "fire" },
        { x: 100, y: 350, type: "smoke" },
        { x: 500, y: 500, type: "shell_casing" },
        { x: 300, y: 480, type: "tree_stump" },
      ],
    },
    questions: SHARED_GAME_QUESTIONS,
  },
  /* ──────── LEVEL 7: TẾT MẬU THÂN ──────── */
  {
    name: "TẾT MẬU THÂN",
    emoji: "💥",
    bg: "#1a1a2e",
    groundColor: "#2a2a4e",
    enemyColor: "#33aa55",
    map: {
      terrain: "urban",
      weather: "night",
      obstacles: [
        { x: 80, y: 50, w: 100, h: 70, type: "wall" },
        { x: 500, y: 60, w: 80, h: 50, type: "wall" },
        { x: 300, y: 180, w: 50, h: 50, type: "bunker" },
        { x: 120, y: 320, w: 60, h: 30, type: "barrel" },
        { x: 550, y: 300, w: 70, h: 16, type: "wire" },
        { x: 350, y: 420, w: 80, h: 60, type: "wall" },
        { x: 200, y: 450, w: 50, h: 50, type: "crater" },
        { x: 620, y: 430, w: 40, h: 30, type: "barrel" },
      ],
      decorations: [
        { x: 250, y: 80, type: "fire" },
        { x: 450, y: 250, type: "fire" },
        { x: 150, y: 250, type: "smoke" },
        { x: 600, y: 180, type: "smoke" },
        { x: 400, y: 500, type: "debris" },
        { x: 100, y: 500, type: "shell_casing" },
      ],
    },
    questions: SHARED_GAME_QUESTIONS,
  },
];

export type GameScreen =
  | "title"
  | "tutorial"
  | "level-intro"
  | "combat"
  | "quiz"
  | "upgrade"
  | "shop"
  | "level-complete"
  | "game-over"
  | "victory";

export interface Upgrade {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: "common" | "rare" | "epic";
  maxStack: number;
}

export const UPGRADES: Upgrade[] = [
  { id: "extra_bullet", name: "THÊM ĐẠN", emoji: "🔹", description: "+1 đường đạn bắn ra", rarity: "rare", maxStack: 4 },
  { id: "fire_rate", name: "TỐC ĐỘ BẮN", emoji: "⚡", description: "Bắn nhanh hơn 20%", rarity: "common", maxStack: 5 },
  { id: "bullet_speed", name: "ĐẠN NHANH", emoji: "💨", description: "Đạn bay nhanh hơn 25%", rarity: "common", maxStack: 3 },
  { id: "hp_up", name: "TĂNG HP", emoji: "❤️", description: "+1 HP (hiện tại)", rarity: "common", maxStack: 99 },
  { id: "ammo_up", name: "THÊM ĐẠN DƯỢC", emoji: "📦", description: "+15 viên đạn", rarity: "common", maxStack: 99 },
  { id: "spread_shot", name: "ĐẠN QUẠT", emoji: "🔱", description: "Mở rộng góc bắn", rarity: "rare", maxStack: 3 },
  { id: "circle_shot", name: "ĐẠN VÒNG TRÒN", emoji: "💫", description: "Bắn đạn vòng tròn 360°", rarity: "epic", maxStack: 1 },
  { id: "damage_up", name: "SÁT THƯƠNG", emoji: "🗡️", description: "+50 điểm mỗi lần hạ địch", rarity: "rare", maxStack: 5 },
  { id: "speed_up", name: "TỐC ĐỘ DI CHUYỂN", emoji: "🏃", description: "Di chuyển nhanh hơn 15%", rarity: "common", maxStack: 3 },
];
