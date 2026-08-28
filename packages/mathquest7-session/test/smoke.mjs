import assert from 'node:assert/strict';
import {
  TOPICS,
  PASS_MASTERY,
  generateProblem,
  CORE_DAILY_COUNT,
  LEVEL_COUNTS,
  generateDailyBenchmark,
  todayKey,
  activeElapsedMs,
} from '../index.mjs';

assert.equal(PASS_MASTERY, 80);
assert.ok(TOPICS.length >= 1);

const topicId = TOPICS[0].id;
const problem = generateProblem(topicId);
assert.ok(problem.q);
assert.ok(problem.choices.length === 4);
assert.ok(problem.choices.includes(String(problem.a)));

const daily = generateDailyBenchmark(topicId);
assert.equal(daily.length, CORE_DAILY_COUNT);
assert.equal(LEVEL_COUNTS.standard, 3);
assert.equal(LEVEL_COUNTS.complex, 4);
assert.equal(LEVEL_COUNTS.word, 3);
const levels = daily.reduce((acc, q) => {
  acc[q.level] = (acc[q.level] || 0) + 1;
  return acc;
}, {});
assert.deepEqual(levels, { standard: 3, complex: 4, word: 3 });

assert.match(todayKey(), /^\d{4}-\d{2}-\d{2}$/);
assert.equal(activeElapsedMs(1000, null, 5000), 1000);

console.log('mathquest7-session smoke ok');
