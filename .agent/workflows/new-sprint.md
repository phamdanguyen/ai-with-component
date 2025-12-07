---
description: Create a new sprint with standardized folder structure and documentation
---

1. Ask the user for the Sprint Number (e.g., 8, 9, 10).
2. Establish the Sprint Directory path: `docs/sprints/sprint-XX` (where XX is the padded sprint number, e.g., 08).
3. Create the directory if it does not exist using `mkdir`.
4. Create the Sprint Plan file: `docs/sprints/sprint-XX/SPRINT_PLAN_SPRINT{X}.md`.
   - Content should follow the standard Sprint Plan template (Goal, Objectives, Backlog, DoD).
5. Notify the user that the sprint environment is ready and the plan file has been created in the correct location.
6. Remind the user that all artifacts for this sprint (Kickoff, Tech Specs, Reports) MUST be saved in this `docs/sprints/sprint-XX` folder.

// turbo
7. Run `dir docs/sprints` to confirm the structure.
