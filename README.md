# Prefer JSR &middot; [![JSR Scope](https://jsr.io/badges/@prefer-jsr)](https://jsr.io/@prefer-jsr)

A collection of tools to help JavaScript/TypeScript projects prefer [JSR](https://jsr.io/) packages over npm when available.

## Packages

This monorepo contains two packages:

### [@prefer-jsr/eslint-plugin-prefer-jsr](./packages/eslint-plugin) &middot; [![JSR](https://jsr.io/badges/@prefer-jsr/eslint-plugin-prefer-jsr)](https://jsr.io/@prefer-jsr/eslint-plugin-prefer-jsr)

ESLint plugin that suggests using JSR packages over npm when JSR alternatives are available.

**Installation:**

```sh
pnpm i jsr:@prefer-jsr/eslint-plugin-prefer-jsr
```

```sh
yarn add jsr:@prefer-jsr/eslint-plugin-prefer-jsr
```

```sh
npx jsr add @prefer-jsr/eslint-plugin-prefer-jsr
```

<details>
<summary>NPM registry (If you really need it for some reason)</summary>

```sh
npm install --save-dev @prefer-jsr/eslint-plugin-prefer-jsr
```

</details>

### [@prefer-jsr/npm2jsr](./packages/npm2jsr) &middot; [![JSR](https://jsr.io/badges/@prefer-jsr/npm2jsr)](https://jsr.io/@prefer-jsr/npm2jsr)

Mapping library that provides data about npm packages and their JSR equivalents.

**Installation:**

```sh
pnpm i jsr:@prefer-jsr/npm2jsr
```

```sh
yarn add jsr:@prefer-jsr/npm2jsr
```

```sh
npx jsr add @prefer-jsr/npm2jsr
```

<details>
<summary>NPM registry (If you really need it for some reason)</summary>

```sh
npm install @prefer-jsr/npm2jsr
```

</details>

## Development

This project uses [Nx](https://nx.dev) for monorepo management and [pnpm](https://pnpm.io) as the package manager.

### Prerequisites

- Node.js 20.9.0 or higher
- pnpm 10.18.2 or higher

### Installation

```sh
pnpm install
```

### Running Tasks

Build all packages:

```sh
pnpm exec nx run-many -t build
```

Run tests:

```sh
pnpm exec nx run-many -t test
```

Lint code:

```sh
pnpm exec nx run-many -t lint
```

Type check:

```sh
pnpm exec nx run-many -t typecheck
```

Run all checks (lint, test, build, typecheck):

```sh
pnpm exec nx run-many -t lint test build typecheck
```

## Publishing

Releases are automated via GitHub Actions and published to both npm and JSR.

- Versions are determined from conventional commits
- Each package has independent versioning
- Releases are triggered automatically on push to `main`

For more information, see [RELEASING.md](./RELEASING.md).

## Code Quality

This project uses several tools to maintain code quality:

- **ESLint**: Linting with typescript-eslint and type-aware rules
- **Prettier**: Code formatting
- **Knip**: Unused dependency detection
- **TypeScript**: Strict type checking with project references
- **Vitest**: Unit testing

Run all quality checks:

```sh
pnpm exec nx run-many -t lint test typecheck
pnpm exec nx format:check
pnpm knip
```

## CI/CD

GitHub Actions workflows automatically run on every push:

- **CI** (`.github/workflows/ci.yml`): Runs lint, test, build, typecheck, format check, and knip
- **Release** (`.github/workflows/release.yml`): Automatically versions and publishes packages on push to `main`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Acknowledgements

The lint plugin in this project was inspired by and draws ideas from other ESLint plugins that help maintain quality in `package.json` files:

- [eslint-plugin-package-json](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json)
- [eslint-plugin-depend](https://github.com/es-tooling/eslint-plugin-depend)

Thank you to these projects for leading the way and demonstrating effective patterns for linting package.json files.

## License

MIT - See [LICENSE](./LICENSE) for details.
