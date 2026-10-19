# First 120 Days: sales onboarding and manager enablement (demonstration prototype)

A working prototype of a competency-based onboarding experience for new sales employees and their managers. It is a portfolio demonstration of human-directed instructional design: I designed and directed it, and developed it with Claude AI. The design was informed by a historical professional onboarding framework, adapted and sanitized for demonstration purposes.

**Status:** Release candidate 3, awaiting the designer's approval. Not yet published, not production software, and not an official learning program of any company. All people, companies, customers, products and records are fictional.

## Run it locally

Option 1: open `index.html` directly in a current browser.

Option 2 (closest to how it would be hosted): from this folder run

```
python3 -m http.server 8000
```

then visit the local address it prints (port 8000).

There is no build step, no external service and no account. Progress is stored only in your browser (local storage). The prototype opens on the Experience Guide; use **Demonstration Controls** at the bottom of that page to restore the sample progress or clear everything.

## What is built

- Experience Guide landing page, including Behind the Design.
- Sales Employee and Sales Manager Learning Pathways with role switching.
- Cumulative completion milestones. Before Day 1 (manager), By Day 7 and By Day 60 are built; By Day 30, 90 and 120 are shown as planned.
- Coordinated employee and manager responsibilities, with two-step manager responsibilities and separate step deadlines.
- Links between related employee and manager activities in both directions, with a way back.
- Manager guidance and employee success criteria for key activities.
- Eight demonstration competencies with evidence collection, link types (Introduces, Builds, Produces evidence) and manager-recorded developmental ratings.
- A four-decision branching negotiation scenario with consequences, feedback, retry, reflection and a manager debrief.
- Searchable performance support: 12 printable resource pages and 3 editable Word templates.
- A downloadable User Guide (PDF).

## Files

```
index.html                    page shell
assets/styles.css             visual design
assets/content.js             all demonstration content (fictional)
assets/app.js                 application logic
downloads/                    User Guide PDF and three Word templates
```

## Accessibility

Designed toward WCAG 2.1 Level AA. Tested internally with automated checks and keyboard tests in one browser engine; not independently audited, and no conformance claim is made.
