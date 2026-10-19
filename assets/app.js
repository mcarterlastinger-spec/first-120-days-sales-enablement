/* First 120 Days: demonstration prototype application.
   Plain JavaScript, no dependencies. State is kept in this browser only. */
(function () {
  "use strict";

  var C = window.CONTENT;
  var STORE_KEY = "first120-demo-v1";
  var main = document.getElementById("main");
  var live = document.getElementById("live");

  /* ---------------- State ---------------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function freshScenario() {
    return { phase: "intro", step: 0, s: initialScenarioState(), history: [], reflection: ["", "", ""], completed: false, shared: false, debrief: "", debriefSaved: false };
  }
  function initialScenarioState() { return { trust: 0, value: 100, knowsBudget: false, knowsPriorities: false, conceded: false, removedReporting: false, traded: false, documented: false, handoff: false }; }
  function defaultState(kind) {
    var st = { v: 1, role: "employee", statuses: {}, courses: {}, managerSteps: {}, evidence: [], ratings: {}, ratingHistory: [], scenario: freshScenario(), seq: 100 };
    if (kind === "sample") {
      st.statuses = clone(C.sample.statuses);
      st.courses = clone(C.sample.courses);
      st.managerSteps = clone(C.sample.managerSteps);
      st.evidence = clone(C.sample.evidence);
      st.ratings = clone(C.sample.ratings);
      Object.keys(st.ratings).forEach(function (k) { var r = st.ratings[k]; st.ratingHistory.push({ competency: k, level: r.level, day: r.day, note: r.note, evidence: r.evidence.slice() }); });
    }
    return st;
  }
  function load() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      if (raw) { var parsed = JSON.parse(raw); if (parsed && parsed.v === 1) { return parsed; } }
    } catch (e) { /* storage unavailable: fall back to in-memory state */ }
    return defaultState("sample");
  }
  var state = load();
  function save() { try { window.localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

  /* ---------------- Helpers ---------------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function announce(msg) { live.textContent = ""; window.setTimeout(function () { live.textContent = msg; }, 60); }
  function byId(list, id) { for (var i = 0; i < list.length; i++) { if (list[i].id === id) { return list[i]; } } return null; }
  var ACT = {}; C.activities.forEach(function (a) { ACT[a.id] = a; });
  var SUPPORTED_BY = {};
  C.activities.forEach(function (a) { (a.supports || []).forEach(function (eid) { (SUPPORTED_BY[eid] = SUPPORTED_BY[eid] || []).push(a.id); }); });
  var STATUS_LABEL = { notstarted: "Not started", enrolled: "Enrolled", inprogress: "In progress", completed: "Completed", planned: "Planned" };
  function statusChip(st) { return '<span class="status status-' + st + '">' + STATUS_LABEL[st] + "</span>"; }
  function trackName(id) { return byId(C.tracks, id).name; }
  function msOf(role, id) { return byId(C.milestones[role], id); }
  function roleName(role) { return role === "employee" ? "Sales Employee" : "Sales Manager"; }
  function pathwayName(role) { return roleName(role) + " Learning Pathway"; }
  function pathwayCrumb(role) { return { label: pathwayName(role), href: "#/home" }; }
  function linkTypeOf(a, pc) { return (a.linkTypes && a.linkTypes[pc]) || a.linkType || "builds"; }
  function linkTypeLabel(t) { return C.linkTypes[t].label; }
  var GUIDE_PDF = { file: "downloads/First-120-Days-User-Guide.pdf", size: "2.7 MB" };
  function nextId(prefix) { state.seq += 1; return prefix + "-" + state.seq; }
  var DAY = C.people.employee.day;
  function dueText(m) { return m.label.charAt(0).toLowerCase() + m.label.slice(1); }
  var EMP = C.people.employee.name.split(" ")[0];
  var COACH_HINT = "Summarize the coaching conversation: what you discussed, what the employee will try next, and when you will follow up.";

  /* ---------------- Status logic ---------------- */
  function courseStatus(cid) { return state.courses[cid] || "notstarted"; }
  function statusOf(a) {
    if (a.role === "employee") {
      if (a.kind === "enrollment") {
        var cs = a.courses.map(function (c) { return courseStatus(c.id); });
        if (cs.every(function (x) { return x === "completed"; })) { return "completed"; }
        if (cs.some(function (x) { return x === "inprogress" || x === "completed"; })) { return "inprogress"; }
        if (cs.every(function (x) { return x !== "notstarted"; })) { return "enrolled"; }
        if (cs.some(function (x) { return x === "enrolled"; })) { return "inprogress"; }
        return "notstarted";
      }
      if (a.kind === "scenario") {
        var sc = state.scenario;
        return sc.completed ? "completed" : (sc.phase !== "intro" || sc.history.length ? "inprogress" : "notstarted");
      }
      return state.statuses[a.id] || "notstarted";
    }
    if (a.kind === "coordinated") {
      var p = !!state.managerSteps[a.id + ":prepare"], d = !!state.managerSteps[a.id + ":deliver"];
      return p && d ? "completed" : (p || d ? "inprogress" : "notstarted");
    }
    if (a.kind === "debrief") { return state.scenario.debriefSaved ? "completed" : "notstarted"; }
    return state.managerSteps[a.id] ? "completed" : "notstarted";
  }
  // Items counted toward a milestone's progress: [{label, done}]
  function milestoneItems(role, msId) {
    var items = [];
    C.activities.forEach(function (a) {
      if (a.role !== role || a.optional) { return; }
      if (role === "manager" && a.kind === "coordinated") {
        if (a.prepare.ms === msId) { items.push({ a: a, done: !!state.managerSteps[a.id + ":prepare"] }); }
        if (a.deliver.ms === msId) { items.push({ a: a, done: !!state.managerSteps[a.id + ":deliver"] }); }
        return;
      }
      if (a.ms === msId) { items.push({ a: a, done: requirementMet(a) }); }
    });
    return items;
  }
  // Enrollment activities meet their milestone requirement once every course is enrolled (completion has no deadline).
  function requirementMet(a) {
    if (a.role === "employee" && a.kind === "enrollment") { return a.courses.every(function (c) { return courseStatus(c.id) !== "notstarted"; }); }
    return statusOf(a) === "completed";
  }
  function isPastDue(a, msId) {
    var m = msOf(a.role, msId || a.ms);
    return !!m && m.day < DAY && !a.optional && !requirementMet(a);
  }
  function progressOf(role, msId) {
    var it = milestoneItems(role, msId);
    var done = it.filter(function (x) { return x.done; }).length;
    return { done: done, total: it.length };
  }
  function activitiesFor(role, msId) {
    return C.activities.filter(function (a) {
      if (a.role !== role) { return false; }
      if (role === "manager" && a.kind === "coordinated") { return a.prepare.ms === msId || a.deliver.ms === msId; }
      return a.ms === msId;
    });
  }

  /* ---------------- Competency logic ---------------- */
  function evidenceFor(pc) { return state.evidence.filter(function (e) { return e.competency === pc; }).sort(function (x, y) { return x.day - y.day; }); }
  function ratingOf(pc) { return state.ratings[pc] || { level: "nyo" }; }
  function levelIndex(id) { return ["nyo", "emerging", "developing", "consistent"].indexOf(id); }
  function levelLabel(id) { return byId(C.scale, id).label; }
  function catLabel(id) { return byId(C.evidenceCategories, id).label; }
  function contributorLabel(by) { return by === "employee" ? C.people.employee.name + " (employee)" : by === "mentor" ? C.people.mentor.name + " (mentor)" : C.people.manager.name + " (manager)"; }
  function levelMeter(id) {
    var n = levelIndex(id), out = '<div class="level"><span class="level-label">' + esc(levelLabel(id)) + '</span><span class="level-meter" aria-hidden="true">';
    for (var i = 1; i <= 3; i++) { out += '<span class="' + (i <= n ? "on" : "") + '"></span>'; }
    return out + "</span></div>";
  }
  function readyToAssess(pc) {
    var ev = evidenceFor(pc), cats = {};
    ev.forEach(function (e) { cats[e.category] = true; });
    return ev.length >= 2 && Object.keys(cats).length >= 2;
  }

  /* ---------------- Navigation chrome ---------------- */
  function navItems() {
    var r = state.role;
    return [
      { href: "#/guide", label: "Experience Guide", key: "guide" },
      { href: "#/home", label: "Learning Pathway", key: "home" },
      { href: "#/competencies", label: "Competencies", key: "competencies" },
      r === "employee" ? { href: "#/practice", label: "Negotiation Practice", key: "practice" } : { href: "#/debrief", label: "Scenario Debrief", key: "debrief" },
      { href: "#/support", label: "Performance Support", key: "support" }
    ];
  }
  function renderChrome(activeKey) {
    var ul = document.getElementById("nav-list");
    ul.innerHTML = navItems().map(function (n) {
      return '<li><a href="' + n.href + '"' + (n.key === activeKey ? ' aria-current="page"' : "") + ">" + n.label + "</a></li>";
    }).join("");
    Array.prototype.forEach.call(document.querySelectorAll(".role-btn"), function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-role") === state.role ? "true" : "false");
    });
  }

  /* ---------------- Shared fragments ---------------- */
  function breadcrumb(parts) {
    return '<nav class="breadcrumb" aria-label="Breadcrumb"><ol>' + parts.map(function (p, i) {
      var last = i === parts.length - 1;
      if (p.html) { return "<li>" + p.html + "</li>"; }
      return "<li>" + (last ? '<span aria-current="page">' + esc(p.label) + "</span>" : (p.href ? '<a href="' + p.href + '">' + esc(p.label) + "</a>" : esc(p.label))) + "</li>";
    }).join("") + "</ol></nav>";
  }
  function compTags(list) {
    if (!list || !list.length) { return ""; }
    return list.map(function (id) { var c = byId(C.competencies, id); return '<a class="tag" href="#/competency/' + id + '" title="' + esc(c.name) + '">' + id + "</a>"; }).join(" ");
  }
  function kindLabel(a) {
    return { task: "Task", meeting: "Meeting", enrollment: "Course enrollment", resource: "Resource", scenario: "Interactive scenario", coordinated: "Coordinated responsibility", debrief: "Debrief" }[a.kind] || "Task";
  }

  var animateRoute = true;
  function route(role) {
    var stops = C.milestones[role];
    var n = stops.length;
    // Evenly spaced stops for legibility; "today" placed proportionally between neighbouring stops.
    var pos = function (i) { return n === 1 ? 0 : (i / (n - 1)) * 100; };
    var todayPct = 0;
    for (var i = 0; i < n - 1; i++) {
      if (DAY >= stops[i].day && DAY <= stops[i + 1].day) { todayPct = pos(i) + (DAY - stops[i].day) / (stops[i + 1].day - stops[i].day) * (pos(i + 1) - pos(i)); }
    }
    var current = currentMilestone(role);
    var html = '<section class="route" aria-labelledby="route-h"><div class="route-head"><h2 id="route-h">' + (role === "employee" ? "Your 120-day milestones" : EMP + "’s 120-day milestones: your responsibilities") + '</h2><span class="muted small">Day ' + DAY + ' of 120. Each milestone is a completion deadline.</span></div>';
    html += '<div class="route-track" aria-hidden="true"><span class="route-fill' + (animateRoute ? " is-animated" : "") + '" style="width:' + todayPct.toFixed(1) + '%"></span><span class="route-today" style="left:' + todayPct.toFixed(1) + '%">Today, Day ' + DAY + "</span></div>";
    html += '<ol class="route-stops">';
    stops.forEach(function (m, idx) {
      var meta, cls = "route-stop";
      if (m.built) {
        var p = progressOf(role, m.id);
        meta = p.done === p.total ? "Complete" : p.done + " of " + p.total + " done";
        if (p.done === p.total) { cls += " is-done"; }
      } else { meta = "Planned"; cls += " is-planned"; }
      html += '<li class="' + cls + '" style="left:' + pos(idx).toFixed(1) + '%"><a href="#/milestone/' + m.id + '"><span class="stop-label">' + esc(m.label) + '</span><span class="stop-meta">' + meta + (m.id === current ? '<span class="visually-hidden">, current milestone</span>' : "") + "</span></a></li>";
    });
    html += "</ol></section>";
    return html;
  }
  function currentMilestone(role) {
    var stops = C.milestones[role];
    for (var i = 0; i < stops.length; i++) { if (stops[i].day >= DAY) { return stops[i].id; } }
    return stops[stops.length - 1].id;
  }

  function activityRow(a, msId, opts) {
    opts = opts || {};
    var st = statusOf(a), meta = ['<span>' + kindLabel(a) + "</span>"];
    if (isPastDue(a, a.kind === "coordinated" ? null : a.ms)) { meta.unshift('<span class="tag tag-due">Past due</span>'); }
    if (a.kind === "enrollment" && requirementMet(a)) { meta.push('<span>Enrollment requirement met</span>'); }
    if (a.isNew) { meta.push('<span class="tag tag-new">New enhancement</span>'); }
    if (a.optional) { meta.push('<span class="tag tag-optional">Optional</span>'); }
    if (a.competencies) { meta.push('<span class="visually-hidden">Competencies:</span>' + compTags(a.competencies)); }
    var support = "";
    if (a.role === "employee" && SUPPORTED_BY[a.id] && !opts.compact) {
      var mgr = SUPPORTED_BY[a.id].map(function (mid) { return ACT[mid]; });
      support = '<p class="row-support">Your manager supports this: ' + mgr.map(function (m) { return esc(m.title); }).join("; ") + "</p>";
    }
    if (a.role === "manager" && a.kind === "coordinated") { return coordinatedCard(a, msId); }
    var control = "";
    if (a.role === "manager" && a.kind !== "debrief") {
      control = '<label class="check"><input type="checkbox" id="chk-' + a.id + '" data-step="' + a.id + '"' + (state.managerSteps[a.id] ? " checked" : "") + "><span>Done</span></label>";
    }
    return '<li class="activity-row"><h3><a href="#/activity/' + a.id + '">' + esc(a.title) + '</a></h3><div class="row-status">' + (control || statusChip(st)) + '</div><div class="row-meta">' + meta.join("") + "</div>" + support + "</li>";
  }
  function coordinatedCard(a, msId) {
    var step = function (key, info) {
      var id = a.id + ":" + key, cur = info.ms === msId;
      return '<li class="' + (cur ? "is-current" : "") + '"><span class="step-when">Step ' + (key === "prepare" ? 1 : 2) + ": " + esc(msOf("manager", info.ms).label) + (cur ? " (this milestone)" : "") + '</span><label class="check"><input type="checkbox" id="chk-' + id.replace(":", "-") + '" data-step="' + id + '"' + (state.managerSteps[id] ? " checked" : "") + "><span>" + esc(info.label) + "</span></label></li>";
    };
    var sup = a.supports.map(function (eid) { var e = ACT[eid]; return '<a href="#/activity/' + e.id + "?from=" + a.id + '">' + esc(e.title) + "</a> (" + STATUS_LABEL[statusOf(e)].toLowerCase() + ")"; }).join("; ");
    return '<li class="coordinated"><h3><a href="#/activity/' + a.id + '">' + esc(a.title) + '</a> <span class="tag">Coordinated, 2 steps</span></h3><p class="small muted" style="margin:0 0 0.5rem">Each step has its own deadline and is checked off separately.</p><ol class="steps-2">' + step("prepare", a.prepare) + step("deliver", a.deliver) + '</ol><p class="row-support small muted" style="margin:0.6rem 0 0">' + EMP + "’s related activities, tracked separately: " + sup + "</p></li>";
  }

  /* ---------------- Views ---------------- */
  function viewHome() {
    var role = state.role, html = "";
    var cur = currentMilestone(role);
    if (role === "employee") {
      html += '<div class="page-head"><h1 tabindex="-1">' + pathwayName(role) + '</h1><p class="lede">Welcome back, ' + EMP + ". It is day " + DAY + " of your first 120 days, and your Day-60 work is under way.</p></div>";
    } else {
      html += '<div class="page-head"><h1 tabindex="-1">' + pathwayName(role) + '</h1><p class="lede">You are coaching ' + esc(C.people.employee.name) + ", " + esc(C.people.employee.role) + ", on day " + DAY + " of 120. Your part: prepare and coordinate the onboarding, observe and coach, and assess each competency from evidence.</p></div>";
    }
    html += route(role);
    var due = activitiesFor(role, cur).filter(function (a) { return !requirementMet(a) && !a.optional; });
    var more = Math.max(0, due.length - 6);
    html += '<div class="grid-2"><div>';
    html += '<section class="panel" aria-labelledby="due-h"><h2 id="due-h">' + (role === "employee" ? "Still to do by Day 60" : "Your open responsibilities by Day 60") + "</h2>" + (role === "manager" ? '<p class="small muted">Tasks you own. ' + EMP + "’s own activities are tracked separately.</p>" : "");
    if (due.length) { html += '<ul class="activity-list">' + due.slice(0, 6).map(function (a) { return activityRow(a, cur, { compact: true }); }).join("") + "</ul>" + (more ? '<p class="small muted" style="margin-top:0.75rem">And ' + more + " more in this milestone.</p>" : ""); }
    else { html += "<p>Everything for this milestone is complete.</p>"; }
    html += '<div class="btn-row"><a class="btn" href="#/milestone/' + cur + '">Open By Day 60</a></div></section>';
    if (role === "manager") {
      var waiting = [];
      if (state.scenario.shared && !state.scenario.debriefSaved) { waiting.push('<li><a href="#/debrief">Debrief ' + EMP + "’s negotiation scenario</a></li>"); }
      C.competencies.forEach(function (c) { if (readyToAssess(c.id) && !state.ratings[c.id]) { waiting.push('<li><a href="#/competency/' + c.id + '">Assess ' + esc(c.name) + "</a>: enough evidence to record a rating</li>"); } });
      html += '<section class="panel" aria-labelledby="wait-h"><h2 id="wait-h">Awaiting Your Review</h2><p class="small muted">Work ' + EMP + " has shared, and competencies with enough evidence for you to assess.</p>" + (waiting.length ? "<ul>" + waiting.join("") + "</ul>" : "<p>Nothing is awaiting your review right now.</p>") + "</section>";
    }
    html += "</div><div>";
    if (role === "employee") {
      var sa = ACT["E60-SS-08"], sst = statusOf(sa);
      html += '<section class="panel" aria-labelledby="neg-h"><h2 id="neg-h">Negotiation practice</h2><p>' + esc(sa.summary) + "</p><p>" + statusChip(sst) + '</p><a class="btn btn-primary" href="#/practice">' + (sst === "notstarted" ? "Start the scenario" : sst === "completed" ? "Review the scenario" : "Continue the scenario") + "</a></section>";
    } else {
      html += '<section class="panel" aria-labelledby="ep-h"><h2 id="ep-h">' + EMP + '’s activity progress</h2><p class="small muted">Counts ' + EMP + "’s required activities, not your responsibilities.</p><ul class=\"activity-list\">";
      C.milestones.employee.forEach(function (m) {
        var p = m.built ? progressOf("employee", m.id) : null;
        html += '<li class="activity-row"><h3>' + esc(m.label) + '</h3><div class="row-status">' + (p ? '<span class="small">' + p.done + " of " + p.total + " activities</span>" : statusChip("planned")) + "</div></li>";
      });
      html += "</ul></section>";
    }
    html += '<section class="panel" aria-labelledby="cs-h"><h2 id="cs-h">Competency snapshot</h2><ul class="activity-list">';
    C.competencies.forEach(function (c) {
      var r = ratingOf(c.id), n = evidenceFor(c.id).length;
      html += '<li class="activity-row"><h3><a href="#/competency/' + c.id + '">' + esc(c.name) + '</a></h3><div class="row-status small">' + esc(levelLabel(r.level)) + '</div><div class="row-meta">' + n + " evidence item" + (n === 1 ? "" : "s") + "</div></li>";
    });
    html += '</ul><p class="small muted" style="margin-top:0.75rem">Ratings are developmental, recorded by the manager from evidence. Completing activities never changes a rating.</p></section>';
    if (role === "employee") {
      var lead = ACT["E07-CS-05"];
      html += '<section class="panel" aria-labelledby="sf-h"><h2 id="sf-h">Supporting features</h2><ul class="activity-list">' +
        '<li class="activity-row"><h3><a href="#/support">Performance support</a></h3><div class="row-meta">Search job aids, templates and primers</div></li>' +
        '<li class="activity-row"><h3><a href="#/activity/E07-CS-05">Optional leadership preparation</a></h3><div class="row-status">' + statusChip(statusOf(lead)) + '</div><div class="row-meta">Outside onboarding deadlines</div></li>' +
        '<li class="activity-row"><h3>Role-specific learning</h3><div class="row-status">' + statusChip("planned") + '</div><div class="row-meta">Depth for your assigned solution areas begins once areas are assigned, around Day 30. Not built in this prototype.</div></li></ul></section>';
    }
    html += "</div></div>";
    return { html: html, nav: "home", title: pathwayName(role) };
  }

  function viewMilestone(msId) {
    var role = state.role, m = msOf(role, msId);
    if (!m) { return viewNotFound(); }
    var html = breadcrumb([pathwayCrumb(role), { label: m.label }]);
    html += '<div class="page-head"><h1 tabindex="-1">' + esc(m.label) + '</h1><p class="lede">' + esc(m.focus) + "</p></div>";
    if (!m.built) {
      html += '<div class="notice notice-planned"><h2 class="h-reset" style="font-size:1.1rem">Planned for a later iteration</h2><p>This milestone is part of the 120-day structure, but its activities are not built in this prototype. The focus above summarizes what it will cover. There are no tasks to complete and no progress is recorded here.</p><p><a href="#/milestone/' + (role === "employee" ? "d7" : "pre") + '">Go to a built milestone</a></p></div>';
      return { html: html, nav: "home", title: m.label };
    }
    var p = progressOf(role, msId);
    html += '<div class="panel" style="margin-bottom:1rem"><p style="margin:0 0 0.5rem"><strong>' + p.done + " of " + p.total + "</strong> " + (role === "manager" ? "of your responsibility steps" : "required activities") + " complete. Everything here is due " + esc(dueText(m)) + "." + (role === "manager" ? " Each step of a coordinated responsibility counts separately." : "") + "</p><div class=\"progress\" role=\"img\" aria-label=\"" + p.done + " of " + p.total + ' complete"><span style="width:' + (p.total ? Math.round(p.done / p.total * 100) : 0) + '%"></span></div></div>';
    C.tracks.forEach(function (t) {
      var list = activitiesFor(role, msId).filter(function (a) { return a.track === t.id; });
      if (!list.length) { return; }
      html += '<section class="section" aria-labelledby="t-' + t.id + '"><div class="section-head"><h2 id="t-' + t.id + '">' + esc(t.name) + '</h2><span class="small muted">' + list.length + " item" + (list.length === 1 ? "" : "s") + "</span></div>";
      html += '<ul class="activity-list">' + list.map(function (a) { return activityRow(a, msId); }).join("") + "</ul></section>";
    });
    return { html: html, nav: "home", title: m.label };
  }

  function stepsDone(a) { return (state.managerSteps[a.id + ":prepare"] ? 1 : 0) + (state.managerSteps[a.id + ":deliver"] ? 1 : 0); }
  // Banner shown after a cross-role link switched the view; returns plainly to the origin (no "from") to avoid loops.
  function returnBar(fromId, a) {
    if (!fromId) { return ""; }
    if (/^PC-\d\d$/.test(fromId)) {
      var c = byId(C.competencies, fromId);
      return c ? '<div class="return-bar"><a href="#/competency/' + c.id + '">← Back to ' + esc(c.id + " " + c.name) + "</a></div>" : "";
    }
    var f = ACT[fromId];
    if (!f || f.role === a.role) { return ""; }
    return '<div class="return-bar" role="note"><p>You switched to the <strong>' + roleName(a.role) + "</strong> view to see this " + (a.role === "manager" ? "manager responsibility" : "employee activity") + ", which is related to “" + esc(f.title) + "”.</p>" +
      '<a href="#/activity/' + f.id + '">← Back to “' + esc(f.title) + "” (" + roleName(f.role) + " view)</a></div>";
  }
  function relatedItem(x, fromId) {
    var st = statusOf(x), status;
    if (x.kind === "coordinated") {
      status = '<ul class="mini-steps">' + ["prepare", "deliver"].map(function (k, i) { var done = !!state.managerSteps[x.id + ":" + k]; return "<li>Step " + (i + 1) + " (" + esc(dueText(msOf("manager", x[k].ms))) + "): " + esc(x[k].label) + " — <strong>" + (done ? "done" : "not yet done") + "</strong></li>"; }).join("") + "</ul>";
    } else { status = statusChip(st); }
    return '<li class="related"><h3><a href="#/activity/' + x.id + "?from=" + fromId + '">' + esc(x.title) + '</a></h3>' +
      '<p class="related-purpose"><span class="related-label">Purpose</span> ' + esc(x.summary) + "</p>" +
      '<div class="related-status"><span class="related-label">' + (x.role === "manager" ? "Manager’s progress" : EMP + "’s progress") + "</span> " + status + "</div>" +
      '<p class="small muted">' + (x.relation ? (x.relation === "direct" ? "Direct support" : "Oversight and coaching") + ". " : "") + "Due " + esc(dueText(msOf(x.role, x.kind === "coordinated" ? x.deliver.ms : x.ms))) + ". Opens in the " + roleName(x.role) + " view.</p></li>";
  }
  function competencyPanel(a) {
    var types = {};
    var items = a.competencies.map(function (cid) {
      var c = byId(C.competencies, cid), t = linkTypeOf(a, cid); types[t] = true;
      return '<li><a href="#/competency/' + cid + '">' + cid + " " + esc(c.name) + '</a> <span class="tag tag-link tag-' + t + '">' + linkTypeLabel(t) + "</span></li>";
    }).join("");
    var defs = ["introduces", "builds", "evidence"].filter(function (t) { return types[t]; }).map(function (t) { return "<dt>" + linkTypeLabel(t) + "</dt><dd>" + esc(C.linkTypes[t].text) + "</dd>"; }).join("");
    return '<section class="panel" aria-labelledby="cp-h"><h2 id="cp-h">Competencies</h2><ul class="comp-links">' + items + '</ul><dl class="link-defs small">' + defs + '</dl><p class="small muted">Completing an activity never changes a rating. Ratings are recorded by the manager from at least two kinds of evidence.</p></section>';
  }
  function resourcePanel(a) {
    var list = (a.resources || []).map(function (rid) { return byId(C.resources, rid); }).filter(function (r) { return r && (r.role !== "manager" || state.role === "manager"); });
    if (!list.length) { return ""; }
    return '<section class="panel" aria-labelledby="rp-h"><h2 id="rp-h">Performance support</h2><ul>' + list.map(function (r) { return '<li><a href="#/resource/' + r.id + '">' + esc(r.title) + '</a> <span class="small muted">(' + esc(r.type) + (r.download ? ", Word template available" : "") + ")</span></li>"; }).join("") + "</ul></section>";
  }
  function guidanceHtml(a) {
    var g = a.guidance, h = "";
    h += "<h2>Purpose</h2><p>" + esc(g.purpose) + "</p>";
    h += "<h2>What to do</h2><ol>" + g.actions.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol>";
    if (g.lookFor) { h += '<details class="disclosure"><summary>What to look for</summary><dl class="lookfor">' + g.lookFor.map(function (x) { return "<dt>" + esc(x.area) + "</dt><dd>" + esc(x.text) + "</dd>"; }).join("") + "</dl></details>"; }
    if (g.coaching) { h += '<details class="disclosure"><summary>Coaching considerations</summary><p>' + esc(g.coaching) + "</p></details>"; }
    if (g.evidence) { h += "<h2>Evidence to record</h2><p>" + esc(g.evidence) + "</p>"; }
    h += "<h2>When this is complete</h2><p>" + esc(g.completion) + "</p>";
    if (g.record) { h += '<div class="btn-row"><a class="btn btn-primary" href="#/competency/' + g.record + "/observe?from=" + a.id + '">Record Observation<span class="visually-hidden"> for</span> (' + g.record + ")</a></div>"; }
    return h;
  }

  function viewActivity(id, fromId) {
    var a = ACT[id];
    if (!a) { return viewNotFound(); }
    var switched = false;
    if (a.role !== state.role) { state.role = a.role; save(); switched = true; }
    var role = a.role, msId = a.kind === "coordinated" ? a.deliver.ms : a.ms, m = msOf(role, msId);
    var msCrumb = { label: m.label, href: "#/milestone/" + msId };
    if (a.kind === "coordinated") {
      msCrumb = { html: '<a href="#/milestone/' + a.prepare.ms + '">' + esc(msOf(role, a.prepare.ms).label) + '</a> <span class="crumb-and">and</span> <a href="#/milestone/' + a.deliver.ms + '">' + esc(m.label) + "</a>" };
    }
    var html = returnBar(fromId, a);
    html += breadcrumb([pathwayCrumb(role), msCrumb, { label: trackName(a.track) }, { label: a.title }]);
    html += '<div class="page-head"><h1 tabindex="-1">' + esc(a.title) + '</h1><p class="small muted">' + esc(kindLabel(a)) + " · " + roleName(role) + (a.isNew ? ' <span class="tag tag-new">New enhancement</span>' : "") + (a.optional ? ' <span class="tag tag-optional">Optional</span>' : "") + "</p></div>";
    html += '<div class="grid-2"><div class="detail-body">';
    html += "<p>" + esc(a.summary) + "</p>";
    if (a.kind === "coordinated") {
      html += "<h2>Two steps, each with its own deadline</h2><ol class=\"steps-2\" style=\"margin-top:0.5rem\">" +
        ["prepare", "deliver"].map(function (k, i) { var info = a[k], sid = a.id + ":" + k, done = !!state.managerSteps[sid]; return '<li><span class="step-when">Step ' + (i + 1) + ": due " + esc(dueText(msOf("manager", info.ms))) + '</span><label class="check"><input type="checkbox" id="chk-' + sid.replace(":", "-") + '" data-step="' + sid + '"' + (done ? " checked" : "") + "><span>" + esc(info.label) + '</span></label><span class="step-state">' + (done ? "Done" : "Not yet done") + "</span></li>"; }).join("") + "</ol>";
      var hasEnroll = a.supports.some(function (eid) { return ACT[eid].kind === "enrollment"; });
      html += '<p class="small">Your responsibility is complete when both steps are done. ' + EMP + "’s progress on the related activities is tracked separately, so this responsibility can be complete while " + EMP + "’s work is still under way." + (hasEnroll ? " Assigning course enrollments is not the same as completing the courses." : "") + "</p>";
    }
    if (a.guidance && role === "manager") { html += guidanceHtml(a); }
    if (a.steps) { html += "<h2>What to do</h2><ol>" + a.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>"; }
    if (a.success) {
      html += "<h2>What Success Looks Like</h2><ul>" + a.success.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>";
      html += '<p class="small muted">Marking this activity complete records your progress. It does not by itself demonstrate competency; your manager weighs evidence from more than one source.</p>';
      var ev = (a.competencies || []).filter(function (cid) { return linkTypeOf(a, cid) === "evidence"; });
      if (ev.length) { html += '<p class="small">Add your work as evidence: ' + ev.map(function (cid) { return '<a href="#/competency/' + cid + '">' + cid + " " + esc(byId(C.competencies, cid).name) + "</a>"; }).join(", ") + ".</p>"; }
    }
    if (a.kind === "enrollment") {
      html += '<h2>Your five courses</h2><table class="course-table"><thead><tr><th scope="col">Course</th><th scope="col">Competency</th><th scope="col">Status</th></tr></thead><tbody>';
      a.courses.forEach(function (c) {
        var cs = courseStatus(c.id);
        html += '<tr><th scope="row">' + esc(c.title) + "</th><td>" + compTags([c.competency]) + '</td><td><label class="visually-hidden" for="course-' + c.id + '">Status for ' + esc(c.title) + '</label><select id="course-' + c.id + '" data-course="' + c.id + '">' +
          [["notstarted", "Not enrolled"], ["enrolled", "Enrolled"], ["inprogress", "In progress"], ["completed", "Completed"]].map(function (o) { return '<option value="' + o[0] + '"' + (cs === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></td></tr>";
      });
      html += "</tbody></table>";
    }
    if (a.kind === "scenario") {
      html += '<div class="btn-row"><a class="btn btn-primary" href="#/practice">' + (statusOf(a) === "notstarted" ? "Start the scenario" : "Open the scenario") + "</a></div>";
    }
    if (a.kind === "debrief") {
      html += '<div class="btn-row"><a class="btn btn-primary" href="#/debrief">Open the debrief</a></div>';
    }
    if (a.why) { html += "<h2>Why it matters</h2><p>" + esc(a.why) + "</p>"; }
    if (role === "manager" && a.supports) {
      html += '<h2 id="emp-h">What ' + EMP + ' does</h2><p class="small muted">' + EMP + "’s related activities. Their status is " + EMP + "’s own progress, separate from yours.</p><ul class=\"related-list\">" + a.supports.map(function (eid) { return relatedItem(ACT[eid], a.id); }).join("") + "</ul>";
    }
    html += "</div><aside>";
    html += '<section class="panel" aria-labelledby="st-h"><h2 id="st-h">' + (role === "manager" ? "Your status" : "Status") + "</h2>";
    if (role === "employee" && (a.kind === "task" || a.kind === "meeting" || a.kind === "resource")) {
      var st = statusOf(a);
      html += '<fieldset class="fieldset"><legend>Set your status</legend><div class="radio-stack">' +
        [["notstarted", "Not started"], ["inprogress", "In progress"], ["completed", "Completed"]].map(function (o) { return '<label><input type="radio" name="status" id="status-' + o[0] + '" value="' + o[0] + '" data-status-for="' + a.id + '"' + (st === o[0] ? " checked" : "") + "> " + o[1] + "</label>"; }).join("") + "</div></fieldset>";
    } else if (role === "employee") {
      html += "<p>" + statusChip(statusOf(a)) + '</p><p class="small muted">' + (a.kind === "enrollment" ? (requirementMet(a) ? "<strong>Enrollment requirement met.</strong> " : "<strong>Enrollment requirement not yet met:</strong> enroll in all five courses. ") + "This status reflects your course progress. Enrollment alone is not evidence of competency." : "Set by your progress through the scenario.") + "</p>";
    } else if (a.kind === "task" || a.kind === "meeting") {
      html += '<label class="check"><input type="checkbox" id="chk-' + a.id + '" data-step="' + a.id + '"' + (state.managerSteps[a.id] ? " checked" : "") + "><span>Mark as done</span></label>";
    } else if (a.kind === "coordinated") {
      html += "<p>" + statusChip(statusOf(a)) + '</p><p class="small">' + stepsDone(a) + " of 2 steps done.</p>";
    } else {
      html += "<p>" + statusChip(statusOf(a)) + "</p>";
    }
    if (a.kind === "coordinated") {
      html += '<p class="small muted" style="margin-top:0.75rem">Step 1 is due ' + esc(dueText(msOf("manager", a.prepare.ms))) + "; step 2 is due " + esc(dueText(m)) + ". Milestones are cumulative completion deadlines.</p></section>";
    } else {
      html += '<p class="small muted" style="margin-top:0.75rem">Due ' + esc(dueText(m)) + ". Milestones are cumulative completion deadlines.</p></section>";
    }
    if (a.competencies) { html += competencyPanel(a); }
    if (role === "employee" && SUPPORTED_BY[a.id]) {
      html += '<section class="panel" aria-labelledby="ms-h"><h2 id="ms-h">How your manager supports this</h2><ul class="related-list">' + SUPPORTED_BY[a.id].map(function (mid) { return relatedItem(ACT[mid], a.id); }).join("") + "</ul></section>";
    }
    html += resourcePanel(a);
    html += "</aside></div>";
    return { html: html, nav: "home", title: a.title, announce: switched ? "Switched to the " + roleName(role) + " view." + (fromId && ACT[fromId] ? " A link back to " + ACT[fromId].title + " is at the top of the page." : "") : "" };
  }

  function viewCompetencies() {
    var html = '<div class="page-head"><h1 tabindex="-1">Competencies</h1><p class="lede">Eight adapted demonstration competencies frame development over the first 120 days. They are not an official framework or a certification standard.</p></div>';
    html += '<div class="notice notice-info"><p><strong>How ratings work.</strong> ' + esc(C.people.manager.name) + " records a developmental rating using at least two complementary kinds of evidence. “Not yet observed” means there is not enough evidence yet; it is not a judgment of performance. No one is expected to reach the top level in every competency by Day 120.</p></div>";
    html += '<ul class="comp-list">' + C.competencies.map(function (c) {
      var r = ratingOf(c.id), ev = evidenceFor(c.id);
      return '<li class="comp-row"><span class="comp-id">' + c.id + '</span><div><h2 style="font-size:1rem;margin:0 0 0.2rem"><a href="#/competency/' + c.id + '" style="color:inherit;text-decoration:none">' + esc(c.name) + '</a></h2><p>' + esc(c.description) + '</p><p class="small" style="margin-top:0.3rem">' + ev.length + " evidence item" + (ev.length === 1 ? "" : "s") + "</p></div>" + levelMeter(r.level) + "</li>";
    }).join("") + "</ul>";
    html += '<section class="section" aria-labelledby="scale-h"><div class="section-head"><h2 id="scale-h">The developmental scale</h2></div><dl>' + C.scale.map(function (s) { return "<dt><strong>" + esc(s.label) + "</strong></dt><dd style=\"margin:0 0 0.75rem\">" + esc(s.text) + "</dd>"; }).join("") + "</dl></section>";
    html += '<section class="section" aria-labelledby="lt-h"><div class="section-head"><h2 id="lt-h">How activities connect to competencies</h2></div><p>Each link between an activity and a competency is labeled with one of three types, so it is clear which activities prepare, which develop skills, and which produce work or performance that can be recorded as evidence.</p><dl>' + ["introduces", "builds", "evidence"].map(function (t) { return "<dt><strong>" + linkTypeLabel(t) + "</strong></dt><dd style=\"margin:0 0 0.75rem\">" + esc(C.linkTypes[t].text) + "</dd>"; }).join("") + "</dl><p>No link type establishes competency on its own. A rating above “Not yet observed” always needs the manager’s judgment and at least two kinds of evidence.</p></section>";
    return { html: html, nav: "competencies", title: "Competencies" };
  }

  function relatedActivitiesHtml(pc) {
    var groups = { introduces: [], builds: [], evidence: [] };
    C.activities.forEach(function (a) { if ((a.competencies || []).indexOf(pc) >= 0) { groups[linkTypeOf(a, pc)].push(a); } });
    var out = "";
    ["evidence", "builds", "introduces"].forEach(function (t) {
      if (!groups[t].length) { return; }
      out += "<h3>" + linkTypeLabel(t) + "</h3><ul>" + groups[t].map(function (a) { return '<li><a href="#/activity/' + a.id + "?from=" + pc + '">' + esc(a.title) + '</a> <span class="small muted">(' + roleName(a.role) + ", " + esc(msOf(a.role, a.kind === "coordinated" ? a.deliver.ms : a.ms).label) + ")</span></li>"; }).join("") + "</ul>";
    });
    return out ? '<h2>Related activities</h2><p class="small muted">' + esc(C.linkTypes.evidence.text) + "</p>" + out : "";
  }
  function viewCompetency(pc, mode, fromId) {
    var c = byId(C.competencies, pc);
    if (!c) { return viewNotFound(); }
    var observe = mode === "observe", switched = false;
    if (observe && state.role !== "manager") { state.role = "manager"; save(); switched = true; }
    var role = state.role, r = ratingOf(pc), ev = evidenceFor(pc);
    var html = breadcrumb([{ label: "Competencies", href: "#/competencies" }, { label: c.name }]);
    if (observe) {
      var src = fromId && ACT[fromId];
      html += '<div class="return-bar" role="note"><p>Recording an observation' + (src ? " from “" + esc(src.title) + "”" : "") + ". The form below is set to observed performance.</p>" + (src ? '<a href="#/activity/' + src.id + '">← Back to “' + esc(src.title) + "”</a>" : "") + "</div>";
    }
    html += '<div class="page-head"><h1 tabindex="-1">' + esc(c.name) + '</h1><p class="lede">' + esc(c.description) + "</p></div>";
    html += '<div class="grid-2"><div class="detail-body">';
    html += "<h2>Observable indicators</h2><ul>" + c.indicators.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
    html += "<h2>Typical evidence</h2><ul>" + c.evidence.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
    html += relatedActivitiesHtml(pc);
    html += '<h2 id="ev-h">Evidence collected</h2>';
    if (ev.length) {
      html += '<ul class="evidence-list" aria-labelledby="ev-h">' + ev.map(function (e) {
        return '<li class="evidence-item" data-cat="' + e.category + '"><h3 style="font-size:1rem;margin:0">' + esc(e.title) + '</h3><span class="small muted">' + esc(catLabel(e.category)) + ", added by " + esc(contributorLabel(e.by)) + ", day " + e.day + "</span><p>" + esc(e.note) + "</p></li>";
      }).join("") + "</ul>";
    } else { html += "<p>No evidence yet. Evidence can come from work products, observed performance and developmental reflection.</p>"; }
    // Add evidence form
    var firstCat = role === "employee" ? "work" : "observed";
    html += '<h2 id="ev-add-h" tabindex="-1">Add evidence</h2><form id="ev-form" data-pc="' + pc + '" novalidate>';
    if (role === "employee") {
      html += '<label class="block" for="ev-cat">Kind of evidence</label><select id="ev-cat" aria-describedby="ev-cat-note"><option value="work">Work product</option><option value="reflection">Developmental reflection</option></select><span class="hint" id="ev-cat-note">Observations are added by your manager or mentor.</span>';
    } else {
      html += '<label class="block" for="ev-cat">Kind of evidence</label><select id="ev-cat"><option value="observed">Observed performance</option><option value="reflection">Developmental reflection (coaching note)</option></select>';
      html += '<label class="block" for="ev-by">Contributed by</label><select id="ev-by"><option value="manager">' + esc(C.people.manager.name) + ' (manager)</option><option value="mentor">' + esc(C.people.mentor.name) + " (mentor)</option></select>";
    }
    html += '<label class="block" for="ev-title">Title</label><input type="text" id="ev-title" autocomplete="off" style="width:100%">';
    html += '<label class="block" for="ev-note">What it shows</label><span class="hint" id="ev-kind-hint">' + esc(byId(C.evidenceCategories, firstCat).hint) + '</span><span class="hint" id="ev-note-hint">Use fictional details only.</span><textarea id="ev-note" aria-describedby="ev-kind-hint ev-note-hint"></textarea>';
    html += '<p id="ev-error" class="error-msg" role="alert"></p><div class="btn-row"><button type="submit" class="btn">Add evidence</button></div></form>';
    if (observe && fromId && ACT[fromId]) { html += '<p class="small" style="margin-top:1rem"><a href="#/activity/' + fromId + '">← Back to “' + esc(ACT[fromId].title) + "”</a></p>"; }
    html += "</div><aside>";
    html += '<section class="panel" aria-labelledby="rt-h"><h2 id="rt-h">Developmental rating</h2>' + levelMeter(r.level);
    if (state.ratings[pc]) { html += '<p class="small" style="margin-top:0.75rem">Recorded by ' + esc(C.people.manager.name) + " on day " + r.day + ".</p><p>" + esc(r.note) + "</p>"; }
    else { html += '<p class="small" style="margin-top:0.75rem">No rating recorded yet. This means there is not enough evidence yet, not that performance is poor.</p>'; }
    html += "</section>";
    if (role === "manager") {
      html += '<section class="panel" aria-labelledby="as-h"><h2 id="as-h">Record a rating</h2><form id="rate-form" data-pc="' + pc + '" novalidate><fieldset class="fieldset"><legend>Level</legend><div class="radio-stack">' + C.scale.map(function (s) {
        return '<label><input type="radio" name="level" id="lvl-' + s.id + '" value="' + s.id + '"' + (r.level === s.id ? " checked" : "") + '><span><strong>' + esc(s.label) + '</strong><span class="hint">' + esc(s.text) + "</span></span></label>";
      }).join("") + "</div></fieldset>";
      html += '<fieldset class="fieldset"><legend>Supporting evidence</legend>' + (ev.length ? '<div class="radio-stack">' + ev.map(function (e) {
        return '<label><input type="checkbox" name="ev" id="use-' + e.id + '" value="' + e.id + '"' + ((r.evidence || []).indexOf(e.id) >= 0 ? " checked" : "") + "><span>" + esc(e.title) + ' <span class="hint">' + esc(catLabel(e.category)) + "</span></span></label>";
      }).join("") + "</div>" : '<p class="small">No evidence yet.</p>') + '<span class="hint">Any level above “Not yet observed” needs at least two items from two different kinds of evidence.</span></fieldset>';
      html += '<label class="block" for="rate-note">Development note</label><textarea id="rate-note">' + esc(state.ratings[pc] ? r.note : "") + '</textarea><p id="rate-error" class="error-msg" role="alert"></p><div class="btn-row"><button type="submit" class="btn btn-primary">Save rating</button></div></form></section>';
    }
    var hist = state.ratingHistory.filter(function (h) { return h.competency === pc; });
    if (hist.length) {
      html += '<section class="panel" aria-labelledby="hi-h"><h2 id="hi-h">Rating history</h2><ul>' + hist.map(function (h) { return "<li>Day " + h.day + ": " + esc(levelLabel(h.level)) + " (" + h.evidence.length + " evidence item" + (h.evidence.length === 1 ? "" : "s") + ")</li>"; }).join("") + "</ul></section>";
    }
    html += "</aside></div>";
    return { html: html, nav: "competencies", title: c.name, focus: observe ? "ev-add-h" : null, announce: switched ? "Switched to the Sales Manager view to record an observation." : "" };
  }

  /* ---------------- Scenario ---------------- */
  var SC = C.scenario;
  function trustLabel(t) { return t <= -1 ? "Strained" : t === 0 ? "Neutral" : t === 1 ? "Positive" : "Strong"; }
  function gauges(s) {
    return '<div class="gauges" role="group" aria-label="Situation so far"><div class="gauge"><span class="gauge-label">Relationship</span><span class="gauge-value">' + trustLabel(s.trust) + '</span></div><div class="gauge"><span class="gauge-label">Contract value retained</span><span class="gauge-value">' + Math.max(0, s.value) + "%</span></div></div>";
  }
  function gaugesChange(b, a) {
    var t = trustLabel(b.trust) === trustLabel(a.trust) ? trustLabel(a.trust) + " (no change)" : trustLabel(b.trust) + " to " + trustLabel(a.trust);
    var dv = Math.max(0, a.value) - Math.max(0, b.value);
    var v = Math.max(0, a.value) + "%" + (dv === 0 ? " (no change)" : " (" + (dv > 0 ? "+" : "") + dv + " points)");
    return '<div class="gauges" role="group" aria-label="Effect of your choice"><div class="gauge"><span class="gauge-label">Relationship</span><span class="gauge-value">' + t + '</span></div><div class="gauge"><span class="gauge-label">Contract value retained</span><span class="gauge-value">' + v + "</span></div></div>";
  }
  function endingFor(s) { for (var i = 0; i < SC.endings.length; i++) { if (SC.endings[i].test(s)) { return SC.endings[i]; } } return SC.endings[SC.endings.length - 1]; }
  function pathRecap(sc) {
    return '<ol class="path-list">' + sc.history.map(function (h, i) {
      var d = SC.decisions[i], o = byId(d.options, h.opt);
      return "<li><strong>" + esc(d.title) + ":</strong> " + esc(o.label) + '<br><span class="small">Principle: ' + esc(o.principle) + "</span>" + (h.reasoning ? '<br><span class="small">Your reasoning: “' + esc(h.reasoning) + "”</span>" : '<br><span class="small muted">No reasoning recorded.</span>') + "</li>";
    }).join("") + "</ol>";
  }
  function viewPractice() {
    if (state.role !== "employee") { state.role = "employee"; save(); }
    var sc = state.scenario, html = "";
    html += breadcrumb([pathwayCrumb("employee"), { label: "By Day 60", href: "#/milestone/d60" }, { label: "Sales Skills & Processes" }, { label: "Negotiation Practice" }]);
    html += '<div class="scenario-wrap">';
    if (sc.phase === "intro") {
      html += '<div class="page-head"><h1 tabindex="-1">' + esc(SC.title) + '</h1><p class="lede">An interactive negotiation scenario with four connected decisions.</p></div>';
      html += '<div class="scene"><h2>The situation</h2><p>' + esc(SC.setting) + "</p><p><strong>Your goal:</strong> " + esc(SC.goal) + "</p><p>Each choice changes how the customer responds later. After each decision you will see the consequence and feedback, and you can try a different choice. You can also record your reasoning, which you will review with your manager.</p></div>";
      html += '<div class="notice"><p><strong>Practice, not a test.</strong> This scenario is a new enhancement for this program. It provides practice and evidence for the Negotiation &amp; Agreement competency. Completing it is not proof of negotiation proficiency. There is no time limit.</p></div>';
      html += '<button type="button" class="btn btn-primary" data-sc="start">Start the scenario</button>';
    } else if (sc.phase === "decide" || sc.phase === "result") {
      var d = SC.decisions[sc.step];
      html += '<div class="page-head"><p class="small muted" style="margin:0">Decision ' + (sc.step + 1) + " of 4</p><h1 tabindex=\"-1\">" + esc(d.title) + "</h1></div>";
      var ctx = sc.phase === "result" ? sc.history[sc.step].before : sc.s;
      html += '<div class="scene"><p class="scene-quote">' + esc(d.prompt(ctx)) + "</p>" + (sc.phase === "decide" ? gauges(ctx) : "");
      if (sc.phase === "decide") {
        html += '<form id="sc-form" novalidate><fieldset class="fieldset" style="margin-top:1.25rem"><legend>What do you do?</legend><ul class="option-list">' + d.options.map(function (o) {
          return '<li><label><input type="radio" name="opt" id="opt-' + o.id + '" value="' + o.id + '"><span>' + esc(o.label) + "</span></label></li>";
        }).join("") + '</ul></fieldset><label class="block" for="sc-reason">Your reasoning <span class="hint">Optional. Why this choice? It is saved with your path for the debrief.</span></label><textarea id="sc-reason"></textarea><p id="sc-error" class="error-msg" role="alert"></p><div class="btn-row"><button type="submit" class="btn btn-primary">Confirm choice</button></div></form>';
      } else {
        var h = sc.history[sc.step], o = byId(d.options, h.opt);
        html += '<div class="feedback"><h2 id="fb-h" tabindex="-1" style="font-size:1.15rem">You chose: ' + esc(o.label) + "</h2><p><strong>What happens:</strong> " + esc(h.reaction) + "</p><p><strong>Feedback:</strong> " + esc(o.feedback) + '</p><p class="principle">Principle: ' + esc(o.principle) + "</p><h3 style=\"font-size:1rem;margin-top:1rem\">Effect of your choice</h3>" + gaugesChange(h.before, sc.s) +
          '<div class="btn-row"><button type="button" class="btn btn-primary" data-sc="next">' + (sc.step < 3 ? "Continue to decision " + (sc.step + 2) : "See the outcome") + '</button><button type="button" class="btn" data-sc="retry">Try a different choice</button></div></div>';
      }
      html += "</div>";
    } else if (sc.phase === "end") {
      var end = endingFor(sc.s);
      html += '<div class="page-head"><p class="scenario-name">Negotiation Practice: A Renewal Under Pressure</p><p class="small muted" style="margin:0">Outcome</p><h1 tabindex="-1">' + esc(end.title) + '</h1></div>' + (sc.completed ? '<p class="notice notice-info completed-note">You’ve completed this scenario. Your decisions and reflection are saved. To explore another approach, select <strong>Start the scenario again</strong> below or revisit an individual decision.</p>' : "") + '<div class="scene"><p>' + esc(end.text) + "</p>" + gauges(sc.s) + "</div>";
      html += '<section class="scene" aria-labelledby="path-h"><h2 id="path-h">Your path</h2>' + pathRecap(sc) + '<h3 style="font-size:1rem">Explore an alternative</h3><p class="small">Go back to any decision and choose differently. Later decisions are replayed from that point.</p><div class="btn-row">' + SC.decisions.map(function (d, i) { var short = d.title.replace(/^The\s+/, ""); short = short.charAt(0).toUpperCase() + short.slice(1); return '<button type="button" class="btn btn-revisit" data-sc="revisit" data-step="' + i + '">Revisit ' + (i + 1) + ": " + esc(short) + "</button>"; }).join("") + "</div></section>";
      html += '<section class="scene" aria-labelledby="ref-h"><h2 id="ref-h">Reflection</h2><p>Answer each prompt in a sentence or two. Saving shares your path, reasoning and reflection with your manager for the debrief.</p><form id="ref-form" novalidate>' + SC.reflectionPrompts.map(function (p, i) {
        return '<label class="block" for="ref-' + i + '">' + esc(p) + '</label><textarea id="ref-' + i + '">' + esc(sc.reflection[i] || "") + "</textarea>";
      }).join("") + '<p id="ref-error" class="error-msg" role="alert"></p><div class="btn-row"><button type="submit" class="btn btn-primary">' + (sc.shared ? "Update reflection" : "Save and share with my manager") + '</button><button type="button" class="btn btn-quiet" data-sc="restart">Start the scenario again</button></div></form>' + (sc.shared ? '<p class="small" style="margin-top:0.75rem">Shared with ' + esc(C.people.manager.name) + ". Your path and reflection are recorded as evidence for Negotiation &amp; Agreement. Your rating is unchanged until your manager assesses it.</p>" : "") + "</section>";
    }
    html += "</div>";
    return { html: html, nav: "practice", title: "Negotiation practice" };
  }

  function scenarioAction(act, step) {
    var sc = state.scenario;
    if (act === "start") { sc.phase = "decide"; sc.step = 0; sc.s = initialScenarioState(); sc.history = []; }
    else if (act === "next") { sc.step += 1; sc.phase = sc.step >= 4 ? "end" : "decide"; if (sc.phase === "end") { sc.step = 3; } }
    else if (act === "retry") { var last = sc.history.pop(); sc.s = last.before; sc.phase = "decide"; announce("Choice undone. Choose again."); }
    else if (act === "revisit") { var k = Number(step); sc.s = clone(sc.history[k].before); sc.history = sc.history.slice(0, k); sc.step = k; sc.phase = "decide"; }
    else if (act === "restart") { var keep = { completed: sc.completed, shared: sc.shared, reflection: sc.reflection, debrief: sc.debrief, debriefSaved: sc.debriefSaved }; state.scenario = freshScenario(); Object.keys(keep).forEach(function (k2) { state.scenario[k2] = keep[k2]; }); }
    save(); render();
  }
  function confirmChoice(form) {
    var sc = state.scenario, d = SC.decisions[sc.step];
    var sel = form.querySelector('input[name="opt"]:checked');
    var err = document.getElementById("sc-error");
    if (!sel) { err.textContent = "Choose one option before confirming."; document.getElementById("opt-" + d.options[0].id).focus(); return; }
    var o = byId(d.options, sel.value), before = clone(sc.s);
    o.apply(sc.s);
    sc.history.push({ d: d.id, opt: o.id, reasoning: document.getElementById("sc-reason").value.trim(), before: before, reaction: o.reaction(sc.s) });
    sc.phase = "result";
    save(); render({ focus: "fb-h" });
    announce("Choice confirmed. Feedback is shown.");
  }
  function saveReflection(form) {
    var sc = state.scenario, vals = SC.reflectionPrompts.map(function (_, i) { return document.getElementById("ref-" + i).value.trim(); });
    var missing = vals.map(function (v, i) { return v ? -1 : i; }).filter(function (i) { return i >= 0; });
    var err = document.getElementById("ref-error");
    if (missing.length) { err.textContent = "Answer all three prompts before saving. Prompt " + (missing[0] + 1) + " is empty."; document.getElementById("ref-" + missing[0]).focus(); return; }
    sc.reflection = vals; sc.completed = true; sc.shared = true;
    var end = endingFor(sc.s);
    var pathNote = "Outcome: " + end.title + ". " + sc.history.map(function (h, i) { var o = byId(SC.decisions[i].options, h.opt); var r = h.reasoning ? " Reasoning: \u201c" + h.reasoning.replace(/[.\s]+$/, "") + ".\u201d" : ""; return "Decision " + (i + 1) + ": " + o.label + r; }).join(" ");
    state.evidence = state.evidence.filter(function (e) { return e.id !== "EV-SC-PATH" && e.id !== "EV-SC-REFL"; });
    state.evidence.push({ id: "EV-SC-PATH", competency: "PC-07", category: "work", by: "employee", day: DAY, title: "Negotiation scenario path and reasoning", note: pathNote });
    state.evidence.push({ id: "EV-SC-REFL", competency: "PC-07", category: "reflection", by: "employee", day: DAY, title: "Negotiation scenario reflection", note: vals.join(" ") });
    save(); render({ focus: "ref-h" });
    announce("Reflection saved and shared with your manager.");
  }

  function viewDebrief() {
    if (state.role !== "manager") { state.role = "manager"; save(); }
    var sc = state.scenario, html = breadcrumb([pathwayCrumb("manager"), { label: "By Day 60", href: "#/milestone/d60" }, { label: "Sales Skills & Processes" }, { label: "Scenario Debrief" }]);
    html += '<div class="page-head"><h1 tabindex="-1">Negotiation scenario debrief</h1><p class="lede">Review ' + EMP + "’s choices, reasoning and reflection, then hold a short debrief conversation linked to Negotiation &amp; Agreement (PC-07).</p></div>";
    if (!sc.shared) {
      html += '<div class="notice notice-planned"><h2 style="font-size:1.1rem">Nothing to debrief yet</h2><p>' + EMP + " has not shared a scenario reflection. To see this view with content, switch to the Sales Employee view and complete the negotiation practice.</p></div>";
      return { html: html, nav: "debrief", title: "Scenario debrief" };
    }
    var end = endingFor(sc.s);
    html += '<div class="grid-2"><div>';
    html += '<section class="scene" aria-labelledby="o-h"><h2 id="o-h">Outcome: ' + esc(end.title) + "</h2><p>" + esc(end.text) + "</p>" + gauges(sc.s) + "</section>";
    html += '<section class="scene" aria-labelledby="p-h"><h2 id="p-h">Path and reasoning</h2>' + pathRecap(sc) + "</section>";
    html += '<section class="scene" aria-labelledby="r-h"><h2 id="r-h">' + EMP + '’s reflection</h2><dl>' + SC.reflectionPrompts.map(function (p, i) { return "<dt><strong>" + esc(p) + "</strong></dt><dd style=\"margin:0 0 0.9rem\">" + esc(sc.reflection[i]) + "</dd>"; }).join("") + "</dl></section>";
    html += "</div><aside>";
    html += '<section class="panel" aria-labelledby="g-h"><h2 id="g-h">Debrief guide</h2><ol>' + SC.debriefQuestions.map(function (q) { return "<li>" + esc(q) + "</li>"; }).join("") + '</ol><p class="small muted">The scenario is practice. Weigh it with other evidence; it does not establish negotiation proficiency.</p></section>';
    html += '<section class="panel" aria-labelledby="n-h"><h2 id="n-h">Coaching notes</h2><form id="db-form" novalidate><label class="block" for="db-notes">What you discussed and agreed</label><textarea id="db-notes">' + esc(sc.debrief) + '</textarea><p id="db-error" class="error-msg" role="alert"></p><div class="btn-row"><button type="submit" class="btn btn-primary">Save coaching notes</button></div></form>' + (sc.debriefSaved ? '<p class="small" style="margin-top:0.75rem">Saved as developmental evidence for PC-07. <a href="#/competency/PC-07">Open PC-07 to record a rating</a>.</p>' : "") + "</section>";
    html += "</aside></div>";
    return { html: html, nav: "debrief", title: "Scenario debrief" };
  }

  /* ---------------- Support search ---------------- */
  var searchState = { q: "", topic: "", type: "" };
  function supportResults() {
    var q = searchState.q.toLowerCase();
    return C.resources.filter(function (r) {
      if (r.role === "manager" && state.role !== "manager") { return false; }
      if (searchState.topic && r.topic !== searchState.topic) { return false; }
      if (searchState.type && r.type !== searchState.type) { return false; }
      if (!q) { return true; }
      return (r.title + " " + r.text + " " + r.topic + " " + r.type).toLowerCase().indexOf(q) >= 0;
    });
  }
  function resultsHtml() {
    var res = supportResults();
    if (!res.length) { return '<h2 class="visually-hidden">Results</h2><p id="res-count">No resources match. Try a different word or clear the filters.</p>'; }
    return '<h2 class="visually-hidden">Results</h2><p id="res-count" class="small muted">' + res.length + " resource" + (res.length === 1 ? "" : "s") + '</p><ul class="result-list">' + res.map(function (r) {
      return '<li><h3><a href="#/resource/' + r.id + '">' + esc(r.title) + '</a></h3><p class="small muted" style="margin:0 0 0.25rem">' + esc(r.type) + ", " + esc(r.topic) + (r.competencies.length ? ", " : "") + compTags(r.competencies) + '</p><p style="margin:0">' + esc(r.text) + '</p><p class="small" style="margin:0.35rem 0 0">Opens a printable reference page' + (r.download ? ', with an editable Word template to download' : "") + ".</p></li>";
    }).join("") + "</ul>";
  }
  function viewSupport() {
    var topics = [], types = [];
    C.resources.forEach(function (r) { if (r.role === "manager" && state.role !== "manager") { return; } if (topics.indexOf(r.topic) < 0) { topics.push(r.topic); } if (types.indexOf(r.type) < 0) { types.push(r.type); } });
    var html = '<div class="page-head"><h1 tabindex="-1">Performance support</h1><p class="lede">Job aids, templates and primers to use on the job. Each opens a short, printable reference page; three templates can also be downloaded as editable Word files. All resources are fictional examples written for this demonstration.</p></div>';
    html += '<form class="search-bar" role="search" id="search-form" novalidate><label for="q">Search<input type="search" id="q" value="' + esc(searchState.q) + '" autocomplete="off"></label><label for="topic">Topic<select id="topic"><option value="">All topics</option>' + topics.sort().map(function (t) { return '<option' + (searchState.topic === t ? " selected" : "") + ">" + esc(t) + "</option>"; }).join("") + '</select></label><label for="type">Type<select id="type"><option value="">All types</option>' + types.sort().map(function (t) { return '<option' + (searchState.type === t ? " selected" : "") + ">" + esc(t) + "</option>"; }).join("") + "</select></label></form>";
    html += '<div id="results">' + resultsHtml() + "</div>";
    return { html: html, nav: "support", title: "Performance support" };
  }

  function viewResource(rid) {
    var r = byId(C.resources, rid);
    if (!r) { return viewNotFound(); }
    var html = breadcrumb([{ label: "Performance Support", href: "#/support" }, { label: r.title }]);
    html += '<div class="page-head"><h1 tabindex="-1">' + esc(r.title) + '</h1><p class="small muted">' + esc(r.type) + " · " + esc(r.topic) + (r.role === "manager" ? ' · <span class="tag">For managers</span>' : "") + (r.competencies.length ? " · " + compTags(r.competencies) : "") + '</p><p class="lede">' + esc(r.text) + "</p></div>";
    html += '<div class="grid-2"><div class="detail-body resource-body">';
    r.body.forEach(function (sec) {
      html += "<h2>" + esc(sec.h) + "</h2>";
      if (sec.p) { html += "<p>" + esc(sec.p) + "</p>"; }
      if (sec.list) { html += "<ul>" + sec.list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }
    });
    html += '<p class="small muted">A fictional, illustrative job aid written for this demonstration.</p>';
    html += '</div><aside class="no-print">';
    html += '<section class="panel" aria-labelledby="use-h"><h2 id="use-h">Use this resource</h2>';
    if (r.download) {
      html += '<p><a class="btn btn-primary" href="' + r.download.file + '" download>Download the editable template <span class="small">(Word, ' + esc(r.download.size) + ")</span></a></p>";
    }
    html += '<p><button type="button" class="btn" data-print="1">Print this page</button></p><p class="small muted">Printing hides the site navigation so only the resource prints.</p></section>';
    var uses = C.activities.filter(function (a) { return (a.resources || []).indexOf(r.id) >= 0 && a.role === state.role; });
    if (uses.length) { html += '<section class="panel" aria-labelledby="used-h"><h2 id="used-h">Used in these activities</h2><ul>' + uses.map(function (a) { return '<li><a href="#/activity/' + a.id + '">' + esc(a.title) + "</a></li>"; }).join("") + "</ul></section>"; }
    html += '<p><a href="#/support">← All performance support</a></p>';
    html += "</aside></div>";
    return { html: html, nav: "support", title: r.title };
  }

  function viewGuide(sub) {
    var h = "";
    // ---- Hero: what this is and how to start
    h += '<div class="page-head guide-head"><h1 tabindex="-1">Welcome to First 120 Days</h1><p class="lede">An interactive demonstration of competency-based sales onboarding. Follow a fictional new account executive and their manager through the first 120 days, from first-week setup to coached, evidence-based assessment.</p>';
    h += '<div class="btn-row guide-actions"><a class="btn btn-primary" href="#/start/employee">Explore Employee Learning Pathway</a><a class="btn btn-primary" href="#/start/manager">Explore Manager Learning Pathway</a></div>';
    h += '<ul class="guide-meta small"><li><a href="' + GUIDE_PDF.file + '" download>Download the First 120 Days User Guide</a> (PDF, ' + esc(GUIDE_PDF.size) + ")</li><li>Designed and directed by me, developed with Claude AI. <a href=\"#/guide/design\">How I built it</a></li><li>All data is fictional. Progress is saved only in this browser.</li></ul></div>";

    // ---- Five-minute tour
    h += '<section class="section" aria-labelledby="how-h"><div class="section-head"><h2 id="how-h">How to Use This Experience</h2></div>';
    h += "<p>Explore freely; you can switch roles at any time and reset whenever you like. For a quick tour, try these five steps (about five minutes):</p>";
    h += '<ol class="tour">' + [
      ['<a href="#/activity/E60-SS-03">Open an employee activity</a>', "See what to do, what success looks like, and the status control."],
      ['<a href="#/activity/M60-SS-03?from=E60-SS-03">Follow “How your manager supports this”</a>', "Opens <em>Shadow client meetings the new hire initiates</em> in the manager view. Use <strong>Back to</strong> to return to the employee activity."],
      ['<a href="#/practice">Try the negotiation practice</a>', "Four connected decisions, with consequences and feedback after each.<span class=\"tour-aside\">Been here before? You may see your saved outcome. Choose <strong>Start the scenario again</strong> to replay.</span>"],
      ['<a href="#/debrief">Switch to the manager and open Scenario Debrief</a>', "Review the path and reflection, and save coaching notes."],
      ['<a href="#/competency/PC-07">Look at a competency</a>', "See how evidence builds up and why a rating needs two kinds of it."]
    ].map(function (x) { return '<li><span class="tour-step">' + x[0] + '</span><span class="tour-note">' + x[1] + "</span></li>"; }).join("") + "</ol>";

    // ---- Details on demand
    h += '<h3 class="details-h">How it works</h3><p class="small muted">Open any topic for detail.</p><div class="details-group">';
    var det = function (title, body) { return '<details class="disclosure"><summary>' + title + "</summary>" + body + "</details>"; };
    h += det("Two role-based pathways", "<p>The <strong>Sales Employee Learning Pathway</strong> follows " + esc(C.people.employee.name) + ", a fictional new account executive on day " + DAY + ". The <strong>Sales Manager Learning Pathway</strong> follows " + esc(C.people.manager.name) + ", who prepares, coaches and assesses. Each role sees its own activities and deadlines.</p>");
    h += det("Milestones, tracks and activities", "<p>Each pathway has four levels: the Learning Pathway, its completion milestones (Before Day 1 for managers, then By Day 7, 30, 60, 90 and 120), four learning tracks, and the individual activities. Milestones are cumulative deadlines: everything listed is due by that day.</p>");
    h += det("Opening activities and updating progress", "<p>Open any activity to see what to do, why it matters and when it is due. Employees set Not started, In progress or Completed. Managers check off their responsibilities. Course enrollment has its own states, because enrolling and finishing are different things.</p>");
    h += det("Coordinated manager–employee responsibilities", "<p>Some manager responsibilities have two steps with separate deadlines, such as arranging tool access before Day 1 and assigning enrollments by Day 7. Each step is checked off on its own. The manager’s responsibility can be complete while the employee’s related activities are still under way.</p>");
    h += det("Moving between related activities", "<p>Employee activities link to the manager responsibilities that support them, and manager activities link to what the employee does. Following a link switches the view and shows a <strong>Back to</strong> link.</p>");
    h += det("Negotiation practice and manager debrief", "<p>As the employee, work through a four-decision contract renewal. Each choice changes how the customer responds later. You can try a different choice or revisit any decision, then answer three reflection prompts. As the manager, open Scenario Debrief to review the path and record coaching notes.</p>");
    h += det("Competency evidence and developmental ratings", "<p>Eight demonstration competencies describe good performance. Evidence comes in three kinds: work products, observed performance and developmental reflection. Only the manager records a rating, and any level above <strong>Not yet observed</strong> needs at least two items from two different kinds of evidence. Completing activities never changes a rating. Activity links are labeled Introduces, Builds or Produces evidence.</p>");
    h += det("Performance support", "<p>Search or filter job aids, templates, coaching guides and primers. Every resource opens as a printable page, and three templates download as editable Word files.</p>");
    h += det("Your sample data and resetting", "<p>The prototype starts with fictional sample progress. Your changes are saved only in this browser. Nothing is sent anywhere, and there is no login or tracking. Use <a href=\"#/guide/controls\">Demonstration Controls</a> to restore the sample or clear everything.</p>");
    h += det("What is built and what is planned", "<p><strong>Built:</strong> both pathways with role switching; Before Day 1 (manager), By Day 7 and By Day 60; coordinated responsibilities; progress tracking; manager guidance and success criteria for key activities; competency evidence and ratings; the negotiation scenario and debrief; printable performance support.</p><p><strong>Planned, not built:</strong> activities for By Day 30, 90 and 120 (shown as Planned, with no progress); role-specific learning for solution areas; further templates.</p>");
    h += "</div></section>";

    // ---- Behind the Design (mandatory)
    h += '<section class="section behind" aria-labelledby="bd-h"><div class="section-head"><h2 id="bd-h" tabindex="-1">Behind the Design: AI-Assisted Development, UX Testing &amp; Refinement</h2></div>';
    h += '<p class="lede-s">I designed this experience and directed its development from start to finish. I used Claude AI as a development partner for implementation, analysis, documentation and automated testing. Every instructional decision, requirement and refinement was mine to make and approve.</p>';
    h += '<ol class="process" aria-label="Development process">' + ["Design", "Claude AI–assisted development", "Hands-on UX testing", "Findings", "Refinement", "Verification"].map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ol>";
    h += '<div class="behind-grid">';
    h += '<section aria-labelledby="bd-a"><h3 id="bd-a">Instructional design leadership</h3><p>The starting point was a sales onboarding and manager enablement framework I originally developed as a working document for an enterprise sales organization. I:</p><ul>' +
      "<li>directed a full analysis of that framework, with every decision recorded in a private decision log</li>" +
      "<li>designed the learning architecture, the two role-based pathways and their coordinated responsibilities</li>" +
      "<li>defined eight new competencies, the developmental scale and the two-kinds-of-evidence rating rule</li>" +
      "<li>designed the branching negotiation scenario for practice, reflection and coaching</li>" +
      "<li>set the requirements and acceptance criteria for each phase, and approved each phase before it began</li></ul>" +
      "<p>All public content was rewritten, generalized or fictionalized. No confidential material from the original framework appears here.</p></section>";
    h += '<section aria-labelledby="bd-b"><h3 id="bd-b">Claude AI–assisted development</h3><p>Working to my requirements, Claude AI:</p><ul>' +
      "<li>structured the source inventory and its reconciliation checks</li>" +
      "<li>drafted the design brief and documentation from my decisions</li>" +
      "<li>implemented the prototype in plain HTML, CSS and JavaScript</li>" +
      "<li>proposed options and flagged ambiguities and conflicts with earlier decisions</li>" +
      "<li>helped me analyze my testing findings</li>" +
      "<li>wrote and ran automated regression tests and scanned the public files for confidential content</li></ul>" +
      "<p>Claude AI did not set the learning strategy. I reviewed and corrected its work throughout.</p></section>";
    h += '<section aria-labelledby="bd-c"><h3 id="bd-c">UX testing and quality assurance</h3><p>I tested each iteration hands-on in both roles and evaluated the findings, with Claude AI helping to analyze them. My testing covered navigation, coordination between the pathways, cross-role links, milestone and completion behavior, the negotiation scenario, evidence and rating safeguards, performance support, and instructional clarity.</p><p>Claude-assisted regression testing ran alongside: automated browser tests of functionality, keyboard-only use, layouts at several screen widths, and selected accessibility checks, all in a single browser engine.</p><p><strong>Not yet done:</strong> testing with external participants, screen-reader testing, testing across other browsers and devices, and an independent accessibility audit. I make no claim of accessibility conformance, and this is a demonstration, not a production system.</p></section>';
    h += '<section aria-labelledby="bd-d"><h3 id="bd-d">Iterative refinement</h3><p>I turned each finding into a targeted change and approved it:</p><dl class="findings">' + [
      ["“Route” was an ambiguous label.", "Renamed Learning Pathway; added this Experience Guide."],
      ["Cross-role links worked one way only.", "Links now work in both directions, with a way back."],
      ["Manager guidance said what, not how.", "Purpose, actions, look-fors, evidence and completion criteria; Record Observation."],
      ["A tools activity overreached into account planning.", "Link removed; every competency link audited and labeled."],
      ["A resource title could not be opened.", "Every resource opens a printable page; three Word templates."],
      ["The Experience Guide was too text-heavy for a first visit.", "A five-minute tour up front, with details on demand."],
      ["The scenario outcome did not name the scenario.", "The outcome screen now shows “A Renewal Under Pressure”."]
    ].map(function (f) { return "<dt>" + f[0] + "</dt><dd>" + f[1] + "</dd>"; }).join("") + "</dl><p>After each round, Claude AI reran and extended the automated regression tests, and I reviewed the results before accepting the changes.</p></section>";
    h += "</div></section>";

    // ---- Disclosures and controls
    h += '<section class="section" aria-labelledby="disc-h"><div class="section-head"><h2 id="disc-h">About this demonstration</h2></div><ul class="disclosures"><li><strong>Fictional content.</strong> All people, companies, customers, products, solution areas and records are fictional.</li><li><strong>Not an official or production system.</strong> This is a portfolio demonstration, not the learning program of any company.</li><li><strong>Demonstration competencies.</strong> Written for this demonstration; not an employer’s standard or a certification.</li><li><strong>Accessibility.</strong> Designed toward WCAG 2.1 Level AA and tested internally, not independently audited. No conformance claim is made.</li></ul></section>';
    h += '<section class="section controls" aria-labelledby="ctl-h"><div class="section-head"><h2 id="ctl-h" tabindex="-1">Demonstration Controls</h2></div><p>Restore the fictional sample progress, or clear everything to explore from a blank start. This affects only this browser.</p><button type="button" class="btn" id="open-reset">Reset demo data…</button></section>';
    return { html: h, nav: "guide", title: "Experience Guide", focus: sub === "controls" ? "ctl-h" : sub === "design" ? "bd-h" : null };
  }

  function viewNotFound() {
    return { html: '<div class="page-head"><h1 tabindex="-1">Page not found</h1><p>This page does not exist in the prototype. <a href="#/guide">Go to the Experience Guide</a> or <a href="#/home">open your Learning Pathway</a>.</p></div>', nav: "", title: "Not found" };
  }

  /* ---------------- Router ---------------- */
  var firstRender = true;
  // Routes: #/guide (default), #/home, #/milestone/<id>, #/activity/<id>?from=<id>, #/competency/<id>[/observe?from=<id>], #/resource/<id>, ...
  function parse() {
    var raw = (window.location.hash || "").replace(/^#\/?/, ""), q = "";
    var qi = raw.indexOf("?");
    if (qi >= 0) { q = raw.slice(qi + 1); raw = raw.slice(0, qi); }
    var h = raw.split("/"), params = {};
    q.split("&").forEach(function (kv) { if (!kv) { return; } var p = kv.split("="); params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); });
    return { name: h[0] || "guide", arg: h[1], arg2: h[2], from: params.from };
  }
  function render(opts) {
    opts = opts || {};
    var p = parse(), v;
    var activeId = document.activeElement && document.activeElement.id;
    animateRoute = !opts.keepFocus && !opts.focus;
    if (p.name === "start") {
      // Entry actions from the Experience Guide: set the role, then open that role's pathway.
      if (p.arg === "employee" || p.arg === "manager") { state.role = p.arg; save(); }
      window.location.replace("#/home");
      return;
    }
    switch (p.name) {
      case "guide": v = viewGuide(p.arg); break;
      case "about": v = viewGuide(); break; // Iteration 1 link kept working
      case "home": v = viewHome(); break;
      case "milestone": v = viewMilestone(p.arg); break;
      case "activity": v = viewActivity(p.arg, p.from); break;
      case "competencies": v = viewCompetencies(); break;
      case "competency": v = viewCompetency(p.arg, p.arg2, p.from); break;
      case "practice": v = viewPractice(); break;
      case "debrief": v = viewDebrief(); break;
      case "support": v = viewSupport(); break;
      case "resource": v = viewResource(p.arg); break;
      default: v = viewNotFound();
    }
    renderChrome(v.nav);
    main.innerHTML = v.html;
    document.title = v.title + " | First 120 Days (demonstration)";
    if (v.announce) { announce(v.announce); }
    if (!opts.focus && !opts.keepFocus && v.focus && document.getElementById(v.focus)) { var vf = document.getElementById(v.focus); vf.focus(); vf.scrollIntoView({ block: "start" }); firstRender = false; return; }
    if (opts.focus && document.getElementById(opts.focus)) { document.getElementById(opts.focus).focus(); }
    else if (opts.keepFocus && activeId && document.getElementById(activeId)) { document.getElementById(activeId).focus(); }
    else if (!firstRender && !opts.keepFocus) {
      var h1 = main.querySelector("h1");
      if (h1) { h1.focus(); }
      window.scrollTo(0, 0);
    }
    firstRender = false;
  }

  /* ---------------- Events ---------------- */
  window.addEventListener("hashchange", function () { render(); });

  document.querySelector(".role-switch").addEventListener("click", function (e) {
    var b = e.target.closest(".role-btn");
    if (!b) { return; }
    var role = b.getAttribute("data-role");
    if (role === state.role) { return; }
    state.role = role; save();
    var p = parse(), target = "#/home";
    if (p.name === "milestone") { target = "#/milestone/" + (msOf(role, p.arg) ? p.arg : currentMilestone(role)); }
    else if (p.name === "competencies" || p.name === "support" || p.name === "about" || p.name === "guide") { target = window.location.hash; }
    else if (p.name === "competency") { target = "#/competency/" + p.arg; }
    else if (p.name === "resource") { var rr = byId(C.resources, p.arg); target = rr && rr.role === "manager" && role === "employee" ? "#/support" : window.location.hash; }
    else if (p.name === "practice" || p.name === "debrief") { target = role === "employee" ? "#/practice" : "#/debrief"; }
    announce("Now viewing as " + roleName(role) + ".");
    if (window.location.hash === target) { render({ focus: b.id || null, keepFocus: true }); b.focus(); } else { window.location.hash = target; }
  });

  main.addEventListener("change", function (e) {
    var t = e.target;
    if (t.matches("[data-step]")) {
      var id = t.getAttribute("data-step");
      state.managerSteps[id] = t.checked; save();
      render({ keepFocus: true });
      announce(t.checked ? "Marked done." : "Marked not done.");
    } else if (t.matches("[data-status-for]")) {
      state.statuses[t.getAttribute("data-status-for")] = t.value; save();
      render({ keepFocus: true });
      announce("Status set to " + STATUS_LABEL[t.value] + ".");
    } else if (t.matches("[data-course]")) {
      state.courses[t.getAttribute("data-course")] = t.value; save();
      render({ keepFocus: true });
      announce("Course status set to " + t.options[t.selectedIndex].text + ".");
    } else if (t.id === "ev-cat") {
      var hint = document.getElementById("ev-kind-hint");
      if (hint) { hint.textContent = (state.role === "manager" && t.value === "reflection") ? COACH_HINT : byId(C.evidenceCategories, t.value).hint; }
    } else if (t.id === "topic" || t.id === "type") {
      searchState[t.id] = t.value; updateResults();
    }
  });
  var searchTimer;
  main.addEventListener("input", function (e) {
    if (e.target.id === "q") { searchState.q = e.target.value; window.clearTimeout(searchTimer); searchTimer = window.setTimeout(updateResults, 250); }
  });
  function updateResults() {
    var box = document.getElementById("results");
    if (!box) { return; }
    box.innerHTML = resultsHtml();
    announce(document.getElementById("res-count").textContent);
  }

  main.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sc]");
    if (b) { scenarioAction(b.getAttribute("data-sc"), b.getAttribute("data-step")); return; }
    var r = e.target.closest("[data-reset]");
    if (r) { doReset(r.getAttribute("data-reset")); return; }
    if (e.target.closest("[data-print]")) { window.print(); return; }
    if (e.target.closest("#open-reset")) { openReset(); }
  });

  main.addEventListener("submit", function (e) {
    var f = e.target;
    e.preventDefault();
    if (f.id === "sc-form") { confirmChoice(f); }
    else if (f.id === "ref-form") { saveReflection(f); }
    else if (f.id === "search-form") { updateResults(); }
    else if (f.id === "ev-form") { addEvidence(f); }
    else if (f.id === "rate-form") { saveRating(f); }
    else if (f.id === "db-form") { saveDebrief(); }
  });

  function addEvidence(f) {
    var pc = f.getAttribute("data-pc");
    var title = document.getElementById("ev-title").value.trim(), note = document.getElementById("ev-note").value.trim();
    var err = document.getElementById("ev-error");
    if (!title) { err.textContent = "Add a title for this evidence."; document.getElementById("ev-title").focus(); return; }
    if (!note) { err.textContent = "Describe what this evidence shows."; document.getElementById("ev-note").focus(); return; }
    var cat = document.getElementById("ev-cat").value;
    var by = state.role === "employee" ? "employee" : document.getElementById("ev-by").value;
    state.evidence.push({ id: nextId("EV"), competency: pc, category: cat, by: by, day: DAY, title: title, note: note });
    save(); render({ focus: "ev-h" });
    announce("Evidence added. The rating has not changed.");
  }
  function saveRating(f) {
    var pc = f.getAttribute("data-pc");
    var lvl = f.querySelector('input[name="level"]:checked');
    var err = document.getElementById("rate-error");
    if (!lvl) { err.textContent = "Choose a level."; document.getElementById("lvl-nyo").focus(); return; }
    var chosen = Array.prototype.map.call(f.querySelectorAll('input[name="ev"]:checked'), function (x) { return x.value; });
    if (lvl.value !== "nyo") {
      var cats = {};
      chosen.forEach(function (id) { var ev = byId(state.evidence, id); if (ev) { cats[ev.category] = true; } });
      if (chosen.length < 2 || Object.keys(cats).length < 2) {
        err.textContent = "To record “" + levelLabel(lvl.value) + "”, select at least two evidence items from two different kinds of evidence. If there is not enough evidence yet, choose “Not yet observed”.";
        var firstEv = f.querySelector('input[name="ev"]'); (firstEv || lvl).focus(); return;
      }
    }
    var note = document.getElementById("rate-note").value.trim();
    state.ratings[pc] = { level: lvl.value, day: DAY, note: note, evidence: chosen };
    state.ratingHistory.push({ competency: pc, level: lvl.value, day: DAY, note: note, evidence: chosen });
    save(); render({ focus: "rt-h" });
    announce("Rating saved: " + levelLabel(lvl.value) + ".");
  }
  function saveDebrief() {
    var notes = document.getElementById("db-notes").value.trim(), err = document.getElementById("db-error");
    if (!notes) { err.textContent = "Add your coaching notes before saving."; document.getElementById("db-notes").focus(); return; }
    var sc = state.scenario;
    sc.debrief = notes; sc.debriefSaved = true; state.managerSteps["M60-SS-06"] = true;
    state.evidence = state.evidence.filter(function (e) { return e.id !== "EV-SC-DEBRIEF"; });
    state.evidence.push({ id: "EV-SC-DEBRIEF", competency: "PC-07", category: "reflection", by: "manager", day: DAY, title: "Negotiation scenario debrief notes", note: notes });
    save(); render({ focus: "n-h" });
    announce("Coaching notes saved as evidence for PC-07.");
  }

  function doReset(kind) {
    var role = state.role;
    state = defaultState(kind === "blank" ? "blank" : "sample");
    state.role = role; save();
    searchState = { q: "", topic: "", type: "" };
    announce(kind === "blank" ? "All progress cleared." : "Sample progress restored.");
    render({ keepFocus: false });
  }
  var dlg = document.getElementById("reset-dialog");
  function openReset() {
    if (dlg && typeof dlg.showModal === "function") { dlg.returnValue = ""; dlg.showModal(); }
    else if (window.confirm("Restore the fictional sample progress?")) { doReset("sample"); }
  }
  if (dlg) {
    dlg.addEventListener("close", function () {
      var v = dlg.returnValue;
      if (v === "sample" || v === "blank") { doReset(v); }
      var back = document.getElementById("open-reset");
      if (back) { back.focus(); }
    });
  }

  render();
})();
