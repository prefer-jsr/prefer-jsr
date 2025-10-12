# Release Process

This repository uses [Nx Release](https://nx.dev/recipes/nx-release) to manage versioning and publishing.

## Configuration

The release configuration in `nx.json` includes:

- **Independent versioning**: Each package has its own version
- **Conventional commits**: Versions are determined from commit messages
- **GitHub releases**: Automatically creates GitHub releases with changelogs
- **Pre-release checks**: Runs `build`, `test`, `lint`, and `typecheck` before versioning

## First Release

For the initial release:

```bash
pnpm exec nx release --first-release
```

This will:

1. Run all pre-version checks
2. Determine versions for each package
3. Update package.json files
4. Generate CHANGELOGs
5. Create git commits and tags
6. Publish to npm
7. Create GitHub releases

## Subsequent Releases

For regular releases:

```bash
# Dry run first (always recommended)
pnpm exec nx release --dry-run

# Actually release
pnpm exec nx release
```

## Release Individual Packages

To release specific packages:

```bash
pnpm exec nx release --projects=eslint-plugin
pnpm exec nx release --projects=npm2jsr
```

## Version Bumps

Nx Release automatically determines version bumps from conventional commits:

- `feat:` → minor version bump (0.x.0)
- `fix:` → patch version bump (0.0.x)
- `feat!:` or `BREAKING CHANGE:` → major version bump (x.0.0)

## Automated CI/CD Releases

After the first release is done manually, subsequent releases are automatically triggered by the `.github/workflows/release.yml` workflow when changes are pushed to the `main` branch.

### How it works

1. **CI runs first** (`.github/workflows/ci.yml`) on every push to main:

   - Runs lint, test, build, typecheck
   - Ensures quality before release

2. **Release workflow runs** (`.github/workflows/release.yml`) if CI passes:
   - Detects changes since last release using git tags
   - Determines new versions from conventional commits
   - Updates package.json and generates changelogs
   - Creates git tags
   - Publishes to npm with provenance
   - Publishes to JSR
   - Creates GitHub releases

### Publishing Targets

Releases are published to two registries:

1. **npm**: JavaScript package registry with provenance attestation
2. **JSR**: JavaScript Registry with native TypeScript support

Each package has a `jsr.json` configuration file for JSR publishing.

### Setup Requirements

Before automated releases work:

1. **Do the first release manually**:

   ```bash
   # Ensure everything is working
   pnpm exec nx run-many -t lint test build typecheck

   # Do the first release
   pnpm exec nx release --first-release
   ```

   This creates the initial git tags that CI relies on.

2. **Configure NPM_TOKEN secret**:

   - Go to [npm Access Tokens](https://www.npmjs.com/settings/tokens)
   - Create an "Automation" token
   - Add to GitHub: Settings → Secrets and variables → Actions → New repository secret
   - Name: `NPM_TOKEN`, Value: your token

3. **Configure JSR_TOKEN secret**:

   - Go to [JSR](https://jsr.io/) and sign in with GitHub
   - Navigate to your account settings → Access Tokens
   - Create a new token with publish permissions
   - Add to GitHub: Settings → Secrets and variables → Actions → New repository secret
   - Name: `JSR_TOKEN`, Value: your token

4. **Configure repository permissions**:
   - Go to Settings → Actions → General → Workflow permissions
   - Enable "Read and write permissions"
   - Enable "Allow GitHub Actions to create and approve pull requests"

### Manual Workflow Trigger

You can trigger a release manually from GitHub Actions UI using "workflow_dispatch".

### Advanced: Separate Version and Publish

For manual control:

```bash
# Generate version and changelog only
pnpm exec nx release version

# Publish only (no versioning)
pnpm exec nx release publish
```

## Prerequisites

1. **Conventional Commits**: All commits must follow the format below
2. **Clean Git State**: No uncommitted changes
3. **NPM Authentication**: For local releases, run `npm login` first

## Conventional Commit Format

Use conventional commits for automatic version determination:

```txt
feat(eslint-plugin): add new rule for package suggestions
fix(npm2jsr): correct package mapping for zod
docs: update README with installation instructions
chore: update dependencies
```

## Troubleshooting

### "npm ERR! 403 Forbidden"

- Check that `NPM_TOKEN` is set correctly in GitHub secrets
- Verify the token has publish permissions
- Ensure package names aren't already taken on npm

### "JSR publish failed"

- Verify `JSR_TOKEN` is set correctly in GitHub secrets
- Check that JSR package names are available
- Ensure `jsr.json` files are valid and exports point to correct files

### "No changes detected"

- Verify commits follow conventional commit format (`feat:`, `fix:`, etc.)
- Check that changes are in the package directories (`packages/*/`)
- Review the git history since the last tag: `git log --oneline $(git describe --tags --abbrev=0)..HEAD`

### "Permission denied" in GitHub Actions

- Verify GitHub Actions has write permissions in Settings → Actions → General
- Check that workflow has `contents: write` and `id-token: write` permissions
- Ensure GITHUB_TOKEN has sufficient permissions
