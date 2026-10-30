---
title: Replaced $2M+ of missile-simulation hardware with software on a Linux PC
shortTitle: Missile sim
date: 2020-02-01
endDate: 2020-08-01
category: Embedded
summary: Implemented, from requirements, the real-time OS side of an interface to another team's missile motion model. The software took the model's messages, tied them to the actions the radar's scheduler requested, and generated responses, valid when the scheduler's request matched the simulated missile and altered when it did not, with the missile model as the source of truth. Debugged and fixed defects in the simulator team's software and in the radar-side interface until the system accepted the simulated missile as a real one.
impact: Simulating a missile used to take more than $2 million of dedicated hardware (2020 cost). The new simulator needs only a Linux computer and an Ethernet connection, and with no specialized hardware left to go end-of-life, the simulation is protected from future obsolescence. Reached proof of concept and successful end-to-end runs in August 2020, six months after starting.
technologies:
  - RTOS
  - Embedded C
  - Interface development
  - Simulation
  - Cross-team debugging
roleId: software-engineer-raytheon
relatedRoles: []
workProject: missile-simulation-interface
metric:
  value: $2M+ → 1 PC
  label: Hardware needed to simulate a missile
---
