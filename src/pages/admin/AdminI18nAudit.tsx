import { useState } from "react";
import i18n from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, ScanSearch } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Finding {
  text: string;
  tag: string;
  selector: string;
  path: string;
}

interface RouteResult {
  path: string;
  lang: string;
  count: number;
  findings: Finding[];
}

const ROUTES = [
  "/", "/about", "/shop", "/cart", "/checkout", "/articles",
  "/community", "/contact", "/faq", "/reviews", "/products/vflow",
  "/auth", "/orders",
];
const LANGS = ["en", "zh", "ja"] as const;

const THAI_RE = /[\u0E00-\u0E7F]/;

const getSelector = (el: Element): string => {
  if (el.id) return `#${el.id}`;
  const parts: string[] = [];
  let cur: Element | null = el;
  let depth = 0;
  while (cur && depth < 4) {
    let part = cur.tagName.toLowerCase();
    if (cur.className && typeof cur.className === "string") {
      const cls = cur.className.trim().split(/\s+/).slice(0, 2).join(".");
      if (cls) part += `.${cls}`;
    }
    parts.unshift(part);
    cur = cur.parentElement;
    depth++;
  }
  return parts.join(" > ");
};

const scanDOM = (path: string, lang: string): RouteResult => {
  const findings: Finding[] = [];
  const seen = new Set<string>();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      const tag = parent.tagName;
      if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
      if (parent.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
      // Skip the audit UI itself
      if (parent.closest("[data-i18n-audit]")) return NodeFilter.FILTER_REJECT;
      const txt = node.textContent || "";
      if (!THAI_RE.test(txt)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const text = (n.textContent || "").trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    const parent = n.parentElement!;
    findings.push({
      text: text.length > 120 ? text.slice(0, 120) + "…" : text,
      tag: parent.tagName.toLowerCase(),
      selector: getSelector(parent),
      path,
    });
  }
  // Also scan attributes (placeholder, title, alt, aria-label)
  document.querySelectorAll("[placeholder],[title],[alt],[aria-label]").forEach((el) => {
    if (el.closest("[data-i18n-audit]")) return;
    ["placeholder", "title", "alt", "aria-label"].forEach((attr) => {
      const v = el.getAttribute(attr);
      if (v && THAI_RE.test(v) && !seen.has(`@${attr}:${v}`)) {
        seen.add(`@${attr}:${v}`);
        findings.push({
          text: `[${attr}] ${v}`,
          tag: el.tagName.toLowerCase(),
          selector: getSelector(el),
          path,
        });
      }
    });
  });
  return { path, lang, count: findings.length, findings };
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function AdminI18nAudit() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState<RouteResult[]>([]);
  const [waitMs, setWaitMs] = useState(4000);

  const runScan = async () => {
    setRunning(true);
    setResults([]);
    const all: RouteResult[] = [];
    const originalLang = i18n.language;

    try {
      for (const lang of LANGS) {
        setProgress(`สลับเป็น ${lang.toUpperCase()}…`);
        await i18n.changeLanguage(lang);
        await sleep(800); // wait for i18n + autoTranslate kickoff

        for (const path of ROUTES) {
          setProgress(`[${lang.toUpperCase()}] กำลังโหลด ${path}…`);
          window.history.pushState({}, "", path);
          window.dispatchEvent(new PopStateEvent("popstate"));
          // Wait for route + auto-translate to settle
          await sleep(waitMs);
          const res = scanDOM(path, lang);
          all.push(res);
          setResults([...all]);
        }
      }
    } finally {
      await i18n.changeLanguage(originalLang);
      setProgress("เสร็จสิ้น");
      setRunning(false);
    }
  };

  const downloadReport = () => {
    const totalFindings = results.reduce((s, r) => s + r.count, 0);
    const lines: string[] = [];
    lines.push(`# i18n Audit Report`);
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push(`Total findings: ${totalFindings}`);
    lines.push(``);
    for (const lang of LANGS) {
      const langResults = results.filter((r) => r.lang === lang);
      const subTotal = langResults.reduce((s, r) => s + r.count, 0);
      lines.push(`\n## ${lang.toUpperCase()} — ${subTotal} ข้อความไทยค้าง`);
      for (const r of langResults) {
        if (r.count === 0) continue;
        lines.push(`\n### ${r.path} (${r.count})`);
        for (const f of r.findings) {
          lines.push(`- <${f.tag}> ${f.text}`);
          lines.push(`  selector: ${f.selector}`);
        }
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `i18n-audit-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const grouped = LANGS.map((lang) => ({
    lang,
    routes: results.filter((r) => r.lang === lang),
    total: results.filter((r) => r.lang === lang).reduce((s, r) => s + r.count, 0),
  }));

  return (
    <div className="p-6 space-y-6" data-i18n-audit>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">i18n Audit — สแกนข้อความไทยค้าง</h1>
          <p className="text-sm text-muted-foreground">
            สลับเป็น EN / ZH / JA แล้วสแกน DOM ทุกหน้า รายงานข้อความไทยที่ยังไม่ได้แปล
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm flex items-center gap-1">
            รอ/หน้า
            <input
              type="number"
              className="w-20 px-2 py-1 border rounded bg-background"
              value={waitMs}
              min={1000}
              step={500}
              onChange={(e) => setWaitMs(Number(e.target.value))}
              disabled={running}
            />
            ms
          </label>
          <Button onClick={runScan} disabled={running}>
            {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ScanSearch className="w-4 h-4 mr-2" />}
            เริ่มสแกน
          </Button>
          <Button variant="outline" onClick={downloadReport} disabled={results.length === 0}>
            <Download className="w-4 h-4 mr-2" /> ดาวน์โหลดรายงาน
          </Button>
        </div>
      </div>

      {progress && (
        <div className="text-sm text-muted-foreground">
          สถานะ: <span className="font-mono">{progress}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {grouped.map((g) => (
          <Card key={g.lang}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>{g.lang.toUpperCase()}</span>
                <Badge variant={g.total === 0 && g.routes.length > 0 ? "default" : "destructive"}>
                  {g.total} ค้าง
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                สแกนแล้ว {g.routes.length}/{ROUTES.length} หน้า
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียด</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-3">
            {grouped.map((g) => (
              <div key={g.lang} className="mb-6">
                <h3 className="font-semibold mb-2">{g.lang.toUpperCase()}</h3>
                {g.routes.length === 0 && <p className="text-sm text-muted-foreground">ยังไม่ได้สแกน</p>}
                {g.routes.map((r) => (
                  <div key={`${g.lang}-${r.path}`} className="mb-3 border-l-2 border-border pl-3">
                    <div className="flex items-center gap-2">
                      <code className="text-sm">{r.path}</code>
                      <Badge variant={r.count === 0 ? "secondary" : "destructive"}>{r.count}</Badge>
                    </div>
                    {r.findings.slice(0, 20).map((f, i) => (
                      <div key={i} className="text-xs mt-1 ml-2">
                        <span className="text-muted-foreground">&lt;{f.tag}&gt;</span> {f.text}
                        <div className="text-[10px] text-muted-foreground/70 font-mono">{f.selector}</div>
                      </div>
                    ))}
                    {r.findings.length > 20 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        + อีก {r.findings.length - 20} รายการ…
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
