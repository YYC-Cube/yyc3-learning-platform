# Contributing to YYC³ Learning Platform

> **欢迎贡献!** Thank you for considering contributing to the YYC³ Learning Platform. This document provides guidelines and instructions for contributing.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation Standards](#documentation-standards)
- [Issue Reporting](#issue-reporting)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- **Resful**: Treat others with respect and consideration
- **Inclusive**: Welcome diverse perspectives and backgrounds
- **Collaborative**: Work together constructively
- **Professional**: Maintain professional communication

### Reporting Issues

If you encounter any issues, please contact: ai-team@yyc3.com

---

## 🚀 Getting Started

### Ways to Contribute

We welcome contributions in many forms:

1. **Bug Reports**: Report bugs and issues
2. **Feature Requests**: Suggest new features
3. **Code Contributions**: Submit pull requests
4. **Documentation**: Improve documentation
5. **Test Coverage**: Add or improve tests
6. **Code Review**: Review pull requests

### First-Time Contributors

If this is your first time contributing:

1. Read this document thoroughly
2. Set up your development environment
3. Find a good first issue to work on
4. Join our community discussions

### Good First Issues

Look for issues labeled:
- `good first issue` - Suitable for newcomers
- `help wanted` - Community contributions welcome
- `documentation` - Documentation improvements

---

## 🛠️ Development Setup

### Prerequisites

```bash
# Required
- Bun >= 1.0.0
- Node.js >= 18.0.0
- Git >= 2.0
- TypeScript >= 5.0

# Recommended
- VS Code with ESLint and Prettier extensions
- GitHub CLI (gh)
```

### Fork and Clone

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/learning-platform.git
cd learning-platform

# 3. Add upstream remote
git remote add upstream https://github.com/YYC-Cube/learning-platform.git

# 4. Install dependencies
bun install

# 5. Verify setup
bun run type-check
bun test
```

### Development Workflow

```bash
# 1. Create a feature branch
git checkout -b feature/your-feature-name

# 2. Make your changes
# ... edit files ...

# 3. Run tests
bun test

# 4. Run type checking
bun run type-check

# 5. Run linting
bun run lint

# 6. Commit changes
git commit -m "feat: add your feature description"

# 7. Push to your fork
git push origin feature/your-feature-name

# 8. Create a pull request
# (See Pull Request Process below)
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your branch
git checkout main
git merge upstream/main

# Or rebase for cleaner history
git checkout main
git rebase upstream/main

# Push to your fork
git push origin main
```

---

## 📐 Coding Standards

### TypeScript Guidelines

#### Type Safety

**Always use strict types**:

```typescript
// ✅ Good - Explicit types
function calculateScore(score: number): number {
  return score * 1.5;
}

// ❌ Bad - Using 'any'
function calculateScore(score: any): any {
  return score * 1.5;
}
```

**Avoid optional types unless necessary**:

```typescript
// ✅ Good - Explicit null check
function getUser(id: string): User | null {
  const user = database.findUser(id);
  return user ?? null;
}

// ❌ Bad - Unclear optionality
function getUser(id: string): User | undefined {
  return database.findUser(id);
}
```

#### Naming Conventions

```typescript
// Classes: PascalCase
class LearningSystem {}

// Interfaces: PascalCase with 'I' prefix
interface ILearningSystem {}

// Types: PascalCase
type LearningResult = {};

// Functions/Variables: camelCase
function calculateScore() {}
const userCount = 10;

// Constants: UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// Private properties: prefix with underscore
private _config: LearningSystemConfig;

// Enum values: PascalCase
enum LayerStatus {
  Ready = 'ready',
  Running = 'running'
}
```

#### Code Organization

```typescript
// 1. Imports (grouped and sorted)
import { ExternalModule } from 'external-package';
import { InternalModule } from './internal';

// 2. Type definitions
interface MyClassProps {}

// 3. Constants
const DEFAULT_VALUE = 100;

// 4. Class declaration
class MyClass {
  // 4.1 Public properties
  public readonly status: string;

  // 4.2 Private properties
  private _config: Config;

  // 4.3 Constructor
  constructor(config: Config) {
    this._config = config;
  }

  // 4.4 Public methods
  public doSomething(): void {}

  // 4.5 Private methods
  private _helperMethod(): void {}
}
```

### Code Style

#### Formatting

We use **Prettier** for consistent code formatting:

```bash
# Format all files
bun run format

# Check formatting
bun run format:check
```

**Configuration** (.prettierrc):
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

#### Linting

We use **ESLint** for code quality:

```bash
# Run linting
bun run lint

# Auto-fix issues
bun run lint:fix
```

### Best Practices

#### Error Handling

```typescript
// ✅ Good - Explicit error handling
async function fetchData(id: string): Promise<Data> {
  try {
    const data = await database.query(id);
    if (!data) {
      throw new Error(`Data not found: ${id}`);
    }
    return data;
  } catch (error) {
    logError('Failed to fetch data', error);
    throw new Error('Unable to fetch data');
  }
}

// ❌ Bad - Silent errors
async function fetchData(id: string): Promise<Data> {
  const data = await database.query(id);
  return data as Data;
}
```

#### Async/Await

```typescript
// ✅ Good - Use async/await
async function processItems(items: Item[]): Promise<void> {
  for (const item of items) {
    await processItem(item);
  }
}

// ❌ Avoid - Nested promises
function processItems(items: Item[]): Promise<void> {
  return items.reduce((promise, item) => {
    return promise.then(() => processItem(item));
  }, Promise.resolve());
}
```

#### Comments

```typescript
// ✅ Good - Self-documenting code
const isActive = status === LayerStatus.Running;

// ❌ Bad - Redundant comments
// Check if status is running
const isActive = status === LayerStatus.Running;

// ✅ Good - Complex algorithm explanation
/**
 * Implements the Apriori algorithm for frequent itemset mining.
 *
 * Algorithm steps:
 * 1. Generate candidate itemsets
 * 2. Count support for each candidate
 * 3. Filter by minimum support threshold
 * 4. Repeat until no more candidates
 */
function mineFrequentItemsets(): Itemset[] {}
```

---

## 📝 Commit Guidelines

### Commit Message Format

We follow the **Conventional Commits** specification:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes
- `ci`: CI configuration changes

### Examples

```bash
# Feature
git commit -m "feat(behavioral): add pattern clustering algorithm"

# Bug fix
git commit -m "fix(knowledge): resolve memory leak in graph traversal"

# Documentation
git commit -m "docs(api): update LearningSystem API examples"

# Breaking change
git commit -m "feat(core)!: change LearningSystem.initialize() to async

BREAKING CHANGE: initialize() now returns Promise<void> instead of void"

# Multiple scopes
git commit -m "fix(behavioral, strategic): resolve cross-layer event propagation"
```

### Best Practices

- Use the imperative mood ("add" not "added" or "adds")
- Keep the subject line <= 72 characters
- Use the body to explain **what** and **why**, not **how**
- Reference issues: `Closes #123` or `Refs #456`

---

## 🔄 Pull Request Process

### Before Submitting

1. **Search existing PRs**: Avoid duplicate work
2. **Discuss large changes**: Open an issue first for major features
3. **Update documentation**: Include relevant documentation updates
4. **Add tests**: Ensure test coverage is maintained or improved
5. **Run all checks**:
   ```bash
   bun test
   bun run type-check
   bun run lint
   bun run format:check
   ```

### Creating a PR

```bash
# 1. Push your branch
git push origin feature/your-feature-name

# 2. Create PR using GitHub CLI
gh pr create --title "feat: add your feature description" \
             --body "See description below"

# 3. Or create manually on GitHub
```

### PR Title Format

Use the same format as commit messages:

```
type(scope): brief description
```

Examples:
- `feat(behavioral): add pattern clustering`
- `fix(knowledge): resolve graph traversal bug`
- `docs(api): update examples`

### PR Description Template

```markdown
## Description
Briefly describe the changes made in this PR.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123
Related to #456

## Changes Made
- Added feature X
- Fixed bug Y
- Updated documentation for Z

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing locally

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Commit messages follow guidelines
```

### PR Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one maintainer approval required
3. **Changes Requested**: Address review feedback
4. **Approval**: PR approved and ready to merge
5. **Merge**: Maintainer will merge the PR

### Review Guidelines

**For Reviewers**:
- Be constructive and respectful
- Explain reasoning for suggestions
- Approve if changes look good
- Request changes if improvements needed

**For Contributors**:
- Respond to all review comments
- Make requested changes or discuss alternatives
- Mark conversations as resolved when addressed

---

## 🧪 Testing Requirements

### Test Structure

```
tests/
├── unit/              # Unit tests for individual modules
├── integration/       # Integration tests for module interactions
├── e2e/              # End-to-end tests for complete workflows
└── fixtures/         # Test data and mocks
```

### Writing Tests

```typescript
import { test, expect, describe, beforeEach } from 'bun:test';

describe('LearningSystem', () => {
  let system: LearningSystem;

  beforeEach(async () => {
    system = new LearningSystem();
    await system.initialize({
      behavioral: { enabled: true },
      strategic: { enabled: true },
      knowledge: { enabled: true }
    });
  });

  test('should learn from experience', async () => {
    const experience = {
      id: 'exp_001',
      timestamp: Date.now(),
      context: {
        situation: { type: 'test' },
        environment: {},
        objectives: [],
        constraints: [],
        availableResources: []
      },
      actions: [],
      outcomes: [],
      feedback: { satisfaction: 0.8, effectiveness: 0.8 },
      metadata: {}
    };

    const result = await system.learn(experience);

    expect(result.success).toBe(true);
    expect(result.learned).toBeGreaterThan(0);
  });

  test('should predict behavior', async () => {
    const prediction = await system.predict({
      situation: { type: 'test' },
      environment: {},
      actor: { id: 'user_001', type: 'human' }
    });

    expect(prediction).toBeDefined();
    expect(prediction.confidence).toBeGreaterThan(0);
  });
});
```

### Test Requirements

- **New Features**: Must include tests
- **Bug Fixes**: Must include regression tests
- **Coverage**: Maintain >80% code coverage
- **All Tests**: Must pass before PR can be merged

### Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun run test:coverage

# Run specific test file
bun test tests/unit/LearningSystem.test.ts

# Watch mode
bun test --watch
```

---

## 📚 Documentation Standards

### Documentation Types

1. **API Documentation**: Function and class references
2. **Architecture Docs**: System design and structure
3. **Guides**: How-to and tutorials
4. **README**: Project overview and quick start

### Writing Guidelines

#### API Documentation

```typescript
/**
 * Learns from a given experience and updates internal models.
 *
 * @param experience - The learning experience containing context,
 * actions, outcomes, and feedback
 *
 * @returns A promise that resolves to the learning result including
 * success status, patterns learned, and metrics
 *
 * @throws {ValidationError} If the experience data is invalid
 * @throws {SystemNotReadyError} If the system is not initialized
 *
 * @example
 * ```typescript
 * const result = await system.learn({
 *   id: 'exp_001',
 *   timestamp: Date.now(),
 *   context: { situation: { type: 'test' }, environment: {} },
 *   actions: [{ type: 'click', parameters: {} }],
 *   outcomes: [{ success: true, effectiveness: 0.9 }],
 *   feedback: { satisfaction: 0.9, effectiveness: 0.9 },
 *   metadata: { source: 'test' }
 * });
 * ```
 */
async learn(experience: LearningExperience): Promise<LearningResult>
```

#### Markdown Documentation

```markdown
## Feature Name

Brief description of the feature.

### Usage

```typescript
// Code example
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| param1 | string | Description |

### Returns

Description of return value.

### Example

Complete example showing typical usage.

### Notes

Additional information, warnings, or best practices.
```

### Documentation Updates

When contributing code:

- **New features**: Update/add documentation
- **API changes**: Update API documentation
- **Breaking changes**: Update migration guides
- **Bug fixes**: Update affected documentation if needed

---

## 🐛 Issue Reporting

### Before Creating an Issue

1. **Search existing issues**: Avoid duplicates
2. **Check documentation**: Ensure it's not a usage question
3. **Reproduce the bug**: Verify it's a real issue

### Issue Template

#### Bug Report

```markdown
## Bug Description
Clear and concise description of the bug.

## Reproduction Steps
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: [e.g. macOS 12.0]
- Runtime: [e.g. Bun 1.0.0]
- Package Version: [e.g. 1.0.0]

## Additional Context
Screenshots, logs, or other relevant information.
```

#### Feature Request

```markdown
## Feature Description
What feature would you like.

## Problem Statement
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Examples, mockups, or implementation ideas.
```

### Issue Labels

- `bug`: Bug reports
- `feature`: Feature requests
- `enhancement`: Improvements to existing features
- `documentation`: Documentation issues
- `good first issue`: Good for newcomers
- `help wanted`: Community contributions welcome

---

## 🎖️ Recognition

### Contributors

All contributors are recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

### Becoming a Maintainer

Active contributors may be invited to become maintainers based on:
- Quality and consistency of contributions
- Understanding of the codebase
- Participation in reviews and discussions
- Helpfulness to other contributors

---

## 📞 Getting Help

### Resources

- **Documentation**: [Full Docs](./docs/learning-system/INDEX.md)
- **API Reference**: [API Docs](./docs/learning-system/api/API-LearningSystem.md)
- **Examples**: [Examples](./examples/)

### Communication

- **Issues**: [GitHub Issues](https://github.com/YYC-Cube/learning-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YYC-Cube/learning-platform/discussions)
- **Email**: ai-team@yyc3.com

### Asking Questions

When asking questions:

1. Search existing issues and documentation first
2. Provide context: what you're trying to do
3. Share relevant code (sanitized if necessary)
4. Include error messages and stack traces
5. Format your question clearly

---

## 🙏 Thank You

Thank you for your interest in contributing to YYC³ Learning Platform! Your contributions help make this project better for everyone.

**Together, we're building the future of AI learning systems.**

---

*This document is maintained by YYC³ AI Team*

*Last updated: 2026-01-03*
