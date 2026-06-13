/**
 * Danh sách ứng dụng EdTech và cách tạo URL liên kết chéo.
 * Mỗi dự án copy file này và đặt CURRENT_APP_ID đúng với thư mục app.
 */
export const CURRENT_APP_ID = "englishflow";

export const EDTECH_APPS = [
  { id: "mathflow", name: "MathFlow VN", short: "Toán", emoji: "📐", folder: "mathflow", repo: "MathFlow", start: "#/home" },
  { id: "bioflow", name: "BioFlow VN", short: "Sinh học", emoji: "🧬", folder: "bioflow", repo: "bioflow", start: "#/home" },
  { id: "chemflow", name: "ChemFlow VN", short: "Hóa học", emoji: "⚗️", folder: "chemflow", repo: "chemflow", start: "#/home" },
  { id: "phyflow", name: "PhyFlow VN", short: "Vật lí", emoji: "⚡", folder: "phyflow", repo: "phyflow", start: "#/home" },
  { id: "literatureflow", name: "LiteratureFlow VN", short: "Ngữ văn", emoji: "📖", folder: "literatureflow", repo: "literatureflow", start: "#/home" },
  { id: "ITflow", name: "ITflow VN", short: "Tin học", emoji: "💻", folder: "ITflow", repo: "ITflow", start: "#/home" },
  { id: "englishflow", name: "EnglishFlow", short: "Tiếng Anh", emoji: "🇬🇧", folder: "englishflow", repo: "englishflow", start: "#/home" },
  { id: "engcoach", name: "EngCoach", short: "Học tiếng Anh trong 60 ngày", emoji: "🗣️", folder: "engcoach", repo: "engcoach", start: "#/dashboard" }
];

const FOLDER_IDS = new Set(EDTECH_APPS.map((app) => app.folder.toLowerCase()));

export const HUB_REPO = "edtech";

function appFolder(app) {
  return app.folder;
}

export function getAppUrl(app, currentAppId = CURRENT_APP_ID) {
  const override = typeof localStorage !== "undefined" && localStorage.getItem("edtech_hub_base");
  if (override) {
    const base = override.replace(/\/$/, "");
    return `${base}/${appFolder(app)}/index.html${app.start}`;
  }

  if (typeof window === "undefined") {
    return `../${appFolder(app)}/index.html${app.start}`;
  }

  const { hostname, pathname, protocol, port } = window.location;
  const portSuffix = port ? `:${port}` : "";

  if (hostname.endsWith(".github.io")) {
    return `${protocol}//${hostname}/${app.repo}/index.html${app.start}`;
  }

  const segments = pathname.split("/").filter(Boolean);
  const currentIdx = segments.findIndex((segment) => segment.toLowerCase() === String(currentAppId).toLowerCase());
  if (currentIdx >= 0) {
    const prefix = segments.slice(0, currentIdx).join("/");
    const root = prefix ? `/${prefix}` : "";
    return `${protocol}//${hostname}${portSuffix}${root}/${appFolder(app)}/index.html${app.start}`;
  }

  const nestedIdx = segments.findIndex((segment) => FOLDER_IDS.has(segment.toLowerCase()));
  if (nestedIdx >= 0) {
    const prefix = segments.slice(0, nestedIdx).join("/");
    const root = prefix ? `/${prefix}` : "";
    return `${protocol}//${hostname}${portSuffix}${root}/${appFolder(app)}/index.html${app.start}`;
  }

  return `../${appFolder(app)}/index.html${app.start}`;
}

export function getHubUrl(currentAppId = CURRENT_APP_ID) {
  const override = typeof localStorage !== "undefined" && localStorage.getItem("edtech_hub_base");
  if (override) {
    const base = override.replace(/\/$/, "");
    return `${base}/${HUB_REPO}/index.html`;
  }

  if (typeof window === "undefined") {
    return `../${HUB_REPO}/index.html`;
  }

  const { hostname, pathname, protocol, port } = window.location;
  const portSuffix = port ? `:${port}` : "";

  if (hostname.endsWith(".github.io")) {
    return `${protocol}//${hostname}/${HUB_REPO}/`;
  }

  const segments = pathname.split("/").filter(Boolean);
  const currentIdx = segments.findIndex((segment) =>
    segment.toLowerCase() === String(currentAppId).toLowerCase()
    || FOLDER_IDS.has(segment.toLowerCase())
  );
  if (currentIdx >= 0) {
    const prefix = segments.slice(0, currentIdx).join("/");
    const root = prefix ? `/${prefix}` : "";
    return `${protocol}//${hostname}${portSuffix}${root}/${HUB_REPO}/index.html`;
  }

  return `../${HUB_REPO}/index.html`;
}

export function listApps(currentAppId = CURRENT_APP_ID) {
  return EDTECH_APPS.map((app) => ({
    ...app,
    url: getAppUrl(app, currentAppId),
    isCurrent: app.id === currentAppId || app.folder.toLowerCase() === String(currentAppId).toLowerCase()
  }));
}
