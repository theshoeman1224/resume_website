---
title: Made radar DSPs plug-and-play so customers can replace them one at a time
shortTitle: Plug-and-play DSPs
date: 2024-06-01
endDate: 2024-06-01
category: DSP
summary: Went past the customer's request on the end-of-life DSP replacement. The system supported two fixed layouts, 5 old DSPs or 5 old plus 3 new, and the customer asked for a third, 8 new DSPs, to retire the old hardware. Without being asked, I built startup so any DSP can be swapped for the other type. The software detects each board at boot and configures itself, with no operator input.
impact: Customers can replace obsolete DSPs one at a time, as boards fail or budget allows, instead of buying and swapping all 5 at once. Operators no longer need to know or enter the hardware configuration at boot. The extra work fit inside the effort's 48%-under-budget delivery.
technologies:
  - DSP
  - Hardware integration
  - Boot and initialization
  - Auto-configuration
  - Systems design
roleId: software-engineer-ii-raytheon
relatedRoles: []
workProject: dsp-hardware-integration
featured: true
metric:
  value: 5 → 1
  label: DSPs a customer must swap at once
---
