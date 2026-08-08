---
title: Engineering Portfolio
slug: resume-website
summary: A fast, data-driven engineering portfolio deployed automatically to Cloudflare.
description: The site you are viewing, built to make career accomplishments and interactive engineering work easy to extend.
technologies:
  - Astro
  - TypeScript
  - Cloudflare Workers
  - GitHub Actions
github: https://github.com/theshoeman1224/resume_website
demo: https://joshshuman.com
featured: true
status: active
---

## Motivation

A paper resume compresses technical work into a fixed format. This site creates room to connect engineering decisions to outcomes while preserving the speed and reliability of a static deployment.

## Architecture

Astro generates static HTML from typed content collections. Reusable components render accomplishments and projects, and a small amount of browser JavaScript is reserved for interactions such as timeline filtering.

## Delivery

Every push to `main` is validated and built by GitHub Actions, then deployed to Cloudflare Workers. The custom domain and HTTPS endpoint update from the same reproducible source-controlled workflow.

## Design Decision

The project intentionally avoids a large frontend framework, backend, and database. New portfolio entries are content changes rather than new application infrastructure.
