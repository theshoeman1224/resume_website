---
title: Replaced $2M+ of missile-simulation hardware with software on a Linux PC
shortTitle: Missile sim
date: 2020-02-01
endDate: 2020-08-01
category: Embedded
summary: Worked from requirements to build the real-time OS side of an interface to another team's missile motion model. The software read the model's messages and matched them to the actions the radar's scheduler requested. With the missile model as the source of truth, it sent back a valid response when the scheduler's request matched the simulated missile and an altered response when it did not. Getting the system to accept the simulated missile as real meant fixing defects in both the simulator team's software and the radar-side interface. When failures became widespread, stepped into a system-integrator role. Analyzed post-test system-level data to find why the system was falsely rejecting valid missile responses or accepting altered ones. Then tested each fix and updated the requirements to match.
impact: Simulating a missile used to take more than $2 million of dedicated hardware (2020 cost). The new simulator needs only a Linux computer and an Ethernet connection. With no specialized hardware left to go end-of-life, the simulation is also protected from future obsolescence. Proof of concept and the first successful end-to-end runs came in August 2020, six months after the project started.
technologies:
  - RTOS
  - Embedded C
  - Interface development
  - Simulation
  - Cross-team debugging
  - System integration
  - Requirements
roleId: software-engineer-raytheon
relatedRoles: []
workProject: missile-simulation-interface
featured: true
metric:
  value: $2M+ → 1 PC
  label: Hardware needed to simulate a missile
---
