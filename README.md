# Prefer JSR

A collection of tools to help JavaScript/TypeScript projects prefer [JSR](https://jsr.io/) packages over npm when available.

## Packages

This monorepo contains two packages:

### [@prefer-jsr/eslint-plugin-prefer-jsr](./packages/eslint-plugin)

ESLint plugin that suggests using JSR packages over npm when JSR alternatives are available.

**Installation:**

```sh
npm install --save-dev @prefer-jsr/eslint-plugin-prefer-jsr
# or
pnpm add -D @prefer-jsr/eslint-plugin-prefer-jsr
```

### [@prefer-jsr/npm2jsr](./packages/npm2jsr)

Mapping library that provides data about npm packages and their JSR equivalents.

**Installation:**

```sh
npm install @prefer-jsr/npm2jsr
# or
pnpm add @prefer-jsr/npm2jsr
```

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

Contributions are welcome! Please ensure:

1. All tests pass: `pnpm exec nx run-many -t test`
2. Code is properly formatted: `pnpm exec nx format:write`
3. No lint errors: `pnpm exec nx run-many -t lint`
4. No type errors: `pnpm exec nx run-many -t typecheck`
5. Use conventional commits for your commit messages

## License

MIT - See [LICENSE](./LICENSE) for details.
