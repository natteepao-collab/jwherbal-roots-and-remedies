/**
 * Auto-translate runtime: scans the DOM for Thai text nodes when the active
 * language is not Thai, batches them to the translate-batch edge function,
 * caches results in localStorage, and replaces the text nodes in place.
 */
import { supabase } from "@/integrations/supabase/client";

const THAI_RE = /[\u0E00-\u0E7F]/;
const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA", "INPUT",
]);
const SKIP_ATTR = "data-no-translate";

type Lang = "en" | "zh" | "ja";
const SUPPORTED: Lang[] = ["en", "zh", "ja"];

const originals = new WeakMap<Text, string>();
let currentLang: Lang | null = null;
let observer: MutationObserver | null = null;
let pending = new Set<Text>();
let flushTimer: number | null = null;
let inFlight = false;

const cacheKey = (lang: Lang) => `autoTranslate:${lang}`;

const loadCache = (lang: Lang): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(cacheKey(lang)) || "{}");
  } catch {
    return {};
  }
};

const saveCache = (lang: Lang, cache: Record<string, string>) => {
  try {
    localStorage.setItem(cacheKey(lang), JSON.stringify(cache));
  } catch {
    /* quota exceeded — ignore */
  }
};

const shouldTranslate = (node: Text): boolean => {
  const txt = node.nodeValue;
  if (!txt) return false;
  const trimmed = txt.trim();
  if (trimmed.length < 1) return false;
  if (!THAI_RE.test(trimmed)) return false;
  let p: Node | null = node.parentNode;
  while (p && p.nodeType === 1) {
    const el = p as HTMLElement;
    if (SKIP_TAGS.has(el.tagName)) return false;
    if (el.hasAttribute(SKIP_ATTR)) return false;
    if (el.isContentEditable) return false;
    p = p.parentNode;
  }
  return true;
};

const collectTextNodes = (root: Node, out: Text[]) => {
  if (root.nodeType === 3) {
    if (shouldTranslate(root as Text)) out.push(root as Text);
    return;
  }
  if (root.nodeType !== 1) return;
  const el = root as HTMLElement;
  if (SKIP_TAGS.has(el.tagName)) return;
  if (el.hasAttribute(SKIP_ATTR)) return;
  for (const child of Array.from(root.childNodes)) collectTextNodes(child, out);
};

const queueFlush = () => {
  if (flushTimer != null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flush();
  }, 250);
};

const queueNode = (node: Text) => {
  if (!currentLang) return;
  if (!shouldTranslate(node)) return;
  pending.add(node);
  queueFlush();
};

const queueSubtree = (root: Node) => {
  if (!currentLang) return;
  const collected: Text[] = [];
  collectTextNodes(root, collected);
  for (const n of collected) pending.add(n);
  if (collected.length) queueFlush();
};

const applyTranslation = (node: Text, translated: string) => {
  if (!node.isConnected) return;
  if (!originals.has(node)) originals.set(node, node.nodeValue || "");
  // Preserve leading/trailing whitespace from original
  const original = node.nodeValue || "";
  const leading = original.match(/^\s*/)?.[0] || "";
  const trailing = original.match(/\s*$/)?.[0] || "";
  node.nodeValue = leading + translated + trailing;
};

const flush = async () => {
  if (inFlight) {
    queueFlush();
    return;
  }
  if (!currentLang) return;
  const lang = currentLang;
  const nodes = Array.from(pending).filter((n) => n.isConnected && shouldTranslate(n));
  pending = new Set();
  if (!nodes.length) return;

  const cache = loadCache(lang);

  // Apply cached and collect uncached unique source strings
  const uncachedMap = new Map<string, Text[]>(); // source(trimmed) -> nodes
  for (const node of nodes) {
    const original = originals.get(node) ?? node.nodeValue ?? "";
    if (!originals.has(node)) originals.set(node, original);
    const trimmed = original.trim();
    if (!trimmed) continue;
    const cached = cache[trimmed];
    if (cached) {
      applyTranslation(node, cached);
    } else {
      const arr = uncachedMap.get(trimmed) || [];
      arr.push(node);
      uncachedMap.set(trimmed, arr);
    }
  }

  if (!uncachedMap.size) return;

  // Batch into chunks of ~40 to avoid overly long prompts
  const sources = Array.from(uncachedMap.keys());
  const CHUNK = 40;
  inFlight = true;
  try {
    for (let i = 0; i < sources.length; i += CHUNK) {
      const slice = sources.slice(i, i + CHUNK);
      try {
        const { data, error } = await supabase.functions.invoke("translate-batch", {
          body: { texts: slice, targetLang: lang },
        });
        if (error || !data?.translations) {
          console.warn("translate-batch failed:", error);
          continue;
        }
        const translations: string[] = data.translations;
        for (let j = 0; j < slice.length; j++) {
          const src = slice[j];
          const tr = translations[j];
          if (!tr || tr === src) continue;
          cache[src] = tr;
          const targets = uncachedMap.get(src) || [];
          for (const node of targets) {
            if (currentLang === lang) applyTranslation(node, tr);
          }
        }
        saveCache(lang, cache);
      } catch (e) {
        console.warn("translate-batch invoke error:", e);
      }
    }
  } finally {
    inFlight = false;
  }
};

const startObserver = () => {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === "characterData") {
        const node = m.target as Text;
        // Skip if the change came from our own translation write
        const orig = originals.get(node);
        if (orig != null && (node.nodeValue || "").trim() && !THAI_RE.test(node.nodeValue || "")) continue;
        queueNode(node);
      } else if (m.type === "childList") {
        m.addedNodes.forEach((n) => queueSubtree(n));
      }
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
};

const stopObserver = () => {
  observer?.disconnect();
  observer = null;
};

const restoreOriginals = () => {
  // Walk the DOM once and restore any node we have a saved original for
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const t = n as Text;
    const orig = originals.get(t);
    if (orig != null && t.nodeValue !== orig) {
      t.nodeValue = orig;
    }
  }
};

export const setAutoTranslateLanguage = (lang: string) => {
  if (typeof window === "undefined") return;
  const next = SUPPORTED.includes(lang as Lang) ? (lang as Lang) : null;

  if (next === currentLang) return;

  if (currentLang && !next) {
    // Switching back to Thai
    stopObserver();
    pending.clear();
    if (flushTimer != null) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    currentLang = null;
    restoreOriginals();
    return;
  }

  if (currentLang && next && currentLang !== next) {
    // Switching from one foreign lang to another — restore first
    pending.clear();
    if (flushTimer != null) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
    restoreOriginals();
  }

  currentLang = next;
  if (currentLang) {
    startObserver();
    queueSubtree(document.body);
  }
};
