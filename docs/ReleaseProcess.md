# Release Process

This document describes how to perform a new release for the Spelite project using `standard-version`.

## 1. Conventional Commits

To ensure the changelog is generated correctly, all commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

- **feat:** A new feature (bumps MINOR version).
- **fix:** A bug fix (bumps PATCH version).
- **docs:** Documentation only changes.
- **style:** Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- **refactor:** A code change that neither fixes a bug nor adds a feature.
- **perf:** A code change that improves performance.
- **test:** Adding missing tests or correcting existing tests.
- **build:** Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm).
- **ci:** Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs).
- **chore:** Other changes that don't modify src or test files.
- **BREAKING CHANGE:** A commit that has a `BREAKING CHANGE:` footer or an exclamation mark after the type/scope (bumps MAJOR version).

## 2. Performing a Release

Once you have finished your changes and they are ready to be published:

1.  **Ensure you are on the main branch** (`main`) and everything is committed and pushed.
2.  **Run the release command**:

    ```bash
    npm run release
    ```

    This command will automatically:
    - Analyze commits since the last tag.
    - Bump the version in `package.json` and `package-lock.json`.
    - Update the `CHANGELOG.md` file.
    - Create a release commit.
    - Create a Git tag corresponding to the new version.

3.  **Verify changes** (optional):
    You can preview what the release will do without actually modifying anything with:
    ```bash
    npm run release -- --dry-run
    ```

## 3. Publishing the Release

After running `npm run release`, you must push the changes and the new tag:

```bash
git push --follow-tags origin main
```

## 4. Special Notes for Agents (Gemini)

When an agent performs a release:

- Always verify that the `CHANGELOG.md` is consistent with recent developments.
- NEVER push to a remote repository without explicit user authorization.
- Propose that the user reviews the generated `CHANGELOG.md` before finalizing.
