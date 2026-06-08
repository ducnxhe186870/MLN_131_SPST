"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GAME_LEVELS, WEAPONS, UPGRADES, WAVES_PER_LEVEL, BOMB_INITIAL_COUNT } from "./data";
import type { GameScreen, Upgrade, GameQuestion } from "./data";
import { PixelHeart } from "./components/PixelArt";
import ShooterArena from "./components/ShooterArena";
import {
  TitleScreen,
  TutorialScreen,
  LevelIntro,
  QuizScreen,
  LevelComplete,
  GameOverScreen,
  VictoryScreen,
  ShopScreen,
  UpgradeScreen,
} from "./components/Screens";

/* ── CSS animations (font loaded from globals.css) ─────────────────── */

const gameCss = `
html, body { overflow: hidden !important; height: 100dvh !important; }
body > nav { display: none !important; }
body > main { padding-top: 0 !important; min-height: 0 !important; height: 100dvh !important; overflow: hidden !important; }
.scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
  pointer-events: none;
  z-index: 1;
}
.crt-glow { text-shadow: 0 0 6px currentColor, 0 0 12px currentColor; }
@keyframes pixel-idle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.pixel-idle { animation: pixel-idle 1s ease-in-out infinite; }
@keyframes pixel-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
.pixel-blink { animation: pixel-blink 1s step-end infinite; }
@keyframes pixel-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
.pixel-shake { animation: pixel-shake 0.3s ease-in-out; }
`;

/* ── Helper: pick N random upgrade choices ─────────────────────────── */

function pickUpgradeChoices(
  upgradeCounts: Record<string, number>,
  count: number = 3
): Upgrade[] {
  // Filter upgrades that haven't hit max stack
  const available = UPGRADES.filter(
    (u) => (upgradeCounts[u.id] || 0) < u.maxStack
  );
  // Weighted by rarity: common 5, rare 3, epic 1
  const weighted: Upgrade[] = [];
  for (const u of available) {
    const w = u.rarity === "common" ? 5 : u.rarity === "rare" ? 3 : 1;
    for (let i = 0; i < w; i++) weighted.push(u);
  }
  // Shuffle and pick unique
  const picked: Upgrade[] = [];
  const used = new Set<string>();
  const shuffled = weighted.sort(() => Math.random() - 0.5);
  for (const u of shuffled) {
    if (picked.length >= count) break;
    if (!used.has(u.id)) {
      picked.push(u);
      used.add(u.id);
    }
  }
  return picked;
}

/* ═══════════════════════════════════════════════════════════════════ */
/*  MAIN GAME PAGE                                                     */
/* ═══════════════════════════════════════════════════════════════════ */

export default function GamePage() {
  const [screen, setScreen] = useState<GameScreen>("title");
  const [level, setLevel] = useState(0);
  const [hp, setHp] = useState(5);
  const [ammo, setAmmo] = useState(30);
  const [score, setScore] = useState(0);
  const [waveIdx, setWaveIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [weaponId, setWeaponId] = useState("single");
  const [ownedWeapons, setOwnedWeapons] = useState<string[]>(["single"]);
  const [ammoQuizUsed, setAmmoQuizUsed] = useState(false);
  const [bombs, setBombs] = useState(BOMB_INITIAL_COUNT);

  // Upgrade system
  const [upgradeCounts, setUpgradeCounts] = useState<Record<string, number>>({});
  const [upgradeChoices, setUpgradeChoices] = useState<Upgrade[]>([]);
  // Track what happens after upgrade: "next-wave" or "level-complete" or "resume-combat"
  // Track whether quiz was triggered by wave clear or ammo empty
  const afterUpgradeRef = useRef<"next-wave" | "level-complete" | "resume-combat">("next-wave");

  // Quiz randomization — pick from pool without repeating
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null);
  const [quizRetry, setQuizRetry] = useState(0);
  const usedQuestionsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (hp <= 0 && screen === "combat") {
      setScreen("game-over");
    }
  }, [hp, screen]);

  const levelData = GAME_LEVELS[level];
  const totalQ = WAVES_PER_LEVEL;

  function shuffleQuestionOptions(question: GameQuestion): GameQuestion {
    const indexedOptions = question.options.map((option, originalIndex) => ({
      option,
      originalIndex,
    }));

    for (let i = indexedOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indexedOptions[i], indexedOptions[j]] = [indexedOptions[j], indexedOptions[i]];
    }

    const shuffledCorrectIndex = indexedOptions.findIndex(
      (item) => item.originalIndex === question.correctIndex
    );

    if (shuffledCorrectIndex < 0) return question;

    return {
      ...question,
      options: indexedOptions.map((item) => item.option),
      correctIndex: shuffledCorrectIndex,
    };
  }

  // Pick a random question from the pool, avoiding repeats
  function pickQuestion(): GameQuestion {
    const pool = levelData.questions;
    const unused = pool.map((_, i) => i).filter((i) => !usedQuestionsRef.current.has(i));
    // If all used, reset
    const candidates = unused.length > 0 ? unused : pool.map((_, i) => i);
    if (unused.length === 0) usedQuestionsRef.current.clear();
    const idx = candidates[Math.floor(Math.random() * candidates.length)];
    usedQuestionsRef.current.add(idx);
    return shuffleQuestionOptions(pool[idx]);
  }

  // Compute current weapon stats from upgrades
  const extraBullets = upgradeCounts["extra_bullet"] || 0;
  const hasCircleShot = (upgradeCounts["circle_shot"] || 0) > 0;
  const spreadStacks = upgradeCounts["spread_shot"] || 0;
  const bonusScore = (upgradeCounts["damage_up"] || 0) * 50;

  // Derive effective weaponId from upgrades (specialty weapons not overridden by extra_bullet)
  const isSpecialtyWeapon = weaponId === "rocket" || weaponId === "shotgun";
  const effectiveWeaponId = hasCircleShot
    ? "circle"
    : isSpecialtyWeapon
    ? weaponId
    : extraBullets >= 2
    ? "triple"
    : extraBullets >= 1
    ? "double"
    : weaponId;

  function startGame() {
    setLevel(0);
    setHp(5);
    setAmmo(30);
    setScore(0);
    setWaveIdx(0);
    setCorrectCount(0);
    setWeaponId("single");
    setOwnedWeapons(["single"]);
    setAmmoQuizUsed(false);
    setBombs(BOMB_INITIAL_COUNT);
    setUpgradeCounts({});
    setUpgradeChoices([]);
    setCurrentQuestion(null);
    setQuizRetry(0);
    usedQuestionsRef.current.clear();
    setScreen("tutorial");
  }

  function startLevel() {
    setWaveIdx(0);
    setCorrectCount(0);
    setAmmoQuizUsed(false);
    usedQuestionsRef.current.clear();
    setScreen("combat");
  }

  // Wave cleared → skip quiz, go straight to upgrade then next wave
  const onWaveCleared = useCallback(() => {
    setAmmoQuizUsed(false);
    const isLastWave = waveIdx + 1 >= totalQ;
    afterUpgradeRef.current = isLastWave ? "level-complete" : "next-wave";
    setScore((s) => s + 150); // bonus score for clearing a wave
    setUpgradeCounts((prev) => {
      const choices = pickUpgradeChoices(prev, 3);
      setUpgradeChoices(choices);
      return prev;
    });
    setScreen("upgrade");
  }, [level, waveIdx]);

  // Ammo empty mid-wave → quiz to earn more ammo
  const onAmmoEmpty = useCallback(() => {
    setAmmoQuizUsed((used) => {
      if (used) return true;
      setCurrentQuestion(pickQuestion());
      setQuizRetry(0);
      setScreen("quiz");
      return true;
    });
  }, [level]);

  function onQuizAnswer(correct: boolean) {
    if (correct) {
      // Correct → get reward, pick upgrade, then resume same wave
      setHp((h) => Math.min(5, h + 1));
      setAmmo((a) => a + 15);
      setScore((s) => s + 100);
      setCorrectCount((c) => c + 1);
      afterUpgradeRef.current = "resume-combat";
      setUpgradeCounts((prev) => {
        const choices = pickUpgradeChoices(prev, 3);
        setUpgradeChoices(choices);
        return prev;
      });
      setScreen("upgrade");
    } else {
      // Wrong → new question, must answer correctly to get ammo
      setCurrentQuestion(pickQuestion());
      setQuizRetry((r) => r + 1);
    }
  }

  function onUpgradePick(upgradeId: string) {
    // Apply upgrade
    setUpgradeCounts((prev) => {
      const next = { ...prev, [upgradeId]: (prev[upgradeId] || 0) + 1 };
      return next;
    });

    // Apply instant effects
    switch (upgradeId) {
      case "hp_up":
        setHp((h) => Math.min(5, h + 1));
        break;
      case "ammo_up":
        setAmmo((a) => a + 15);
        break;
    }

    // Move to next state
    if (afterUpgradeRef.current === "level-complete") {
      setScreen("level-complete");
    } else if (afterUpgradeRef.current === "resume-combat") {
      // Return to same wave (enemies still alive, just got ammo from quiz)
      setAmmoQuizUsed(false);
      setScreen("combat");
    } else {
      setWaveIdx((w) => w + 1);
      setAmmoQuizUsed(false);
      setScreen("combat");
    }
  }

  function nextLevel() {
    if (level + 1 >= GAME_LEVELS.length) {
      setScreen("victory");
    } else {
      setLevel((l) => l + 1);
      setAmmo(30);
      setBombs(BOMB_INITIAL_COUNT);
      setAmmoQuizUsed(false);
      usedQuestionsRef.current.clear();
      setScreen("shop");
    }
  }

  function restart() {
    setLevel(0);
    setHp(5);
    setAmmo(30);
    setScore(0);
    setWaveIdx(0);
    setCorrectCount(0);
    setWeaponId("single");
    setOwnedWeapons(["single"]);
    setAmmoQuizUsed(false);
    setBombs(BOMB_INITIAL_COUNT);
    setUpgradeCounts({});
    setUpgradeChoices([]);
    setCurrentQuestion(null);
    setQuizRetry(0);
    usedQuestionsRef.current.clear();
    setScreen("title");
  }

  function buyWeapon(id: string) {
    const weapon = WEAPONS.find((w) => w.id === id);
    if (!weapon || score < weapon.cost || ownedWeapons.includes(id)) return;
    setScore((s) => s - weapon.cost);
    setOwnedWeapons((o) => [...o, id]);
    setWeaponId(id);
  }

  function equipWeapon(id: string) {
    if (ownedWeapons.includes(id)) {
      setWeaponId(id);
    }
  }

  // In-game weapon switching (called from ShooterArena via Q key / number keys)
  const onWeaponSwitch = useCallback((id: string) => {
    if (ownedWeapons.includes(id)) {
      setWeaponId(id);
    }
  }, [ownedWeapons]);

  // Build stats display for HUD
  const activeUpgrades: string[] = [];
  if (extraBullets > 0) activeUpgrades.push(`+${extraBullets}đạn`);
  if (hasCircleShot) activeUpgrades.push("360°");
  if (spreadStacks > 0) activeUpgrades.push(`quạt×${spreadStacks}`);
  const fireRateStacks = upgradeCounts["fire_rate"] || 0;
  if (fireRateStacks > 0) activeUpgrades.push(`⚡×${fireRateStacks}`);
  const speedStacks = upgradeCounts["speed_up"] || 0;
  if (speedStacks > 0) activeUpgrades.push(`🏃×${speedStacks}`);

  const currentWeaponData = WEAPONS.find((w) => w.id === effectiveWeaponId);
  const isCombatFlow = screen === "combat" || screen === "quiz" || screen === "upgrade";

  return (
    <>
      <style jsx global>{gameCss}</style>

      <div
        className="relative overflow-hidden flex flex-col"
        style={{ height: "100dvh", background: "linear-gradient(180deg, #0a0a1e 0%, #12122a 50%, #1a1a3a 100%)" }}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-[#090b16]/95 shrink-0"
        >
          <Link href="/" className="pixel-font text-[10px] sm:text-[11px] text-slate-400 hover:text-[#FFD700] hover:scale-105 transition-all bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl font-bold cursor-pointer">
            ← THOÁT GAME
          </Link>
          <span className="pixel-font text-[10px] sm:text-[12px] text-[#FFD700] font-bold text-center tracking-wider [text-shadow:0_0_8px_rgba(255,215,0,0.2)]">
            NHÀ NƯỚC PHÁP QUYỀN XÃ HỘI CHỦ NGHĨA VIỆT NAM — XÂY DỰNG & BẢO VỆ TỔ QUỐC
          </span>
          <span className="pixel-font text-[10px] sm:text-[11px] text-slate-500 bg-slate-900/80 border border-slate-850 px-2.5 py-1 rounded-xl font-semibold">
            v2.2
          </span>
        </div>

        {/* HUD */}
        {(screen === "combat" || screen === "quiz") && (
          <div
            className="grid grid-cols-1 md:grid-cols-3 items-center px-6 py-3.5 border-b border-slate-800 bg-[#090b16]/95 shrink-0 gap-4"
          >
            {/* Left Column: Player Health & Upgrades */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-col gap-1 bg-slate-900/60 border border-slate-850/80 px-3 py-1.5 rounded-xl shadow-inner">
                <span className="pixel-font text-[8px] text-slate-500 uppercase tracking-widest font-bold">Sinh mệnh (HP)</span>
                <div className="flex gap-1 items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <PixelHeart key={i} filled={i < hp} />
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-1 bg-slate-900/60 border border-slate-850/80 px-3 py-1.5 rounded-xl shadow-inner min-h-[38px] justify-center">
                <span className="pixel-font text-[7px] text-slate-500 uppercase tracking-widest font-bold">Nâng cấp hoạt động</span>
                <div className="flex gap-1.5 flex-wrap">
                  {activeUpgrades.length > 0 ? (
                    activeUpgrades.map((up, i) => (
                      <span key={i} className="pixel-font text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/25 px-1.5 py-0.5 rounded uppercase font-semibold">
                        {up}
                      </span>
                    ))
                  ) : (
                    <span className="pixel-font text-[8px] text-slate-600 italic">Trống</span>
                  )}
                </div>
              </div>
            </div>

            {/* Center Column: Weapons, Ammo, Bombs */}
            <div className="flex justify-center items-center gap-4">
              {/* Equipped Weapon Card */}
              <div className="flex items-center gap-3 bg-[#12122a] border border-[#FFD700]/30 px-3.5 py-1.5 rounded-xl shadow-md">
                <span className="text-xl animate-pulse select-none">{currentWeaponData?.emoji}</span>
                <div className="flex flex-col">
                  <span className="pixel-font text-[7px] text-slate-500 uppercase tracking-widest font-bold">Vũ khí</span>
                  <span className="pixel-font text-[11px] text-[#FFD700] font-black">{currentWeaponData?.name}</span>
                </div>
              </div>

              {/* Ammo Indicator */}
              <div className="flex flex-col bg-slate-900/80 border border-slate-800 px-4 py-1.5 rounded-xl text-center min-w-[70px]">
                <span className="pixel-font text-[7px] text-slate-500 uppercase tracking-widest font-bold">Đạn</span>
                <span className={`pixel-font text-[13px] font-black ${ammo <= 5 ? "text-[#ff4444] animate-pulse" : "text-[#4fc3f7]"}`}>
                  {ammo}
                </span>
              </div>

              {/* Bombs Indicator */}
              <div className="flex flex-col bg-slate-900/80 border border-slate-800 px-4 py-1.5 rounded-xl text-center min-w-[60px]" title="Lựu đạn (phím E)">
                <span className="pixel-font text-[7px] text-slate-500 uppercase tracking-widest font-bold">Lựu đạn</span>
                <span className={`pixel-font text-[13px] font-black ${bombs <= 0 ? "text-slate-600" : "text-[#ff9944]"}`}>
                  💣 {bombs}
                </span>
              </div>
            </div>

            {/* Right Column: Score, Level, Wave */}
            <div className="flex items-center justify-end gap-4 flex-wrap">
              {/* Level & Wave */}
              <div className="flex flex-col bg-slate-900/60 border border-slate-850/80 px-3 py-1.5 rounded-xl text-right">
                <span className="pixel-font text-[7px] text-slate-500 uppercase tracking-widest font-bold">Tiến trình</span>
                <span className="pixel-font text-[11px] text-slate-300 font-bold">
                  LV{level + 1} • W{waveIdx + 1}/{totalQ}
                </span>
              </div>

              {/* Score Card */}
              <div className="flex flex-col bg-[#12122a] border border-[#FFD700]/25 px-4 py-1.5 rounded-xl text-right shadow-[0_0_15px_rgba(255,215,0,0.05)]">
                <span className="pixel-font text-[7px] text-slate-500 uppercase tracking-widest font-bold">Điểm số</span>
                <span className="pixel-font text-[14px] text-[#FFD700] font-black tracking-wider">
                  ⬡ {score.toString().padStart(5, "0")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main area — flex-1 to fill remaining space */}
        <div className={`flex-1 min-h-0 ${screen === "combat" ? "overflow-hidden" : "overflow-auto"}`}>
          {isCombatFlow ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <div className="relative w-full h-full bg-[#05060b] flex items-center justify-center p-2">
                {/* CRT Monitor Outer Bezel decoration */}
                <div className="relative w-full h-full border-4 border-slate-900 rounded-2xl overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.9),0_0_35px_rgba(0,0,0,0.7)] bg-black">
                  <ShooterArena
                    levelData={levelData}
                    levelIndex={level}
                    onWaveCleared={onWaveCleared}
                    onAmmoEmpty={onAmmoEmpty}
                    setHp={setHp}
                    ammo={ammo}
                    setAmmo={setAmmo}
                    setScore={setScore}
                    waveNum={waveIdx}
                    weaponId={effectiveWeaponId}
                    upgrades={upgradeCounts}
                    bombs={bombs}
                    setBombs={setBombs}
                    ownedWeapons={ownedWeapons}
                    onWeaponSwitch={onWeaponSwitch}
                    paused={screen !== "combat"}
                  />

                  {screen === "quiz" && currentQuestion && (
                    <div className="absolute inset-0 overflow-auto bg-black/45 backdrop-blur-sm z-30">
                      <QuizScreen
                        key={`quiz-${level}-${waveIdx}-${quizRetry}`}
                        question={currentQuestion}
                        onAnswer={onQuizAnswer}
                      />
                    </div>
                  )}

                  {screen === "upgrade" && (
                    <div className="absolute inset-0 overflow-auto bg-black/45 backdrop-blur-sm z-30">
                      <UpgradeScreen
                        key={`upgrade-${level}-${waveIdx}`}
                        choices={upgradeChoices.map((u) => ({
                          upgrade: u,
                          stacks: upgradeCounts[u.id] || 0,
                        }))}
                        onPick={onUpgradePick}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              {screen === "title" && <TitleScreen key="title" onStart={startGame} />}

              {screen === "tutorial" && (
                <TutorialScreen key="tutorial" onStart={() => setScreen("level-intro")} />
              )}

              {screen === "level-intro" && (
                <LevelIntro key={`intro-${level}`} level={level} levelData={levelData} onStart={startLevel} />
              )}

              {screen === "level-complete" && (
                <LevelComplete
                  key={`complete-${level}`}
                  levelData={levelData}
                  correctCount={correctCount}
                  totalQ={totalQ}
                  totalScore={score}
                  onNext={nextLevel}
                  isLastLevel={level + 1 >= GAME_LEVELS.length}
                />
              )}

              {screen === "shop" && (
                <ShopScreen
                  key={`shop-${level}`}
                  score={score}
                  currentWeaponId={effectiveWeaponId}
                  ownedWeapons={ownedWeapons}
                  onBuy={buyWeapon}
                  onEquip={equipWeapon}
                  onContinue={() => setScreen("level-intro")}
                />
              )}

              {screen === "game-over" && <GameOverScreen key="gameover" score={score} onRestart={restart} />}

              {screen === "victory" && <VictoryScreen key="victory" score={score} onRestart={restart} />}
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}
