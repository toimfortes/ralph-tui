import { describe, expect, test } from 'bun:test';
import type { AgentPluginConfig } from '../plugins/agents/types.js';
import type { TrackerTask } from '../plugins/trackers/types.js';
import { TaskRouter } from './task-router.js';

const defaultAgent: AgentPluginConfig = {
  name: 'claude-fast',
  plugin: 'claude',
  options: {},
};

const geminiAgent: AgentPluginConfig = {
  name: 'gemini-impl',
  plugin: 'gemini',
  options: {},
};

const reviewerAgent: AgentPluginConfig = {
  name: 'reviewer',
  plugin: 'codex',
  options: {},
};

function createTask(overrides: Partial<TrackerTask> = {}): TrackerTask {
  return {
    id: 'US-001',
    title: 'Test task',
    status: 'open',
    priority: 2,
    ...overrides,
  };
}

describe('TaskRouter', () => {
  test('returns default agent when no rules match', () => {
    const router = new TaskRouter(defaultAgent, [geminiAgent], [
      { tags: ['implementation'], complexity: 'hard', agent: 'gemini-impl' },
    ]);

    expect(router.select(createTask())).toEqual(defaultAgent);
  });

  test('matches rules by tag', () => {
    const router = new TaskRouter(defaultAgent, [geminiAgent], [
      { tags: ['implementation'], agent: 'gemini-impl' },
    ]);

    expect(
      router.select(createTask({ labels: ['implementation', 'backend'] }))
    ).toEqual(geminiAgent);
  });

  test('requires both tag and complexity when both are configured', () => {
    const router = new TaskRouter(defaultAgent, [geminiAgent], [
      { tags: ['implementation'], complexity: 'hard', agent: 'gemini-impl' },
    ]);

    expect(
      router.select(
        createTask({
          labels: ['implementation'],
          metadata: { complexity: 'medium' },
        })
      )
    ).toEqual(defaultAgent);
  });

  test('matches complexity-only rules', () => {
    const router = new TaskRouter(defaultAgent, [reviewerAgent], [
      { complexity: 'simple', agent: 'reviewer' },
    ]);

    expect(
      router.select(createTask({ metadata: { complexity: 'simple' } }))
    ).toEqual(reviewerAgent);
  });

  test('prefers explicit task metadata targetAgent over rules', () => {
    const router = new TaskRouter(defaultAgent, [geminiAgent, reviewerAgent], [
      { tags: ['implementation'], agent: 'gemini-impl' },
    ]);

    expect(
      router.select(
        createTask({
          labels: ['implementation'],
          metadata: { targetAgent: 'reviewer', complexity: 'hard' },
        })
      )
    ).toEqual(reviewerAgent);
  });

  test('accepts plugin ids as routing targets', () => {
    const router = new TaskRouter(defaultAgent, [geminiAgent], [
      { tags: ['implementation'], agent: 'gemini' },
    ]);

    expect(
      router.select(createTask({ labels: ['implementation'] }))
    ).toEqual(geminiAgent);
  });
});
