import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronRight, ChevronDown, Search, X, Users,
  Sparkles, BookOpen, Star, TrendingUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Skill { name: string; employees: number }
interface Category { name: string; count: number; skills: Skill[] }
interface Theme { theme: string; count: number; categories: Category[] }
interface FlatSkill extends Skill { category: string; theme: string }

// ─── Mock data ────────────────────────────────────────────────────────────────

const TAXONOMY: Theme[] = [
  {
    theme: "Building (Action & Execution)",
    count: 47,
    categories: [
      {
        name: "Planning & Prioritization",
        count: 12,
        skills: [
          { name: "Goal Setting", employees: 34 },
          { name: "Agile Iteration", employees: 28 },
          { name: "Roadmap Ownership", employees: 19 },
          { name: "Backlog Management", employees: 23 },
          { name: "Dependency Mapping", employees: 11 },
        ],
      },
      {
        name: "Mindset & Challenging Status Quo",
        count: 8,
        skills: [
          { name: "Challenge the Status Quo", employees: 22 },
          { name: "First-Principles Thinking", employees: 15 },
          { name: "Goal Reverse Engineering", employees: 9 },
        ],
      },
    ],
  },
  {
    theme: "Leading (People & Influence)",
    count: 38,
    categories: [
      {
        name: "Coaching & Development",
        count: 10,
        skills: [
          { name: "Feedback Delivery", employees: 45 },
          { name: "Career Pathing", employees: 23 },
          { name: "Mentorship", employees: 31 },
          { name: "Performance Calibration", employees: 17 },
        ],
      },
      {
        name: "Cross-Functional Influence",
        count: 9,
        skills: [
          { name: "Stakeholder Alignment", employees: 38 },
          { name: "Executive Communication", employees: 26 },
          { name: "Negotiation", employees: 14 },
        ],
      },
    ],
  },
  {
    theme: "Thinking (Strategy & Analysis)",
    count: 29,
    categories: [
      {
        name: "Data-Driven Decisions",
        count: 7,
        skills: [
          { name: "Experimentation", employees: 17 },
          { name: "Metrics Design", employees: 12 },
          { name: "A/B Testing", employees: 21 },
        ],
      },
      {
        name: "Strategic Vision",
        count: 6,
        skills: [
          { name: "Market Analysis", employees: 14 },
          { name: "Competitive Intelligence", employees: 9 },
        ],
      },
    ],
  },
];

const FLAT_SKILLS: FlatSkill[] = TAXONOMY.flatMap(t =>
  t.categories.flatMap(c =>
    c.skills.map(s => ({ ...s, category: c.name, theme: t.theme }))
  )
);

// Mock employee names per skill (generated)
function getMockEmployees(skill: string): string[] {
  const names = [
    "Sarah Chen","Marcus Thompson","Priya Nair","James O'Brien",
    "Yuki Tanaka","Amara Diallo","Luca Romano","Fatima Al-Rashid",
    "Noah Kim","Elena Vasquez","David Park","Aisha Okonkwo",
  ];
  let h = 0;
  for (let i = 0; i < skill.length; i++) h = (h * 31 + skill.charCodeAt(i)) | 0;
  const start = Math.abs(h) % names.length;
  const result: string[] = [];
  for (let i = 0; i < 5; i++) result.push(names[(start + i) % names.length]);
  return result;
}

function getAvatarUrl(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  const abs = Math.abs(hash);
  return `https://xsgames.co/randomusers/assets/avatars/${abs % 2 === 0 ? "male" : "female"}/${abs % 50}.jpg`;
}

// ─── Accent ───────────────────────────────────────────────────────────────────
const ORANGE = "#F97316";
const ORANGE_LIGHT = "#FFF7ED";
const ORANGE_BORDER = "#FED7AA";

// ─── Right Rail ───────────────────────────────────────────────────────────────

function RightRail({ skill, onClose }: { skill: FlatSkill; onClose: () => void }) {
  const employees = getMockEmployees(skill.name);
  const levels = [
    { label: "Expert",       pct: 28, color: ORANGE },
    { label: "Proficient",   pct: 45, color: "#FB923C" },
    { label: "Developing",   pct: 18, color: "#FED7AA" },
    { label: "Awareness",    pct: 9,  color: "#FEF3C7" },
  ];

  return (
    <div style={{
      width: 340, flexShrink: 0, height: "100%",
      background: "#FFFFFF", borderLeft: "1px solid #EBEBEB",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
      animation: "slideInRight 0.22s cubic-bezier(0.4,0,0.2,1)",
    }}>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(20px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #F0F0F0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: ORANGE_LIGHT, border: `1px solid ${ORANGE_BORDER}`,
            borderRadius: 6, padding: "3px 8px",
          }}>
            <Star size={11} color={ORANGE} fill={ORANGE} />
            <span style={{ fontSize: 11, fontWeight: 600, color: ORANGE, fontFamily: "Inter, system-ui, sans-serif" }}>
              AI Skill
            </span>
          </div>
          <button onClick={onClose} style={{
            width: 26, height: 26, borderRadius: 6, border: "none",
            background: "transparent", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center",
            color: "#A1A1AA", transition: "background 0.12s",
          }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F4F4F5")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <X size={15} />
          </button>
        </div>

        <h2 style={{
          margin: "0 0 6px", fontSize: 18, fontWeight: 700,
          color: "#18181B", fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: "-0.02em", lineHeight: 1.2,
        }}>
          {skill.name}
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif" }}>
            {skill.theme.split("(")[0].trim()}
          </span>
          <ChevronRight size={11} color="#D4D4D8" />
          <span style={{ fontSize: 12, color: "#71717A", fontFamily: "Inter, system-ui, sans-serif" }}>
            {skill.category}
          </span>
        </div>
      </div>

      {/* Employee count */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0F0F0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: ORANGE_LIGHT, border: `1px solid ${ORANGE_BORDER}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Users size={18} color={ORANGE} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#18181B", lineHeight: 1.1, fontFamily: "Inter, system-ui, sans-serif" }}>
              {skill.employees}
            </div>
            <div style={{ fontSize: 12, color: "#71717A", fontFamily: "Inter, system-ui, sans-serif", marginTop: 1 }}>
              employees with this skill
            </div>
          </div>
        </div>
      </div>

      {/* Skill level distribution */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0F0F0" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12, fontFamily: "Inter, system-ui, sans-serif" }}>
          Skill Levels
        </div>
        {levels.map(({ label, pct, color }) => (
          <div key={label} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ fontSize: 12, color: "#52525B", fontFamily: "Inter, system-ui, sans-serif" }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif" }}>{pct}%</span>
            </div>
            <div style={{ height: 5, background: "#F4F4F5", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: color, borderRadius: 3,
                transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Top employees */}
      <div style={{ padding: "16px 20px", flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12, fontFamily: "Inter, system-ui, sans-serif" }}>
          Top Employees
        </div>
        {employees.map(name => (
          <div key={name} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "7px 0", borderBottom: "1px solid #F9F9F9",
          }}>
            <img
              src={getAvatarUrl(name)}
              alt={name}
              style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #E4E4E7", flexShrink: 0 }}
              onError={e => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name)}`; }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif" }}>
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid #F0F0F0" }}>
        <button style={{
          width: "100%", height: 36,
          background: ORANGE, border: "none", borderRadius: 8,
          color: "#fff", fontSize: 13, fontWeight: 600,
          fontFamily: "Inter, system-ui, sans-serif", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          transition: "opacity 0.12s",
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <TrendingUp size={14} />
          View all {skill.employees} employees
        </button>
      </div>
    </div>
  );
}

// ─── Search dropdown ──────────────────────────────────────────────────────────

function SearchDropdown({
  query, onSelectSkill, onAiSearch,
}: {
  query: string;
  onSelectSkill: (skill: FlatSkill) => void;
  onAiSearch: (q: string) => void;
}) {
  const matches = FLAT_SKILLS.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    s.category.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6);

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
      background: "#fff", border: "1px solid #E4E4E7", borderRadius: 12,
      boxShadow: "0 8px 30px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
      overflow: "hidden", zIndex: 100,
    }}>
      {matches.length > 0 ? (
        <>
          <div style={{ padding: "8px 0 4px 14px" }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Inter, system-ui, sans-serif" }}>
              Matching Skills
            </span>
          </div>
          {matches.map(skill => (
            <div
              key={`${skill.theme}:${skill.name}`}
              onClick={() => onSelectSkill(skill)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 14px", cursor: "pointer", transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F9F9F9")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif" }}>
                  {skill.name}
                </span>
                <span style={{ fontSize: 12, color: "#A1A1AA", marginLeft: 6, fontFamily: "Inter, system-ui, sans-serif" }}>
                  · {skill.category}
                </span>
              </div>
              <div style={{
                background: ORANGE_LIGHT, border: `1px solid ${ORANGE_BORDER}`,
                borderRadius: 5, padding: "2px 7px",
                fontSize: 11, fontWeight: 500, color: ORANGE,
                fontFamily: "Inter, system-ui, sans-serif", flexShrink: 0,
              }}>
                {skill.employees}
              </div>
            </div>
          ))}
          <div style={{ height: 1, background: "#F0F0F0", margin: "4px 0" }} />
        </>
      ) : (
        <div style={{ padding: "12px 14px 4px" }}>
          <span style={{ fontSize: 12, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif" }}>
            No existing skills match "{query}"
          </span>
          <div style={{ height: 1, background: "#F0F0F0", margin: "8px 0 4px" }} />
        </div>
      )}

      {/* AI search trigger */}
      <div
        onClick={() => onAiSearch(query)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px 10px", cursor: "pointer", transition: "background 0.1s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = ORANGE_LIGHT)}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{
          width: 22, height: 22, borderRadius: 5,
          background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Search size={12} color="#fff" />
        </div>
        <div>
          <span style={{ fontSize: 13, color: "#52525B", fontFamily: "Inter, system-ui, sans-serif" }}>Search: </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif" }}>
            {query}
          </span>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif" }}>
          AI extract
        </span>
      </div>
    </div>
  );
}

// ─── Taxonomy row types ───────────────────────────────────────────────────────

function CountBadge({ n, orange }: { n: number; orange?: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: orange ? ORANGE_LIGHT : "#F4F4F5",
      border: `1px solid ${orange ? ORANGE_BORDER : "#E4E4E7"}`,
      borderRadius: 5, padding: "1px 7px",
      fontSize: 11, fontWeight: 500,
      color: orange ? ORANGE : "#71717A",
      fontFamily: "Inter, system-ui, sans-serif",
      flexShrink: 0,
    }}>
      {n} {orange ? "" : "skills"}
    </span>
  );
}

// ─── AI search result card ────────────────────────────────────────────────────

function AiResultCard({ query, onClose }: { query: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (loading) return (
    <div style={{
      background: "#FFFBF5", border: `1px solid ${ORANGE_BORDER}`,
      borderRadius: 12, padding: "20px 24px",
      display: "flex", alignItems: "center", gap: 12, marginBottom: 24,
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: ORANGE_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Sparkles size={16} color={ORANGE} />
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif", marginBottom: 3 }}>
          Extracting skill: <strong>"{query}"</strong>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%", background: ORANGE,
              animation: `bounce 1s ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6)}40%{transform:scale(1)} }`}</style>
      </div>
    </div>
  );

  return (
    <div style={{
      background: "#FFFBF5", border: `1px solid ${ORANGE_BORDER}`,
      borderRadius: 12, padding: "20px 24px", marginBottom: 24,
      animation: "fadeIn 0.3s ease",
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif" }}>
              AI Extraction: "{query}"
            </div>
            <div style={{ fontSize: 11, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif" }}>
              Not in existing taxonomy · extracted from performance data
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#A1A1AA", display: "flex" }}>
          <X size={14} />
        </button>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1, background: "#fff", border: "1px solid #FED7AA", borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, fontFamily: "Inter, system-ui, sans-serif" }}>
            Closest match
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif", marginBottom: 2 }}>
            Goal Setting
          </div>
          <div style={{ fontSize: 12, color: "#71717A", fontFamily: "Inter, system-ui, sans-serif" }}>
            Planning & Prioritization
          </div>
        </div>
        <div style={{ flex: 1, background: "#fff", border: "1px solid #FED7AA", borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6, fontFamily: "Inter, system-ui, sans-serif" }}>
            Employees found
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: ORANGE, fontFamily: "Inter, system-ui, sans-serif" }}>
            26
          </div>
          <div style={{ fontSize: 12, color: "#71717A", fontFamily: "Inter, system-ui, sans-serif" }}>
            mention this in reviews
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SkillsSearch() {
  const [activeTab, setActiveTab] = useState<"ai" | "predefined">("ai");
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(
    new Set(["Building (Action & Execution)", "Leading (People & Influence)", "Thinking (Strategy & Analysis)"])
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Planning & Prioritization"])
  );
  const [selectedSkill, setSelectedSkill] = useState<FlatSkill | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current && !searchRef.current.contains(e.target as Node)
      ) setShowDropdown(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const handleSelectSkill = useCallback((skill: FlatSkill) => {
    setSelectedSkill(skill);
    setQuery(skill.name);
    setShowDropdown(false);
  }, []);

  const handleAiSearch = useCallback((q: string) => {
    setAiResult(q);
    setShowDropdown(false);
  }, []);

  const toggleTheme = (t: string) => setExpandedThemes(prev => {
    const n = new Set(prev);
    n.has(t) ? n.delete(t) : n.add(t);
    return n;
  });
  const toggleCategory = (c: string) => setExpandedCategories(prev => {
    const n = new Set(prev);
    n.has(c) ? n.delete(c) : n.add(c);
    return n;
  });

  return (
    <div style={{
      flex: 1, display: "flex", height: "100%",
      background: "#F9F9F9", overflow: "hidden",
    }}>
      {/* Main scroll area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{
            margin: "0 0 16px", fontSize: 22, fontWeight: 700,
            color: "#18181B", fontFamily: "Inter, system-ui, sans-serif",
            letterSpacing: "-0.02em",
          }}>
            Skills Search
          </h1>

          {/* Tabs + timestamp */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{
              display: "flex", background: "#F0F0F0", borderRadius: 9,
              padding: 3, gap: 2,
            }}>
              {([
                { id: "ai", label: "AI-Generated Skills", icon: <Sparkles size={13} /> },
                { id: "predefined", label: "Predefined Skills", icon: <BookOpen size={13} /> },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 14px", borderRadius: 7, border: "none",
                    cursor: "pointer", transition: "all 0.15s",
                    fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                    fontFamily: "Inter, system-ui, sans-serif",
                    background: activeTab === tab.id ? "#fff" : "transparent",
                    color: activeTab === tab.id ? "#18181B" : "#71717A",
                    boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  <span style={{ color: activeTab === tab.id ? ORANGE : "#A1A1AA" }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <span style={{
              fontSize: 12, color: "#A1A1AA",
              fontFamily: "Inter, system-ui, sans-serif",
            }}>
              Last updated: May 28, 2026
            </span>
          </div>
        </div>

        {activeTab === "ai" ? (
          <>
            {/* ── Search bar ──────────────────────────────────────────── */}
            <div style={{ position: "relative", marginBottom: 8 }} ref={dropdownRef}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#fff", border: `1.5px solid ${showDropdown || query ? ORANGE : "#E4E4E7"}`,
                borderRadius: 12, padding: "0 16px", height: 50,
                boxShadow: showDropdown || query
                  ? `0 0 0 3px rgba(249,115,22,0.10), 0 2px 10px rgba(0,0,0,0.06)`
                  : "0 1px 3px rgba(0,0,0,0.05)",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}>
                <Search size={18} color={query ? ORANGE : "#A1A1AA"} style={{ flexShrink: 0, transition: "color 0.15s" }} />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  placeholder="Search for a skill..."
                  onChange={e => { setQuery(e.target.value); setShowDropdown(!!e.target.value); }}
                  onFocus={() => { if (query) setShowDropdown(true); }}
                  style={{
                    flex: 1, border: "none", outline: "none", background: "transparent",
                    fontSize: 15, color: "#18181B",
                    fontFamily: "Inter, system-ui, sans-serif", fontWeight: 400,
                  }}
                />
                {query && (
                  <button
                    onClick={() => { setQuery(""); setShowDropdown(false); setAiResult(null); }}
                    style={{
                      width: 22, height: 22, borderRadius: "50%", background: "#E4E4E7",
                      border: "none", cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    <X size={12} color="#52525B" />
                  </button>
                )}
              </div>

              {showDropdown && query.length >= 1 && (
                <SearchDropdown
                  query={query}
                  onSelectSkill={handleSelectSkill}
                  onAiSearch={handleAiSearch}
                />
              )}
            </div>

            <p style={{
              margin: "0 0 24px", fontSize: 12.5, color: "#A1A1AA",
              fontFamily: "Inter, system-ui, sans-serif",
            }}>
              Search the AI-extracted skill taxonomy, or search for a phrase to extract skills on-demand.
            </p>

            {/* AI result card */}
            {aiResult && (
              <AiResultCard query={aiResult} onClose={() => setAiResult(null)} />
            )}

            {/* ── Taxonomy browser ────────────────────────────────────── */}
            <div style={{
              background: "#fff", border: "1px solid #EBEBEB",
              borderRadius: 12, overflow: "hidden",
            }}>
              {TAXONOMY.map((theme, ti) => (
                <div key={theme.theme}>
                  {/* Theme row */}
                  <div
                    onClick={() => toggleTheme(theme.theme)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "13px 18px",
                      background: "#FAFAFA",
                      borderTop: ti > 0 ? "1px solid #F0F0F0" : "none",
                      cursor: "pointer", userSelect: "none",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F4F4F5")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#FAFAFA")}
                  >
                    <div style={{
                      transform: expandedThemes.has(theme.theme) ? "rotate(90deg)" : "none",
                      transition: "transform 0.15s", display: "flex",
                    }}>
                      <ChevronRight size={15} color="#71717A" />
                    </div>
                    <span style={{
                      fontSize: 14, fontWeight: 700, color: "#18181B",
                      fontFamily: "Inter, system-ui, sans-serif", flex: 1,
                    }}>
                      {theme.theme}
                    </span>
                    <CountBadge n={theme.count} />
                  </div>

                  {expandedThemes.has(theme.theme) && theme.categories.map((cat, ci) => (
                    <div key={cat.name}>
                      {/* Category row */}
                      <div
                        onClick={() => toggleCategory(cat.name)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 18px 10px 44px",
                          borderTop: "1px solid #F5F5F5",
                          cursor: "pointer", transition: "background 0.1s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={{
                          transform: expandedCategories.has(cat.name) ? "rotate(90deg)" : "none",
                          transition: "transform 0.15s", display: "flex",
                        }}>
                          <ChevronRight size={13} color="#A1A1AA" />
                        </div>
                        <span style={{
                          fontSize: 13.5, fontWeight: 500, color: "#3F3F46",
                          fontFamily: "Inter, system-ui, sans-serif", flex: 1,
                        }}>
                          {cat.name}
                        </span>
                        <CountBadge n={cat.count} />
                      </div>

                      {expandedCategories.has(cat.name) && cat.skills.map(skill => {
                        const flat: FlatSkill = { ...skill, category: cat.name, theme: theme.theme };
                        const isActive = selectedSkill?.name === skill.name && selectedSkill?.category === cat.name;
                        return (
                          <div
                            key={skill.name}
                            onClick={() => setSelectedSkill(isActive ? null : flat)}
                            style={{
                              display: "flex", alignItems: "center",
                              padding: "9px 18px 9px 68px",
                              borderTop: "1px solid #F9F9F9",
                              cursor: "pointer", transition: "background 0.1s",
                              background: isActive ? ORANGE_LIGHT : "transparent",
                              borderLeft: isActive ? `3px solid ${ORANGE}` : "3px solid transparent",
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#FAFAFA"; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                          >
                            <span style={{
                              flex: 1, fontSize: 13, fontWeight: isActive ? 500 : 400,
                              color: isActive ? "#18181B" : "#52525B",
                              fontFamily: "Inter, system-ui, sans-serif",
                            }}>
                              {skill.name}
                            </span>
                            <div style={{
                              display: "flex", alignItems: "center", gap: 4,
                              background: isActive ? "#fff" : ORANGE_LIGHT,
                              border: `1px solid ${ORANGE_BORDER}`,
                              borderRadius: 5, padding: "2px 7px",
                            }}>
                              <Users size={10} color={ORANGE} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: ORANGE, fontFamily: "Inter, system-ui, sans-serif" }}>
                                {skill.employees}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Predefined Skills tab — placeholder */
          <div style={{
            background: "#fff", border: "1px solid #EBEBEB", borderRadius: 12,
            padding: "48px 32px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 10, minHeight: 260,
          }}>
            <BookOpen size={32} color="#D4D4D8" />
            <div style={{ fontSize: 15, fontWeight: 600, color: "#71717A", fontFamily: "Inter, system-ui, sans-serif" }}>
              Predefined Skills
            </div>
            <div style={{ fontSize: 13, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif", textAlign: "center", maxWidth: 320 }}>
              Browse the curated skill taxonomy mapped to your org's competency framework.
            </div>
          </div>
        )}
      </div>

      {/* ── Right rail ──────────────────────────────────────────────────── */}
      {selectedSkill && (
        <RightRail skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
      )}
    </div>
  );
}
