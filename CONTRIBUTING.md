# Contributing to Open Budget API

Thank you for your interest in contributing to the Open Budget API! This project is part of BetterGovPH's mission to promote government transparency and open data in the Philippines.

## 🎯 How You Can Contribute

We welcome contributions from developers, data scientists, designers, researchers, and anyone passionate about government transparency. Here are ways you can help:

### 1. **Code Contributions**

- Add new API endpoints or features
- Improve existing endpoints and queries
- Optimize Neo4j Cypher queries for performance
- Fix bugs and issues
- Enhance error handling and validation
- Add comprehensive tests (unit and E2E)

### 2. **Documentation**

- Improve API documentation and examples
- Add tutorials and guides
- Translate documentation to Filipino/Tagalog
- Create video tutorials or demos
- Enhance Swagger/OpenAPI documentation

### 3. **Data Quality**

- Validate budget data accuracy
- Report data inconsistencies or errors
- Suggest data model improvements
- Help with data cleaning and validation scripts

### 4. **Testing**

- Write unit tests and E2E tests
- Perform manual testing and report bugs
- Test API performance and scalability
- Security testing and vulnerability reporting

### 5. **Design & User Experience**

- Improve API design and structure
- Enhance developer experience
- Design better error messages
- Create visual documentation and diagrams

### 6. **Research & Analytics**

- Use the API for research and share findings
- Suggest new analytics endpoints
- Identify use cases and applications
- Provide feedback on API usability

## 🚀 Getting Started

### Prerequisites

Before contributing, make sure you have:

- **Node.js** 20+ installed
- **Neo4j Database** 5.x running locally
- **Yarn** package manager
- **Git** for version control
- Budget data loaded from [open-budget-data](https://github.com/bettergovph/open-budget-data)

### Setting Up Development Environment

1. **Fork the repository**

   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/open-budget-api.git
   cd open-budget-api
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your Neo4j credentials
   ```

4. **Load budget data**
   - Follow instructions in [open-budget-data](https://github.com/bettergovph/open-budget-data) to import data into Neo4j
   - Verify your Neo4j database has the budget data loaded

5. **Run the development server**

   ```bash
   yarn start:dev
   ```

6. **Verify the setup**
   - Open http://localhost:3000/api (Swagger documentation)
   - Test the health endpoint: http://localhost:3000/api/v1/health

## 📝 Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

Branch naming conventions:

- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Adding or updating tests
- `refactor/` - Code refactoring
- `perf/` - Performance improvements

### 2. Make Your Changes

- Follow the existing code style and conventions
- Write clean, readable, and well-documented code
- Add comments for complex logic
- Update relevant documentation

### 3. Write Tests

All new features and bug fixes should include tests:

```bash
# Run unit tests
yarn test

# Run E2E tests
yarn test:e2e

# Check test coverage
yarn test:cov
```

### 4. Format Your Code

Before committing, format your code:

```bash
yarn format
```

### 5. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add budget variance analytics endpoint"
```

Commit message format:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

- Clear title describing the change
- Detailed description of what changed and why
- Reference to any related issues (e.g., "Closes #123")
- Screenshots or examples if applicable

## 📐 Code Style Guidelines

### TypeScript Style

- Use TypeScript strict mode
- Define interfaces for all data structures
- Use meaningful variable and function names
- Avoid `any` types - use specific types or generics
- Use async/await over promises

### NestJS Conventions

- Use dependency injection
- Follow module-controller-service pattern
- Use DTOs for request/response validation
- Document all endpoints with Swagger decorators

### Neo4j Query Guidelines

- Use parameterized queries (prevent injection)
- Optimize queries for performance
- Add comments for complex Cypher queries
- Test queries with large datasets
- Use EXPLAIN/PROFILE for query optimization

## 🐛 Reporting Bugs

Found a bug? Please report it!

### Before Reporting

1. Check if the bug has already been reported in [Issues](https://github.com/bettergovph/open-budget-api/issues)
2. Try to reproduce the bug with the latest code
3. Gather relevant information (logs, screenshots, etc.)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:

1. Call endpoint '...'
2. With parameters '...'
3. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Error logs**
```

Paste error logs here

```

**Environment**
- Node.js version:
- Neo4j version:
- OS:

**Additional context**
Any other relevant information.
```

## 💡 Suggesting Features

Have an idea for a new feature?

### Feature Request Template

```markdown
**Feature description**
Clear description of the feature.

**Use case**
Why is this feature needed? Who will use it?

**Proposed solution**
How should this feature work?

**Example API endpoint**
GET /api/v1/budget/new-feature?param=value
```

## 🔍 Code Review Process

All contributions go through code review:

1. **Manual Review**
   - Code quality and style
   - Logic correctness
   - Performance considerations
   - Security implications
   - Documentation completeness

2. **Feedback**
   - Reviewers may request changes
   - Address feedback by pushing new commits
   - Once approved, your PR will be merged

## 🏆 Recognition

Contributors will be:

- Listed in the project's contributors
- Mentioned in release notes for significant contributions
- Invited to join the core team for sustained contributions

## 📜 Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read the full [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

### Quick Summary

- **Be respectful**: Treat everyone with respect and kindness
- **Be collaborative**: Work together constructively
- **Be inclusive**: Welcome diverse perspectives
- **Be professional**: Focus on what's best for the project
- **Be patient**: Help newcomers learn and grow

### Reporting

If you experience or witness unacceptable behavior, please report it by creating a GitHub Issue with the label "Code of Conduct Violation" or contacting the project maintainers.

For complete details on our standards, enforcement, and reporting process, see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## 📚 Resources

- **Documentation**: [README.md](README.md)
- **Roadmap**: [PLAN.md](PLAN.md)
- **Data Source**: [open-budget-data](https://github.com/bettergovph/open-budget-data)
- **NestJS Docs**: https://docs.nestjs.com
- **Neo4j Cypher**: https://neo4j.com/docs/cypher-manual

## ❓ Questions?

- **General questions**: Open a [Discussion](https://github.com/bettergovph/open-budget-api/discussions)
- **Bug reports**: Open an [Issue](https://github.com/bettergovph/open-budget-api/issues)
- **Feature requests**: Open an [Issue](https://github.com/bettergovph/open-budget-api/issues)

## 🙏 Thank You!

Every contribution, no matter how small, helps make government data more accessible and promotes transparency in the Philippines. Thank you for being part of this mission!

---

**Built with ❤️ for Philippine Government Transparency and Accountability**
