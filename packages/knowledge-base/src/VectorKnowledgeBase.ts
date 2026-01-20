/**
 * 向量知识库系统
 * 支持向量检索、知识图谱、RAG等功能
 */

// ==================== 类型定义 ====================

export interface VectorEmbedding {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
  text: string;
  timestamp: number;
}

export interface SearchResult {
  id: string;
  score: number;
  embedding: VectorEmbedding;
  snippet?: string;
}

export interface KnowledgeNode {
  id: string;
  type: string;
  label: string;
  properties: Record<string, any>;
  embeddings?: number[];
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  properties: Record<string, any>;
  weight?: number;
}

export interface KnowledgeGraph {
  nodes: Map<string, KnowledgeNode>;
  edges: Map<string, KnowledgeEdge>;
}

export interface RAGContext {
  query: string;
  topK: number;
  threshold?: number;
  filters?: Record<string, any>;
}

export interface RAGResult {
  answer: string;
  sources: SearchResult[];
  confidence: number;
  reasoning?: string;
}

// ==================== 向量知识库 ====================

export class VectorKnowledgeBase {
  private embeddings: Map<string, VectorEmbedding> = new Map();
  private knowledgeGraph: KnowledgeGraph = {
    nodes: new Map(),
    edges: new Map()
  };
  private embeddingDimension: number = 384; // 默认维度

  constructor(dimension?: number) {
    if (dimension) {
      this.embeddingDimension = dimension;
    }
  }

  // ==================== 向量操作 ====================

  /**
   * 添加向量嵌入
   */
  public async addEmbedding(
    text: string,
    metadata: Record<string, any> = {},
    vector?: number[]
  ): Promise<string> {
    const id = this.generateId();
    const embedding: VectorEmbedding = {
      id,
      vector: vector || await this.generateEmbedding(text),
      metadata,
      text,
      timestamp: Date.now()
    };

    this.embeddings.set(id, embedding);
    return id;
  }

  /**
   * 批量添加向量
   */
  public async addEmbeddingsBatch(
    items: Array<{ text: string; metadata?: Record<string, any>; vector?: number[] }>
  ): Promise<string[]> {
    const ids: string[] = [];
    for (const item of items) {
      const id = await this.addEmbedding(item.text, item.metadata, item.vector);
      ids.push(id);
    }
    return ids;
  }

  /**
   * 删除向量
   */
  public deleteEmbedding(id: string): boolean {
    return this.embeddings.delete(id);
  }

  /**
   * 获取向量
   */
  public getEmbedding(id: string): VectorEmbedding | undefined {
    return this.embeddings.get(id);
  }

  /**
   * 语义搜索
   */
  public async semanticSearch(
    query: string,
    topK: number = 10,
    threshold: number = 0.7,
    filters?: Record<string, any>
  ): Promise<SearchResult[]> {
    const queryVector = await this.generateEmbedding(query);
    const results: SearchResult[] = [];

    for (const [id, embedding] of this.embeddings) {
      // 应用过滤器
      if (filters && !this.matchFilters(embedding.metadata, filters)) {
        continue;
      }

      const score = this.cosineSimilarity(queryVector, embedding.vector);
      
      if (score >= threshold) {
        results.push({
          id,
          score,
          embedding,
          snippet: this.generateSnippet(embedding.text, query)
        });
      }
    }

    // 按相似度排序并返回 topK 结果
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  /**
   * 混合搜索（向量 + 关键词）
   */
  public async hybridSearch(
    query: string,
    topK: number = 10,
    vectorWeight: number = 0.7,
    keywordWeight: number = 0.3
  ): Promise<SearchResult[]> {
    const vectorResults = await this.semanticSearch(query, topK * 2);
    const keywordResults = this.keywordSearch(query, topK * 2);

    // 合并结果
    const combined = new Map<string, SearchResult>();

    vectorResults.forEach(result => {
      combined.set(result.id, {
        ...result,
        score: result.score * vectorWeight
      });
    });

    keywordResults.forEach(result => {
      const existing = combined.get(result.id);
      if (existing) {
        existing.score += result.score * keywordWeight;
      } else {
        combined.set(result.id, {
          ...result,
          score: result.score * keywordWeight
        });
      }
    });

    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // ==================== 知识图谱 ====================

  /**
   * 添加知识节点
   */
  public addNode(node: KnowledgeNode): void {
    this.knowledgeGraph.nodes.set(node.id, node);
  }

  /**
   * 添加知识边
   */
  public addEdge(edge: KnowledgeEdge): void {
    this.knowledgeGraph.edges.set(edge.id, edge);
  }

  /**
   * 获取节点
   */
  public getNode(id: string): KnowledgeNode | undefined {
    return this.knowledgeGraph.nodes.get(id);
  }

  /**
   * 获取相关节点
   */
  public getRelatedNodes(nodeId: string, maxDepth: number = 2): KnowledgeNode[] {
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: nodeId, depth: 0 }];
    const results: KnowledgeNode[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current.id) || current.depth > maxDepth) {
        continue;
      }

      visited.add(current.id);
      const node = this.getNode(current.id);
      
      if (node && current.depth > 0) {
        results.push(node);
      }

      // 找到相关边
      for (const edge of this.knowledgeGraph.edges.values()) {
        if (edge.source === current.id && !visited.has(edge.target)) {
          queue.push({ id: edge.target, depth: current.depth + 1 });
        }
        if (edge.target === current.id && !visited.has(edge.source)) {
          queue.push({ id: edge.source, depth: current.depth + 1 });
        }
      }
    }

    return results;
  }

  /**
   * 路径查询
   */
  public findPath(sourceId: string, targetId: string, maxDepth: number = 5): KnowledgeEdge[] | null {
    const queue: Array<{ nodeId: string; path: KnowledgeEdge[]; depth: number }> = [
      { nodeId: sourceId, path: [], depth: 0 }
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.nodeId === targetId) {
        return current.path;
      }

      if (current.depth >= maxDepth || visited.has(current.nodeId)) {
        continue;
      }

      visited.add(current.nodeId);

      for (const edge of this.knowledgeGraph.edges.values()) {
        if (edge.source === current.nodeId && !visited.has(edge.target)) {
          queue.push({
            nodeId: edge.target,
            path: [...current.path, edge],
            depth: current.depth + 1
          });
        }
      }
    }

    return null;
  }

  // ==================== RAG 检索增强生成 ====================

  /**
   * RAG 查询
   */
  public async ragQuery(context: RAGContext): Promise<RAGResult> {
    // 1. 检索相关内容
    const searchResults = await this.semanticSearch(
      context.query,
      context.topK,
      context.threshold,
      context.filters
    );

    if (searchResults.length === 0) {
      return {
        answer: '抱歉，没有找到相关信息。',
        sources: [],
        confidence: 0
      };
    }

    // 2. 构建上下文
    const contextText = searchResults
      .map(result => result.embedding.text)
      .join('\n\n');

    // 3. 生成答案（这里是简化版，实际应调用 LLM）
    const answer = await this.generateAnswer(context.query, contextText);

    // 4. 计算置信度
    const confidence = this.calculateConfidence(searchResults);

    return {
      answer,
      sources: searchResults,
      confidence,
      reasoning: `基于 ${searchResults.length} 个相关来源生成答案`
    };
  }

  /**
   * 多跳推理
   */
  public async multiHopReasoning(
    query: string,
    maxHops: number = 3
  ): Promise<{
    answer: string;
    reasoning: string[];
    sources: SearchResult[];
  }> {
    const reasoning: string[] = [];
    const allSources: SearchResult[] = [];
    let currentQuery = query;

    for (let hop = 0; hop < maxHops; hop++) {
      const results = await this.semanticSearch(currentQuery, 5);
      
      if (results.length === 0) break;

      allSources.push(...results);
      reasoning.push(`第 ${hop + 1} 步: 找到 ${results.length} 个相关结果`);

      // 提取关键信息用于下一跳
      currentQuery = this.extractNextQuery(results);
    }

    const answer = await this.generateAnswer(query, allSources.map(s => s.embedding.text).join('\n'));

    return {
      answer,
      reasoning,
      sources: allSources
    };
  }

  // ==================== 辅助方法 ====================

  /**
   * 生成向量嵌入（简化实现）
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // 实际应使用真实的嵌入模型（如 Sentence Transformers）
    // 这里使用简单的哈希+归一化作为演示
    const vector = new Array(this.embeddingDimension).fill(0);
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = (charCode * (i + 1)) % this.embeddingDimension;
      vector[index] += charCode / 1000;
    }

    // 归一化
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  /**
   * 余弦相似度
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vector dimensions must match');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * 关键词搜索
   */
  private keywordSearch(query: string, topK: number): SearchResult[] {
    const keywords = query.toLowerCase().split(/\s+/);
    const results: SearchResult[] = [];

    for (const [id, embedding] of this.embeddings) {
      const text = embedding.text.toLowerCase();
      let score = 0;

      keywords.forEach(keyword => {
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
        score += matches;
      });

      if (score > 0) {
        results.push({
          id,
          score: score / keywords.length, // 归一化
          embedding,
          snippet: this.generateSnippet(embedding.text, query)
        });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  /**
   * 刷新知识库
   */
  public async refresh(): Promise<void> {
    // 简化实现，实际应重新加载或更新知识库内容
    console.log('Refreshing vector knowledge base...');
    // 可以在此添加实际的刷新逻辑
  }

  /**
   * 生成摘要片段
   */
  private generateSnippet(text: string, query: string, contextLength: number = 150): string {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) {
      return text.substring(0, contextLength) + '...';
    }

    const start = Math.max(0, index - contextLength / 2);
    const end = Math.min(text.length, index + lowerQuery.length + contextLength / 2);
    
    let snippet = text.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  }

  /**
   * 匹配过滤器
   */
  private matchFilters(metadata: Record<string, any>, filters: Record<string, any>): boolean {
    return Object.entries(filters).every(([key, value]) => {
      return metadata[key] === value;
    });
  }

  /**
   * 生成答案（简化实现）
   */
  private async generateAnswer(query: string, context: string): Promise<string> {
    // 实际应调用 LLM API
    return `基于提供的上下文，关于"${query}"的回答：\n${context.substring(0, 200)}...`;
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(results: SearchResult[]): number {
    if (results.length === 0) return 0;
    
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const topScore = results[0]?.score || 0;
    
    return (avgScore * 0.6 + topScore * 0.4);
  }

  /**
   * 提取下一跳查询
   */
  private extractNextQuery(results: SearchResult[]): string {
    // 简化实现：使用第一个结果的片段
    return results[0]?.snippet || results[0]?.embedding.text.substring(0, 100) || '';
  }

  /**
   * 生成ID
   */
  private generateId(): string {
    return `vec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // ==================== 统计和管理 ====================

  /**
   * 获取统计信息
   */
  public getStats() {
    return {
      totalEmbeddings: this.embeddings.size,
      totalNodes: this.knowledgeGraph.nodes.size,
      totalEdges: this.knowledgeGraph.edges.size,
      dimension: this.embeddingDimension,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * 估算内存使用
   */
  private estimateMemoryUsage(): string {
    const bytesPerVector = this.embeddingDimension * 8; // float64
    const totalBytes = this.embeddings.size * bytesPerVector;
    const mb = totalBytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  /**
   * 清空数据
   */
  public clear(): void {
    this.embeddings.clear();
    this.knowledgeGraph.nodes.clear();
    this.knowledgeGraph.edges.clear();
  }

  /**
   * 导出数据
   */
  public export() {
    return {
      embeddings: Array.from(this.embeddings.entries()),
      nodes: Array.from(this.knowledgeGraph.nodes.entries()),
      edges: Array.from(this.knowledgeGraph.edges.entries()),
      dimension: this.embeddingDimension
    };
  }

  /**
   * 导入数据
   */
  public import(data: ReturnType<typeof this.export>): void {
    this.embeddings = new Map(data.embeddings);
    this.knowledgeGraph.nodes = new Map(data.nodes);
    this.knowledgeGraph.edges = new Map(data.edges);
    this.embeddingDimension = data.dimension;
  }
}

// ==================== 单例导出 ====================

export const vectorKnowledgeBase = new VectorKnowledgeBase();
