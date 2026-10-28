---
title: Modernized the program's build infrastructure
shortTitle: Build modernization
date: 2023-09-01
category: DevOps
summary: Worked with platform engineers to containerize legacy build tools so they run on the new infrastructure, store build artifacts in Artifactory, and tie Jenkins pipelines to GitLab merge requests as pass/fail checks.
impact: Build times dropped 30–50%, depending on the build hardware. Every migrated team builds through these pipelines, and checks are shared and controlled across groups instead of each team maintaining its own. Code and tools stay in sync between the program's unclassified and classified networks.
technologies:
  - Containers
  - Jenkins
  - Artifactory
  - GitLab CI
  - Coverity
roleId: devsecops-champion
relatedRoles: []
metric:
  value: 30–50%
  label: Faster builds
---
