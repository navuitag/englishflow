/**
 * Interactive mind map — tổng hợp kiến thức theo lớp / chương / bài.
 * Dùng chung cho các dự án *Flow (mathflow, literatureflow, …).
 */

function groupKey(skill, mode) {
  if (mode === "domain") return skill.domain || skill.category || skill.chapter || "Khác";
  if (mode === "category") return skill.category || skill.litKind || skill.domain || skill.chapter || "Khác";
  return skill.chapter || skill.domain || skill.category || "Khác";
}

function isSkillUnlocked(skill, completed) {
  const prereq = skill.prerequisite || [];
  return prereq.every((id) => completed.includes(id));
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
        id: `g${grade}_${groups.size}`,
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
    branches: [...groups.values()].map((group) => ({
      ...group,
      count: group.skills.length
    }))
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
        href: `#/summer/${packId}/topic/${t.id}`
      }))
    }))
  };
}

function renderLeaf(skill, status) {
  const locked = status === "locked";
  const done = status === "done";
  const href = locked ? "#" : `#/lesson/${skill.id}`;
  return `
    <li class="mm-leaf mm-leaf--${status}">
      <a href="${href}" class="mm-leaf-link"${locked ? ' aria-disabled="true" tabindex="-1"' : ""}>
        <span class="mm-leaf-dot" aria-hidden="true"></span>
        <span class="mm-leaf-text">${escapeHtml(skill.title)}</span>
        ${done ? '<span class="mm-badge done">✓</span>' : locked ? '<span class="mm-badge lock">🔒</span>' : ""}
      </a>
    </li>
  `;
}

function renderBranch(branch, completed, expanded) {
  const openClass = expanded ? " is-open" : "";
  const doneCount = branch.skills.filter((s) => completed.includes(s.id)).length;
  const pct = branch.count ? Math.round((doneCount / branch.count) * 100) : 0;

  return `
    <article class="mm-branch${openClass}" data-branch-id="${escapeHtml(branch.id)}">
      <button type="button" class="mm-branch-head" aria-expanded="${expanded}">
        <span class="mm-branch-icon" aria-hidden="true">◉</span>
        <span class="mm-branch-meta">
          <strong>${escapeHtml(branch.label)}</strong>
          ${branch.book ? `<small>${escapeHtml(branch.book)}</small>` : ""}
        </span>
        <span class="mm-branch-stats">${doneCount}/${branch.count} · ${pct}%</span>
        <span class="mm-chevron" aria-hidden="true">›</span>
      </button>
      <div class="mm-branch-body">
        <ul class="mm-leaves">
          ${branch.skills.map((skill) => renderLeaf(skill, skillStatus(skill, completed))).join("")}
        </ul>
      </div>
    </article>
  `;
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
          <li><a href="${t.href}">${t.emoji ? `${t.emoji} ` : ""}${escapeHtml(t.label)}</a></li>
        `).join("")}
      </ul>
    </article>
  `).join("");

  return `
    <section class="mm-summer-section card-panel">
      <header class="mm-summer-head">
        <span class="tag">Ôn hè</span>
        <h2>${section.emoji} ${escapeHtml(section.label)}</h2>
        <p>Các lộ trình ôn hè — chủ đề tương tác và đề tổng hợp.</p>
      </header>
      <div class="mm-summer-grid">${packs}</div>
    </section>
  `;
}

let escapeHtml = (s) => String(s ?? "");

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

  function renderPage(state, options = {}) {
    const grades = getGrades();
    const activeGrade = options.grade ?? resolveGrade(state);
    const groupMode = options.groupMode || config.defaultGroupMode;
    const tree = buildMindMapTree(ctx.data.skills || [], activeGrade, groupMode);
    const completed = state.completedLessons || [];
    const doneTotal = tree.branches.reduce(
      (n, b) => n + b.skills.filter((s) => completed.includes(s.id)).length,
      0
    );
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

    const branches = tree.branches.map((b) => renderBranch(b, completed, expanded)).join("");

    return `
      <section class="page-title mm-page-head">
        <span class="eyebrow">Mind Map · Tổng hợp kiến thức</span>
        <h1>Sơ đồ tư duy ${escapeHtml(config.subject)}</h1>
        <p>Nhìn toàn cảnh theo lớp và chương — bấm nhánh để mở rộng, bấm bài để học ngay.</p>
      </section>

      <div class="mm-hub card-panel">
        <div class="mm-center">
          <span class="mm-center-emoji">${config.emoji}</span>
          <strong>${escapeHtml(config.subject)}</strong>
          <span>Lớp ${activeGrade} · ${doneTotal}/${tree.total} bài · ${tree.branches.length} nhánh</span>
        </div>
        <div class="mm-hub-actions">
          <button type="button" class="btn secondary mm-toggle-all" data-expand="true">Mở tất cả</button>
          <button type="button" class="btn secondary mm-toggle-all" data-expand="false">Thu gọn</button>
          <a class="btn secondary" href="#/skills">Cây kỹ năng</a>
        </div>
      </div>

      <div class="grade-tabs mm-grade-tabs" role="group" aria-label="Chọn lớp">${gradeTabs}</div>
      <div class="mm-mode-tabs" role="group" aria-label="Cách nhóm">${modeTabs}</div>

      <div class="mm-canvas" data-mm-grade="${activeGrade}" data-mm-mode="${groupMode}">
        <div class="mm-spine" aria-hidden="true"></div>
        <div class="mm-branches">${branches}</div>
      </div>

      ${renderSummerSection(summer)}
    `;
  }

  function bindPage(state) {
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

  return { renderPage, bindPage, buildMindMapTree, buildSummerBranches };
}
