/*
  Demonstration content for the Sales Onboarding & Manager Enablement prototype.
  All names, companies, customers and records are fictional. Written for demonstration only.
*/
window.CONTENT = (function () {
  "use strict";

  var tracks = [
    { id: "hr", name: "HR & Workplace" },
    { id: "ss", name: "Sales Skills & Processes" },
    { id: "cs", name: "Company & Solutions" },
    { id: "cm", name: "Community & Mentoring" }
  ];

  var people = {
    employee: { name: "Jordan Ellis", role: "Account Executive, new hire", day: 52 },
    manager: { name: "Priya Raman", role: "Regional Sales Manager" },
    mentor: { name: "Sam Okoro", role: "Senior Account Executive, mentor" }
  };

  var milestones = {
    employee: [
      { id: "d7", label: "By Day 7", day: 7, built: true,
        focus: "Get set up, meet the people you will work with, and start the core learning." },
      { id: "d30", label: "By Day 30", day: 30, built: false,
        focus: "Learn the offerings, account plans and annual priorities; complete core sales-process learning; build foundational awareness of all six solution areas; join client meetings as an observer, and start working with a mentor." },
      { id: "d60", label: "By Day 60", day: 60, built: true,
        focus: "Take on your client account, start client meetings yourself, and apply negotiation and proposal skills." },
      { id: "d90", label: "By Day 90", day: 90, built: false,
        focus: "Deliver your client-approaches presentation, show progress on client sales, and receive structured feedback on your presentation and client engagement." },
      { id: "d120", label: "By Day 120", day: 120, built: false,
        focus: "Hold a developmental review across the eight competencies with your manager, update and present your account plans, and review your professional network." }
    ],
    manager: [
      { id: "pre", label: "Before Day 1", day: 0, built: true,
        focus: "Prepare logistics, learning, meetings and introductions so the first week runs smoothly." },
      { id: "d7", label: "By Day 7", day: 7, built: true,
        focus: "Communicate what you prepared, hold first-week meetings, discuss the competency model, and introduce the solution areas." },
      { id: "d30", label: "By Day 30", day: 30, built: false,
        focus: "Set initial expectations: offerings, account plans, annual priorities and team objectives; assign the client-approaches presentation and first client meetings; assign solution areas when ready; supervise mentoring." },
      { id: "d60", label: "By Day 60", day: 60, built: true,
        focus: "Support application on a live account: assign it, broker key introductions, shadow client meetings, and debrief the negotiation scenario." },
      { id: "d90", label: "By Day 90", day: 90, built: false,
        focus: "Verify progress and give structured feedback on the presentation and client engagement; confirm required learning is complete." },
      { id: "d120", label: "By Day 120", day: 120, built: false,
        focus: "Lead the developmental review across the eight competencies and agree next development steps." }
    ]
  };

  // Learning activities. status: notstarted | enrolled | inprogress | completed
  var activities = [
    /* ---------------- Employee · By Day 7 ---------------- */
    { id: "E07-HR-01", role: "employee", ms: "d7", track: "hr", kind: "task",
      title: "Complete your workplace orientation modules",
      summary: "Short self-paced modules on IT setup, HR essentials and your office facilities.",
      steps: ["Open the orientation modules in the learning system.", "Complete the IT, HR and facilities modules.", "Note any setup questions for your manager."],
      why: "Removes first-week friction so your time goes to people and learning." },
    { id: "E07-HR-02", role: "employee", ms: "d7", track: "hr", kind: "task",
      title: "Set up your HR system profile",
      summary: "Confirm your personal details and get familiar with where goals and reviews will live.",
      steps: ["Sign in to the HR system.", "Review and confirm your profile.", "Find the goals area you will use at Day 60."],
      why: "You will record performance goals here by Day 60." },
    { id: "E07-HR-03", role: "employee", ms: "d7", track: "hr", kind: "task",
      title: "Complete required compliance learning",
      summary: "Three required eLearning courses: business ethics, health and safety, and information security.",
      steps: ["Complete the business ethics course.", "Complete the health and safety course.", "Complete the information security course."],
      why: "Required for everyone, and the foundation for how you handle customer information." },

    { id: "E07-SS-01", role: "employee", ms: "d7", track: "ss", kind: "meeting",
      title: "Meet the teams in your office",
      summary: "Short introductory meetings with the departments you will work alongside.",
      steps: ["Attend the meetings your manager scheduled.", "Ask each team how they support sales.", "Note one person to follow up with in each team."],
      why: "Knowing who does what shortens every future request." },
    { id: "E07-SS-02", role: "employee", ms: "d7", track: "ss", kind: "task",
      title: "Get oriented in your core sales tools",
      summary: "Find your way around the CRM, the customer portal, the company intranet and the sales resource center.",
      steps: ["Log in to each tool.", "Locate your accounts in the CRM.", "Bookmark the sales resource center and its training section."],
      why: "These tools hold the account data, materials and training you will use daily." },
    { id: "E07-SS-03", role: "employee", ms: "d7", track: "ss", kind: "enrollment",
      title: "Enroll in the core sales skills courses",
      summary: "Enroll in five instructor-supported courses. Enrollment is due by Day 7; no completion date is set, so track each course as you progress.",
      courses: [
        { id: "C1", title: "Advancing sales opportunities", competency: "PC-04" },
        { id: "C2", title: "Consultative selling", competency: "PC-05" },
        { id: "C3", title: "Customer needs discovery", competency: "PC-05" },
        { id: "C4", title: "Negotiation fundamentals", competency: "PC-07" },
        { id: "C5", title: "Presenting to customers", competency: "PC-06" }
      ],
      why: "These courses build the skills behind several competencies. Enrolling, or even finishing, is not evidence of competency on its own.",
      competencies: ["PC-04", "PC-05", "PC-06", "PC-07"], linkType: "builds" },
    { id: "E07-SS-04", role: "employee", ms: "d7", track: "ss", kind: "meeting",
      title: "Discuss the sales competency model with your manager",
      summary: "Walk through the eight competencies that frame your development over the first 120 days.",
      steps: ["Read the eight competency descriptions.", "Pick two you feel confident in and two you want to grow.", "Agree with your manager how evidence will be gathered."],
      why: "Sets shared expectations for how your development will be observed and discussed.", competencies: ["PC-01", "PC-02", "PC-03", "PC-04", "PC-05", "PC-06", "PC-07", "PC-08"], linkType: "introduces" },

    { id: "E07-CS-01", role: "employee", ms: "d7", track: "cs", kind: "meeting",
      title: "Set solution priorities and goals with your manager",
      summary: "Agree which parts of the solution portfolio matter most for your role this year.",
      steps: ["Review the priorities document your manager shares.", "Discuss how they apply to your territory.", "Write down two learning goals."],
      why: "Focuses your product learning where it will matter most." },
    { id: "E07-CS-02", role: "employee", ms: "d7", track: "cs", kind: "meeting",
      title: "Get an introduction to the six solution areas",
      summary: "A guided overview of the solution portfolio. Deeper learning later focuses on the areas you are assigned.",
      steps: ["Attend the introduction session.", "Note how each solution area helps customers.", "List questions to raise when areas are assigned around Day 30."],
      why: "Everyone needs a broad picture; depth follows your assigned responsibilities." },
    { id: "E07-CS-03", role: "employee", ms: "d7", track: "cs", kind: "task",
      title: "Learn the foundations of your customers' industry",
      summary: "Four short eLearning modules on how your customers' industry works, who pays, and what pressures they face.",
      steps: ["Complete the four industry foundation modules.", "Note three customer pressures you heard about.", "Bring them to your next one-to-one."],
      why: "Customer conversations go further when you understand their world.", competencies: ["PC-04"], linkType: "builds" },
    { id: "E07-CS-04", role: "employee", ms: "d7", track: "cs", kind: "task",
      title: "Explore the product academy and recent town halls",
      summary: "Browse the course catalog, learn how to access eLearning, and listen to recent all-hands recordings.",
      steps: ["Open the course catalog.", "Save courses relevant to your goals.", "Listen to the latest two town hall recordings."],
      why: "Shows where ongoing learning lives and what leadership is focused on." },
    { id: "E07-CS-05", role: "employee", ms: "d7", track: "cs", kind: "task", optional: true, feature: "leadership",
      title: "Optional: register for leadership preparation",
      summary: "If a people-leadership path interests you, register for the optional leadership development program.",
      steps: ["Read the program overview.", "Discuss timing with your manager.", "Register if it fits your goals."],
      why: "Optional and outside the onboarding deadlines; it supports longer-term career goals." },

    { id: "E07-CM-01", role: "employee", ms: "d7", track: "cm", kind: "meeting",
      title: "Meet the people around your role",
      summary: "Introductions to your office, HR partner, leadership, peers and the key account managers you will work with.",
      steps: ["Attend the introductions your manager arranged.", "Ask each person how you can help them.", "Add everyone to your contacts."],
      why: "Your network is how work gets done here." },
    { id: "E07-CM-02", role: "employee", ms: "d7", track: "cm", kind: "resource",
      title: "Save the contact directory and expert list",
      summary: "Bookmark the company contact directory and the list of subject-matter experts.",
      steps: ["Open both resources.", "Bookmark them.", "Find one expert for each solution area."],
      why: "Saves time when a customer question needs specialist input." },
    { id: "E07-CM-03", role: "employee", ms: "d7", track: "cm", kind: "meeting",
      title: "Agree your mentoring and shadowing plan",
      summary: "Agree on a mentor and the shadowing opportunities you will have in the first month.",
      steps: ["Share what you most want to learn by watching others.", "Meet your assigned mentor.", "Book your first shadowing session."],
      why: "Watching experienced colleagues speeds up learning more than any course." },

    /* ---------------- Employee · By Day 60 ---------------- */
    { id: "E60-HR-01", role: "employee", ms: "d60", track: "hr", kind: "task",
      title: "Enter your performance goals",
      summary: "Record your agreed performance goals in the HR system.",
      steps: ["Draft goals with your manager.", "Enter them in the HR system.", "Ask your manager to confirm."],
      why: "Makes expectations explicit before the Day-120 review." },

    { id: "E60-SS-01", role: "employee", ms: "d60", track: "ss", kind: "task",
      title: "Take on your assigned client account",
      summary: "Your manager assigns your first account; review its history and current opportunities.",
      steps: ["Read the account history in the CRM.", "List open opportunities and risks.", "Confirm your understanding with your manager."],
      why: "Your first live account is where the competencies come together.", competencies: ["PC-02"], linkType: "builds" },
    { id: "E60-SS-02", role: "employee", ms: "d60", track: "ss", kind: "meeting",
      title: "Connect with your key account managers",
      summary: "Meet the global and regional key account managers who coordinate larger customers.",
      steps: ["Attend the introductions your manager brokered.", "Learn how account coordination works.", "Agree how you will keep each other informed."],
      why: "Large customers are served by a team; you need to know your part.", competencies: ["PC-02"], linkType: "builds" },
    { id: "E60-SS-03", role: "employee", ms: "d60", track: "ss", kind: "task",
      title: "Start client meetings yourself",
      summary: "Move from attending meetings to initiating them with your account contacts.",
      steps: ["Plan each meeting around one clear objective.", "Send the agenda in advance.", "Follow up with agreed next steps within two working days."],
      why: "Initiating meetings is a visible step toward working independently.", competencies: ["PC-03"], linkType: "evidence", resources: ["R1"],
      success: ["Each meeting has a written objective and an agenda the customer received in advance.", "You confirm the customer's priorities in their own words before proposing anything.", "You listen more than you present, and adjust the conversation to what you hear.", "Within two working days, you send a follow-up that lists each next step with an owner and a date.", "You keep your call plan and follow-up, so they can serve as work-product evidence for PC-03."] },
    { id: "E60-SS-04", role: "employee", ms: "d60", track: "ss", kind: "task",
      title: "Prepare your client-approaches presentation",
      summary: "Prepare a short presentation on how you will approach your account. You deliver it by Day 90.",
      steps: ["Outline the customer's goals and your proposed approach.", "Draft the slides.", "Review progress with your manager."],
      why: "Pulls together planning, discovery and value; delivered and reviewed by Day 90.", competencies: ["PC-02", "PC-06"], linkType: "evidence", resources: ["R4", "R6"],
      success: ["The outline names the customer's goals, key stakeholders and your next actions.", "Each part of your approach links to an outcome the customer cares about.", "Expected benefits are stated with the assumptions behind them.", "You have reviewed a draft with your manager before Day 60 and noted their feedback."] },
    { id: "E60-SS-05", role: "employee", ms: "d60", track: "ss", kind: "meeting",
      title: "Discuss revenue targets with your manager",
      summary: "Understand your quarterly and annual targets and how they connect to your account plan.",
      steps: ["Review your targets.", "Map them to your account opportunities.", "Agree on priorities for the next quarter."],
      why: "Targets shape where you spend your time.", competencies: ["PC-01"], linkType: "builds", resources: ["R8"] },
    { id: "E60-SS-06", role: "employee", ms: "d60", track: "ss", kind: "meeting",
      title: "Qualify and position a real opportunity",
      summary: "A manager discussion plus three eLearning modules on identifying opportunities, qualifying them, and analyzing competitors.",
      steps: ["Complete the three eLearning modules.", "Bring one real opportunity from your account.", "Discuss how to qualify and position it."],
      why: "Applies discovery and qualification to a real opportunity.", competencies: ["PC-04"], linkType: "evidence", resources: ["R2"],
      success: ["You describe the opportunity as a business problem in the customer's terms.", "You state what you know, and do not yet know, about need, priority, decision process and funding.", "You record a qualification status with your reasons, and agree a next step with your manager."] },
    { id: "E60-SS-07", role: "employee", ms: "d60", track: "ss", kind: "meeting",
      title: "Strengthen your account relationships",
      summary: "A manager discussion plus eLearning on building business relationships and your professional presence.",
      steps: ["Complete the two eLearning modules.", "Map your account's stakeholders.", "Discuss gaps in your relationships with your manager."],
      why: "Strong relationships sustain accounts beyond a single deal.", competencies: ["PC-02"], linkType: "builds" },
    { id: "E60-SS-08", role: "employee", ms: "d60", track: "ss", kind: "scenario", isNew: true,
      title: "Negotiation practice: a renewal under pressure",
      summary: "An interactive branching scenario. Negotiate a contract renewal with a fictional customer, reflect on your choices, then debrief with your manager.",
      why: "Applies the negotiation course you took by Day 30. Completing the scenario is practice and evidence, not proof of negotiation proficiency.",
      competencies: ["PC-07", "PC-08"], linkTypes: { "PC-07": "evidence", "PC-08": "builds" }, resources: ["R5"] },
    { id: "E60-SS-09", role: "employee", ms: "d60", track: "ss", kind: "task",
      title: "Strategic negotiation eLearning",
      summary: "A follow-on eLearning module on planning complex negotiations.",
      steps: ["Complete the module.", "Use its planning worksheet on a real opportunity."],
      why: "Extends the fundamentals you learned by Day 30.", competencies: ["PC-07"], linkType: "builds", resources: ["R5"] },

    { id: "E60-CS-01", role: "employee", ms: "d60", track: "cs", kind: "meeting",
      title: "Discuss the solution portfolio strategy",
      summary: "Understand how the solution areas fit together and the value story they tell customers.",
      steps: ["Review the portfolio strategy overview.", "Discuss buyer types and sales insights with your manager."],
      why: "Lets you position combined solutions, not single products.", competencies: ["PC-06"], linkType: "builds", resources: ["R12"] },
    { id: "E60-CS-02", role: "employee", ms: "d60", track: "cs", kind: "meeting",
      title: "Discuss the services and support model",
      summary: "Learn how customers are supported after the sale and who is involved.",
      steps: ["Review the services model.", "Discuss handoff expectations with your manager."],
      why: "You set customer expectations that delivery colleagues must meet.", competencies: ["PC-08"], linkType: "builds", resources: ["R7"] },
    { id: "E60-CS-03", role: "employee", ms: "d60", track: "cs", kind: "task",
      title: "Contribute to a proposal response",
      summary: "Review proposal templates, complete a proposal-writing eLearning, and help draft a live proposal response.",
      steps: ["Review the proposal overview and templates.", "Complete the proposal-writing eLearning.", "Draft one section of a live response with the proposal team."],
      why: "Real proposal work is the best practice for value-based writing.", competencies: ["PC-05", "PC-06"], linkTypes: { "PC-05": "builds", "PC-06": "evidence" }, resources: ["R6"],
      success: ["Your section links each recommendation to a customer outcome.", "Benefits are stated with their assumptions, and risks or alternatives are addressed openly.", "The proposal team accepts your draft with only light edits, or you can explain how you used their feedback."] },

    { id: "E60-CM-01", role: "employee", ms: "d60", track: "cm", kind: "meeting",
      title: "Consult key account managers on account strategy",
      summary: "Ask the key account managers for their view of your account's priorities and risks.",
      steps: ["Prepare two specific questions.", "Hold the consultation.", "Update your account plan with what you learn."],
      why: "Brings broader customer context into your account plan.", competencies: ["PC-02"], linkType: "evidence", resources: ["R4"],
      success: ["You arrive with two specific questions about the account's priorities or risks.", "Your account plan shows what changed as a result of the consultation.", "You can explain the change to your manager in a sentence or two."] },
    { id: "E60-CM-02", role: "employee", ms: "d60", track: "cm", kind: "meeting",
      title: "Collaborate with solution engineers and marketing",
      summary: "Work with a solution engineer and a marketing specialist on one customer opportunity.",
      steps: ["Agree the opportunity and goal.", "Hold a working session.", "Share the outcome with your manager."],
      why: "Complex sales are team sales.", competencies: ["PC-05", "PC-06"], linkType: "builds", resources: ["R3"] },

    /* ---------------- Manager · Before Day 1 and By Day 7 ---------------- */
    { id: "M-HR-01", role: "manager", ms: "d7", track: "hr", kind: "coordinated",
      title: "Orientation, HR setup and compliance learning",
      summary: "One coordinated responsibility in two steps.",
      prepare: { ms: "pre", label: "Arrange orientation modules, HR system access and compliance courses" },
      deliver: { ms: "d7", label: "Communicate the arrangements, or delegate them" },
      supports: ["E07-HR-01", "E07-HR-02", "E07-HR-03"], relation: "direct" },
    { id: "M-SS-01", role: "manager", ms: "pre", track: "ss", kind: "task",
      title: "Book first-week team introductions",
      summary: "Book short introductory meetings with the departments the new hire will work alongside.",
      supports: ["E07-SS-01"], relation: "direct" },
    { id: "M-SS-02", role: "manager", ms: "d7", track: "ss", kind: "task",
      title: "Host the team introductions",
      summary: "Host or attend the introductions and make sure each team explains how it supports sales.",
      supports: ["E07-SS-01"], relation: "direct" },
    { id: "M-SS-03", role: "manager", ms: "d7", track: "ss", kind: "coordinated",
      title: "Sales tools and core course enrollment",
      summary: "One coordinated responsibility in two steps.",
      prepare: { ms: "pre", label: "Arrange tool access and course seats" },
      deliver: { ms: "d7", label: "Assign the tools orientation and the five course enrollments" },
      supports: ["E07-SS-02", "E07-SS-03"], relation: "direct" },
    { id: "M-SS-04", role: "manager", ms: "pre", track: "ss", kind: "task",
      title: "Prepare competency discussion points",
      summary: "Prepare how you will explain the eight competencies and how evidence will be gathered.",
      supports: ["E07-SS-04"], relation: "direct", competencies: ["PC-01", "PC-02", "PC-03", "PC-04", "PC-05", "PC-06", "PC-07", "PC-08"], linkType: "introduces" },
    { id: "M-SS-05", role: "manager", ms: "d7", track: "ss", kind: "meeting",
      title: "Meet to discuss the competency model",
      summary: "Walk through the competencies and agree how development will be observed and recorded.",
      supports: ["E07-SS-04"], relation: "direct",
      guidance: {
        purpose: "Set shared expectations for development before any evidence is gathered, so later ratings feel fair and predictable.",
        actions: ["Explain that the eight competencies are developmental, not a pass or fail test.", "Ask the new hire which two competencies feel strongest and which two they want to grow.", "Agree how evidence will be gathered: work products, your observations or a mentor's, and reflection.", "Explain that \u201cNot yet observed\u201d means not enough evidence yet, not poor performance."],
        completion: "Mark this done when you have held the conversation and agreed how evidence will be gathered."
      } },
    { id: "M-CS-01", role: "manager", ms: "d7", track: "cs", kind: "coordinated",
      title: "Solution and industry learning resources",
      summary: "One coordinated responsibility in two steps.",
      prepare: { ms: "pre", label: "Arrange access to the product academy, course catalog and industry modules" },
      deliver: { ms: "d7", label: "Assign the industry foundations and point to recordings and optional programs" },
      supports: ["E07-CS-03", "E07-CS-04", "E07-CS-05"], relation: "direct" },
    { id: "M-CS-02", role: "manager", ms: "pre", track: "cs", kind: "task",
      title: "Prepare solution priorities and goals",
      summary: "Prepare the priorities document you will review together in the first week.",
      supports: ["E07-CS-01"], relation: "direct" },
    { id: "M-CS-03", role: "manager", ms: "d7", track: "cs", kind: "meeting",
      title: "Set solution priorities and goals",
      summary: "Review priorities together and agree two learning goals.",
      supports: ["E07-CS-01"], relation: "direct" },
    { id: "M-CS-04", role: "manager", ms: "pre", track: "cs", kind: "task",
      title: "Gather the solution-area overview materials",
      summary: "Gather the overview materials for the six solution areas.",
      supports: ["E07-CS-02"], relation: "direct" },
    { id: "M-CS-05", role: "manager", ms: "d7", track: "cs", kind: "meeting",
      title: "Introduce the solution areas",
      summary: "Give a guided overview; explain that deeper learning follows assigned areas.",
      supports: ["E07-CS-02"], relation: "direct" },
    { id: "M-CM-01", role: "manager", ms: "d7", track: "cm", kind: "coordinated",
      title: "Introductions, contacts and mentoring",
      summary: "One coordinated responsibility in two steps.",
      prepare: { ms: "pre", label: "Line up introductions, the contact directory, the expert list and a mentor" },
      deliver: { ms: "d7", label: "Make the introductions and agree mentoring and shadowing" },
      supports: ["E07-CM-01", "E07-CM-02", "E07-CM-03"], relation: "direct" },

    /* ---------------- Manager · By Day 60 ---------------- */
    { id: "M60-HR-01", role: "manager", ms: "d60", track: "hr", kind: "task",
      title: "Direct performance-goal entry",
      summary: "Agree goals together and ask the new hire to enter them in the HR system.",
      supports: ["E60-HR-01"], relation: "direct" },
    { id: "M60-SS-01", role: "manager", ms: "d60", track: "ss", kind: "task",
      title: "Assign the client account",
      summary: "Assign the first account and share its history and context.",
      supports: ["E60-SS-01"], relation: "direct" },
    { id: "M60-SS-02", role: "manager", ms: "d60", track: "ss", kind: "task",
      title: "Broker key account manager introductions",
      summary: "Introduce the new hire to the global and regional key account managers for their account.",
      supports: ["E60-SS-02"], relation: "direct" },
    { id: "M60-SS-03", role: "manager", ms: "d60", track: "ss", kind: "task",
      title: "Shadow client meetings the new hire initiates",
      summary: "Observe at least one client meeting the new hire plans and leads, then coach and record what you saw.",
      supports: ["E60-SS-03"], relation: "indirect", competencies: ["PC-03"], linkType: "evidence", resources: ["R10", "R9"],
      guidance: {
        purpose: "See how the new hire runs a real customer conversation, give timely coaching, and gather observed-performance evidence for Customer Engagement & Meeting Effectiveness (PC-03).",
        actions: ["Before the meeting, ask to see the call plan: the objective, agenda and key questions.", "Agree your role in advance. Observe; step in only if the customer relationship is at risk.", "During the meeting, note specific behaviors and the customer's responses, not general impressions.", "Within a day, hold a short coaching conversation: one strength, one growth focus, one agreed action.", "Record what you observed as evidence, describing behavior and context."],
        lookFor: [
          { area: "Preparation", text: "A clear objective and agenda shared with the customer beforehand." },
          { area: "Questioning", text: "Open questions that uncover goals and priorities before any proposal." },
          { area: "Listening", text: "Summarizes what the customer said and checks understanding." },
          { area: "Customer engagement", text: "Adapts to the customer's interests; the customer talks at least as much as the seller." },
          { area: "Follow-through", text: "Closes with agreed next steps, owners and dates, and follows up within two working days." }
        ],
        coaching: "Describe what you saw and its effect on the customer. Avoid labels such as \u201cgood\u201d or \u201cweak\u201d. One observation is one piece of evidence; a rating also needs a second, different kind of evidence.",
        evidence: "An observed-performance entry for PC-03 that names the meeting, the behaviors you saw and the customer's response.",
        completion: "Mark this done when you have observed at least one meeting and held the coaching conversation. Recording evidence is strongly recommended but is not required to mark this done.",
        record: "PC-03"
      } },
    { id: "M60-SS-04", role: "manager", ms: "d60", track: "ss", kind: "task",
      title: "Review progress on the client-approaches presentation",
      summary: "Check the outline and draft; give feedback before the Day-90 delivery.",
      supports: ["E60-SS-04"], relation: "indirect", resources: ["R9"],
      guidance: {
        purpose: "Catch gaps in planning and value early, so the Day-90 presentation shows the new hire's best thinking.",
        actions: ["Review the outline against the customer's goals, stakeholders and next actions.", "Check that each part of the approach links to a customer outcome, with stated assumptions.", "Give two or three specific suggestions, and agree a date for the next draft."],
        completion: "Mark this done when you have reviewed a draft and given feedback. The presentation itself is delivered and assessed by Day 90."
      } },
    { id: "M60-SS-05", role: "manager", ms: "d60", track: "ss", kind: "meeting",
      title: "Lead sales development discussions",
      summary: "Revenue targets, opportunity and pitch development, and relationship management.",
      supports: ["E60-SS-05", "E60-SS-06", "E60-SS-07"], relation: "direct", competencies: ["PC-04"], linkType: "evidence", resources: ["R2", "R9"],
      guidance: {
        purpose: "Connect targets, a real opportunity and the account's relationships in one development conversation, and observe how the new hire qualifies an opportunity (PC-04).",
        actions: ["Review targets and agree where time should go next quarter.", "Ask the new hire to walk you through one real opportunity: the problem, need, priority, decision process and funding.", "Discuss gaps in the account's relationships and agree one action.", "Record what you observed about qualification as PC-04 evidence."],
        lookFor: [
          { area: "Business terms", text: "States the opportunity as the customer's business problem, not a product." },
          { area: "Qualification", text: "Knows what is confirmed and what is still unknown about need, priority, decision process and funding." },
          { area: "Next step", text: "Proposes a specific next step to close the biggest gap." }
        ],
        evidence: "An observed-performance entry for PC-04 describing the qualification discussion.",
        completion: "Mark this done when the discussions have been held. Recording evidence is recommended but not required.",
        record: "PC-04"
      } },
    { id: "M60-SS-06", role: "manager", ms: "d60", track: "ss", kind: "debrief", isNew: true,
      title: "Debrief the negotiation scenario",
      summary: "Review the path and reflection, discuss them using the debrief guide, and record coaching notes.",
      supports: ["E60-SS-08"], relation: "direct", competencies: ["PC-07"], linkType: "evidence", resources: ["R9"] },
    { id: "M60-CS-01", role: "manager", ms: "d60", track: "cs", kind: "meeting",
      title: "Discuss portfolio strategy and the services model",
      summary: "Explain how solutions combine and how customers are supported after the sale.",
      supports: ["E60-CS-01", "E60-CS-02"], relation: "direct" },
    { id: "M60-CS-02", role: "manager", ms: "d60", track: "cs", kind: "task",
      title: "Involve the new hire in a proposal response",
      summary: "Find a live response they can contribute to and introduce them to the proposal team.",
      supports: ["E60-CS-03"], relation: "direct" },
    { id: "M60-CM-01", role: "manager", ms: "d60", track: "cm", kind: "task",
      title: "Oversee cross-functional collaboration",
      summary: "Check in on work with key account managers, solution engineers and marketing.",
      supports: ["E60-CM-01", "E60-CM-02"], relation: "indirect",
      guidance: {
        purpose: "Make sure collaboration is happening and is useful to the new hire, without taking it over.",
        actions: ["Ask what the new hire learned from the key account managers and how the account plan changed.", "Ask a solution engineer or marketing colleague for one sentence of feedback on working together.", "Remove any obstacle the new hire cannot remove alone."],
        completion: "Mark this done when you have checked in on both collaborations."
      } }
  ];

  var competencies = [
    { id: "PC-01", name: "Territory & Time Prioritization",
      description: "Decides which customers and prospects get attention, and how much, based on potential, current business and relationship needs; reviews those choices as conditions change.",
      indicators: ["Ranks accounts using stated criteria.", "Builds a weekly plan that reflects the ranking.", "Revises the plan after a material change."],
      evidence: ["Territory plan (work product)", "Manager review conversation (observed)"] },
    { id: "PC-02", name: "Strategic Account Planning",
      description: "Maintains a living plan for each priority account that records the customer's goals, key people, relationship health and the next actions most likely to create mutual value.",
      indicators: ["Plan names goals, stakeholders and next actions.", "Updates the plan after customer meetings.", "Presents the plan clearly to the manager."],
      evidence: ["Account plan (work product)", "Account-plan presentation (observed)"] },
    { id: "PC-03", name: "Customer Engagement & Meeting Effectiveness",
      description: "Plans every customer conversation around a clear objective, listens to understand, adapts in the moment, and closes with agreed next steps that are followed up promptly.",
      indicators: ["Writes an objective and agenda for each meeting.", "Confirms understanding before proposing.", "Sends a follow-up with agreed next steps."],
      evidence: ["Call plan (work product)", "Observed meeting (manager or mentor)", "Follow-up sample (work product)"] },
    { id: "PC-04", name: "Opportunity Discovery & Qualification",
      description: "Spots business problems the organization could help solve and confirms the customer's need, priority, decision process and funding before committing significant effort.",
      indicators: ["States the problem in the customer's business terms.", "Checks need, priority, decision process and funding.", "Records the qualification status and reasons."],
      evidence: ["Opportunity summary (work product)", "Qualification discussion (observed)"] },
    { id: "PC-05", name: "Needs Analysis & Solution Scoping",
      description: "Uses structured questioning to learn the customer's goals, constraints, decision criteria and measures of success, and shapes a solution that fits them.",
      indicators: ["Prepares a question plan before discovery.", "Captures constraints and success measures.", "Proposes a scope that traces to stated needs."],
      evidence: ["Discovery notes (work product)", "Scoping summary (work product)"] },
    { id: "PC-06", name: "Value-Based Proposals & Presentations",
      description: "Builds proposals and presentations that tie a recommendation to the customer's desired outcomes, quantify expected benefit with stated assumptions, and address risks and alternatives openly.",
      indicators: ["Links each recommendation to a customer outcome.", "States expected benefit with its assumptions.", "Addresses risks and alternatives."],
      evidence: ["Proposal section (work product)", "Client-approaches presentation (observed)"] },
    { id: "PC-07", name: "Negotiation & Agreement",
      description: "Prepares by understanding each side's interests, limits and alternatives; trades rather than concedes to protect value and the relationship; and confirms agreement in writing.",
      indicators: ["Completes a preparation worksheet before negotiating.", "Pairs each concession with something in return.", "Confirms agreed terms in writing."],
      evidence: ["Negotiation scenario path and reasoning (work product)", "Scenario reflection (developmental)", "Manager debrief notes (developmental)"] },
    { id: "PC-08", name: "Implementation Handoff & Customer Success",
      description: "Hands the customer over to delivery colleagues with full context and realistic expectations, and stays involved to help the customer reach early success.",
      indicators: ["Writes a handoff brief covering goals, commitments and risks.", "Sets expectations that match the agreement.", "Holds an early check-in with the customer."],
      evidence: ["Handoff brief (work product)", "Delivery colleague feedback (observed)"] }
  ];

  var scale = [
    { id: "nyo", label: "Not yet observed", text: "Insufficient evidence to evaluate the competency. This is not a judgment of performance." },
    { id: "emerging", label: "Emerging", text: "Demonstrates relevant behaviors with substantial guidance or inconsistent execution." },
    { id: "developing", label: "Developing", text: "Demonstrates relevant behaviors in routine situations, with some coaching or refinement needed." },
    { id: "consistent", label: "Demonstrating consistently", text: "Independently demonstrates relevant behaviors across multiple situations, supported by documented evidence." }
  ];

  // How an activity relates to a competency. No link type establishes competency on its own.
  var linkTypes = {
    introduces: { label: "Introduces", text: "Orients you to the competency and what good looks like. It produces no evidence." },
    builds: { label: "Builds", text: "Learning or practice that develops the skills. Useful preparation, but not performance evidence on its own." },
    evidence: { label: "Produces evidence", text: "The work or performance can be recorded as evidence. Evidence informs your manager's judgment; it does not establish competency by itself." }
  };

  var evidenceCategories = [
    { id: "work", label: "Work product", hint: "Name the artifact, such as a call plan, account plan or proposal section, and explain what it shows against the competency's indicators." },
    { id: "observed", label: "Observed performance", hint: "Describe what you saw and the context: the situation, the specific behaviors, and how the customer or colleague responded. Avoid general judgments." },
    { id: "reflection", label: "Developmental reflection", hint: "Explain what was learned, what changed in your approach, and what will be applied next time." }
  ];

  // Fictional sample records (demonstration only)
  var sample = {
    statuses: {
      "E07-HR-01": "completed", "E07-HR-02": "completed", "E07-HR-03": "completed",
      "E07-SS-01": "completed", "E07-SS-02": "completed", "E07-SS-04": "completed",
      "E07-CS-01": "completed", "E07-CS-02": "completed", "E07-CS-03": "completed", "E07-CS-04": "completed",
      "E07-CM-01": "completed", "E07-CM-02": "completed", "E07-CM-03": "completed",
      "E60-HR-01": "inprogress", "E60-SS-01": "completed", "E60-SS-02": "completed", "E60-SS-03": "inprogress",
      "E60-SS-04": "inprogress", "E60-SS-05": "completed", "E60-SS-06": "inprogress", "E60-CS-03": "inprogress",
      "E60-CM-01": "inprogress"
    },
    courses: { C1: "completed", C2: "completed", C3: "inprogress", C4: "completed", C5: "enrolled" },
    managerSteps: {
      "M-HR-01:prepare": true, "M-HR-01:deliver": true, "M-SS-01": true, "M-SS-02": true,
      "M-SS-03:prepare": true, "M-SS-03:deliver": true, "M-SS-04": true, "M-SS-05": true,
      "M-CS-01:prepare": true, "M-CS-01:deliver": true, "M-CS-02": true, "M-CS-03": true, "M-CS-04": true, "M-CS-05": true,
      "M-CM-01:prepare": true, "M-CM-01:deliver": true,
      "M60-HR-01": true, "M60-SS-01": true, "M60-SS-02": true, "M60-SS-05": true
    },
    evidence: [
      { id: "EV-1", competency: "PC-03", category: "work", by: "employee", day: 38, title: "Call plan for first account meeting",
        note: "Objective, agenda and three discovery questions prepared before the meeting." },
      { id: "EV-2", competency: "PC-03", category: "observed", by: "mentor", day: 41, title: "Observed client meeting",
        note: "Opened with a clear objective and confirmed the customer's priorities before presenting. Follow-up was sent the next day; next steps were vague in one place." },
      { id: "EV-3", competency: "PC-04", category: "work", by: "employee", day: 47, title: "Opportunity summary: reporting upgrade",
        note: "Describes the customer's reporting delays in business terms; funding and decision process not yet confirmed." }
    ],
    ratings: {
      "PC-03": { level: "developing", day: 45, note: "Plans meetings well and listens carefully. Next step: make every follow-up end with a dated, owned next step.", evidence: ["EV-1", "EV-2"] }
    }
  };

  // Performance-support resources. Every resource opens a printable reference page (#/resource/<id>).
  // R4, R5 and R7 also offer an editable Word template in downloads/.
  var resources = [
    { id: "R1", title: "Meeting planning checklist", type: "Job aid", topic: "Customer meetings", role: "both", competencies: ["PC-03"],
      text: "A one-page checklist: objective, attendees, agenda, three questions, desired next step.",
      body: [
        { h: "Before the meeting", list: ["Write one objective: what should be different after this meeting?", "Confirm who is attending and what each person cares about.", "Send a short agenda at least one working day ahead.", "Prepare three open questions about the customer's goals or priorities.", "Decide the next step you will propose if the meeting goes well."] },
        { h: "During the meeting", list: ["Restate the objective and check it still fits the customer's needs.", "Ask before you present; summarize what you heard before proposing.", "Note commitments as they are made."] },
        { h: "Within two working days", list: ["Send a follow-up listing each next step with an owner and a date.", "Update the account plan with anything new you learned."] }
      ] },
    { id: "R2", title: "Qualification questions guide", type: "Job aid", topic: "Opportunities", role: "both", competencies: ["PC-04"],
      text: "Questions to confirm need, priority, decision process and funding, with examples of strong and weak answers.",
      body: [
        { h: "Need", list: ["What problem are you trying to solve, and what does it cost you today?", "Strong answer: a specific business effect, such as “reports arrive four days late, so we reorder stock blind.” Weak answer: “we are always looking to improve.”"] },
        { h: "Priority", list: ["Where does this sit against your other initiatives this year?", "What happens if nothing changes for six months?"] },
        { h: "Decision process", list: ["Who else will be involved in the decision, and what does each person need to see?", "What steps does a purchase like this go through?"] },
        { h: "Funding", list: ["Is budget set aside for this, or would it need to be found?", "When does your budget cycle start?"] },
        { h: "Record the result", p: "Note the qualification status (qualified, needs more discovery, or not a fit) and the reasons. A clear “not now” is a useful outcome." }
      ] },
    { id: "R3", title: "Discovery question bank", type: "Job aid", topic: "Discovery", role: "both", competencies: ["PC-05"],
      text: "Open questions grouped by goals, constraints, decision criteria and success measures.",
      body: [
        { h: "Goals", list: ["What are you trying to achieve this year?", "How would this project help you get there?"] },
        { h: "Constraints", list: ["What limits do we need to work within: time, budget, systems or people?", "What has been tried before, and what got in the way?"] },
        { h: "Decision criteria", list: ["How will you compare the options in front of you?", "Which criterion matters most if they conflict?"] },
        { h: "Success measures", list: ["Six months after go-live, what would tell you this worked?", "Who will judge that, and how will they measure it?"] }
      ] },
    { id: "R4", title: "Account plan template", type: "Template", topic: "Account planning", role: "both", competencies: ["PC-02"],
      text: "Sections for customer goals, stakeholders, relationship health, opportunities, risks and next actions.",
      download: { file: "downloads/account-plan-template.docx", label: "Account plan template", size: "12 KB" },
      body: [
        { h: "Sections in the template", list: ["Account summary: what the customer does and how they use your solutions today.", "Customer goals for the next 12 months, in their words.", "Stakeholder map: name, role, what they care about, and relationship health.", "Opportunities: problem, estimated value, qualification status and next step.", "Risks: what could harm the relationship or revenue, and how you will respond.", "Next actions: owner and date for each."] },
        { h: "How to use it", p: "Start a plan within a week of taking on an account. Update it after every significant customer meeting, and bring it to your one-to-ones. The plan is a working document, not a report." }
      ] },
    { id: "R5", title: "Negotiation preparation worksheet", type: "Template", topic: "Negotiation", role: "both", competencies: ["PC-07"],
      text: "Capture each side's interests, limits and alternatives, and the trades you could offer.",
      download: { file: "downloads/negotiation-preparation-worksheet.docx", label: "Negotiation preparation worksheet", size: "12 KB" },
      body: [
        { h: "Complete before any negotiation", list: ["Our interests: what we need and why it matters.", "Their interests: what the customer needs and why, including interests that are not about price.", "Our limits: the point at which we would walk away.", "Our alternative if we do not agree, and our best guess at theirs.", "Tradable items: what we could give that costs us little and is worth a lot to them, and what we would ask for in return.", "Questions to ask early, to learn their priorities and budget."] },
        { h: "During and after", list: ["Pair each concession with something in return.", "Summarize agreed terms, owners and dates in writing the same day.", "Brief delivery colleagues on what was promised."] }
      ] },
    { id: "R6", title: "Value statement builder", type: "Job aid", topic: "Proposals", role: "both", competencies: ["PC-06"],
      text: "Turn a recommendation into an outcome, a quantified benefit and the assumptions behind it.",
      body: [
        { h: "Build each statement in four parts", list: ["Recommendation: what you propose the customer does.", "Outcome: the result the customer cares about.", "Benefit: an estimate, with its unit and timeframe.", "Assumptions: what must be true for the estimate to hold."] },
        { h: "Fictional example", p: "“Moving weekly stock reports to daily (recommendation) lets planners reorder before shortages (outcome), which we estimate reduces emergency freight by about 15% in the first year (benefit), assuming order volumes stay near this year's level (assumption).”" },
        { h: "Check before you send", list: ["Would the customer recognize the outcome as theirs?", "Have you stated the risks and at least one alternative?"] }
      ] },
    { id: "R7", title: "Implementation handoff brief", type: "Template", topic: "Handoff", role: "both", competencies: ["PC-08"],
      text: "What delivery colleagues need: customer goals, commitments made, risks and key contacts.",
      download: { file: "downloads/implementation-handoff-brief.docx", label: "Implementation handoff brief", size: "12 KB" },
      body: [
        { h: "Sections in the template", list: ["Customer goals and how they will judge success.", "What was agreed: scope, dates and any special terms.", "Commitments made in conversation that are not in the contract.", "Risks and sensitivities.", "Key contacts and their roles.", "Date of your early check-in with the customer."] },
        { h: "How to use it", p: "Complete it before the delivery kick-off and walk delivery colleagues through it. Expectations you set during the sale are only kept if the people delivering know about them." }
      ] },
    { id: "R8", title: "Territory prioritization grid", type: "Template", topic: "Territory", role: "both", competencies: ["PC-01"],
      text: "Rate accounts by potential, current business and relationship need to decide where time goes.",
      body: [
        { h: "Rate each account from 1 to 3", list: ["Potential: how much new value could this account create in the next year?", "Current business: how much revenue do we already have to protect?", "Relationship need: how much attention does the relationship need right now?"] },
        { h: "Turn ratings into time", list: ["Add the three ratings. Accounts scoring 7 to 9 get weekly attention; 4 to 6 every two weeks; 3 monthly.", "Build next week's plan from the ranking.", "Revisit the grid whenever something material changes, such as a lost deal or a new contact."] }
      ] },
    { id: "R9", title: "Coaching conversation guide", type: "Coaching guide", topic: "Coaching", role: "manager", competencies: [],
      text: "A four-part structure for development conversations: evidence, strengths, one growth focus, agreed action.",
      body: [
        { h: "Four parts", list: ["Evidence: describe what you saw or read, specifically and without labels.", "Strengths: name one behavior that worked and why it mattered to the customer.", "One growth focus: choose a single area; more than one dilutes the message.", "Agreed action: what the new hire will try next, and when you will follow up."] },
        { h: "Good practice", list: ["Ask for their view before you give yours.", "Keep it short and close to the event.", "Separate coaching from rating. A coaching note is developmental evidence, not a verdict."] }
      ] },
    { id: "R10", title: "Observing a client meeting", type: "Coaching guide", topic: "Coaching", role: "manager", competencies: ["PC-03"],
      text: "What to watch for and how to record an observation as evidence without judging the person.",
      body: [
        { h: "Before", list: ["Review the call plan with the new hire.", "Agree that you will observe and step in only if the customer relationship is at risk."] },
        { h: "What to watch for", list: ["Preparation: objective and agenda shared in advance.", "Questioning: open questions before any proposal.", "Listening: summarizes and checks understanding.", "Customer engagement: adapts to the customer's interests.", "Follow-through: agreed next steps with owners and dates."] },
        { h: "Recording the observation", p: "Write what happened and how the customer responded, for example “Asked about the reporting delay before presenting; the customer described a second problem.” Avoid judgments such as “great meeting”. Add it as observed-performance evidence on the competency page." }
      ] },
    { id: "R11", title: "Industry primer: how customers buy", type: "Primer", topic: "Industry", role: "both", competencies: ["PC-04"],
      text: "An illustrative overview of buying roles, budget cycles and common procurement steps.",
      body: [
        { h: "Buying roles", list: ["Economic buyer: approves the spend.", "User: relies on the solution day to day.", "Procurement: manages terms, price and supplier risk.", "Technical evaluator: checks fit with existing systems."] },
        { h: "Budget cycles", p: "Many organizations set budgets once a year. Needs found after the cycle closes may wait for the next one unless the problem is urgent." },
        { h: "Common procurement steps", list: ["Need identified and sponsor found.", "Options compared against criteria.", "Commercial and legal review.", "Approval and contract."] },
        { h: "Note", p: "This primer is a generalized illustration written for the demonstration. Real buying processes vary by organization." }
      ] },
    { id: "R12", title: "Solution areas at a glance", type: "Primer", topic: "Solutions", role: "both", competencies: [],
      text: "A one-paragraph summary of each of the six solution areas and the customer problems they address.",
      body: [
        { h: "The six fictional solution areas", list: ["Analytics: turns operational data into timely reports and forecasts.", "Data services: supplies and maintains reference data customers rely on.", "Customer engagement: helps customers reach and serve their own clients.", "Compliance support: tracks obligations and reduces audit effort.", "Technology platforms: hosts and connects the customer's core systems.", "Advisory services: expert guidance on strategy and change."] },
        { h: "Note", p: "These solution areas are invented for the demonstration and do not describe any real company's portfolio." }
      ] }
  ];

  /* ---------------- Day-60 branching negotiation scenario ----------------
     State carried across decisions: trust (relationship), value (price retained, %),
     flags: knowsBudget, knowsPriorities, conceded, removedReporting, documented. */
  var scenario = {
    title: "A renewal under pressure",
    setting: "Customer A, a regional distribution company, is renewing its two-year subscription to your company's analytics platform. Dana, the procurement director, has asked for a call. Luis, who runs operations and relies on the platform's reporting, will join. The renewal is due this quarter.",
    goal: "Reach an agreement that protects value for both sides and keeps the relationship healthy.",
    decisions: [
      {
        id: "d1", title: "The opening demand",
        prompt: function (s) { return "Dana opens: \"We've reviewed the renewal. We need a 20% reduction, or we'll put this out to tender.\""; },
        options: [
          { id: "a", label: "Offer 10% now to show good faith.",
            apply: function (s) { s.value -= 10; s.conceded = true; },
            reaction: function (s) { return "Dana notes the 10% and says, \"That's a start. We still need to get to 20.\" You have given ground without learning why she asked."; },
            feedback: "Conceding before you understand the request signals there is more to give. Dana now treats 10% as the floor, not the ceiling.",
            principle: "Understand interests before you move on price." },
          { id: "b", label: "Ask what is driving the 20% figure.",
            apply: function (s) { s.knowsBudget = true; s.trust += 1; },
            reaction: function (s) { return "Dana pauses. \"Our finance team cut operations budgets mid-year. This renewal lands in the current budget, and the current number doesn't fit.\" Now you know the real constraint is this year's budget."; },
            feedback: "A question turned a position (20% off) into an interest (fit this year's budget). That opens options beyond a straight discount.",
            principle: "Separate the position from the interest behind it." },
          { id: "c", label: "Say the price is fixed because the value justifies it.",
            apply: function (s) { s.trust -= 1; },
            reaction: function (s) { return "Dana's tone cools. \"Then we'll start the tender process.\" Luis stays quiet. The conversation has become a contest."; },
            feedback: "Defending price before understanding the request can be read as dismissive. You protected value for now but lost goodwill and information.",
            principle: "Hold your value without closing the conversation." }
        ]
      },
      {
        id: "d2", title: "Finding what matters",
        prompt: function (s) {
          if (s.knowsBudget) { return "Luis joins in: \"Whatever we do, my team can't lose the weekly reporting. It's how we run the warehouses.\" Dana adds that the budget pressure is real."; }
          if (s.trust < 0) { return "Dana is guarded. Luis mentions in passing that his team \"relies on the weekly reports,\" then goes quiet."; }
          return "Dana repeats that 20% is the target. Luis mentions his team relies on the weekly reporting.";
        },
        options: [
          { id: "a", label: "Ask Luis how his team uses the reporting and what it is worth to them.",
            apply: function (s) { s.knowsPriorities = true; s.trust += 1; },
            reaction: function (s) {
              return s.trust >= 1
                ? "Luis explains that the reports cut stock-outs noticeably last year. Dana listens. The value of the platform is now on the table in the customer's own words."
                : "Luis opens up a little: the reports help prevent stock-outs. Dana is still cautious, but you have learned what the customer values most.";
            },
            feedback: "Letting the customer state the value is more persuasive than stating it yourself, and tells you what not to trade away.",
            principle: "Learn what the other side values most." },
          { id: "b", label: "Present the return-on-investment figures from your last quarterly review.",
            apply: function (s) { if (s.trust < 0) { s.trust -= 1; } },
            reaction: function (s) {
              return s.trust < 0
                ? "Dana cuts in: \"We've all seen vendor ROI slides.\" The figures don't land while trust is low."
                : "Dana nods politely. The figures are reasonable, but you still don't know which outcomes matter most to them.";
            },
            feedback: "Data helps, but leading with your own figures skips the step of learning what the customer values. It lands poorly when trust is low.",
            principle: "Ask before you tell." },
          { id: "c", label: "Offer to meet in the middle with an additional discount.",
            apply: function (s) { s.value -= (s.conceded ? 5 : 10); s.conceded = true; },
            reaction: function (s) { return "Dana accepts the extra movement and asks what else is possible. Each concession so far has come without anything in return."; },
            feedback: "Splitting the difference is a habit, not a strategy. Unpaired concessions teach the customer that pressure works.",
            principle: "Never concede without a trade." }
        ]
      },
      {
        id: "d3", title: "Building the deal",
        prompt: function (s) {
          var p = "Dana asks, \"So what can you actually do for us?\"";
          if (s.knowsBudget && s.knowsPriorities) { return p + " You know the constraint is this year's budget and that weekly reporting must stay."; }
          if (s.knowsBudget) { return p + " You know the constraint is this year's budget."; }
          if (s.knowsPriorities) { return p + " You know the weekly reporting matters most to Luis's team."; }
          return p + " You are still not sure what is behind the request.";
        },
        options: [
          { id: "a", label: "Propose a three-year term with a lower first-year price that fits this year's budget, and full price in years two and three.",
            apply: function (s) { s.traded = true; if (s.knowsBudget) { s.value = Math.max(s.value, 95); s.trust += 1; } else { s.value -= 2; } },
            reaction: function (s) {
              return s.knowsBudget
                ? "Dana leans in. \"That would fit this year's number.\" Luis asks whether reporting stays included; it does. You have traded commitment for price timing."
                : "Dana is puzzled: \"Why would we commit for longer when cost is the problem?\" Without knowing the budget-timing issue, the offer looks like it solves your problem, not theirs. She agrees to consider it.";
            },
            feedback: "Trading term length for price timing protects overall value, but it only persuades when it answers the customer's real constraint.",
            principle: "Trade things that are cheap for you and valuable to them." },
          { id: "b", label: "Remove the advanced reporting module to bring the price down.",
            apply: function (s) { s.removedReporting = true; if (s.knowsPriorities) { s.trust -= 2; } s.value -= 12; },
            reaction: function (s) {
              return s.knowsPriorities
                ? "Luis frowns. \"That's the part we told you we need.\" Dana says she'll need to think. You have offered to cut the thing they value most."
                : "Dana agrees it brings the price down. Luis looks uneasy but says nothing for now.";
            },
            feedback: "Reducing scope can be a valid trade, but not when it removes what the customer values most. Knowing priorities first prevents this.",
            principle: "Protect what the customer values most." },
          { id: "c", label: "Offer 15% off if they sign this week.",
            apply: function (s) { s.value -= 15; s.conceded = true; },
            reaction: function (s) { return "Dana agrees quickly. \"We can sign this week at that price.\" The deadline you set made the concession feel urgent, but the value given away is large."; },
            feedback: "Deadline discounts close quickly but give away value and set expectations for every future renewal.",
            principle: "Urgency should not replace a trade." }
        ]
      },
      {
        id: "d4", title: "Closing and handoff",
        prompt: function (s) { return "Dana says, \"I think we have something we can work with.\" The call is nearly over."; },
        options: [
          { id: "a", label: "Summarize the agreed terms, confirm next steps and owners in writing, and brief the implementation team.",
            apply: function (s) { s.documented = true; s.trust += 1; s.handoff = true; },
            reaction: function (s) { return "Dana confirms the summary by email the same day. Luis thanks you for involving his team's needs, and the delivery team has the context it needs."; },
            feedback: "A written summary turns a verbal understanding into a shared agreement, and a handoff brief protects what you promised.",
            principle: "Confirm agreement in writing and hand off with context." },
          { id: "b", label: "Accept the verbal yes and send the contract next week.",
            apply: function (s) { s.documented = false; },
            reaction: function (s) { return "A week later, Dana's understanding of the terms differs from yours on two points. The contract stalls while you reconcile them."; },
            feedback: "Verbal agreements leave room for different memories. Delay invites renegotiation.",
            principle: "Confirm agreement while it is fresh." },
          { id: "c", label: "Raise an upgrade to a larger package before you close.",
            apply: function (s) { s.trust -= 1; s.documented = false; },
            reaction: function (s) { return "Dana stiffens. \"Let's finish this renewal first.\" The moment to confirm agreement passes, and the call ends without clear next steps."; },
            feedback: "Expanding the deal at the moment of agreement can unsettle a fragile understanding. Secure the agreement first.",
            principle: "Close what you agreed before opening something new." }
        ]
      }
    ],
    endings: [
      { id: "strong", title: "A durable agreement",
        test: function (s) { return s.value >= 90 && s.trust >= 2 && s.documented && !s.removedReporting && s.knowsBudget && s.knowsPriorities; },
        text: "You uncovered the budget constraint and what the customer values most, protected most of the contract's value, kept the reporting they rely on, and confirmed everything in writing. The relationship is in good shape for the next renewal." },
      { id: "gaps", title: "A sound agreement with gaps in understanding",
        test: function (s) { return s.value >= 90 && s.documented && !s.removedReporting && !(s.knowsBudget && s.knowsPriorities); },
        text: "You protected value and documented the terms, but you never fully learned " + "what was driving the request or what the customer values most. The deal holds for now; the next renewal will be harder without that understanding." },
      { id: "costly", title: "An agreement that gave away value",
        test: function (s) { return s.documented && (s.value < 90 || s.removedReporting); },
        text: "You reached and documented an agreement, but it cost more than it needed to, either through concessions without trades or by cutting what the customer valued." },
      { id: "fragile", title: "A fragile outcome",
        test: function () { return true; },
        text: "There is an understanding, but it is not secure. Trust, documentation or both are weak, and the renewal could still slip." }
    ],
    reflectionPrompts: [
      "Which decision would you make the same way again, and why?",
      "Which decision would you change, and what would you do instead?",
      "What would you prepare differently before a real negotiation like this?"
    ],
    debriefQuestions: [
      "What did you learn about the customer's interests, and when?",
      "Where did you trade, and where did you concede? What did each cost?",
      "How did your earlier choices shape the customer's later reactions?",
      "What will you do in your next real negotiation that you did not do here?"
    ]
  };

  return {
    tracks: tracks, people: people, milestones: milestones, activities: activities,
    competencies: competencies, scale: scale, evidenceCategories: evidenceCategories,
    sample: sample, resources: resources, scenario: scenario, linkTypes: linkTypes
  };
})();
