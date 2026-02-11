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
- `v0.4.0`: Base semantic implementation and optimized indexing
- `v0.5.0`: Data architecture documentation and references
- `v0.6.0`: Semantic export implementation for JSON-LD and RDF-XML
- `v0.7.0`: Hybrid search implementation and SpellBrowser stability fixes

## Main Branch Versioning

Tags on the `main` branch should reflect the current stable version or the latest major development milestone.

## Technical Architecture Summary

For a detailed breakdown of the semantic ontology, data models, and reactive state management, refer to:

- [Data Architecture Documentation](docs/DataArchitecture.md)

### Hybrid Search Implementation

- **Lexical Engine**: Rule-based tokenization (`queryParser.ts`) using a predefined `LEXICON`. It extracts D&D metadata (level, school, etc.) from natural language.
- **Semantic Engine**:
  - Model: `Xenova/paraphrase-multilingual-MiniLM-L12-v2` (quantized ONNX).
  - Runtime: **Transformers.js** inside a Web Worker (`semantic.worker.ts`).
  - Storage: Embeddings are cached in IndexedDB (`embeddings` table) to minimize CPU usage.
  - Logic: Hybrid filtering (Metadata first, then Semantic ranking) with a dynamic threshold (`max(0.25, best_score * 0.6)`).

### Performance Considerations

- Semantic search only triggers after a "warmup" (indexing of candidates).
- All AI operations are local (offline-first PWA).
- WASM files for ONNX are served from `/public` to ensure compatibility with sub-directory deployments.
