# Implementation Plan - UMS Dashboard Simulator Removal & Portal Redesign

This plan outlines the complete removal of the interactive Student Simulator and the creation of a high-fidelity institutional UMS dashboard focusing entirely on student divisions, faculty class assignments, and subjects catalog.

## Proposed Changes

### Frontend Components & Pages

#### [MODIFY] [dashboard.tsx](file:///c:/Users/Admin/Downloads/ChallengeTracker%20(3)/Classroom%20Academic%20Hub/classroom-frontend/src/pages/dashboard.tsx)
* **Remove Student Simulator Elements**: Delete all sandbox student profiles, enrollments, warning banners, library search and borrowing widgets, homework submissions form, grades mocks registry, and interactive voting/check-in simulators.
* **Student Divisions (1,500 Students Categorization)**: Divide the 1500 students in three significant ways:
  1. *Departmental Category Index*: 450 Computer Science, 300 Electronics, 250 Mechanical, 150 Civil, 130 Electrical, 120 Biotech, 100 Math.
  2. *Academic Level Distribution*: 400 First Year, 380 Second Year, 370 Third Year, 350 Fourth Year.
  3. *Active Cohort Section Mappings*: K22AA (125), K22AB (125), K22AC (100), E22AA (150), M22AA (150), C22AA (100), and others.
* **Faculty Registry & Assigned Sections**: A detailed administrative matrix showing professors, departments, assigned subjects, and active class invite codes/capacities.
* **Syllabus Matrix**: Grid component showing active subject pathway blueprints, credit maps, and descriptions linked directly to the database resources.
* **Preserve Institutional Overview**: Retain original charts, timetable, and department load figures as a secondary toggle option.

---

## Verification Plan

### Automated Tests
* Validate type correctness and compiling success with the TypeScript compiler:
  ```powershell
  npx tsc --noEmit
  ```

### Manual Verification
* Navigate to the home UMS dashboard page.
* Select the **UMS Student Portal** view mode.
* Toggle between the three new tabs: **Student Divisions**, **Faculty Registry**, and **Syllabus Matrix** to confirm smooth, responsive, premium visuals and data-rich tables.
