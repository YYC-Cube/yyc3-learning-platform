/**
 * @fileoverview 考试工具函数测试
 * @description 测试exam-utils模块的所有考试相关函数
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-05
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateScore,
  shuffleArray,
  getQuestionsByDifficulty,
  getQuestionsByCategory,
  type Question,
  type ExamResult,
} from '@/lib/exam-utils';

describe('calculateScore', () => {
  let mockQuestions: Question[];

  beforeEach(() => {
    mockQuestions = [
      {
        id: '1',
        text: 'Question 1',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        difficulty: 'easy' as const,
        category: 'math',
      },
      {
        id: '2',
        text: 'Question 2',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'B',
        difficulty: 'medium' as const,
        category: 'science',
      },
      {
        id: '3',
        text: 'Question 3',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'C',
        difficulty: 'hard' as const,
        category: 'math',
      },
    ];
  });

  it('应该正确计算全部正确的分数', () => {
    const answers = {
      0: 'A',
      1: 'B',
      2: 'C',
    };

    const result = calculateScore(mockQuestions, answers);

    expect(result.score).toBe(3);
    expect(result.total).toBe(3);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.correctAnswers).toBe(3);
    expect(result.incorrectAnswers).toBe(0);
    expect(result.skippedAnswers).toBe(0);
  });

  it('应该正确计算部分正确的分数', () => {
    const answers = {
      0: 'A',
      1: 'A', // wrong
      2: 'D', // wrong
    };

    const result = calculateScore(mockQuestions, answers);

    expect(result.score).toBe(1);
    expect(result.total).toBe(3);
    expect(result.percentage).toBeCloseTo(33.33, 1);
    expect(result.passed).toBe(false);
    expect(result.correctAnswers).toBe(1);
    expect(result.incorrectAnswers).toBe(2);
    expect(result.skippedAnswers).toBe(0);
  });

  it('应该正确处理包含跳过的答案', () => {
    const answers = {
      0: 'A',
      // 1 skipped
      2: 'C',
    };

    const result = calculateScore(mockQuestions, answers);

    expect(result.score).toBe(2);
    expect(result.total).toBe(3);
    expect(result.percentage).toBeCloseTo(66.67, 1);
    expect(result.passed).toBe(true);
    expect(result.correctAnswers).toBe(2);
    expect(result.incorrectAnswers).toBe(0);
    expect(result.skippedAnswers).toBe(1);
  });

  it('应该正确处理全部跳过的情况', () => {
    const answers = {};

    const result = calculateScore(mockQuestions, answers);

    expect(result.score).toBe(0);
    expect(result.total).toBe(3);
    expect(result.percentage).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.correctAnswers).toBe(0);
    expect(result.incorrectAnswers).toBe(0);
    expect(result.skippedAnswers).toBe(3);
  });

  it('应该正确判断及格分数线(60%)', () => {
    const answers60 = {
      0: 'A',
      1: 'B',
      2: 'D', // wrong
    };

    const result60 = calculateScore(mockQuestions, answers60);

    expect(result60.percentage).toBeCloseTo(66.67, 1);
    expect(result60.passed).toBe(true);

    const answers59 = {
      0: 'A',
      1: 'D', // wrong
      2: 'D', // wrong
    };

    const result59 = calculateScore(mockQuestions, answers59);

    expect(result59.percentage).toBeCloseTo(33.33, 1);
    expect(result59.passed).toBe(false);
  });

  it('应该正确计算正好60%的情况', () => {
    const questions = [
      ...mockQuestions,
      {
        id: '4',
        text: 'Question 4',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'D',
        difficulty: 'easy' as const,
        category: 'math',
      },
      {
        id: '5',
        text: 'Question 5',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        difficulty: 'medium' as const,
        category: 'science',
      },
    ];

    const answers = {
      0: 'A',
      1: 'B',
      2: 'C',
      3: 'D',
      4: 'D', // wrong - 4/5 = 80% passed
    };

    const result = calculateScore(questions, answers);
    expect(result.score).toBe(4);
    expect(result.total).toBe(5);
    expect(result.percentage).toBe(80);
    expect(result.passed).toBe(true);

    // Test exactly 60%
    const answers60 = {
      0: 'A',
      1: 'D', // wrong
      2: 'C',
      3: 'D',
      4: 'D', // wrong - 3/5 = 60%
    };

    const result60 = calculateScore(questions, answers60);
    expect(result60.score).toBe(3);
    expect(result60.total).toBe(5);
    expect(result60.percentage).toBe(60);
    expect(result60.passed).toBe(true);
  });

  it('应该初始化timeSpent为0', () => {
    const answers = {
      0: 'A',
      1: 'B',
      2: 'C',
    };

    const result = calculateScore(mockQuestions, answers);
    expect(result.timeSpent).toBe(0);
  });

  it('应该处理空问题列表', () => {
    const result = calculateScore([], {});

    expect(result.score).toBe(0);
    expect(result.total).toBe(0);
    expect(result.percentage).toBeNaN(); // 0/0 = NaN
    expect(result.passed).toBe(false);
    expect(result.correctAnswers).toBe(0);
    expect(result.incorrectAnswers).toBe(0);
    expect(result.skippedAnswers).toBe(0);
  });
});

describe('shuffleArray', () => {
  it('应该返回数组的副本而不修改原数组', () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];

    const shuffled = shuffleArray(original);

    expect(original).toEqual(originalCopy);
    expect(shuffled).not.toBe(original);
  });

  it('应该返回相同长度的数组', () => {
    const array = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(array);

    expect(shuffled).toHaveLength(array.length);
  });

  it('应该包含原数组的所有元素', () => {
    const array = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(array);

    expect(shuffled.sort()).toEqual(array.sort());
  });

  it('应该处理空数组', () => {
    const result = shuffleArray([]);

    expect(result).toEqual([]);
  });

  it('应该处理单元素数组', () => {
    const result = shuffleArray([1]);

    expect(result).toEqual([1]);
  });

  it('应该处理双元素数组', () => {
    const array = [1, 2];
    const results = new Set();

    // 多次洗牌，应该有两种可能的结果
    for (let i = 0; i < 20; i++) {
      const shuffled = shuffleArray(array);
      results.add(JSON.stringify(shuffled));
    }

    // 应该至少产生两种不同的结果（虽然不是100%保证）
    expect(results.size).toBeGreaterThan(1);
  });

  it('应该正确洗牌字符串数组', () => {
    const array = ['a', 'b', 'c', 'd', 'e'];
    const shuffled = shuffleArray(array);

    expect(shuffled.sort()).toEqual(array.sort());
  });

  it('应该正确洗牌对象数组', () => {
    const array = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
      { id: 3, name: 'C' },
    ];
    const shuffled = shuffleArray(array);

    expect(shuffled).toHaveLength(3);
    expect(shuffled.map(item => item.id).sort()).toEqual([1, 2, 3]);
  });
});

describe('getQuestionsByDifficulty', () => {
  let mockQuestions: Question[];

  beforeEach(() => {
    mockQuestions = [
      {
        id: '1',
        text: 'Easy Question 1',
        options: ['A', 'B'],
        correctAnswer: 'A',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: '2',
        text: 'Medium Question 1',
        options: ['A', 'B'],
        correctAnswer: 'B',
        difficulty: 'medium',
        category: 'science',
      },
      {
        id: '3',
        text: 'Easy Question 2',
        options: ['A', 'B'],
        correctAnswer: 'A',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: '4',
        text: 'Hard Question 1',
        options: ['A', 'B'],
        correctAnswer: 'A',
        difficulty: 'hard',
        category: 'history',
      },
      {
        id: '5',
        text: 'Medium Question 2',
        options: ['A', 'B'],
        correctAnswer: 'B',
        difficulty: 'medium',
        category: 'science',
      },
    ];
  });

  it('应该正确筛选简单题目', () => {
    const result = getQuestionsByDifficulty(mockQuestions, 'easy');

    expect(result).toHaveLength(2);
    expect(result.every(q => q.difficulty === 'easy')).toBe(true);
    expect(result.map(q => q.id)).toEqual(['1', '3']);
  });

  it('应该正确筛选中等题目', () => {
    const result = getQuestionsByDifficulty(mockQuestions, 'medium');

    expect(result).toHaveLength(2);
    expect(result.every(q => q.difficulty === 'medium')).toBe(true);
    expect(result.map(q => q.id)).toEqual(['2', '5']);
  });

  it('应该正确筛选困难题目', () => {
    const result = getQuestionsByDifficulty(mockQuestions, 'hard');

    expect(result).toHaveLength(1);
    expect(result.every(q => q.difficulty === 'hard')).toBe(true);
    expect(result[0].id).toBe('4');
  });

  it('应该在没有匹配题目时返回空数组', () => {
    const questions: Question[] = [
      {
        id: '1',
        text: 'Question 1',
        options: ['A', 'B'],
        correctAnswer: 'A',
        difficulty: 'easy' as const,
        category: 'math',
      },
    ];

    const result = getQuestionsByDifficulty(questions, 'hard');

    expect(result).toEqual([]);
  });

  it('应该处理空数组', () => {
    const result = getQuestionsByDifficulty([], 'easy');

    expect(result).toEqual([]);
  });

  it('应该返回新数组而不修改原数组', () => {
    const originalCopy = [...mockQuestions];
    const result = getQuestionsByDifficulty(mockQuestions, 'easy');

    expect(mockQuestions).toEqual(originalCopy);
    expect(result).not.toBe(mockQuestions);
  });

  it('应该正确处理没有difficulty字段的题目', () => {
    const questions: Question[] = [
      {
        id: '1',
        text: 'Question 1',
        options: ['A', 'B'],
        correctAnswer: 'A',
        // difficulty undefined
      },
    ];

    const result = getQuestionsByDifficulty(questions, 'easy');

    expect(result).toEqual([]);
  });
});

describe('getQuestionsByCategory', () => {
  let mockQuestions: Question[];

  beforeEach(() => {
    mockQuestions = [
      {
        id: '1',
        text: 'Math Question 1',
        options: ['A', 'B'],
        correctAnswer: 'A',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: '2',
        text: 'Science Question 1',
        options: ['A', 'B'],
        correctAnswer: 'B',
        difficulty: 'medium',
        category: 'science',
      },
      {
        id: '3',
        text: 'Math Question 2',
        options: ['A', 'B'],
        correctAnswer: 'A',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: '4',
        text: 'History Question 1',
        options: ['A', 'B'],
        correctAnswer: 'A',
        difficulty: 'hard',
        category: 'history',
      },
      {
        id: '5',
        text: 'Science Question 2',
        options: ['A', 'B'],
        correctAnswer: 'B',
        difficulty: 'medium',
        category: 'science',
      },
    ];
  });

  it('应该正确筛选数学题目', () => {
    const result = getQuestionsByCategory(mockQuestions, 'math');

    expect(result).toHaveLength(2);
    expect(result.every(q => q.category === 'math')).toBe(true);
    expect(result.map(q => q.id)).toEqual(['1', '3']);
  });

  it('应该正确筛选科学题目', () => {
    const result = getQuestionsByCategory(mockQuestions, 'science');

    expect(result).toHaveLength(2);
    expect(result.every(q => q.category === 'science')).toBe(true);
    expect(result.map(q => q.id)).toEqual(['2', '5']);
  });

  it('应该正确筛选历史题目', () => {
    const result = getQuestionsByCategory(mockQuestions, 'history');

    expect(result).toHaveLength(1);
    expect(result.every(q => q.category === 'history')).toBe(true);
    expect(result[0].id).toBe('4');
  });

  it('应该在没有匹配题目时返回空数组', () => {
    const result = getQuestionsByCategory(mockQuestions, 'geography');

    expect(result).toEqual([]);
  });

  it('应该处理空数组', () => {
    const result = getQuestionsByCategory([], 'math');

    expect(result).toEqual([]);
  });

  it('应该返回新数组而不修改原数组', () => {
    const originalCopy = [...mockQuestions];
    const result = getQuestionsByCategory(mockQuestions, 'math');

    expect(mockQuestions).toEqual(originalCopy);
    expect(result).not.toBe(mockQuestions);
  });

  it('应该正确处理没有category字段的题目', () => {
    const questions: Question[] = [
      {
        id: '1',
        text: 'Question 1',
        options: ['A', 'B'],
        correctAnswer: 'A',
        difficulty: 'easy',
        // category undefined
      },
    ];

    const result = getQuestionsByCategory(questions, 'math');

    expect(result).toEqual([]);
  });
});

describe('综合测试', () => {
  it('应该在实际考试场景中正确工作', () => {
    const questions: Question[] = [
      {
        id: '1',
        text: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '4',
        difficulty: 'easy',
        category: 'math',
      },
      {
        id: '2',
        text: 'What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 'Paris',
        difficulty: 'easy',
        category: 'geography',
      },
      {
        id: '3',
        text: 'Solve: x + 5 = 10',
        options: ['3', '4', '5', '6'],
        correctAnswer: '5',
        difficulty: 'medium',
        category: 'math',
      },
    ];

    const answers = {
      0: '4',
      1: 'Paris',
      2: '5',
    };

    const result = calculateScore(questions, answers);

    expect(result.score).toBe(3);
    expect(result.total).toBe(3);
    expect(result.percentage).toBe(100);
    expect(result.passed).toBe(true);

    // 测试按难度筛选
    const easyQuestions = getQuestionsByDifficulty(questions, 'easy');
    expect(easyQuestions).toHaveLength(2);

    const mediumQuestions = getQuestionsByDifficulty(questions, 'medium');
    expect(mediumQuestions).toHaveLength(1);

    // 测试按分类筛选
    const mathQuestions = getQuestionsByCategory(questions, 'math');
    expect(mathQuestions).toHaveLength(2);

    const geoQuestions = getQuestionsByCategory(questions, 'geography');
    expect(geoQuestions).toHaveLength(1);
  });

  it('应该正确组合使用多个函数', () => {
    const allQuestions: Question[] = [
      { id: '1', text: 'Q1', options: ['A', 'B'], correctAnswer: 'A', difficulty: 'easy', category: 'math' },
      { id: '2', text: 'Q2', options: ['A', 'B'], correctAnswer: 'B', difficulty: 'medium', category: 'math' },
      { id: '3', text: 'Q3', options: ['A', 'B'], correctAnswer: 'A', difficulty: 'easy', category: 'science' },
    ];

    // 获取数学题目
    const mathQuestions = getQuestionsByCategory(allQuestions, 'math');
    expect(mathQuestions).toHaveLength(2);

    // 从数学题目中获取简单题目
    const easyMathQuestions = getQuestionsByDifficulty(mathQuestions, 'easy');
    expect(easyMathQuestions).toHaveLength(1);
    expect(easyMathQuestions[0].id).toBe('1');

    // 打乱题目顺序
    const shuffled = shuffleArray(easyMathQuestions);
    expect(shuffled).toHaveLength(1);
  });
});
