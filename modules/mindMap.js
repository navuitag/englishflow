/**
 * Interactive mind map — tổng hợp kiến thức theo lớp / chủ đề / bài.
 */

function groupKey(skill, mode) {
  if (mode === "domain") return skill.domain || skill.category || skill.chapter || "Khác";
  if (mode === "category") return skill.category || skill.litKind || skill.domain || skill.chapter || "Khác";
  return skill.chapter || skill.domain || skill.category || "Khác";
}

export function makeBranchId(grade, label) {
  const slug = String(label)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "topic";
  return `${grade}--${slug}`;
}

export function parseBranchId(branchId) {
  const idx = String(branchId).indexOf("--");
  if (idx === -1) return null;
  return { grade: Number(branchId.slice(0, idx)), slug: branchId.slice(idx + 2) };
}

function isSkillUnlocked(skill, completed) {
  return (skill.prerequisite || []).every((id) => completed.includes(id));
}

function skillStatus(skill, completed) {
  if (completed.includes(skill.id)) return "done";
  if (!isSkillUnlocked(skill, completed)) return "locked";
  return "open";
}

export function buildMindMapTree(skills, grade, groupMode = "chapter") {
  const gradeSkills = skills
    .filter((s) => s.grade === grade)
    .sort((a, b) => (a.chapterIndex || 0) - (b.chapterIndex || 0) || (a.lessonNo || 0) - (b.lessonNo || 0));

  const groups = new Map();
  gradeSkills.forEach((skill) => {
    const key = groupKey(skill, groupMode);
    if (!groups.has(key)) {
      groups.set(key, {
        id: makeBranchId(grade, key),
        label: key,
        book: skill.book || "",
        chapterIndex: skill.chapterIndex,
        skills: []
      });
    }
    groups.get(key).skills.push(skill);
  });

  return {
    grade,
    total: gradeSkills.length,
    branches: [...groups.values()].map((group) => ({ ...group, count: group.skills.length }))
  };
}

export function findBranch(skills, branchId, groupMode = "chapter") {
  const parsed = parseBranchId(branchId);
  if (!parsed || !parsed.grade) return null;
  const tree = buildMindMapTree(skills, parsed.grade, groupMode);
  return tree.branches.find((b) => b.id === branchId) || null;
}

function getLesson(skillId, lessons) {
  return (lessons || []).find((l) => l.id === skillId || l.skill === skillId) || null;
}

function extractConcepts(skill, lesson) {
  const items = [];
  const push = (label, kind) => {
    const text = String(label || "").trim();
    if (text) items.push({ label: text, kind });
  };

  push(skill?.description, "desc");
  push(skill?.litFocus, "focus");
  push(skill?.litSample, "sample");
  push(skill?.formula, "formula");
  push(skill?.grammar, "grammar");
  push(skill?.domain, "domain");

  if (lesson?.steps) {
    lesson.steps.forEach((step) => {
      if (step.type === "keypoints" && step.points?.length) {
        step.points.forEach((p) => push(p, "keypoint"));
      } else if ((step.type === "intro" || step.type === "example" || step.type === "summary") && step.content) {
        push(step.content, step.type);
      }
    });
  }

  if (!items.length) push(skill?.title, "title");
  return items.slice(0, 8);
}

export function buildSkillMindMap(skill, lessons) {
  if (!skill) return null;
  const lesson = getLesson(skill.id, lessons);
  const concepts = extractConcepts(skill, lesson);
  const groups = [
    { id: "goal", label: "Mục tiêu", items: concepts.filter((c) => c.kind === "desc" || c.kind === "intro") },
    { id: "core", label: "Điểm nhớ", items: concepts.filter((c) => c.kind === "keypoint" || c.kind === "focus" || c.kind === "formula" || c.kind === "grammar") },
    { id: "example", label: "Ví dụ", items: concepts.filter((c) => c.kind === "example" || c.kind === "sample") },
    { id: "other", label: "Khác", items: concepts.filter((c) => !["desc", "intro", "keypoint", "focus", "formula", "grammar", "example", "sample"].includes(c.kind)) }
  ].filter((g) => g.items.length);

  return { center: skill.title, subtitle: skill.chapter || skill.book || "", groups, skillId: skill.id };
}

export function buildTopicMindMap(branch, lessons) {
  if (!branch) return null;
  const spokes = branch.skills.map((skill) => {
    const lesson = getLesson(skill.id, lessons);
    return {
      id: skill.id,
      title: skill.title,
      href: `#/lesson/${skill.id}`,
      mindHref: `#/mindmap/lesson/${skill.id}`,
      concepts: extractConcepts(skill, lesson).slice(0, 5)
    };
  });
  return {
    center: branch.label,
    subtitle: branch.book ? `Chương ${branch.chapterIndex || ""} · ${branch.book}`.trim() : "",
    branchId: branch.id,
    spokes
  };
}

export function buildSummerTopicMindMap(pack, topicId) {
  const topic = pack?.topics?.find((t) => t.id === topicId);
  const lesson = pack?.lessons?.find((l) => l.id === topicId);
  if (!topic) return null;
  const concepts = [];
  if (lesson?.steps) {
    lesson.steps.forEach((step) => {
      if (step.type === "keypoints" && step.points?.length) {
        step.points.forEach((p) => concepts.push({ label: p, kind: "keypoint" }));
      } else if (step.content) {
        concepts.push({ label: step.content, kind: step.type });
      }
    });
  }
  return {
    center: `${topic.emoji || "☀️"} ${topic.title}`,
    subtitle: topic.description || pack.meta?.title || "",
    concepts,
    topicId,
    packId: pack.meta?.packId || topicId
  };
}

export function buildSummerBranches(summerPacks) {
  if (!summerPacks || !Object.keys(summerPacks).length) return null;
  return {
    id: "summer-root",
    label: "Ôn hè",
    emoji: "☀️",
    children: Object.entries(summerPacks).map(([packId, pack]) => ({
      id: packId,
      label: pack.meta?.title || packId,
      subtitle: pack.meta?.subtitle || "",
      href: `#/summer/${packId}`,
      topicCount: pack.topics?.length || 0,
      examCount: pack.exams?.length || 0,
      topics: (pack.topics || []).map((t) => ({
        id: t.id,
        label: t.title,
        emoji: t.emoji || "",
        href: `#/summer/${packId}/topic/${t.id}`,
        mindHref: `#/mindmap/summer/${packId}/${t.id}`
      }))
    }))
  };
}

let escapeHtml = (s) => String(s ?? "");

function renderLeaf(skill, status) {
  const locked = status === "locked";
  const done = status === "done";
  const href = locked ? "#" : `#/lesson/${skill.id}`;
  return `
    <li class="mm-leaf mm-leaf--${status}">
      <a href="${href}" class="mm-leaf-link"${locked ? ' aria-disabled="true" tabindex="-1"' : ""}>
        <span class="mm-leaf-dot"></span>
        <span class="mm-leaf-text">${escapeHtml(skill.title)}</span>
        ${done ? '<span class="mm-badge done">✓</span>' : locked ? '<span class="mm-badge lock">🔒</span>' : ""}
      </a>
      <a class="mm-mini-map-link" href="#/mindmap/lesson/${escapeHtml(skill.id)}" title="Sơ đồ bài">🧠</a>
    </li>`;
}

function renderBranch(branch, completed, expanded) {
  const openClass = expanded ? " is-open" : "";
  const doneCount = branch.skills.filter((s) => completed.includes(s.id)).length;
  const pct = branch.count ? Math.round((doneCount / branch.count) * 100) : 0;

  return `
    <article class="mm-branch${openClass}" data-branch-id="${escapeHtml(branch.id)}">
      <button type="button" class="mm-branch-head" aria-expanded="${expanded}">
        <span class="mm-branch-icon">◉</span>
        <span class="mm-branch-meta">
          <strong>${escapeHtml(branch.label)}</strong>
          ${branch.book ? `<small>${escapeHtml(branch.book)}</small>` : ""}
        </span>
        <span class="mm-branch-stats">${doneCount}/${branch.count} · ${pct}%</span>
        <span class="mm-chevron">›</span>
      </button>
      <div class="mm-branch-toolbar">
        <a class="mm-topic-link" href="#/mindmap/topic/${encodeURIComponent(branch.id)}">🧠 Sơ đồ chủ đề</a>
      </div>
      <div class="mm-branch-body">
        <ul class="mm-leaves">
          ${branch.skills.map((skill) => renderLeaf(skill, skillStatus(skill, completed))).join("")}
        </ul>
      </div>
    </article>`;
}

function renderConceptChips(items) {
  return items.map((item) => `
    <li class="mm-concept-chip mm-concept--${escapeHtml(item.kind || "note")}">
      <span class="mm-concept-dot"></span>${escapeHtml(item.label)}
    </li>`).join("");
}

function renderTopicDetail(map, backHref = "#/mindmap") {
  const spokes = map.spokes.map((spoke) => `
    <article class="mm-skill-spoke card-panel">
      <header class="mm-spoke-head">
        <a href="${spoke.href}"><strong>${escapeHtml(spoke.title)}</strong></a>
        <a class="mm-mini-map-link" href="${spoke.mindHref}">🧠 Chi tiết</a>
      </header>
      <ul class="mm-concept-list">${renderConceptChips(spoke.concepts)}</ul>
    </article>`).join("");

  return `
    <section class="mm-detail-page">
      <a class="back-link" href="${backHref}">← Sơ đồ tổng quan</a>
      <div class="mm-topic-center card-panel">
        <span class="mm-center-emoji">📌</span>
        <div>
          <h1>${escapeHtml(map.center)}</h1>
          ${map.subtitle ? `<p>${escapeHtml(map.subtitle)}</p>` : ""}
          <span class="tag">${map.spokes.length} bài · ${map.spokes.reduce((n, s) => n + s.concepts.length, 0)} ý chính</span>
        </div>
      </div>
      <div class="mm-spoke-grid">${spokes}</div>
    </section>`;
}

function renderSkillDetail(map, backHref) {
  const groups = map.groups.map((g) => `
    <article class="mm-skill-group card-panel">
      <h3>${escapeHtml(g.label)}</h3>
      <ul class="mm-concept-list">${renderConceptChips(g.items)}</ul>
    </article>`).join("");

  return `
    <section class="mm-detail-page">
      <a class="back-link" href="${backHref}">← Quay lại</a>
      <div class="mm-topic-center card-panel">
        <span class="mm-center-emoji">📝</span>
        <div>
          <h1>${escapeHtml(map.center)}</h1>
          ${map.subtitle ? `<p>${escapeHtml(map.subtitle)}</p>` : ""}
        </div>
        <a class="btn primary" href="#/lesson/${escapeHtml(map.skillId)}">Vào bài học</a>
      </div>
      <div class="mm-skill-groups">${groups}</div>
    </section>`;
}

function renderSummerTopicDetail(map, packId) {
  return `
    <section class="mm-detail-page">
      <a class="back-link" href="#/summer/${encodeURIComponent(packId)}/topic/${encodeURIComponent(map.topicId)}">← Chủ đề ôn hè</a>
      <div class="mm-topic-center card-panel mm-summer-center">
        <span class="mm-center-emoji">☀️</span>
        <div>
          <h1>${escapeHtml(map.center)}</h1>
          ${map.subtitle ? `<p>${escapeHtml(map.subtitle)}</p>` : ""}
        </div>
        <a class="btn primary" href="#/summer/${encodeURIComponent(packId)}/topic/${encodeURIComponent(map.topicId)}/play">Luyện ngay</a>
      </div>
      <article class="mm-skill-group card-panel">
        <h3>Kiến thức cần nhớ</h3>
        <ul class="mm-concept-list">${renderConceptChips(map.concepts)}</ul>
      </article>
    </section>`;
}

function renderSummerSection(section) {
  if (!section) return "";
  const packs = section.children.map((pack) => `
    <article class="mm-summer-pack">
      <a class="mm-summer-pack-head" href="${pack.href}">
        <span class="mm-summer-emoji">📦</span>
        <span>
          <strong>${escapeHtml(pack.label)}</strong>
          <small>${escapeHtml(pack.subtitle)} · ${pack.topicCount} chủ đề · ${pack.examCount} đề</small>
        </span>
      </a>
      <ul class="mm-summer-topics">
        ${pack.topics.map((t) => `
          <li>
            <a href="${t.href}">${t.emoji ? `${t.emoji} ` : ""}${escapeHtml(t.label)}</a>
            <a class="mm-mini-map-link" href="${t.mindHref}" title="Sơ đồ chủ đề">🧠</a>
          </li>`).join("")}
      </ul>
    </article>`).join("");

  return `
    <section class="mm-summer-section card-panel">
      <header class="mm-summer-head">
        <span class="tag">Ôn hè</span>
        <h2>${section.emoji} ${escapeHtml(section.label)}</h2>
        <p>Các lộ trình ôn hè — mỗi chủ đề có sơ đồ tư duy riêng.</p>
      </header>
      <div class="mm-summer-grid">${packs}</div>
    </section>`;
}

function renderTopicCards(branches) {
  return `
    <section class="mm-topic-cards">
      <h2 class="mm-section-title">Sơ đồ theo chủ đề</h2>
      <div class="mm-topic-card-grid">
        ${branches.map((b) => `
          <a class="mm-topic-card card-panel" href="#/mindmap/topic/${encodeURIComponent(b.id)}">
            <strong>${escapeHtml(b.label)}</strong>
            <span>${b.count} bài</span>
            <span class="mm-topic-card-cta">Xem sơ đồ →</span>
          </a>`).join("")}
      </div>
    </section>`;
}

export function createMindMapModule(ctx) {
  escapeHtml = ctx.escapeHtml || escapeHtml;

  const config = {
    subject: "Kiến thức",
    emoji: "🧠",
    groupModes: [
      { id: "chapter", label: "Theo chương" },
      { id: "domain", label: "Theo lĩnh vực" },
      { id: "category", label: "Theo chủ đề" }
    ],
    defaultGroupMode: "chapter",
    ...ctx.config
  };

  function getGrades() {
    return [...new Set((ctx.data.skills || []).map((s) => s.grade))].sort((a, b) => a - b);
  }

  function resolveGrade(state) {
    const grades = getGrades();
    if (ctx.getSelectedGrade) return ctx.getSelectedGrade(state, grades);
    const selected = state.selectedGrade ?? state.selectedLevel;
    if (grades.includes(selected)) return selected;
    return grades[0] || 1;
  }

  function setGrade(grade) {
    if (ctx.setSelectedGrade) ctx.setSelectedGrade(grade);
    else if (ctx.setSelectedLevel) ctx.setSelectedLevel(grade);
  }

  function notFound(msg) {
    return ctx.notFound ? ctx.notFound(msg) : `<section class="empty-state">${escapeHtml(msg)}</section>`;
  }

  function renderPage(state, options = {}) {
    const grades = getGrades();
    const activeGrade = options.grade ?? resolveGrade(state);
    const groupMode = options.groupMode || config.defaultGroupMode;
    const tree = buildMindMapTree(ctx.data.skills || [], activeGrade, groupMode);
    const completed = state.completedLessons || [];
    const doneTotal = tree.branches.reduce((n, b) => n + b.skills.filter((s) => completed.includes(s.id)).length, 0);
    const summer = buildSummerBranches(ctx.data.summerPacks);
    const expanded = options.expandAll !== false;

    const gradeTabs = grades.map((g) => {
      const count = (ctx.data.skills || []).filter((s) => s.grade === g).length;
      const active = g === activeGrade ? " active" : "";
      return `<button type="button" class="grade-tab${active}" data-mm-grade="${g}" aria-pressed="${g === activeGrade}">
        <strong>Lớp ${g}</strong><span>${count} bài</span>
      </button>`;
    }).join("");

    const modeTabs = config.groupModes.map((m) => {
      const active = m.id === groupMode ? " active" : "";
      return `<button type="button" class="mm-mode-tab${active}" data-mm-mode="${m.id}" aria-pressed="${m.id === groupMode}">${m.label}</button>`;
    }).join("");

    return `
      <section class="page-title mm-page-head">
        <span class="eyebrow">Mind Map · Tổng hợp kiến thức</span>
        <h1>Sơ đồ tư duy ${escapeHtml(config.subject)}</h1>
        <p>Nhìn toàn cảnh theo lớp và chủ đề — mỗi chương có sơ đồ riêng.</p>
      </section>
      <div class="mm-hub card-panel">
        <div class="mm-center">
          <span class="mm-center-emoji">${config.emoji}</span>
          <strong>${escapeHtml(config.subject)}</strong>
          <span>Lớp ${activeGrade} · ${doneTotal}/${tree.total} bài · ${tree.branches.length} chủ đề</span>
        </div>
        <div class="mm-hub-actions">
          <button type="button" class="btn secondary mm-toggle-all" data-expand="true">Mở tất cả</button>
          <button type="button" class="btn secondary mm-toggle-all" data-expand="false">Thu gọn</button>
          <a class="btn secondary" href="#/skills">Cây kỹ năng</a>
        </div>
      </div>
      <div class="grade-tabs mm-grade-tabs" role="group" aria-label="Chọn lớp">${gradeTabs}</div>
      <div class="mm-mode-tabs" role="group" aria-label="Cách nhóm">${modeTabs}</div>
      ${renderTopicCards(tree.branches)}
      <div class="mm-canvas" data-mm-grade="${activeGrade}" data-mm-mode="${groupMode}">
        <div class="mm-spine"></div>
        <div class="mm-branches">${tree.branches.map((b) => renderBranch(b, completed, expanded)).join("")}</div>
      </div>
      ${renderSummerSection(summer)}`;
  }

  function renderTopicPage(state, branchId, options = {}) {
    const groupMode = options.groupMode || config.defaultGroupMode;
    const branch = findBranch(ctx.data.skills || [], decodeURIComponent(branchId), groupMode);
    if (!branch) return notFound("Không tìm thấy chủ đề.");
    const map = buildTopicMindMap(branch, ctx.data.lessons);
    return renderTopicDetail(map, "#/mindmap");
  }

  function renderSkillPage(state, skillId) {
    const skill = (ctx.data.skills || []).find((s) => s.id === skillId);
    if (!skill) return notFound("Không tìm thấy bài học.");
    const map = buildSkillMindMap(skill, ctx.data.lessons);
    const branchId = makeBranchId(skill.grade, groupKey(skill, config.defaultGroupMode));
    return renderSkillDetail(map, `#/mindmap/topic/${encodeURIComponent(branchId)}`);
  }

  function renderSummerTopicPage(state, packId, topicId) {
    const pack = ctx.data.summerPacks?.[packId];
    if (!pack) return notFound("Không tìm thấy lộ trình ôn hè.");
    const map = buildSummerTopicMindMap(pack, topicId);
    if (!map) return notFound("Không tìm thấy chủ đề ôn hè.");
    map.packId = packId;
    return renderSummerTopicDetail(map, packId);
  }

  function chapterMindMapHref(skill, groupMode = config.defaultGroupMode) {
    if (!skill) return "#/mindmap";
    return `#/mindmap/topic/${encodeURIComponent(makeBranchId(skill.grade, groupKey(skill, groupMode)))}`;
  }

  function bindPage() {
    document.querySelectorAll("[data-mm-grade]").forEach((tab) => {
      tab.addEventListener("click", () => {
        if (tab.dataset.mmGrade) {
          setGrade(Number(tab.dataset.mmGrade));
          ctx.renderRoute?.();
        }
      });
    });
    document.querySelectorAll("[data-mm-mode]").forEach((tab) => {
      tab.addEventListener("click", () => {
        if (!tab.dataset.mmMode) return;
        ctx.setMindMapMode?.(tab.dataset.mmMode);
        ctx.renderRoute?.();
      });
    });
    document.querySelectorAll(".mm-branch-head").forEach((btn) => {
      btn.addEventListener("click", () => {
        const branch = btn.closest(".mm-branch");
        const open = branch.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open);
      });
    });
    document.querySelectorAll(".mm-toggle-all").forEach((btn) => {
      btn.addEventListener("click", () => {
        const expand = btn.dataset.expand === "true";
        document.querySelectorAll(".mm-branch").forEach((branch) => {
          branch.classList.toggle("is-open", expand);
          branch.querySelector(".mm-branch-head")?.setAttribute("aria-expanded", expand);
        });
      });
    });
    document.querySelectorAll(".mm-leaf-link[aria-disabled]").forEach((link) => {
      link.addEventListener("click", (e) => e.preventDefault());
    });
  }

  return {
    renderPage,
    renderTopicPage,
    renderSkillPage,
    renderSummerTopicPage,
    bindPage,
    chapterMindMapHref,
    makeBranchId,
    buildMindMapTree,
    buildSummerBranches
  };
}
