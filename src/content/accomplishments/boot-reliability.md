---
title: Cut boot failure rate from 7–10% to 2–3% on radar platform
shortTitle: Boot failures
date: 2023-09-01
endDate: 2023-09-01
category: Embedded
summary: As lead investigator, traced boot failures to a race condition in the supplier's initialization protocol, then replaced it with an in-house implementation that removed the supplier dependency.
impact: Boot failure rate dropped from ~7–10% to ~2–3%. The failure was a major pain point for the customer, who had filed 93 formal issues against it across two software releases, all rated major. That was about a quarter of the 354 customer issues filed across all of the team's software releases, and this one fix closed all 93. Each boot takes about 10 minutes, and test events run about five a day with 20–30 engineers on site, so every failed boot left the whole team waiting. The fix still ships in every fielded unit worldwide. Remaining failures are due to the supplier's released hardware limitations.
technologies:
  - Embedded C
  - Boot and initialization
  - Failure analysis
  - Hardware integration
roleId: software-engineer-ii-raytheon
relatedRoles: []
workProject: dsp-hardware-integration
featured: true
metric:
  value: 7–10% → 2–3%
  label: Boot failure rate
---

