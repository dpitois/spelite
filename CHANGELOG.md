# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.6.2](https://github.com/dpitois/spelite/compare/v0.6.0...v0.6.2) (2026-02-09)

### Documentation

- finalize changelog generation and document release process ([45210a3](https://github.com/dpitois/spelite/commit/45210a34b0219c3a45dd891a603fd0faebe3b889))

### UI/UX Enhancements

- **mobile:** increase font sizes for better readability ([27bbbdd](https://github.com/dpitois/spelite/commit/27bbbdd2d6419e53cccd52cd9acba24ce86ca04d))

### Styling

- fix formatting in changelog and release documentation ([5294835](https://github.com/dpitois/spelite/commit/52948357ebc54025b486ba785dff88ad89363914))

### [0.6.1](https://github.com/dpitois/spelite/compare/v0.6.0...v0.6.1) (2026-02-09)

# [0.6.0](https://github.com/dpitois/spelite/compare/v0.5.0...v0.6.0) (2026-02-09)

### Features

- **ontology:** implement semantic export for JSON-LD and RDF-XML ([4e909c5](https://github.com/dpitois/spelite/commit/4e909c52d038c9cc28ad4607e006941d3e1cc8d1))

# [0.5.0](https://github.com/dpitois/spelite/compare/v0.4.0...v0.5.0) (2026-02-09)

### Features

- **data:** implement action type filtering and optimize test performance ([ab72a03](https://github.com/dpitois/spelite/commit/ab72a034d6e15371faa2338f8370f912e1ad5d0a))
- **search:** add action type filtering to query parser and lexicon ([ac02487](https://github.com/dpitois/spelite/commit/ac024877eaf23577d124e4d674537a9f16bb246a))
- **ui:** add filter reset capability to Filter Drawer and finalize feature ([6deb8fa](https://github.com/dpitois/spelite/commit/6deb8fa1fe03169d957ef431b5c26d3fc9f4286c))
- **utils:** add spell sorting and parsing helpers for duration and range ([b70993c](https://github.com/dpitois/spelite/commit/b70993c3816773cb456541bf23035fff791cd7ec))

# [0.4.0](https://github.com/dpitois/spelite/compare/v0.2.0...v0.4.0) (2026-02-07)

### Bug Fixes

- update Vite version and adjust WASM path handling in semantic worker ([0c0cac8](https://github.com/dpitois/spelite/commit/0c0cac8c9856ab6d69e570409b48bf89fa47812e))

### Features

- **semantic:** pre-compute and serve embeddings for optimized indexing ([dfcc633](https://github.com/dpitois/spelite/commit/dfcc6332ccb89f431464336bebb9456d1bc12ada))

# [0.2.0](https://github.com/dpitois/spelite/compare/v0.3.0...v0.2.0) (2026-02-07)

### Bug Fixes

- **search:** fine-tune semantic relevance and cleanup logs ([013aaa2](https://github.com/dpitois/spelite/commit/013aaa2bd8c28b50b1ecdce11dfe3794621d9e26))
- **worker:** implement progressive batch persistence for embeddings ([5831182](https://github.com/dpitois/spelite/commit/58311823df83a977cd64b0a7ad8a8a82cd873758))

### Features

- **admin:** localize maintenance view and polish layout ([216e39e](https://github.com/dpitois/spelite/commit/216e39e368e995cfd05d17a0a491056b7b9cbfed))
- **router:** implement signal-based hash routing and sub-routes ([a6a2001](https://github.com/dpitois/spelite/commit/a6a200138c626f6501b41f4c540ee28bd1dd5e0d)), closes [#character](https://github.com/dpitois/spelite/issues/character)
- **search:** implement persistent opt-in semantic search with progress tracking ([eaf56a3](https://github.com/dpitois/spelite/commit/eaf56a339df864e7ef6fee50cf81a5767a719a59))
- **search:** implement semantic model loading and inference logic ([ce6852b](https://github.com/dpitois/spelite/commit/ce6852b6e2f02902efb516a67e92a6ab38325709))
- **search:** setup web worker infrastructure for semantic embeddings ([9909d57](https://github.com/dpitois/spelite/commit/9909d57bd764549ddd235a6d13d5696a7049c672))

# [0.3.0](https://github.com/dpitois/spelite/compare/v0.1.0...v0.3.0) (2026-02-07)

### Features

- **ontology:** migrate classes/races to SPO store and optimize bundle ([613e085](https://github.com/dpitois/spelite/commit/613e085a29d1ba3c63cd93aaa16da8d7619ff203))
- **ontology:** migrate to semantic triplet store with IndexedDB ([88672f1](https://github.com/dpitois/spelite/commit/88672f147e7c651bca71118c4abb23a5adddf4c0))
- **search:** implement natural language semantic query engine ([9129f41](https://github.com/dpitois/spelite/commit/9129f4138b40c08728c486f3781be77df3cf8b12))
- **ui:** restrict spell learning to character capabilities ([b161935](https://github.com/dpitois/spelite/commit/b161935044937773f84009dcd95c325153ede8f8))

# [0.1.0](https://github.com/dpitois/spelite/compare/6672a3a3cc231e6825890910952a1f2c2f85c431...v0.1.0) (2026-02-07)

### Features

- **dashboard:** add quick info line for prepared spells ([acbf288](https://github.com/dpitois/spelite/commit/acbf288826049f919a1802a96173826380b02da5))
- implemented spell browser with advanced filtering ([491bef2](https://github.com/dpitois/spelite/commit/491bef2c408a5a1fc8dd2914030f99f884f8e656))
- integrated spell data and internationalization ([6672a3a](https://github.com/dpitois/spelite/commit/6672a3a3cc231e6825890910952a1f2c2f85c431))
- interactive character dashboard and spell slot management ([23b4b4d](https://github.com/dpitois/spelite/commit/23b4b4d80caa2858fc4c518b18b159317ae490e8))
- **ontology:** define core types for spell ontology and JSON-LD support ([df47b2e](https://github.com/dpitois/spelite/commit/df47b2e63a22e9ecef54db70273454c86ad60e35))
- **ontology:** enhance data quality with structured translations and advanced filters ([4fe438d](https://github.com/dpitois/spelite/commit/4fe438d93836c8f758f538b934662e5dc7c500f6))
- **ontology:** implement migration script with semantic mechanics extraction ([2933d96](https://github.com/dpitois/spelite/commit/2933d96839d3b7dc4a391635a06872057170c7ea))
- **ontology:** implement ontologyRepository with semantic filtering ([2c3c976](https://github.com/dpitois/spelite/commit/2c3c976cb1f43dbc23b226116cbdf0b28073ead2))
- optimize header, footer and panel UI for mobile devices ([9ba3b1e](https://github.com/dpitois/spelite/commit/9ba3b1edf01bb1d7253bbe0910168759c028ea98))
- PWA support, assets and test environment ([68f8bf0](https://github.com/dpitois/spelite/commit/68f8bf012629d9bf514835580c56e901c36f0d90))
- redesign ability scores with bold overlay layout and massive values ([5490bb4](https://github.com/dpitois/spelite/commit/5490bb4d4e796abf03967ceb71cc7ef3c3248196))
- **ui:** enrich spell display with concentration and ritual metadata ([c025a75](https://github.com/dpitois/spelite/commit/c025a7591fdfbeb2277453fd15541935e9a7bf50))
