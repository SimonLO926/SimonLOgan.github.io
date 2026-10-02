const DEFAULTS = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  hue: 0,
  blur: 0,
  invert: 0,
  opacity: 100,
  temperature: 0,
  tint: 0,
  vignette: 0,
  grain: 0,
  fade: 0,
  rotate: 0,
  flipH: false,
  flipV: false
};

const GEOMETRY_KEYS = ["rotate", "flipH", "flipV"];
const LOOK_KEYS = Object.keys(DEFAULTS).filter((key) => !GEOMETRY_KEYS.includes(key));

const PRESETS = [
  { id: "original", name: "原片", en: "Original", values: {} },
  { id: "vivid", name: "鮮明", en: "Vivid", values: { brightness: 106, contrast: 118, saturate: 145 } },
  { id: "golden", name: "暖陽", en: "Golden", values: { brightness: 108, contrast: 106, saturate: 122, sepia: 16, temperature: 42, fade: 8 } },
  { id: "cool", name: "冷調", en: "Cool", values: { brightness: 102, contrast: 112, saturate: 92, temperature: -48, tint: 10 } },
  { id: "film", name: "底片", en: "Portra", values: { brightness: 104, contrast: 108, saturate: 88, sepia: 10, temperature: 14, grain: 22, vignette: 28, fade: 16 } },
  { id: "vintage", name: "復古", en: "Vintage", values: { brightness: 110, contrast: 96, saturate: 78, sepia: 42, temperature: 22, grain: 18, vignette: 36, fade: 18 } },
  { id: "mono", name: "黑白", en: "Mono", values: { contrast: 118, grayscale: 100, vignette: 22, grain: 12 } },
  { id: "noir", name: "夜色", en: "Noir", values: { brightness: 88, contrast: 142, grayscale: 100, vignette: 58, grain: 20 } },
  { id: "soft", name: "柔光", en: "Soft", values: { brightness: 112, contrast: 90, saturate: 92, blur: 0.4, fade: 14, temperature: 8 } },
  { id: "fade", name: "褪色", en: "Fade", values: { brightness: 114, contrast: 84, saturate: 72, fade: 40, grain: 10, temperature: 6 } },
  { id: "sakura", name: "櫻花", en: "Sakura", values: { brightness: 108, contrast: 102, saturate: 118, hue: 346, temperature: 12, tint: -18, fade: 10 } },
  { id: "teal", name: "青橙", en: "Teal", values: { contrast: 120, saturate: 126, temperature: 28, tint: 22, vignette: 32 } },
  { id: "japan", name: "日系", en: "Airy", values: { brightness: 114, contrast: 90, saturate: 70, temperature: 6, fade: 26, grain: 8 } },
  { id: "lomo", name: "LOMO", en: "Lomo", values: { brightness: 104, contrast: 132, saturate: 155, vignette: 62, temperature: 12, grain: 16 } },
  { id: "drama", name: "戲劇", en: "Drama", values: { brightness: 96, contrast: 148, saturate: 116, vignette: 40, temperature: -8 } }
];

const GROUPS = [
  {
    id: "light",
    label: "光線",
    en: "Light",
    controls: [
      { key: "brightness", name: "亮度", min: 0, max: 200, step: 1, unit: "%" },
      { key: "contrast", name: "對比", min: 0, max: 200, step: 1, unit: "%" },
      { key: "fade", name: "褪色", min: 0, max: 100, step: 1, unit: "%" }
    ]
  },
  {
    id: "color",
    label: "色彩",
    en: "Color",
    controls: [
      { key: "saturate", name: "飽和", min: 0, max: 200, step: 1, unit: "%" },
      { key: "temperature", name: "色溫", min: -100, max: 100, step: 1, unit: "", signed: true, ends: ["冷", "暖"] },
      { key: "tint", name: "色調", min: -100, max: 100, step: 1, unit: "", signed: true, ends: ["洋紅", "綠"] },
      { key: "hue", name: "色相", min: 0, max: 360, step: 1, unit: "°" },
      { key: "sepia", name: "復古棕", min: 0, max: 100, step: 1, unit: "%" },
      { key: "grayscale", name: "黑白", min: 0, max: 100, step: 1, unit: "%" }
    ]
  },
  {
    id: "effect",
    label: "效果",
    en: "Effect",
    controls: [
      { key: "vignette", name: "暗角", min: 0, max: 100, step: 1, unit: "%" },
      { key: "grain", name: "顆粒", min: 0, max: 100, step: 1, unit: "%" },
      { key: "blur", name: "模糊", min: 0, max: 12, step: 0.1, unit: "px" },
      { key: "invert", name: "反相", min: 0, max: 100, step: 1, unit: "%" },
      { key: "opacity", name: "不透明", min: 0, max: 100, step: 1, unit: "%" }
    ]
  }
];

const ALL_CONTROLS = GROUPS.flatMap((group) => group.controls);

const $ = (id) => document.getElementById(id);

const els = {
  fileName: $("fileName"),
  fileMeta: $("fileMeta"),
  peekBtn: $("peekBtn"),
  compareBtn: $("compareBtn"),
  undoBtn: $("undoBtn"),
  redoBtn: $("redoBtn"),
  resetBtn: $("resetBtn"),
  downloadJpg: $("downloadJpg"),
  downloadPng: $("downloadPng"),
  empty: $("empty"),
  samples: $("samples"),
  viewer: $("viewer"),
  loading: $("loading"),
  print: $("print"),
  baseImg: $("baseImg"),
  fxImg: $("fxImg"),
  clip: $("clip"),
  look: $("look"),
  handle: $("handle"),
  dropveil: $("dropveil"),
  compareRange: $("compareRange"),
  filmdock: $("filmdock"),
  filmCount: $("filmCount"),
  filmstrip: $("filmstrip"),
  applyAll: $("applyAll"),
  presets: $("presets"),
  controls: $("controls"),
  imageInput: $("imageInput"),
  toast: $("toast"),
  pickBtn: $("pickBtn"),
  addMore: $("addMore"),
  stage: $("stage")
};

let images = [];
let activeId = null;
let uid = 1;
let samples = [];
let grainCanvas = null;
let compareOn = false;
let peekOriginal = false;
let compareDrag = false;
let toastTimer = 0;
let filmstripSignature = "";
let filmstripScrollId = null;
let slidingKey = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function normalize(adj) {
  const next = clone(DEFAULTS);
  if (!adj) return next;
  for (const key of Object.keys(DEFAULTS)) {
    if (adj[key] == null) continue;
    next[key] = key === "flipH" || key === "flipV" ? Boolean(adj[key]) : Number(adj[key]);
  }
  next.rotate = ((Math.round(next.rotate) % 360) + 360) % 360;
  return next;
}

function active() {
  return images.find((item) => item.id === activeId) || null;
}

function quantize(value, control) {
  const step = control.step || 1;
  const snapped = Math.round((value - control.min) / step) * step + control.min;
  const digits = step < 1 ? 1 : 0;
  return Number(Math.min(control.max, Math.max(control.min, snapped)).toFixed(digits));
}

function formatNumber(control, value) {
  const n = Number(value);
  if (control.step && control.step < 1) {
    const text = n.toFixed(1);
    return control.signed && n > 0 ? `+${text}` : text;
  }
  const rounded = Math.round(n);
  return control.signed && rounded > 0 ? `+${rounded}` : String(rounded);
}

function buildFilter(adj, blurPx = adj.blur) {
  const blur = Math.round(blurPx * 100) / 100;
  return [
    `brightness(${adj.brightness}%)`,
    `contrast(${adj.contrast}%)`,
    `saturate(${adj.saturate}%)`,
    `grayscale(${adj.grayscale}%)`,
    `sepia(${adj.sepia}%)`,
    `hue-rotate(${adj.hue}deg)`,
    `blur(${blur}px)`,
    `invert(${adj.invert}%)`
  ].join(" ");
}

function signedOverlay(value, positive, negative, strength) {
  if (!value) return { color: "transparent", alpha: 0 };
  const rgb = value > 0 ? positive : negative;
  return {
    color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
    alpha: (Math.abs(value) / 100) * strength
  };
}

function vignetteModel(amount) {
  const n = Math.max(0, Math.min(100, Number(amount) || 0));
  if (!n) return { inner: 100, alpha: 0 };
  return {
    inner: 72 - n * 0.36,
    alpha: 0.22 + (n / 100) * 0.68
  };
}

function lookModel(adj, blurPx) {
  const a = normalize(adj);
  const vignette = vignetteModel(a.vignette);
  return {
    adj: a,
    filter: buildFilter(a, blurPx == null ? a.blur : blurPx),
    temp: signedOverlay(a.temperature, [255, 145, 46], [64, 150, 255], 0.7),
    tint: signedOverlay(a.tint, [64, 190, 115], [224, 72, 168], 0.55),
    fadeAlpha: (a.fade / 100) * 0.34,
    vignette,
    vignetteCss: vignette.alpha
      ? `radial-gradient(ellipse at center, rgba(0,0,0,0) ${vignette.inner}%, rgba(0,0,0,${vignette.alpha}) 100%)`
      : "none",
    grainAlpha: (a.grain / 100) * 0.48,
    opacity: a.opacity / 100
  };
}

function applyLook(el, adj) {
  if (!el) return;
  const model = lookModel(adj);
  el.style.setProperty("--filter", model.filter);
  el.style.setProperty("--temp-color", model.temp.color);
  el.style.setProperty("--temp-alpha", String(model.temp.alpha));
  el.style.setProperty("--tint-color", model.tint.color);
  el.style.setProperty("--tint-alpha", String(model.tint.alpha));
  el.style.setProperty("--fade-alpha", String(model.fadeAlpha));
  el.style.setProperty("--vignette", model.vignetteCss);
  el.style.setProperty("--grain-alpha", String(model.grainAlpha));
  el.style.opacity = String(model.opacity);
}

function presetAdjustments(preset, geometry) {
  return normalize({
    ...DEFAULTS,
    ...preset.values,
    rotate: geometry.rotate,
    flipH: geometry.flipH,
    flipV: geometry.flipV
  });
}

function matchingPresetId(adj) {
  const current = normalize(adj);
  for (const preset of PRESETS) {
    const merged = presetAdjustments(preset, current);
    if (LOOK_KEYS.every((key) => Math.abs(merged[key] - current[key]) < 0.051)) return preset.id;
  }
  return null;
}

function paintTrack(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const val = Number(input.value);
  const pct = (n) => ((n - min) / (max - min)) * 100;
  let start = 0;
  let end = pct(val);
  if (min < 0 && max > 0) {
    const zero = pct(0);
    const current = pct(val);
    start = Math.min(zero, current);
    end = Math.max(zero, current);
  }
  input.style.setProperty("--a", `${start}%`);
  input.style.setProperty("--b", `${end}%`);
}

function toast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}

function createGrain() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const pixels = ctx.createImageData(128, 128);
  let seed = 20260326;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < pixels.data.length; i += 4) {
    const n = rand() * 255;
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = n;
    pixels.data[i + 3] = 255;
  }
  ctx.putImageData(pixels, 0, 0);
  grainCanvas = canvas;
  document.documentElement.style.setProperty("--grain-url", `url("${canvas.toDataURL("image/png")}")`);
}

function displayName(name) {
  return String(name || "未命名").replace(/\.[^.]+$/, "");
}

function safeName(name) {
  const cleaned = String(name || "photo").replace(/[\\/:*?"<>|\n\r]/g, "").trim();
  return cleaned.slice(0, 80) || "photo";
}

function updateMeta() {
  const item = active();
  if (!item) {
    els.fileName.textContent = "尚未選擇照片";
    els.fileMeta.textContent = "拖放、貼上或從相簿選擇";
    return;
  }
  els.fileName.textContent = displayName(item.name);
  const preset = PRESETS.find((entry) => entry.id === matchingPresetId(item.adjustments));
  const dims = item.ready ? `${item.img.naturalWidth}×${item.img.naturalHeight}` : "讀取中";
  const angle = item.adjustments.rotate ? ` · ${item.adjustments.rotate}°` : "";
  els.fileMeta.textContent = `${dims} · ${preset ? preset.name : "自訂"}${angle}`;
}

function updateHistoryButtons() {
  const item = active();
  els.undoBtn.disabled = !item || item.historyIndex <= 0;
  els.redoBtn.disabled = !item || item.historyIndex >= item.history.length - 1;
}

function updateChrome() {
  const item = active();
  const has = Boolean(item);
  document.querySelector(".toolbar-actions").hidden = !has;
  els.peekBtn.disabled = !has;
  els.compareBtn.disabled = !has;
  els.resetBtn.disabled = !has;
  els.downloadJpg.disabled = !has || !item.ready;
  els.downloadPng.disabled = !has || !item.ready;
  els.applyAll.disabled = images.length < 2;
  document.querySelectorAll(".xform button").forEach((button) => {
    button.disabled = !has;
  });
  updateHistoryButtons();
}

function syncControls() {
  const item = active();
  const adj = item ? item.adjustments : DEFAULTS;
  for (const control of ALL_CONTROLS) {
    const row = els.controls.querySelector(`[data-key="${control.key}"]`);
    if (!row) continue;
    const range = row.querySelector(".range");
    const num = row.querySelector(".num");
    if (document.activeElement !== range) range.value = adj[control.key];
    if (document.activeElement !== num) num.value = formatNumber(control, adj[control.key]);
    range.disabled = !item;
    num.disabled = !item;
    paintTrack(range);
    row.classList.toggle("is-changed", Number(adj[control.key]) !== DEFAULTS[control.key]);
  }
  const flipH = $("flipH");
  const flipV = $("flipV");
  const readout = $("rotateReadout");
  if (flipH) flipH.classList.toggle("is-on", Boolean(adj.flipH));
  if (flipV) flipV.classList.toggle("is-on", Boolean(adj.flipV));
  if (readout) readout.textContent = `Frame · ${adj.rotate || 0}°`;
  updateChrome();
}

function updatePresetActive() {
  const id = active() ? matchingPresetId(active().adjustments) : null;
  els.presets.querySelectorAll(".preset").forEach((button) => {
    const on = button.dataset.id === id;
    button.classList.toggle("is-active", on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  });
  updateMeta();
}

function refreshLooks() {
  const item = active();
  if (item) applyLook(els.look, item.adjustments);
  els.clip.classList.toggle("show-checker", Boolean(item && item.adjustments.opacity < 100));
  renderFilmstrip();
}

function pushHistory() {
  const item = active();
  if (!item) return;
  const snap = clone(item.adjustments);
  if (same(item.history[item.historyIndex], snap)) return;
  item.history = item.history.slice(0, item.historyIndex + 1);
  item.history.push(snap);
  if (item.history.length > 50) item.history.shift();
  item.historyIndex = item.history.length - 1;
  updateHistoryButtons();
}

function restoreHistory(nextIndex) {
  const item = active();
  if (!item) return;
  item.historyIndex = nextIndex;
  item.adjustments = clone(item.history[nextIndex]);
  syncControls();
  refreshLooks();
  updatePresetActive();
  layout();
  updateCompare();
}

function undo() {
  const item = active();
  if (!item || item.historyIndex <= 0) return;
  restoreHistory(item.historyIndex - 1);
}

function redo() {
  const item = active();
  if (!item || item.historyIndex >= item.history.length - 1) return;
  restoreHistory(item.historyIndex + 1);
}

function setKey(control, raw, commit) {
  const item = active();
  if (!item) return;
  item.adjustments[control.key] = quantize(Number(raw), control);
  syncControls();
  refreshLooks();
  updatePresetActive();
  if (commit) pushHistory();
}

function layout() {
  const item = active();
  if (!item?.ready || !item.img.naturalWidth || els.viewer.hidden) return;
  const style = getComputedStyle(els.viewer);
  const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const maxW = Math.max(80, els.viewer.clientWidth - padX);
  const maxH = Math.max(80, els.viewer.clientHeight - padY);
  const nw = item.img.naturalWidth;
  const nh = item.img.naturalHeight;
  const turned = item.adjustments.rotate % 180 !== 0;
  const frameW = turned ? nh : nw;
  const frameH = turned ? nw : nh;
  const scale = Math.min(maxW / frameW, maxH / frameH);
  const dispW = Math.max(1, Math.round(frameW * scale));
  const dispH = Math.max(1, Math.round(frameH * scale));
  els.print.style.width = `${dispW}px`;
  els.print.style.height = `${dispH}px`;
  const imgW = turned ? dispH : dispW;
  const imgH = turned ? dispW : dispH;
  const transform = `translate(-50%, -50%) rotate(${item.adjustments.rotate}deg) scale(${item.adjustments.flipH ? -1 : 1}, ${item.adjustments.flipV ? -1 : 1})`;
  for (const img of [els.baseImg, els.fxImg]) {
    img.style.width = `${imgW}px`;
    img.style.height = `${imgH}px`;
    img.style.transform = transform;
  }
}

function updateCompare() {
  const peek = peekOriginal;
  const on = compareOn && !peek && Boolean(active());
  els.print.classList.toggle("is-comparing", on);
  els.compareBtn.classList.toggle("is-on", compareOn);
  els.compareBtn.setAttribute("aria-pressed", compareOn ? "true" : "false");
  els.peekBtn.classList.toggle("is-on", peek);
  els.compareRange.disabled = !on;
  if (!on) {
    els.clip.style.clipPath = peek ? "inset(0 0 0 100%)" : "none";
    els.handle.hidden = true;
    return;
  }
  const split = Number(els.compareRange.value);
  els.clip.style.clipPath = `inset(0 0 0 ${split}%)`;
  els.handle.hidden = false;
  els.handle.style.left = `${split}%`;
  els.handle.querySelector(".before").hidden = split < 12;
  els.handle.querySelector(".after").hidden = split > 88;
}

function moveCompare(event) {
  const rect = els.print.getBoundingClientRect();
  if (!rect.width) return;
  const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
  els.compareRange.value = String((x / rect.width) * 100);
  updateCompare();
}

function renderFilmstrip() {
  const signature = images.map((item) => item.id).join(",");
  if (filmstripSignature !== signature) {
    const scroll = els.filmstrip.scrollLeft;
    filmstripSignature = signature;
    els.filmstrip.replaceChildren();
    for (const item of images) {
      const thumb = document.createElement("div");
      thumb.className = "thumb";
      thumb.dataset.id = String(item.id);
      thumb.innerHTML = `
        <button type="button" class="thumb-main">
          <span class="swatch look">
            <img class="fx" alt="" draggable="false">
            <span class="layer temp"></span>
            <span class="layer tint"></span>
            <span class="layer fade"></span>
            <span class="layer vignette"></span>
            <span class="layer grain"></span>
          </span>
          <span class="tname"></span>
        </button>
        <button type="button" class="thumb-x" aria-label="移除此照片">×</button>
      `;
      thumb.querySelector(".thumb-main").addEventListener("click", () => selectImage(item.id));
      thumb.querySelector(".thumb-x").addEventListener("click", (event) => {
        event.stopPropagation();
        removeImage(item.id);
      });
      els.filmstrip.appendChild(thumb);
    }
    els.filmstrip.scrollLeft = scroll;
  }

  for (const item of images) {
    const thumb = els.filmstrip.querySelector(`[data-id="${item.id}"]`);
    if (!thumb) continue;
    thumb.classList.toggle("is-active", item.id === activeId);
    const img = thumb.querySelector("img");
    if (img.getAttribute("src") !== item.url) img.src = item.url;
    thumb.querySelector(".tname").textContent = displayName(item.name);
    applyLook(thumb.querySelector(".look"), item.adjustments);
  }

  const has = images.length > 0;
  els.filmdock.hidden = !has;
  els.filmCount.textContent = has ? `${images.length} 張照片` : "照片";
  if (activeId && activeId !== filmstripScrollId) {
    filmstripScrollId = activeId;
    const current = els.filmstrip.querySelector(`[data-id="${activeId}"]`);
    if (current) {
      const left = current.offsetLeft;
      const right = left + current.offsetWidth;
      if (left < els.filmstrip.scrollLeft) els.filmstrip.scrollLeft = left;
      else if (right > els.filmstrip.scrollLeft + els.filmstrip.clientWidth) {
        els.filmstrip.scrollLeft = right - els.filmstrip.clientWidth;
      }
    }
  }
  if (!activeId) filmstripScrollId = null;
}

function showEmpty() {
  activeId = null;
  els.viewer.hidden = true;
  els.empty.hidden = false;
  els.filmdock.hidden = true;
  compareOn = false;
  peekOriginal = false;
  updateCompare();
  updateMeta();
  updatePresetActive();
  syncControls();
  renderFilmstrip();
}

function selectImage(id) {
  const item = images.find((entry) => entry.id === id);
  if (!item) return;
  activeId = id;
  els.baseImg.src = item.url;
  els.fxImg.src = item.url;
  els.baseImg.alt = `${displayName(item.name)} 原圖`;
  els.fxImg.alt = `${displayName(item.name)} 的濾鏡預覽`;
  els.empty.hidden = true;
  els.viewer.hidden = false;
  const ready = Boolean(item.ready && item.img.naturalWidth);
  els.loading.hidden = ready;
  els.print.hidden = !ready;
  document.querySelectorAll(".preset .swatch img").forEach((img) => {
    img.src = item.url;
  });
  if (ready) layout();
  syncControls();
  refreshLooks();
  updatePresetActive();
  updateCompare();
}

function removeImage(id) {
  const index = images.findIndex((item) => item.id === id);
  if (index < 0) return;
  const [item] = images.splice(index, 1);
  if (activeId === id) {
    const next = images[Math.min(index, images.length - 1)];
    if (next) selectImage(next.id);
    else showEmpty();
  } else {
    renderFilmstrip();
    updateChrome();
  }
  URL.revokeObjectURL(item.url);
}

function addFiles(fileList, { announce = true } = {}) {
  const list = [...fileList].filter((file) => /^image\//.test(file.type));
  if (!list.length) {
    toast("請選擇圖片檔案");
    return Promise.resolve([]);
  }
  const created = list.map((file) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const item = {
      id: uid++,
      name: file.name || `未命名-${uid}.jpg`,
      url,
      img,
      ready: false,
      adjustments: clone(DEFAULTS),
      history: [clone(DEFAULTS)],
      historyIndex: 0
    };
    images.push(item);
    img.addEventListener("load", () => {
      item.ready = true;
      if (item.id === activeId) {
        els.loading.hidden = true;
        els.print.hidden = false;
        layout();
        updateMeta();
        updateChrome();
      }
      renderFilmstrip();
    });
    img.addEventListener("error", () => {
      toast(`無法讀取 ${displayName(item.name)}`);
      removeImage(item.id);
    });
    img.src = url;
    return item;
  });
  selectImage(created[0].id);
  if (announce) toast(created.length > 1 ? `已加入 ${created.length} 張照片` : "已加入照片");
  return Promise.all(created.map((item) => new Promise((resolve) => {
    if (item.ready) {
      resolve(item);
      return;
    }
    item.img.addEventListener("load", () => resolve(item), { once: true });
    item.img.addEventListener("error", () => resolve(null), { once: true });
  }))).then((items) => items.filter(Boolean));
}

function renderSampleButtons() {
  els.samples.replaceChildren();
  for (const sample of samples) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sample";
    button.innerHTML = `<img alt="" draggable="false"><span></span>`;
    button.querySelector("img").src = sample.url;
    button.querySelector("span").textContent = sample.name;
    button.addEventListener("click", () => addFiles([
      new File([sample.blob], `${sample.name}.jpg`, { type: "image/jpeg" })
    ], { announce: false }));
    els.samples.appendChild(button);
  }
}

function setPresetSources(url) {
  els.presets.querySelectorAll(".preset img").forEach((img) => {
    if (!img.getAttribute("src")) img.src = url;
  });
}

function buildPresets() {
  els.presets.replaceChildren();
  for (const preset of PRESETS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preset";
    button.dataset.id = preset.id;
    button.setAttribute("role", "option");
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `
      <span class="swatch look">
        <img class="fx" alt="" draggable="false">
        <span class="layer temp"></span>
        <span class="layer tint"></span>
        <span class="layer fade"></span>
        <span class="layer vignette"></span>
        <span class="layer grain"></span>
      </span>
      <span class="pname">${preset.name}<small>${preset.en}</small></span>
    `;
    applyLook(button.querySelector(".look"), presetAdjustments(preset, DEFAULTS));
    button.addEventListener("click", () => applyPreset(preset));
    els.presets.appendChild(button);
  }
}

async function applyPreset(preset) {
  if (!active()) {
    if (!samples[0]) return;
    await addFiles([
      new File([samples[0].blob], `${samples[0].name}.jpg`, { type: "image/jpeg" })
    ], { announce: false });
  }
  const item = active();
  if (!item) return;
  item.adjustments = presetAdjustments(preset, item.adjustments);
  pushHistory();
  syncControls();
  refreshLooks();
  updatePresetActive();
}

function buildControls() {
  for (const group of GROUPS) {
    const section = document.createElement("section");
    section.className = "group";
    section.innerHTML = `<header><h3>${group.label}</h3><span>${group.en}</span></header>`;
    for (const control of group.controls) {
      const row = document.createElement("div");
      row.className = "slider";
      row.dataset.key = control.key;
      row.innerHTML = `
        <div class="slider-top">
          <span class="slider-name" title="雙擊重設"></span>
          <span class="slider-val">
            <input class="num" type="text" inputmode="decimal" aria-label="${control.name}數值" autocomplete="off">
            <span class="unit"></span>
          </span>
        </div>
        <input class="range" type="range" min="${control.min}" max="${control.max}" step="${control.step}" value="${DEFAULTS[control.key]}" aria-label="${control.name}">
        ${control.ends ? `<div class="slider-scale"><span>${control.ends[0]}</span><span>${control.ends[1]}</span></div>` : ""}
      `;
      row.querySelector(".slider-name").textContent = control.name;
      row.querySelector(".unit").textContent = control.unit;
      const range = row.querySelector(".range");
      const num = row.querySelector(".num");
      range.addEventListener("input", () => setKey(control, range.value, false));
      range.addEventListener("pointerdown", () => {
        slidingKey = control.key;
      });
      range.addEventListener("keyup", () => pushHistory());
      range.addEventListener("dblclick", () => setKey(control, DEFAULTS[control.key], true));
      num.addEventListener("focus", () => num.select());
      num.addEventListener("input", () => {
        const n = Number(String(num.value).replace(/^\+/, ""));
        if (!Number.isFinite(n)) return;
        setKey(control, n, false);
      });
      num.addEventListener("change", () => {
        const n = Number(String(num.value).replace(/^\+/, ""));
        setKey(control, Number.isFinite(n) ? n : DEFAULTS[control.key], true);
        const item = active();
        if (item) num.value = formatNumber(control, item.adjustments[control.key]);
      });
      row.querySelector(".slider-name").addEventListener("dblclick", () => {
        setKey(control, DEFAULTS[control.key], true);
      });
      section.appendChild(row);
    }
    els.controls.appendChild(section);
  }

  const frame = document.createElement("section");
  frame.className = "group";
  frame.innerHTML = `
    <header><h3>構圖</h3><span id="rotateReadout">Frame · 0°</span></header>
    <div class="xform">
      <button type="button" id="rotLeft" title="向左旋轉">↺<span>左轉</span></button>
      <button type="button" id="rotRight" title="向右旋轉">↻<span>右轉</span></button>
      <button type="button" id="flipH" title="水平翻轉">⇋<span>水平</span></button>
      <button type="button" id="flipV" title="垂直翻轉">⇅<span>垂直</span></button>
    </div>
  `;
  els.controls.appendChild(frame);
  $("rotLeft").addEventListener("click", () => rotateBy(-90));
  $("rotRight").addEventListener("click", () => rotateBy(90));
  $("flipH").addEventListener("click", () => toggleFlip("flipH"));
  $("flipV").addEventListener("click", () => toggleFlip("flipV"));
}

function rotateBy(delta) {
  const item = active();
  if (!item) return;
  item.adjustments.rotate = (item.adjustments.rotate + delta + 360) % 360;
  pushHistory();
  syncControls();
  layout();
  updateMeta();
}

function toggleFlip(key) {
  const item = active();
  if (!item) return;
  item.adjustments[key] = !item.adjustments[key];
  pushHistory();
  syncControls();
  layout();
}

function resetAll() {
  const item = active();
  if (!item) return;
  item.adjustments = clone(DEFAULTS);
  pushHistory();
  syncControls();
  refreshLooks();
  updatePresetActive();
  layout();
}

function applyAll() {
  const item = active();
  if (!item || images.length < 2) return;
  for (const image of images) {
    if (image.id === item.id) continue;
    image.adjustments = normalize({
      ...item.adjustments,
      rotate: image.adjustments.rotate,
      flipH: image.adjustments.flipH,
      flipV: image.adjustments.flipV
    });
    image.history = image.history.slice(0, image.historyIndex + 1);
    image.history.push(clone(image.adjustments));
    image.historyIndex = image.history.length - 1;
  }
  renderFilmstrip();
  toast("已把色調套用到全部照片");
}

function paintWash(ctx, w, h, overlay, mode) {
  if (!overlay.alpha) return;
  ctx.save();
  ctx.globalCompositeOperation = mode;
  ctx.globalAlpha = overlay.alpha;
  ctx.fillStyle = overlay.color;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function paintVignette(ctx, w, h, model) {
  if (!model.vignette.alpha) return;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(w / 2, h / 2);
  const reach = Math.SQRT2;
  const inner = (model.vignette.inner / 100) * reach;
  const gradient = ctx.createRadialGradient(0, 0, inner, 0, 0, reach);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, `rgba(0,0,0,${model.vignette.alpha})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(-1, -1, 2, 2);
  ctx.restore();
}

function paintGrain(ctx, w, h, alpha) {
  if (!alpha || !grainCanvas) return;
  const tile = Math.max(24, Math.round(w * 0.18));
  const scaled = document.createElement("canvas");
  scaled.width = tile;
  scaled.height = tile;
  const g = scaled.getContext("2d");
  g.imageSmoothingEnabled = true;
  g.drawImage(grainCanvas, 0, 0, tile, tile);
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = alpha;
  ctx.fillStyle = ctx.createPattern(scaled, "repeat");
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function renderCanvas(item, mime) {
  const a = normalize(item.adjustments);
  const srcW = item.img.naturalWidth;
  const srcH = item.img.naturalHeight;
  const turned = a.rotate % 180 !== 0;
  let outW = turned ? srcH : srcW;
  let outH = turned ? srcW : srcH;
  const fit = Math.min(1, 8192 / Math.max(outW, outH));
  outW = Math.max(1, Math.round(outW * fit));
  outH = Math.max(1, Math.round(outH * fit));
  const drawW = turned ? outH : outW;
  const drawH = turned ? outW : outH;
  const cssW = parseFloat(els.fxImg.style.width) || srcW;
  const blurPx = a.blur * (drawW / cssW);
  const model = lookModel(a, blurPx);

  const layer = document.createElement("canvas");
  layer.width = outW;
  layer.height = outH;
  const ctx = layer.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.save();
  ctx.translate(outW / 2, outH / 2);
  ctx.rotate((a.rotate * Math.PI) / 180);
  ctx.scale(a.flipH ? -1 : 1, a.flipV ? -1 : 1);
  ctx.filter = model.filter;
  ctx.drawImage(item.img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.filter = "none";
  ctx.restore();
  paintWash(ctx, outW, outH, model.temp, "soft-light");
  paintWash(ctx, outW, outH, model.tint, "soft-light");
  paintWash(ctx, outW, outH, { color: "rgb(255,248,240)", alpha: model.fadeAlpha }, "screen");
  paintVignette(ctx, outW, outH, model);
  paintGrain(ctx, outW, outH, model.grainAlpha);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const out = canvas.getContext("2d");
  if (mime === "image/jpeg") {
    out.fillStyle = "#ffffff";
    out.fillRect(0, 0, outW, outH);
  }
  out.globalAlpha = model.opacity;
  out.drawImage(layer, 0, 0);
  return { canvas, scaled: fit < 0.999 };
}

function canvasToBlob(canvas, mime) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("empty"))), mime, 0.92);
  });
}

function saveBlob(blob, filename) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2500);
}

async function download(mime) {
  const item = active();
  if (!item?.ready) return;
  const button = mime === "image/jpeg" ? els.downloadJpg : els.downloadPng;
  const previous = button.textContent;
  button.disabled = true;
  button.textContent = "處理中";
  try {
    const { canvas, scaled } = renderCanvas(item, mime);
    const blob = await canvasToBlob(canvas, mime);
    const ext = mime === "image/jpeg" ? "jpg" : "png";
    saveBlob(blob, `${safeName(displayName(item.name))}-filter.${ext}`);
    toast(scaled ? `已下載 ${ext.toUpperCase()}（長邊已縮至 8192）` : `已下載 ${ext.toUpperCase()}`);
  } catch (error) {
    toast("下載失敗，請換一張較小的圖片");
  } finally {
    button.textContent = previous;
    updateChrome();
  }
}

function rand(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function paintCoast(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  sky.addColorStop(0, "#6678b4");
  sky.addColorStop(0.48, "#f09468");
  sky.addColorStop(1, "#ffd7a4");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const sx = w * 0.72;
  const sy = h * 0.46;
  const glow = ctx.createRadialGradient(sx, sy, 8, sx, sy, w * 0.2);
  glow.addColorStop(0, "rgba(255,244,214,1)");
  glow.addColorStop(0.28, "rgba(255,190,110,0.9)");
  glow.addColorStop(1, "rgba(255,160,90,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sx, sy, w * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe6b5";
  ctx.beginPath();
  ctx.arc(sx, sy, w * 0.055, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(45, 42, 58, 0.55)";
  ctx.lineWidth = 2;
  [[0.18, 0.22], [0.22, 0.2], [0.26, 0.23]].forEach(([x, y], i) => {
    ctx.beginPath();
    ctx.moveTo(w * x, h * y);
    ctx.quadraticCurveTo(w * x + 16, h * y - 10, w * x + 28 + i * 6, h * y + 2);
    ctx.stroke();
  });

  const sea = ctx.createLinearGradient(0, h * 0.58, 0, h);
  sea.addColorStop(0, "#e07b62");
  sea.addColorStop(0.35, "#3e6d8c");
  sea.addColorStop(1, "#17344c");
  ctx.fillStyle = sea;
  ctx.fillRect(0, h * 0.58, w, h * 0.42);

  ctx.fillStyle = "rgba(255, 226, 180, 0.28)";
  ctx.beginPath();
  ctx.moveTo(sx - 16, h * 0.58);
  ctx.lineTo(sx + 16, h * 0.58);
  ctx.lineTo(sx + 78, h);
  ctx.lineTo(sx - 78, h);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 7; i += 1) {
    const y = h * 0.64 + i * 22;
    ctx.beginPath();
    ctx.moveTo(w * 0.08, y);
    ctx.bezierCurveTo(w * 0.3, y - 8, w * 0.55, y + 8, w * 0.95, y - 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#24312c";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.72);
  ctx.quadraticCurveTo(w * 0.08, h * 0.5, w * 0.18, h * 0.6);
  ctx.quadraticCurveTo(w * 0.25, h * 0.68, w * 0.3, h * 0.62);
  ctx.lineTo(w * 0.24, h);
  ctx.lineTo(0, h);
  ctx.fill();
  ctx.fillStyle = "#f2c14e";
  ctx.fillRect(w * 0.11, h * 0.575, 8, 8);

  ctx.fillStyle = "#415860";
  ctx.beginPath();
  ctx.ellipse(w * 0.46, h * 0.6, w * 0.09, h * 0.028, 0, Math.PI, 0, true);
  ctx.fill();
}

function paintCity(ctx, w, h) {
  const random = rand(7);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#10182e");
  sky.addColorStop(0.55, "#24365d");
  sky.addColorStop(1, "#4d3b58");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = 0; i < 70; i += 1) {
    ctx.globalAlpha = 0.3 + random() * 0.7;
    ctx.fillRect(random() * w, random() * h * 0.55, random() > 0.8 ? 2 : 1, 1);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#f4e7c4";
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.18, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(244,231,196,0.18)";
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.18, 70, 0, Math.PI * 2);
  ctx.fill();

  const blocks = [
    [0.02, 0.46, 0.12, 0.34],
    [0.13, 0.34, 0.1, 0.46],
    [0.22, 0.42, 0.16, 0.38],
    [0.37, 0.28, 0.12, 0.52],
    [0.48, 0.4, 0.18, 0.4],
    [0.65, 0.33, 0.11, 0.47],
    [0.75, 0.48, 0.14, 0.32],
    [0.88, 0.38, 0.12, 0.42]
  ];
  blocks.forEach(([x, y, bw, bh], index) => {
    ctx.fillStyle = index % 2 ? "#1b2438" : "#12192a";
    ctx.fillRect(w * x, h * y, w * bw, h * bh);
    const win = random() > 0.45 ? "#f0c56e" : "#d7e4ff";
    for (let yy = h * y + 12; yy < h * (y + bh) - 10; yy += 16) {
      for (let xx = w * x + 8; xx < w * (x + bw) - 8; xx += 12) {
        if (random() < 0.28) continue;
        ctx.globalAlpha = 0.35 + random() * 0.65;
        ctx.fillStyle = random() > 0.82 ? "#ff8b62" : win;
        ctx.fillRect(xx, yy, 5, 7);
      }
    }
    ctx.globalAlpha = 1;
  });

  ctx.fillStyle = "#ff6b3d";
  ctx.fillRect(w * 0.5, h * 0.52, 46, 16);
  ctx.fillStyle = "#dfff45";
  ctx.fillRect(w * 0.505, h * 0.528, 36, 6);

  const street = ctx.createLinearGradient(0, h * 0.8, 0, h);
  street.addColorStop(0, "#2a211d");
  street.addColorStop(1, "#120e10");
  ctx.fillStyle = street;
  ctx.fillRect(0, h * 0.8, w, h * 0.2);
  ctx.fillStyle = "rgba(255, 196, 120, 0.35)";
  ctx.fillRect(0, h * 0.8, w, 8);
}

function paintFlowers(ctx, w, h) {
  const wall = ctx.createLinearGradient(0, 0, 0, h);
  wall.addColorStop(0, "#f6ecdf");
  wall.addColorStop(1, "#e7d3bf");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#f8fbf6";
  ctx.fillRect(w * 0.16, h * 0.1, w * 0.42, h * 0.48);
  ctx.strokeStyle = "#d9c7b2";
  ctx.lineWidth = 10;
  ctx.strokeRect(w * 0.16, h * 0.1, w * 0.42, h * 0.48);
  ctx.beginPath();
  ctx.moveTo(w * 0.37, h * 0.1);
  ctx.lineTo(w * 0.37, h * 0.58);
  ctx.moveTo(w * 0.16, h * 0.34);
  ctx.lineTo(w * 0.58, h * 0.34);
  ctx.stroke();

  const outside = ctx.createLinearGradient(0, h * 0.1, 0, h * 0.58);
  outside.addColorStop(0, "#b7d7c6");
  outside.addColorStop(1, "#6f9a73");
  ctx.fillStyle = outside;
  ctx.fillRect(w * 0.175, h * 0.125, w * 0.18, h * 0.2);
  ctx.fillRect(w * 0.385, h * 0.125, w * 0.18, h * 0.2);
  ctx.fillStyle = "#87b487";
  ctx.beginPath();
  ctx.arc(w * 0.25, h * 0.46, 46, 0, Math.PI * 2);
  ctx.arc(w * 0.48, h * 0.48, 38, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#c9b29a";
  ctx.fillRect(0, h * 0.78, w, h * 0.22);
  ctx.fillStyle = "#b4534a";
  ctx.beginPath();
  ctx.ellipse(w * 0.62, h * 0.74, 34, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8d3d38";
  ctx.fillRect(w * 0.6, h * 0.74, 18, 42);

  const blooms = [
    [0.58, 0.58, 34, "#ff8d97"],
    [0.67, 0.5, 42, "#ff5d6c"],
    [0.75, 0.6, 30, "#ffd0c2"],
    [0.7, 0.66, 24, "#f06a78"],
    [0.63, 0.66, 22, "#ffb4a2"]
  ];
  ctx.strokeStyle = "#3f6a45";
  ctx.lineWidth = 4;
  blooms.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(w * 0.66, h * 0.74);
    ctx.quadraticCurveTo(w * x, h * 0.7, w * x, h * y);
    ctx.stroke();
  });
  ctx.fillStyle = "#2f6a45";
  [[0.6, 0.64], [0.74, 0.66]].forEach(([x, y]) => {
    ctx.beginPath();
    ctx.ellipse(w * x, h * y, 22, 10, -0.6, 0, Math.PI * 2);
    ctx.fill();
  });
  blooms.forEach(([x, y, r, color]) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(w * x, h * y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,244,220,0.85)";
    ctx.beginPath();
    ctx.arc(w * x, h * y, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  });
}

function paintMountains(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  sky.addColorStop(0, "#f7d7b8");
  sky.addColorStop(0.45, "#f3b89a");
  sky.addColorStop(1, "#9ec3d8");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,244,220,0.95)";
  ctx.beginPath();
  ctx.arc(w * 0.24, h * 0.28, 42, 0, Math.PI * 2);
  ctx.fill();

  const ridges = [
    ["#d9e4ea", 0.62, 0.08],
    ["#a9c3cf", 0.7, 0.12],
    ["#6e97a4", 0.78, 0.16],
    ["#3e6a62", 0.88, 0.2]
  ];
  ridges.forEach(([color, baseline, amp], index) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * baseline);
    for (let x = 0; x <= w; x += 40) {
      const y = h * baseline - Math.sin(x / 90 + index) * h * amp - ((x * (index + 2)) % 70);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.fill();
  });

  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.fillRect(0, h * 0.72, w, 36);

  ctx.fillStyle = "#1e3a32";
  for (let i = 0; i < 9; i += 1) {
    const x = w * (0.08 + i * 0.1);
    const tree = h * (0.16 + (i % 3) * 0.03);
    ctx.beginPath();
    ctx.moveTo(x, h * 0.9);
    ctx.lineTo(x + 18, h * 0.9 - tree);
    ctx.lineTo(x + 36, h * 0.9);
    ctx.fill();
  }
}

function canvasBlob(paint) {
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 800;
  paint(canvas.getContext("2d"), canvas.width, canvas.height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
}

async function initSamples() {
  const defs = [
    ["黃昏海岸", paintCoast],
    ["城市夜窗", paintCity],
    ["窗邊花束", paintFlowers],
    ["遠山晨霧", paintMountains]
  ];
  samples = [];
  for (const [name, paint] of defs) {
    const blob = await canvasBlob(paint);
    samples.push({ name, blob, url: URL.createObjectURL(blob) });
  }
  renderSampleButtons();
  setPresetSources(samples[0].url);
}

function hasFiles(event) {
  return [...(event.dataTransfer?.types || [])].includes("Files");
}

function isTextField(target) {
  if (!target) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  return tag === "INPUT" && target.type !== "range";
}

function bindEvents() {
  els.pickBtn.addEventListener("click", () => els.imageInput.click());
  els.addMore.addEventListener("click", () => els.imageInput.click());
  els.imageInput.addEventListener("change", () => {
    if (els.imageInput.files?.length) addFiles(els.imageInput.files);
    els.imageInput.value = "";
  });
  els.compareBtn.addEventListener("click", () => {
    if (!active()) return;
    compareOn = !compareOn;
    if (compareOn && (els.compareRange.value === "0" || els.compareRange.value === "100")) {
      els.compareRange.value = "50";
    }
    updateCompare();
  });
  els.peekBtn.addEventListener("pointerdown", (event) => {
    if (!active()) return;
    event.preventDefault();
    peekOriginal = true;
    updateCompare();
  });
  const endPeek = () => {
    if (!peekOriginal) return;
    peekOriginal = false;
    updateCompare();
  };
  els.peekBtn.addEventListener("pointerup", endPeek);
  els.peekBtn.addEventListener("pointerleave", endPeek);
  els.peekBtn.addEventListener("pointercancel", endPeek);
  els.undoBtn.addEventListener("click", undo);
  els.redoBtn.addEventListener("click", redo);
  els.resetBtn.addEventListener("click", resetAll);
  els.applyAll.addEventListener("click", applyAll);
  els.downloadJpg.addEventListener("click", () => download("image/jpeg"));
  els.downloadPng.addEventListener("click", () => download("image/png"));
  els.compareRange.addEventListener("input", updateCompare);

  els.print.addEventListener("pointerdown", (event) => {
    if (!compareOn || peekOriginal || !active()) return;
    if (event.button != null && event.button !== 0) return;
    compareDrag = true;
    els.print.setPointerCapture(event.pointerId);
    moveCompare(event);
  });
  els.print.addEventListener("pointermove", (event) => {
    if (compareDrag) moveCompare(event);
  });
  const endDrag = (event) => {
    compareDrag = false;
    if (event?.pointerId != null && els.print.hasPointerCapture?.(event.pointerId)) {
      els.print.releasePointerCapture(event.pointerId);
    }
  };
  els.print.addEventListener("pointerup", endDrag);
  els.print.addEventListener("pointercancel", endDrag);
  els.print.addEventListener("dblclick", () => {
    if (!active()) return;
    compareOn = !compareOn;
    updateCompare();
  });
  els.print.addEventListener("contextmenu", (event) => event.preventDefault());

  let dragDepth = 0;
  window.addEventListener("dragenter", (event) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    dragDepth += 1;
    els.dropveil.hidden = false;
  });
  window.addEventListener("dragover", (event) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
  });
  window.addEventListener("dragleave", () => {
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) els.dropveil.hidden = true;
  });
  window.addEventListener("drop", (event) => {
    if (!hasFiles(event)) return;
    event.preventDefault();
    dragDepth = 0;
    els.dropveil.hidden = true;
    if (event.dataTransfer?.files?.length) addFiles(event.dataTransfer.files);
  });
  window.addEventListener("paste", (event) => {
    const files = [...(event.clipboardData?.files || [])].filter((file) => /^image\//.test(file.type));
    if (!files.length) return;
    event.preventDefault();
    addFiles(files);
  });
  window.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !isTextField(event.target)) {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if (event.code === "Space" && !isTextField(event.target) && !event.repeat && active()) {
      event.preventDefault();
      peekOriginal = true;
      updateCompare();
    }
    if (compareOn && !isTextField(event.target) && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      const next = Number(els.compareRange.value) + (event.key === "ArrowLeft" ? -3 : 3);
      els.compareRange.value = String(Math.min(100, Math.max(0, next)));
      updateCompare();
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.code === "Space") {
      peekOriginal = false;
      updateCompare();
    }
  });
  window.addEventListener("pointerup", () => {
    if (!slidingKey) return;
    slidingKey = null;
    pushHistory();
  });
  window.addEventListener("blur", () => {
    peekOriginal = false;
    compareDrag = false;
    updateCompare();
  });

  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => layout());
    observer.observe(els.viewer);
  } else {
    window.addEventListener("resize", layout);
  }
}

createGrain();
buildPresets();
buildControls();
bindEvents();
syncControls();
updateCompare();
initSamples();
