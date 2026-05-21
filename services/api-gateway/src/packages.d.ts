declare module '../../../packages/autonomous-engine/src/core/AgenticCore' {
  export class AgenticCore {
    constructor(config: any);
    processInput(input: any): Promise<any>;
    getSystemStatus(): any;
  }
}

declare module '../../../packages/tool-registry/src/ToolRegistry' {
  export interface RegisteredTool {
    metadata: any;
  }
  export class ToolRegistry {
    constructor(config: any);
    getTools(): RegisteredTool[];
    searchTools(query: string): RegisteredTool[];
    execute(toolId: string, input: any, context: any): Promise<any>;
    getToolStats(toolId: string): any;
  }
}

declare module '../../../packages/knowledge-base/src/VectorKnowledgeBase' {
  export class VectorKnowledgeBase {
    constructor(dimension: number);
    addEmbedding(text: string, metadata?: any): Promise<string>;
    semanticSearch(query: string, topK?: number, threshold?: number, filters?: any): Promise<any>;
    ragQuery(params: any): Promise<any>;
  }
}

declare module '../../../packages/learning-system/src/MetaLearningLayer' {
  export class MetaLearningLayer {
    constructor();
  }
}

declare module '../../../packages/learning-system/src/LearningSystem' {
  export class LearningSystem {
    constructor();
  }
}

declare module '../../../packages/core-engine/src/EventDispatcher' {
  export class EventDispatcher {}
  export const eventDispatcher: EventDispatcher;
}
