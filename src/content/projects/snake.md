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
demo: https://joshshuman.com/projects/snake/#play
featured: true
status: in-development
embed:
  src: /games/snake/index.html
  title: Play Snake, built with Rust and WebAssembly
---

## Background

Snake began as a focused way to explore Rust game-state design and browser delivery without moving the game engine into JavaScript.

## Architecture

The project keeps game rules and state in a reusable Rust engine. A WebAssembly frontend connects that engine to browser rendering and input, while Trunk produces a self-contained static release.

## Build And Integration

The release workflow compiles the `wasm32-unknown-unknown` target and emits optimized assets plus a manifest recording the exact source commit, repository URL, and build time. That manifest makes the version embedded in this portfolio traceable to its independent source repository.

## Controls

Choose Easy, Medium, Hard, or a custom arena to begin. The game supports Arrow keys and WASD on a keyboard, plus an on-screen directional pad for pointer and touch input. Pause and Restart controls remain available while playing.
