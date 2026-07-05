# Bleck's Cave Minecraft Documentation

> Documentation website for Minecraft modpacks and related projects

This is the official documentation website for Bleck's Cave Minecraft projects, including:

- **Aetas Ferrea** - Hardcore medieval survival modpack
- **Aetas Ferrea Extras** - Additional content modules
- **Aetas Ferrea Farmers' Delight** - Farming integration
- **Aetas Ferrea Minecolonies** - Colony management integration
- **Aetas Ferrea Spartan** - Combat enhancements
- **Aetas Ferrea Lib** - Shared library
- **Better Than PvP** - PvP improvements
- **Builder++** - Building tools
- **MC Vanilla Tweaked** - Vanilla enhancements
- **Velocita Optimized** - Performance optimizations

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20 or higher
- **pnpm** 11.9.0 or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/BleckWolf25/blecksCaveMinecraft.git
   cd blecksCaveMinecraft
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open your browser to `http://localhost:5173`

## 📝 Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview the production build
- `pnpm lint` - Run ESLint
- `pnpm test` - Run unit tests
- `pnpm test:watch` - Run unit tests in watch mode
- `pnpm test:e2e` - Run end-to-end tests with Playwright
- `pnpm test:e2e:ui` - Run E2E tests with Playwright UI
- `pnpm typecheck` - Run TypeScript type checking

## 🏗️ Project Structure

```
blecksCaveMinecraft/
├── .github/              # GitHub workflows and templates
├── public/               # Static assets
├── scripts/             # Build and utility scripts
├── src/
│   ├── components/      # React components
│   ├── content/         # Markdown documentation content
│   └── ...              # Other source files
├── tests/               # Test files
├── e2e/                 # E2E test files
├── dist/                # Build output (generated)
└── coverage/            # Test coverage reports (generated)
```

## 🧪 Testing

The project uses **Vitest** for unit testing and **Playwright** for end-to-end testing.

### Run Unit Tests
```bash
pnpm test
```

### Run E2E Tests
```bash
pnpm test:e2e
```

### View Test Coverage
After running tests, coverage reports are generated in the `coverage/` directory.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security concerns, please review our [Security Policy](SECURITY.md).

## 📧 Contact

For questions or support, please open an issue on GitHub or contact [joao.coutinho08@icloud.com](mailto:joao.coutinho08@icloud.com).

---

Built with ❤️ using Vite, TypeScript, and React
