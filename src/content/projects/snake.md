---
title: Rust Snake
slug: snake
summary: A browser Snake game with a reusable Rust engine and WebAssembly frontend.
description: A native Rust game designed to compile into a self-contained browser release without requiring installation.
technologies:
  - Rust
  - WebAssembly
  - Trunk
  - HTML Canvas
github: https://github.com/theshoeman1224/snake
featured: true
status: in-development
---

## Background

Snake began as a focused way to explore Rust game-state design and browser delivery without moving the game engine into JavaScript.

## Architecture

The project keeps game rules and state in a reusable Rust engine. A WebAssembly frontend connects that engine to browser rendering and input, while Trunk produces a self-contained static release.

## Build And Integration

The release workflow compiles the `wasm32-unknown-unknown` target and emits optimized assets plus a manifest recording the exact source commit, repository URL, and build time. That manifest makes the version embedded in this portfolio traceable to its independent source repository.

## Next Step

The playable WebAssembly build and controls will be embedded here in the next milestone.
