export function renderVisualization(config = {}) {
  const type = config.visualization;
  if (!type) return "";
  return renderLegacyVisualization(config);
}

export function bindVisualizations() {
  // 2D-only visualizations; no WebGL scenes to mount.
}

function renderLegacyVisualization(config = {}) {
  const type = config.visualization;

  if (type === "presentSimple") {
    return wrap(
      renderTimeline("present"),
      renderFormula(config.formula || "S + V(s/es) + O"),
      "Thì hiện tại đơn diễn tả thói quen, sự thật hiển nhiên."
    );
  }
  if (type === "presentContinuous") {
    return wrap(
      renderTimeline("present"),
      renderFormula(config.formula || "S + am/is/are + V-ing"),
      "Hành động đang diễn ra ngay lúc nói."
    );
  }
  if (type === "pastSimple") {
    return wrap(
      renderTimeline("past"),
      renderFormula(config.formula || "S + V2/V-ed + O"),
      "Hành động đã kết thúc trong quá khứ."
    );
  }
  if (type === "futureSimple") {
    return wrap(
      renderTimeline("future"),
      renderFormula(config.formula || "S + will + V"),
      "Dự định hoặc dự đoán cho tương lai."
    );
  }
  if (type === "comparative") {
    return renderComparative(config.formula || "S + adj-er + than + N");
  }
  if (type === "superlative") {
    return renderSuperlative(config.formula || "S + the + adj-est");
  }
  if (type === "passive") {
    return renderPassive(config.formula || "S + to be + V3 (+ by O)");
  }
  if (type === "thereBe") {
    return renderThereBe(config.formula || "There is/are + N");
  }
  if (type === "presentPerfect") {
    return wrap(
      renderPerfectTimeline(),
      renderFormula(config.formula || "S + have/has + V3"),
      "Trải nghiệm bắt đầu trong quá khứ, còn liên quan tới hiện tại."
    );
  }
  if (type === "pastContinuous") {
    return wrap(
      renderTimeline("past"),
      renderFormula(config.formula || "S + was/were + V-ing"),
      "Hành động đang diễn ra tại một thời điểm trong quá khứ."
    );
  }
  if (type === "reportedSpeech") {
    return renderReported(config.formula || "S + said (that) + S + V");
  }

  return wrap("", renderFormula(config.formula || type), "");
}

function wrap(top, formula, caption) {
  return `
    <div class="viz grammar-viz">
      ${top}
      ${formula}
      ${caption ? `<p class="viz-note">${caption}</p>` : ""}
    </div>
  `;
}

const TOKEN_CLASS = [
  { test: /^s$/i, cls: "tok-subject", label: "Chủ ngữ" },
  { test: /(am|is|are|was|were|be|to be)/i, cls: "tok-be", label: "to be" },
  { test: /(will|do|does|did|the)/i, cls: "tok-aux", label: "Trợ từ" },
  { test: /(v|verb|ing|ed|v2|v3)/i, cls: "tok-verb", label: "Động từ" },
  { test: /(adj)/i, cls: "tok-adj", label: "Tính từ" },
  { test: /(o|n|than)/i, cls: "tok-object", label: "Tân ngữ" }
];

function classify(token) {
  const found = TOKEN_CLASS.find((rule) => rule.test.test(token.replace(/[()/-]/g, "")));
  return found ? found.cls : "tok-object";
}

export function renderFormula(formula) {
  const parts = String(formula).split("+").map((part) => part.trim()).filter(Boolean);
  const blocks = parts
    .map((part) => `<span class="formula-block ${classify(part)}">${part}</span>`)
    .join('<b class="formula-plus">+</b>');
  return `<div class="formula-strip">${blocks}</div>`;
}

function renderTimeline(active) {
  const points = [
    { key: "past", label: "Quá khứ" },
    { key: "present", label: "Hiện tại" },
    { key: "future", label: "Tương lai" }
  ];
  const dots = points
    .map((point) => `
      <div class="timeline-point${point.key === active ? " active" : ""}">
        <span class="timeline-dot"></span>
        <small>${point.label}</small>
      </div>
    `)
    .join("");
  return `<div class="timeline-viz"><div class="timeline-line"></div>${dots}</div>`;
}

function renderComparative(formula) {
  return `
    <div class="viz grammar-viz">
      <div class="compare-bars">
        <div class="compare-bar"><span style="height:45%"></span><small>A</small></div>
        <div class="compare-bar tall"><span style="height:80%"></span><small>B</small></div>
      </div>
      <p class="viz-note">B taller than A → "B is taller than A".</p>
      ${renderFormula(formula)}
    </div>
  `;
}

function renderSuperlative(formula) {
  return `
    <div class="viz grammar-viz">
      <div class="compare-bars">
        <div class="compare-bar"><span style="height:40%"></span><small>A</small></div>
        <div class="compare-bar"><span style="height:62%"></span><small>B</small></div>
        <div class="compare-bar tall"><span style="height:92%"></span><small>C</small></div>
      </div>
      <p class="viz-note">C cao nhất → "C is the tallest".</p>
      ${renderFormula(formula)}
    </div>
  `;
}

function renderThereBe(formula) {
  return `
    <div class="viz grammar-viz">
      <div class="therebe-grid">
        <div class="therebe-card">
          <span class="therebe-count">1</span>
          <strong>There is</strong>
          <small>a book</small>
        </div>
        <div class="therebe-card">
          <span class="therebe-count">3+</span>
          <strong>There are</strong>
          <small>books</small>
        </div>
      </div>
      ${renderFormula(formula)}
    </div>
  `;
}

function renderPerfectTimeline() {
  return `
    <div class="timeline-viz perfect">
      <div class="timeline-line"></div>
      <div class="timeline-point active">
        <span class="timeline-dot"></span>
        <small>Quá khứ</small>
      </div>
      <div class="timeline-point">
        <span class="timeline-dot arrow">→</span>
        <small>...</small>
      </div>
      <div class="timeline-point active">
        <span class="timeline-dot"></span>
        <small>Hiện tại</small>
      </div>
    </div>
  `;
}

function renderReported(formula) {
  return `
    <div class="viz grammar-viz">
      <div class="passive-flow">
        <div class="passive-card active">
          <span class="tag">Trực tiếp</span>
          <strong>"I am tired," she said.</strong>
        </div>
        <span class="passive-arrow">→</span>
        <div class="passive-card">
          <span class="tag">Tường thuật</span>
          <strong>She said she was tired.</strong>
        </div>
      </div>
      ${renderFormula(formula)}
    </div>
  `;
}

function renderPassive(formula) {
  return `
    <div class="viz grammar-viz">
      <div class="passive-flow">
        <div class="passive-card active">
          <span class="tag">Chủ động</span>
          <strong>Tom writes a letter.</strong>
        </div>
        <span class="passive-arrow">→</span>
        <div class="passive-card">
          <span class="tag">Bị động</span>
          <strong>A letter is written by Tom.</strong>
        </div>
      </div>
      ${renderFormula(formula)}
    </div>
  `;
}
