# Versioning and Archiving Conventions

This document describes the processes used by agents (such as Gemini CLI) to manage versions and project history for Spelite.

## Feature Archiving (Feature Branches)

To maintain a clean history without accumulating local branches, feature branches (`feature/*`) are transformed into annotated tags following Semantic Versioning (SemVer) before being deleted.

### Transformation Procedure

1. **Identify the next version number**: Use an incremental minor version (e.g., `v0.1.0`, `v0.2.0`).
2. **Create the annotated tag**:
   ```bash
   git tag -a vX.Y.Z -m "Concise description of the feature" branch-name
   ```
3. **Delete the local branch**:
   ```bash
   git branch -D branch-name
   ```

## Current Tags Status

The following tags were created to archive initial research and implementations:

- `v0.1.0`: Ontology implementation and repository (ex-feature/ontology)
- `v0.2.0`: Semantic search with embeddings and ONNX worker (ex-feature/semantic-embeddings)
- `v0.3.0`: Triplestore integration research (ex-feature/triplestore)
- `v0.4.0`: Base semantic implementation and optimized indexing (HEAD on main)

## Main Branch Versioning

Tags on the `main` branch should reflect the current stable version or the latest major development milestone.
