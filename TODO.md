# TODO

Role and promotion dates are confirmed. Other dates (accomplishments and work projects) are approximate until checked here.

## Confirm content

- [ ] **DSP replacement dates.** Currently Jan 2024 – Dec 2024.
  - `src/content/work-projects/dsp-hardware-integration.md`
  - `src/content/accomplishments/dsp-obsolescence-replacement.md`
- [ ] **Boot-reliability date and role.** The card is dated Feb 2022 under Software Engineer I, but the fix came out of the DSP replacement, which is currently dated 2024 (Software Engineer II). One of them is wrong:
  - If the project started earlier, move its start date back (and add `software-engineer-raytheon` to its `roles` if it began before Apr 2022).
  - If the fix was in 2024, change its date, set `roleId: software-engineer-ii-raytheon`, move it between the two roles' `accomplishments` lists, and update both role summaries (Software Engineer I mentions the boot investigation).
  - File: `src/content/accomplishments/boot-reliability.md`
- [ ] **Boot-time improvement.** Replace "about 10% faster" with the measured number in `src/content/accomplishments/dsp-obsolescence-replacement.md`.
- [ ] **Other accomplishment and work-project dates.** Check the rest against records.
