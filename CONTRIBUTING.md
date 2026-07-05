# Contributing to Bleck's Cave Minecraft Documentation

First off, thank you for taking the time to contribute! Contributions from the community help make the Bleck's Cave Minecraft documentation more comprehensive, accurate, and helpful for everyone.

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Table of Contents

- [Contributing to Bleck's Cave Minecraft Documentation](#contributing-to-blecks-cave-minecraft-documentation)
  - [Table of Contents](#table-of-contents)
  - [How Can I Contribute?](#how-can-i-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Documentation Improvements](#documentation-improvements)
    - [Pull Requests](#pull-requests)
  - [Development Setup](#development-setup)
    - [Prerequisites](#prerequisites)
    - [Setting Up Your Workspace](#setting-up-your-workspace)
    - [Development Commands](#development-commands)
  - [Style \& Code Guidelines](#style--code-guidelines)
    - [TypeScript/JavaScript Coding Style](#typescriptjavascript-coding-style)
    - [React Best Practices](#react-best-practices)
    - [Markdown Documentation Style](#markdown-documentation-style)
    - [Commit Messages](#commit-messages)
  - [Testing](#testing)
    - [Writing Unit Tests](#writing-unit-tests)
    - [Writing E2E Tests](#writing-e2e-tests)
  - [Security Vulnerabilities](#security-vulnerabilities)

---

## How Can I Contribute?

### Reporting Bugs

We use structured GitHub Issue Forms to track bug reports. Before submitting a bug report, please:

1. Check the existing issues to ensure it hasn't been reported or resolved already.
2. Test on a clean environment without browser extensions that might interfere.
3. Fill out the [Bug Report Template](https://github.com/BleckWolf25/blecksCaveMinecraft/issues/new?template=bug_report.yml) completely, including:
   - Project version
   - Browser and OS information
   - Step-by-step instructions to reproduce the issue
   - Screenshots or error messages if applicable

### Suggesting Enhancements

If you have ideas for new features, UI improvements, or functionality additions:

1. Search the issues to verify your suggestion hasn't been discussed before.
2. Open a [Feature Request](https://github.com/BleckWolf25/blecksCaveMinecraft/issues/new?template=feature_request.yml) describing the feature, the problem it solves, and how it might be implemented.

### Documentation Improvements

This project is primarily a documentation site. If you find:

- Inaccurate information
- Missing documentation
- Unclear explanations
- Typos or grammar issues
- Outdated content

Please open a [Documentation Issue](https://github.com/BleckWolf25/blecksCaveMinecraft/issues/new?template=documentation.yml) or submit a pull request with your improvements.

### Pull Requests

To submit code changes:

1. **Fork** the repository and create your branch from `main` or the active development branch (e.g., `feature/your-feature-name` or `bugfix/issue-description`).
2. Make your changes, keeping them focused. Avoid unrelated changes.
3. Write clean, readable code following our guidelines.
4. Ensure your changes compile and pass all tests locally.
5. Submit a Pull Request (PR) with a clear description of the changes and references to any related issues.

---

## Development Setup

This project is built with **Vite**, **TypeScript**, and **React**.

### Prerequisites

- **Node.js** 20 or higher: Ensure you have Node.js installed and configured in your environment variables.
- **pnpm** 11.9.0 or higher: We use pnpm as our package manager for faster, more efficient dependency management.
- **Git**: Installed and configured on your system.
- **An IDE**: VS Code (recommended), IntelliJ IDEA, or any editor with TypeScript support.

### Setting Up Your Workspace

1. **Clone the repository:**

   ```bash
   git clone https://github.com/BleckWolf25/blecksCaveMinecraft.git
   cd blecksCaveMinecraft
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Start the development server:**

   ```bash
   pnpm dev
   ```

4. Open your browser to `http://localhost:5173`

### Development Commands

Use the following pnpm commands in your project root:

- **Start development server:**

  ```bash
  pnpm dev
  ```

- **Build for production:**

  ```bash
  pnpm build
  ```

- **Preview production build:**

  ```bash
  pnpm preview
  ```

- **Run linter:**

  ```bash
  pnpm lint
  ```

- **Run type check:**

  ```bash
  pnpm typecheck
  ```

- **Run unit tests:**

  ```bash
  pnpm test
  ```

- **Run unit tests in watch mode:**

  ```bash
  pnpm test:watch
  ```

- **Run E2E tests:**

  ```bash
  pnpm test:e2e
  ```

- **Run E2E tests with UI:**

  ```bash
  pnpm test:e2e:ui
  ```

---

## Style & Code Guidelines

### TypeScript/JavaScript Coding Style

To keep the codebase uniform and easy to read:

- **Indentation:** Use 4 spaces for indentation. Do not use tabs.
- **Naming Conventions:**
  - Components and Classes: `PascalCase`
  - Functions and Variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `kebab-case` for utilities, `PascalCase` for components
- **Braces:** Use standard Egyptian brackets style:

  ```typescript
  export function exampleFunction(): void {
    if (condition) {
      // code
    } else {
      // code
    }
  }
  ```

- **Type Safety:** Always use TypeScript types. Avoid `any` unless absolutely necessary.
- **Comments:** Add JSDoc comments to public functions and complex logic.

### React Best Practices

- **Functional Components:** Use functional components with hooks.
- **Props:** Define props interfaces explicitly:

  ```typescript
  interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }

  export function Button({ label, onClick, disabled = false }: ButtonProps) {
    return <button onClick={onClick} disabled={disabled}>{label}</button>;
  }
  ```

- **State Management:** Use `useState`, `useReducer`, or external state management as appropriate.
- **Side Effects:** Use `useEffect` for side effects with proper dependency arrays.
- **Performance:** Use `useMemo` and `useCallback` for expensive computations and callbacks when needed.

### Markdown Documentation Style

When editing documentation in `src/content/`:

- Use clear, descriptive headings
- Include code examples with proper syntax highlighting
- Add screenshots or diagrams where helpful
- Keep language simple and accessible
- Use consistent formatting throughout

### Commit Messages

Use clear and descriptive commit messages. We recommend using prefix tags for commits, such as:

- `feat: ...` for a new feature
- `fix: ...` for a bug fix
- `docs: ...` for documentation changes
- `refactor: ...` for code style or internal design changes
- `style: ...` for formatting fixes
- `test: ...` for adding or updating tests
- `chore: ...` for maintenance tasks

Example:

```text
feat: add search functionality to documentation sidebar
```

---

## Testing

This project uses **Vitest** for unit testing and **Playwright** for end-to-end testing.

### Writing Unit Tests

- Place test files next to the source files with `.test.ts` or `.test.tsx` extension
- Test components and utility functions thoroughly
- Mock external dependencies appropriately
- Aim for high test coverage on critical paths

### Writing E2E Tests

- Place E2E tests in the `e2e/` directory
- Test user flows and critical functionality
- Use Playwright's best practices for reliable tests
- Run tests locally before submitting PRs

---

## Security Vulnerabilities

Please do not report security vulnerabilities in public issues. Refer to our [Security Policy](SECURITY.md) for instructions on how to report security issues privately.
