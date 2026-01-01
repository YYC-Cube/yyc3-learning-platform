import { ManagementConfig, StrategicGoal } from '@/types/IFiveDimensionalManagement';
import { Logger } from '@/utils/Logger';

export class GoalValidator {
  private config: ManagementConfig;
  private logger: Logger;

  constructor(config: ManagementConfig) {
    this.config = config;
    this.logger = new Logger('GoalValidator');
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing GoalValidator...');
  }

  async validateGoal(goal: StrategicGoal): Promise<void> {
    // Basic validation
    if (!goal.title || goal.title.trim() === '') {
      throw new Error('Goal title is required');
    }
    if (!goal.description || goal.description.trim() === '') {
      throw new Error('Goal description is required');
    }
    if (!goal.owner || goal.owner.trim() === '') {
      throw new Error('Goal owner is required');
    }
    if (goal.targetValue <= 0) {
      throw new Error('Target value must be greater than 0');
    }
    if (goal.deadline <= new Date()) {
      throw new Error('Deadline must be in the future');
    }
  }
}