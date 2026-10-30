---
title: Resolved the race condition blocking the radar's government acceptance
shortTitle: Race condition
# TODO: confirm date
date: 2022-11-01
# TODO: confirm date
endDate: 2022-11-01
category: Embedded
summary: About five engineers, including two Technical Fellows (Raytheon's highest engineering rank), had spent eight months on a mission-critical defect without finding the cause, and the government would not accept the radar until it was fixed. Designed a fault-triggered diagnostic build that halted the real-time application at failure and preserved memory and hardware-interface state. It exposed a race condition between an asynchronous interface thread and the main application thread.
impact: Implemented the root-cause fix overnight and passed customer-site testing the following morning. Preserved the only software baseline compatible with an obsolescence-driven hardware replacement required for continued radar production.
technologies:
  - Embedded C
  - Real-time systems
  - Concurrency debugging
  - Failure analysis
  - Hardware integration
roleId: software-engineer-ii-raytheon
relatedRoles: []
featured: true
metric:
  value: Overnight
  label: Fix after an 8-month, 5-engineer investigation
---
