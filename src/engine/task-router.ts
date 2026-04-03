/**
 * ABOUTME: Selects an agent configuration for a task using lean routing rules.
 * Supports explicit task metadata overrides plus tag/complexity-based matching.
 */

import type { AgentPluginConfig } from '../plugins/agents/types.js';
import type { TrackerTask } from '../plugins/trackers/types.js';
import type { TaskRoutingComplexity, TaskRoutingRule } from '../config/types.js';

function readTaskComplexity(task: TrackerTask): TaskRoutingComplexity | undefined {
  const value = task.metadata?.complexity;
  if (value === 'simple' || value === 'medium' || value === 'hard') {
    return value;
  }
  return undefined;
}

function readTargetAgent(task: TrackerTask): string | undefined {
  const value = task.metadata?.targetAgent;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export class TaskRouter {
  private readonly rules: TaskRoutingRule[];
  private readonly defaultAgent: AgentPluginConfig;
  private readonly agentsByName = new Map<string, AgentPluginConfig>();

  constructor(
    defaultAgent: AgentPluginConfig,
    availableAgents: AgentPluginConfig[] = [],
    rules: TaskRoutingRule[] = [],
  ) {
    this.defaultAgent = defaultAgent;
    this.rules = rules;

    for (const agent of [...availableAgents, defaultAgent]) {
      this.agentsByName.set(agent.name, agent);
      if (!this.agentsByName.has(agent.plugin)) {
        this.agentsByName.set(agent.plugin, agent);
      }
    }
  }

  select(task: TrackerTask): AgentPluginConfig {
    const explicitTarget = readTargetAgent(task);
    if (explicitTarget) {
      return this.agentsByName.get(explicitTarget) ?? this.defaultAgent;
    }

    const taskLabels = new Set(task.labels ?? []);
    const taskComplexity = readTaskComplexity(task);

    for (const rule of this.rules) {
      if (!this.matchesRule(rule, taskLabels, taskComplexity)) {
        continue;
      }

      const selected = this.agentsByName.get(rule.agent);
      if (selected) {
        return selected;
      }
    }

    return this.defaultAgent;
  }

  private matchesRule(
    rule: TaskRoutingRule,
    taskLabels: Set<string>,
    taskComplexity: TaskRoutingComplexity | undefined,
  ): boolean {
    if (rule.tags && rule.tags.length > 0) {
      const hasMatchingTag = rule.tags.some((tag) => taskLabels.has(tag));
      if (!hasMatchingTag) {
        return false;
      }
    }

    if (rule.complexity && taskComplexity !== rule.complexity) {
      return false;
    }

    return true;
  }
}
