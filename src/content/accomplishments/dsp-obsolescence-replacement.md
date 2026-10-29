---
title: Delivered an end-of-life DSP replacement 6 months early and 48% under budget
shortTitle: Early, under budget
# TODO: confirm dates (see TODO.md)
date: 2024-01-01
endDate: 2024-12-01
category: DSP
summary: Sole engineer on the software and test effort to integrate a supplier's replacement for end-of-life DSP hardware. Worked directly with the supplier, diagnosed defects in their software, and fixed some of them without waiting on supplier support. Redesigned startup so the software detects and configures any mix of old and new DSP boards on its own, where operators used to need to know the hardware configuration at boot.
# TODO: replace "about 10%" with the measured boot-time improvement (see TODO.md)
impact: Finished 6 months ahead of schedule and 48% under budget across the full software and test effort. Replaced the supplier's DMA boot protocol with a POSIX-compliant Ethernet/UDP boot, which cut reliance on supplier software and made boot about 10% faster and far more consistent. The new boards can also replace DSPs outside the original scope. The boot-failure fix (7–10% → 1–2%) came out of this work.
technologies:
  - DSP
  - Hardware integration
  - Boot and initialization
  - Ethernet/UDP
  - POSIX
  - Supplier coordination
roleId: software-engineer-ii-raytheon
relatedRoles: []
workProject: dsp-hardware-integration
featured: true
metric:
  value: 6 months early
  label: Delivered 48% under budget
---
