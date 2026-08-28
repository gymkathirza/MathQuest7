/**
 * @gymkathirza/mathquest7-session — public barrel for pure MathQuest 7 session helpers.
 * Prefer deep imports (`@gymkathirza/mathquest7-session/curriculum`) when tree-shaking matters.
 */

export {
  PASS_MASTERY,
  MIN_MASTERY_ATTEMPTS,
  WEEKS,
  TOPICS,
  generateProblem,
  topicUnlocked,
  canTakeExit,
  updateMastery,
} from './curriculum.mjs';

export {
  CORE_DAILY_COUNT,
  LEVEL_COUNTS,
  NC_LOCATIONS,
  generateComplexProblem,
  generateNCWordProblem,
  generateTieredProblem,
  generateDailyBenchmark,
} from './daily-session.mjs';

export {
  IDLE_PAUSE_MS,
  BREAK_EVERY_MIN,
  MASTERY_DAY_BASE,
  todayKey,
  yesterdayKey,
  ensurePracticeDay,
  activeElapsedMs,
  elapsedPracticeMin,
  shouldIdlePause,
  cappedSegmentEnd,
  pauseSegment,
  nextBreakThreshold,
  canResumePractice,
  resetMasterySession,
  flushMasterySegment,
  masterySessionElapsedMs,
  masteryDayTotalMs,
  formatPracticeDuration,
  masteryLogRows,
} from './practice-timer.mjs';
