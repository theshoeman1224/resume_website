# Career questionnaire

Answers here feed the roles, accomplishments, and work projects in `src/content/`. Write under each question after the `>`. Short notes are fine, "skip" or "can't share" is fine, and rough numbers ("about 30%", "~12 people") are better than none.

Nothing in this file is published. Content only reaches the site once it's copied into `src/content/`.

---

## A. Targeting and limits

1. Which titles are you targeting next (Principal, Staff, Lead, Engineering Manager, Architect)? Which industries (defense only, or also aerospace, automotive, telecom, medical, commercial embedded)?
   >

2. Location, remote or hybrid, and willingness to relocate?
   >

3. Clearance level and status, if you're willing to list it?
   >

4. What can be public? Program names, customers, platform types, hardware vendors? Or should we use generic names like "airborne radar receiver"? Does anything need company approval?
   >

5. If a hiring manager remembers three things about you, what should they be?
   >

6. Is there anything on the site now that you'd remove or play down?
   >

---

## B. Education and early career

**On the site today:** Research Assistant, Wentworth Institute of Technology, May 2017 – Jan 2018. Built feedback-control automation and a touchscreen operator interface for a student photolithography system; validated dose accuracy with oscilloscope measurements; presented at AAAS and NCUR 2018. No education entry. Nothing between Jan 2018 and Oct 2019.

7. Degree(s), major, minor, school, graduation date, honors, GPA (only if strong).
   >

8. Wentworth requires co-ops. What co-ops or internships did you do (company, dates, what you built)?
   >

9. What happened between Jan 2018 and Oct 2019 (school, co-op, another job)?
   >

10. Research Assistant: who ran the lab, and what did you build yourself versus inherit? Was it used after you left? Were AAAS and NCUR talks or posters? What was the title? Any award?
    >

11. Certifications, training, patents, publications, talks, awards (company awards, spot awards, team awards)?
    >

---

## C. Software Engineer, Raytheon (Oct 2019 – Jan 2025)

**On the site today:** Embedded C on DSP hardware for real-time radar signal processing. Three accomplishments:
- *Embedded C for real-time radar DSP*: "Cut cycle counts on the radar correlator while keeping the algorithmic output identical." (no numbers)
- *Cut boot failure rate from 7–10% to 1–2%* (Feb 2022): traced failures to a race condition in the supplier's initialization protocol and replaced it with an in-house implementation.
- *Resolved a production-blocking race condition during customer testing* (Nov 2022): after an eight-month investigation had failed, built a fault-triggered diagnostic build, found a race between an async interface thread and the main thread, fixed it overnight, passed customer testing the next morning.

12. Did your level or title change in these five-plus years (for example SWE II → Senior SWE)? Give the dates. One five-year entry undersells growth.
    >

13. Which programs or products did you work on, and when? What was your role on each?
    >

14. Hardware and stack: DSP family, processors, FPGA involvement, RTOS or bare metal, toolchains, test equipment.
    >

15. DSP correlator optimization: cycle counts or latency before and after? What did the headroom enable (more channels, new modes, cheaper hardware, meeting a frame deadline)?
    >

16. Boot reliability: how long did it take? How many units or systems were affected? What was the cost or schedule exposure? Is your implementation still shipping?
    >

17. Race condition: how big was the team behind the earlier eight-month effort? What was at stake (production line, contract milestone, dollars)? Any recognition afterwards?
    >

18. Mentoring, onboarding, code review, interviewing: how many people, and was any of it a formal role?
    >

19. Other work not on the site: internal tools, simulators, test automation, requirements or verification work, customer demos, field or test-site support, proposals.
    >

---

## D. DevSecOps Lead, concurrent (Oct 2019 – Jan 2025)

**On the site today:** Department Agile and DevSecOps lead held alongside full-time signal-processing work. "Systems and software teams coordinated their planning and releases through the processes this role put in place." (no numbers)

20. Was this an official title or an informal responsibility? Did it really start the month you joined? Who assigned it?
    >

21. How big was the department (people, teams, programs)?
    >

22. Before and after: what tools and pipeline stages existed when you started, and what did you add (CI, static analysis, security scanning, SBOM, containers, test gates, Jira or Agile cadence)?
    >

23. Numbers: build or release time, release frequency, teams onboarded, defects caught earlier, onboarding time for new engineers, audit or compliance results.
    >

24. Did the practices spread beyond your department?
    >

---

## E. Senior Software Engineering Task Lead, Raytheon (Jan 2025 – Mar 2026)

**On the site today:** Software architect and task lead for a new radar receiver. Defined interface contracts across hardware, firmware, and systems; grew the team from 8 to 18 engineers.

25. What did "task lead" cover: technical lead, people lead, budget or schedule ownership (CAM, EVMS), hiring?
    >

26. Receiver replacement: what did it replace, and why (obsolescence, performance, cost)? Which milestones did you reach (PDR, CDR, first article, integration, delivery)?
    >

27. Team growth from 8 to 18: did you interview or hire, organize sub-teams, create onboarding? How long did it take?
    >

28. Interface contracts: how many interfaces or ICDs, between which teams, how were they enforced, and what integration problems did they prevent?
    >

29. Any schedule, cost, or quality outcomes you can put a number on?
    >

---

## F. Principal Software Engineer, Raytheon (Mar 2026 – present)

**On the site today:** Principal engineer for embedded software on radar programs. "Arbitrated design decisions between hardware, firmware, integration, and test organizations. Unblocked cross-team conflicts before they reached the program schedule." (generic, no specifics)

30. Scope: how many programs and engineers do you influence, and who do you report to?
    >

31. Concrete wins so far: architecture decisions, standards, roadmaps, proposals or capture work, reviews you chair.
    >

32. The home page lists Applied AI as a focus area. Where does that show up at work, if anywhere?
    >

33. What are you building toward in this role over the next year?
    >

---

## G. Professional projects (new timeline lane)

These become bars on the timeline with their own date ranges, linked to the roles and accomplishments they cover. Copy the block once per program or project worth showing (aim for two to five).

```
Public-safe name:
Start (month/year):
End (month/year, or "ongoing"):
Roles it spans:
Team size:
Your responsibility:
Phase(s) you covered:
Result:
Accomplishments that belong to it:
Main technologies:
```

---

## H. Accomplishment template

Copy once per win, new or existing. Existing wins only need the parts that are missing.

```
Title (outcome first, with the number if there is one):
Context (the system, the stakes, who was affected):
Challenge (what made it hard, what had already been tried):
What I did (your actions, separate from the team's):
Result (before → after, time or money saved, risk retired, who benefited):
Dates:
Role:
Project:
Technologies:
Recognition:
OK to publish? (yes / generic wording only / no):
```

---

## I. Wins you may not have written down

34. A time you saved a schedule, cut cost, or retired a technical risk.
    >

35. A practice, tool, or standard you introduced that others still use.
    >

36. A time you presented to a customer, leadership, or a review board.
    >

37. A conflict between teams you resolved, or a decision you made that held up.
    >

38. People you trained or helped get promoted.
    >

39. Which three or four wins should be "signature work" featured on the home page?
    >
