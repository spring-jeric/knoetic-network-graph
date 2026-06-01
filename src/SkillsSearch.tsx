import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronRight, Search, X, Users, Sparkles, BookOpen,
  FileText, MessageCircle, UserCircle, TrendingUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Skill { name: string; employees: number }
interface Category { name: string; count: number; skills: Skill[] }
interface Theme { theme: string; count: number; categories: Category[] }
interface FlatSkill extends Skill { category: string; theme: string }
type Confidence = "H" | "M" | "L";
type MentionLevel = "frequent" | "some";
type EvidenceSource = "review" | "checkin" | "profile";

interface EvidenceItem {
  source: EvidenceSource;
  date: string;
  quote: string;
}
interface Employee {
  id: string;
  name: string;
  title: string;
  company: string;
  mention: MentionLevel;
  confidence: Confidence;
  avatar: string;
  summary: string;
  evidence: EvidenceItem[];
}

// ─── Taxonomy ─────────────────────────────────────────────────────────────────

const TAXONOMY: Theme[] = [
  {
    theme: "Building (Action & Execution)", count: 47,
    categories: [
      { name: "Planning & Prioritization", count: 12, skills: [
        { name: "Goal Setting", employees: 34 },
        { name: "Agile Iteration", employees: 28 },
        { name: "Roadmap Ownership", employees: 19 },
        { name: "Backlog Management", employees: 23 },
        { name: "Dependency Mapping", employees: 11 },
      ]},
      { name: "Mindset & Challenging Status Quo", count: 8, skills: [
        { name: "Challenge the Status Quo", employees: 22 },
        { name: "First-Principles Thinking", employees: 15 },
        { name: "Goal Reverse Engineering", employees: 9 },
      ]},
    ],
  },
  {
    theme: "Leading (People & Influence)", count: 38,
    categories: [
      { name: "Coaching & Development", count: 10, skills: [
        { name: "Feedback Delivery", employees: 45 },
        { name: "Career Pathing", employees: 23 },
        { name: "Mentorship", employees: 31 },
        { name: "Performance Calibration", employees: 17 },
      ]},
      { name: "Cross-Functional Influence", count: 9, skills: [
        { name: "Stakeholder Alignment", employees: 38 },
        { name: "Executive Communication", employees: 26 },
        { name: "Negotiation", employees: 14 },
      ]},
    ],
  },
  {
    theme: "Thinking (Strategy & Analysis)", count: 29,
    categories: [
      { name: "Data-Driven Decisions", count: 7, skills: [
        { name: "Experimentation", employees: 17 },
        { name: "Metrics Design", employees: 12 },
        { name: "A/B Testing", employees: 21 },
      ]},
      { name: "Strategic Vision", count: 6, skills: [
        { name: "Market Analysis", employees: 14 },
        { name: "Competitive Intelligence", employees: 9 },
      ]},
    ],
  },
];

const FLAT_SKILLS: FlatSkill[] = TAXONOMY.flatMap(t =>
  t.categories.flatMap(c => c.skills.map(s => ({ ...s, category: c.name, theme: t.theme })))
);

function getAvatarUrl(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  const abs = Math.abs(h);
  return `https://xsgames.co/randomusers/assets/avatars/${abs % 2 === 0 ? "male" : "female"}/${abs % 50}.jpg`;
}

// ─── Employees per skill (uses skill name as seed) ────────────────────────────

const GOAL_SETTING_EMPLOYEES: Employee[] = [
  {
    id: "jessica", name: "Jessica Swank", title: "CPO", company: "Box",
    mention: "frequent", confidence: "H",
    avatar: getAvatarUrl("Jessica Swank"),
    summary: "Jessica demonstrates Goal Setting through quarterly OKR facilitation and cross-functional alignment at Box.",
    evidence: [
      { source: "review",  date: "Mar 2026", quote: "Jessica consistently sets clear, measurable goals at the start of each quarter and holds the team accountable throughout the cycle." },
      { source: "checkin", date: "Jan 2026", quote: "Reverse-engineered the annual company goal into team-level OKRs with clear ownership, demonstrating strong goal decomposition." },
      { source: "profile", date: "Dec 2025", quote: "Led Q4 planning cycle resulting in a 94% goal achievement rate across the organisation." },
    ],
  },
  {
    id: "carol", name: "Carol Mahoney", title: "CHRO", company: "Coursera",
    mention: "frequent", confidence: "H",
    avatar: getAvatarUrl("Carol Mahoney"),
    summary: "Carol demonstrates Goal Setting through structured people strategy alignment and org-wide performance planning at Coursera.",
    evidence: [
      { source: "review",  date: "Feb 2026", quote: "Carol's goal-setting process is rigorous — she aligns people metrics directly to business outcomes and revisits them monthly." },
      { source: "profile", date: "Nov 2025", quote: "Introduced a company-wide OKR cadence resulting in a 30% improvement in cross-functional alignment scores." },
    ],
  },
  {
    id: "sarah", name: "Sarah Livnat", title: "VP People", company: "Notion",
    mention: "some", confidence: "M",
    avatar: getAvatarUrl("Sarah Livnat"),
    summary: "Sarah shows emerging Goal Setting capability, particularly in team planning cycles, with room to grow in longer-horizon goal architecture.",
    evidence: [
      { source: "checkin", date: "Apr 2026", quote: "Set clear Q2 hiring goals and tracked against them weekly, though longer-term planning could be more structured." },
      { source: "review",  date: "Jan 2026", quote: "Demonstrates goal-setting skills within her function but would benefit from broader cross-functional OKR experience." },
    ],
  },
  {
    id: "joseph", name: "Joseph Quan", title: "Head of People", company: "Knoetic",
    mention: "some", confidence: "L",
    avatar: "/joseph.png",
    summary: "Joseph has shown early signals of Goal Setting in recent check-ins, primarily through team sprint planning and hiring targets.",
    evidence: [
      { source: "checkin", date: "May 2026", quote: "Mentioned goal-tracking practices during weekly sync — would benefit from formalising this into a structured OKR approach." },
    ],
  },
];

function getMockEmployees(skillName: string): Employee[] {
  if (skillName === "Goal Setting") return GOAL_SETTING_EMPLOYEES;
  // Generic employees for other skills, seeded from name
  const names = ["Alex Rivera","Sam Park","Jordan Wei","Taylor Obi"];
  const confidences: Confidence[] = ["H","H","M","L"];
  const mentions: MentionLevel[] = ["frequent","frequent","some","some"];
  const companies = ["Stripe","Figma","Vercel","Linear"];
  const titles = ["CPO","VP Product","Head of People","Director, Talent"];
  return names.map((name, i) => ({
    id: `${skillName}-${i}`,
    name, title: titles[i], company: companies[i],
    mention: mentions[i], confidence: confidences[i],
    avatar: getAvatarUrl(name + skillName),
    summary: `${name} demonstrates ${skillName} through their work at ${companies[i]}.`,
    evidence: [
      { source: "review" as EvidenceSource, date: "Mar 2026", quote: `${name} has shown consistent application of ${skillName} in performance reviews.` },
    ],
  }));
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const ORANGE = "#7C5CF6";
const ORANGE_LIGHT = "#F5F3FF";
const ORANGE_BORDER = "#DDD6FE";

// ─── Confidence chip ──────────────────────────────────────────────────────────
const CONF_STYLES: Record<Confidence, { bg: string; text: string; label: string }> = {
  H: { bg: "#DCFCE7", text: "#16A34A", label: "High" },
  M: { bg: "#FEF9C3", text: "#CA8A04", label: "Medium" },
  L: { bg: "#F4F4F5", text: "#71717A", label: "Low" },
};
const MENTION_STYLES: Record<MentionLevel, { bg: string; border: string; text: string; label: string }> = {
  frequent: { bg: "#F0FDF4", border: "#BBF7D0", text: "#16A34A", label: "Frequent mention" },
  some:     { bg: "#FFFBEB", border: "#FDE68A", text: "#CA8A04", label: "Some mention"     },
};
const SOURCE_META: Record<EvidenceSource, { label: string; Icon: typeof FileText; color: string }> = {
  review:  { label: "Performance Review", Icon: FileText,      color: "#6D28D9" },
  checkin: { label: "Check-in",           Icon: MessageCircle, color: "#0284C7" },
  profile: { label: "Profile",            Icon: UserCircle,    color: "#047857" },
};

// ─── Skill Insights (inline) ──────────────────────────────────────────────────

function SkillInsights({ emp, skillName }: { emp: Employee; skillName: string }) {
  const cs = CONF_STYLES[emp.confidence];
  return (
    <div style={{
      background: "#FAFAFA", borderTop: "1px solid #F0F0F0",
      padding: "16px 16px 16px 62px",
      animation: "expandInsight 0.2s ease",
    }}>
      <style>{`@keyframes expandInsight{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>

      {/* Confidence indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: cs.bg, borderRadius: 6, padding: "4px 10px",
        }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: cs.text, fontFamily: "Inter, system-ui, sans-serif" }}>
            {emp.confidence}
          </span>
          <span style={{ fontSize: 11, color: cs.text, fontFamily: "Inter, system-ui, sans-serif" }}>
            Confidence
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif" }}>
          {skillName}
        </span>
      </div>

      {/* Summary */}
      <p style={{
        margin: "0 0 14px", fontSize: 12.5, color: "#3F3F46", lineHeight: 1.6,
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
        {emp.summary}
      </p>

      {/* Evidence items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {emp.evidence.map((ev, i) => {
          const sm = SOURCE_META[ev.source];
          return (
            <div key={i} style={{
              background: "#fff", border: "1px solid #EBEBEB",
              borderRadius: 8, padding: "10px 12px",
              borderLeft: `3px solid ${sm.color}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                <sm.Icon size={12} color={sm.color} />
                <span style={{ fontSize: 11, fontWeight: 600, color: sm.color, fontFamily: "Inter, system-ui, sans-serif" }}>
                  {sm.label}
                </span>
                <span style={{ fontSize: 11, color: "#D4D4D8", marginLeft: "auto", fontFamily: "Inter, system-ui, sans-serif" }}>
                  {ev.date}
                </span>
              </div>
              <p style={{
                margin: 0, fontSize: 12, color: "#52525B", lineHeight: 1.55,
                fontFamily: "Inter, system-ui, sans-serif",
                fontStyle: "italic",
              }}>
                "{ev.quote}"
              </p>
            </div>
          );
        })}
      </div>

      {/* See all skills */}
      <div style={{ marginTop: 12 }}>
        <button style={{
          background: "none", border: "none", cursor: "pointer", padding: 0,
          fontSize: 12, fontWeight: 500, color: ORANGE,
          fontFamily: "Inter, system-ui, sans-serif",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          See all skills <ChevronRight size={11} color={ORANGE} />
        </button>
      </div>
    </div>
  );
}

// ─── Employee row ─────────────────────────────────────────────────────────────

function EmployeeRow({
  emp, skillName, expanded, onToggle,
}: {
  emp: Employee; skillName: string; expanded: boolean; onToggle: () => void;
}) {
  const [hov, setHov] = useState(false);
  const ms = MENTION_STYLES[emp.mention];
  const cs = CONF_STYLES[emp.confidence];

  return (
    <div>
      <div
        onClick={onToggle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          padding: "12px 16px",
          background: expanded ? "#F5F3FF" : hov ? "#FAFAFA" : "transparent",
          cursor: "pointer", transition: "background 0.12s",
          borderTop: "1px solid #F5F5F5",
        }}
      >
        {/* Avatar */}
        <img
          src={emp.avatar}
          alt={emp.name}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            objectFit: "cover", border: "1.5px solid #E4E4E7", flexShrink: 0,
            marginTop: 2,
          }}
          onError={e => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(emp.name)}`; }}
        />

        {/* Name + title + company */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif" }}>
              {emp.name}
            </span>
            {/* Confidence pill */}
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 20, height: 20, borderRadius: 5,
              background: cs.bg,
              fontSize: 10, fontWeight: 700, color: cs.text,
              fontFamily: "Inter, system-ui, sans-serif", flexShrink: 0,
            }}>
              {emp.confidence}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#71717A", fontFamily: "Inter, system-ui, sans-serif", marginBottom: 6 }}>
            {emp.title} · {emp.company}
          </div>
          {/* Mention badge */}
          <span style={{
            display: "inline-flex", alignItems: "center",
            background: ms.bg, border: `1px solid ${ms.border}`,
            borderRadius: 5, padding: "2px 7px",
            fontSize: 11, fontWeight: 500, color: ms.text,
            fontFamily: "Inter, system-ui, sans-serif",
          }}>
            {ms.label}
          </span>
        </div>

        {/* Expand chevron */}
        <div style={{
          transform: expanded ? "rotate(90deg)" : "none",
          transition: "transform 0.15s", color: "#A1A1AA",
          display: "flex", marginTop: 10, flexShrink: 0,
        }}>
          <ChevronRight size={14} color="#A1A1AA" />
        </div>
      </div>

      {/* Inline skill insights */}
      {expanded && <SkillInsights emp={emp} skillName={skillName} />}
    </div>
  );
}

// ─── Right Rail ───────────────────────────────────────────────────────────────

function RightRail({ skill, onClose }: { skill: FlatSkill; onClose: () => void }) {
  const [expandedEmp, setExpandedEmp] = useState<string | null>(null);
  const employees = getMockEmployees(skill.name);

  // Reset expanded employee when skill changes
  useEffect(() => { setExpandedEmp(null); }, [skill.name]);

  const themeShort = skill.theme.split("(")[0].trim();

  return (
    <div style={{
      width: 400, flexShrink: 0, height: "100%",
      background: "#FFFFFF", borderLeft: "1px solid #EBEBEB",
      display: "flex", flexDirection: "column",
      overflowY: "auto",
      animation: "slideInRight 0.22s cubic-bezier(0.4,0,0.2,1)",
    }}>
      <style>{`
        @keyframes slideInRight{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid #F0F0F0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif" }}>
                {skill.category}
              </span>
              <ChevronRight size={10} color="#D4D4D8" />
              <span style={{ fontSize: 11, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif" }}>
                {themeShort}
              </span>
            </div>
            {/* Skill name */}
            <h2 style={{
              margin: 0, fontSize: 19, fontWeight: 700,
              color: "#18181B", fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: "-0.02em", lineHeight: 1.2,
            }}>
              {skill.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 26, height: 26, borderRadius: 6,
              background: "transparent", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#A1A1AA", flexShrink: 0, transition: "background 0.12s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F4F4F5")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <X size={15} />
          </button>
        </div>

        {/* Employee count */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: ORANGE_LIGHT, border: `1px solid ${ORANGE_BORDER}`,
          borderRadius: 6, padding: "4px 10px", marginTop: 10,
        }}>
          <Users size={12} color={ORANGE} />
          <span style={{ fontSize: 12, fontWeight: 600, color: ORANGE, fontFamily: "Inter, system-ui, sans-serif" }}>
            {skill.employees} employees with this skill
          </span>
        </div>
      </div>

      {/* ── Section label ───────────────────────────────────────────── */}
      <div style={{ padding: "10px 16px 4px" }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Inter, system-ui, sans-serif" }}>
          Ranked by evidence strength
        </span>
      </div>

      {/* ── Employee list ────────────────────────────────────────────── */}
      <div style={{ flex: 1 }}>
        {employees.map(emp => (
          <EmployeeRow
            key={emp.id}
            emp={emp}
            skillName={skill.name}
            expanded={expandedEmp === emp.id}
            onToggle={() => setExpandedEmp(prev => prev === emp.id ? null : emp.id)}
          />
        ))}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <div style={{ padding: "14px 16px", borderTop: "1px solid #F0F0F0" }}>
        <button style={{
          width: "100%", height: 36, background: ORANGE,
          border: "none", borderRadius: 8, color: "#fff",
          fontSize: 13, fontWeight: 600,
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
      {matches.length > 0 && (
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
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 14px", cursor: "pointer", transition: "background 0.1s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#F9F9F9")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif" }}>{skill.name}</span>
                <span style={{ fontSize: 12, color: "#A1A1AA", marginLeft: 6, fontFamily: "Inter, system-ui, sans-serif" }}>· {skill.category}</span>
              </div>
              <span style={{
                background: ORANGE_LIGHT, border: `1px solid ${ORANGE_BORDER}`,
                borderRadius: 5, padding: "2px 7px", fontSize: 11, fontWeight: 500, color: ORANGE,
                fontFamily: "Inter, system-ui, sans-serif", flexShrink: 0,
              }}>
                {skill.employees}
              </span>
            </div>
          ))}
          <div style={{ height: 1, background: "#F0F0F0", margin: "4px 0" }} />
        </>
      )}

      {matches.length === 0 && (
        <div style={{ padding: "12px 14px 4px" }}>
          <span style={{ fontSize: 12, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif" }}>No existing skills match "{query}"</span>
          <div style={{ height: 1, background: "#F0F0F0", margin: "8px 0 4px" }} />
        </div>
      )}

      {/* AI extract row */}
      <div
        onClick={() => onAiSearch(query)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", cursor: "pointer", transition: "background 0.1s" }}
        onMouseEnter={e => (e.currentTarget.style.background = ORANGE_LIGHT)}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{ width: 22, height: 22, borderRadius: 5, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Search size={12} color="#fff" />
        </div>
        <div>
          <span style={{ fontSize: 13, color: "#52525B", fontFamily: "Inter, system-ui, sans-serif" }}>Search: </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif" }}>{query}</span>
        </div>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif" }}>AI extract</span>
      </div>
    </div>
  );
}

// ─── AI extraction card ───────────────────────────────────────────────────────

function AiExtractionCard({ query, onClose }: { query: string; onClose: () => void }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const start = Date.now();
    const duration = 1600;
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) requestAnimationFrame(tick);
      else setDone(true);
    };
    requestAnimationFrame(tick);
  }, [query]);

  if (!done) return (
    <div style={{
      background: "#F5F3FF", border: `1px solid ${ORANGE_BORDER}`,
      borderRadius: 12, padding: "20px 24px", marginBottom: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: ORANGE, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={15} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif" }}>
            Extracting skill: "{query}"
          </div>
          <div style={{ fontSize: 12, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif", marginTop: 1 }}>
            This may take a moment…
          </div>
        </div>
      </div>
      <div style={{ height: 4, background: "#DDD6FE", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: ORANGE, borderRadius: 2, transition: "width 0.06s linear" }} />
      </div>
    </div>
  );

  return (
    <div style={{
      background: "#F5F3FF", border: `1px solid ${ORANGE_BORDER}`,
      borderRadius: 12, padding: "20px 24px", marginBottom: 24,
      animation: "fadeUp 0.3s ease",
    }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
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
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1, background: "#fff", border: `1px solid ${ORANGE_BORDER}`, borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5, fontFamily: "Inter, system-ui, sans-serif" }}>Closest match</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif", marginBottom: 2 }}>Goal Setting</div>
          <div style={{ fontSize: 12, color: "#71717A", fontFamily: "Inter, system-ui, sans-serif" }}>Planning & Prioritization</div>
        </div>
        <div style={{ flex: 1, background: "#fff", border: `1px solid ${ORANGE_BORDER}`, borderRadius: 8, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5, fontFamily: "Inter, system-ui, sans-serif" }}>Employees found</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: ORANGE, fontFamily: "Inter, system-ui, sans-serif" }}>26</div>
          <div style={{ fontSize: 12, color: "#71717A", fontFamily: "Inter, system-ui, sans-serif" }}>mention this in reviews</div>
        </div>
      </div>
    </div>
  );
}

// ─── Count badge ──────────────────────────────────────────────────────────────

function CountBadge({ n, orange }: { n: number; orange?: boolean }) {
  return (
    <span style={{
      background: orange ? ORANGE_LIGHT : "#F4F4F5",
      border: `1px solid ${orange ? ORANGE_BORDER : "#E4E4E7"}`,
      borderRadius: 5, padding: "1px 7px",
      fontSize: 11, fontWeight: 500,
      color: orange ? ORANGE : "#71717A",
      fontFamily: "Inter, system-ui, sans-serif", flexShrink: 0,
    }}>
      {n}{!orange && " skills"}
    </span>
  );
}

// ─── Predefined taxonomy mock data ───────────────────────────────────────────

interface PredefinedSkill { name: string }
interface PredefinedCategory { name: string; count: number; skills: PredefinedSkill[] }
interface PredefinedTheme { theme: string; count: number; categories: PredefinedCategory[] }

const PREDEFINED_TAXONOMY: PredefinedTheme[] = [
  {
    theme: "Leadership", count: 5,
    categories: [
      { name: "People Management", count: 3, skills: [
        { name: "Delegation" },
        { name: "Performance Feedback" },
        { name: "Team Building" },
      ]},
      { name: "Strategic Leadership", count: 2, skills: [
        { name: "Vision Setting" },
        { name: "Change Management" },
      ]},
    ],
  },
  {
    theme: "Technical", count: 4,
    categories: [
      { name: "Engineering", count: 2, skills: [
        { name: "System Design" },
        { name: "Code Review" },
      ]},
      { name: "Data & Analytics", count: 2, skills: [
        { name: "SQL" },
        { name: "Data Visualization" },
      ]},
    ],
  },
  {
    theme: "Communication", count: 4,
    categories: [
      { name: "Written", count: 2, skills: [
        { name: "Documentation" },
        { name: "Report Writing" },
      ]},
      { name: "Verbal", count: 2, skills: [
        { name: "Presentation Skills" },
        { name: "Stakeholder Updates" },
      ]},
    ],
  },
];

// ─── Promo banner ─────────────────────────────────────────────────────────────

function PromoBanner({ onSwitch }: { onSwitch: () => void }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #EEF2FF 0%, #EFF6FF 100%)",
      border: "1px solid #C7D2FE",
      borderRadius: 12, padding: "16px 18px",
      display: "flex", alignItems: "flex-start", gap: 12,
      marginBottom: 20,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: "#7C5CF6", display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0,
      }}>
        <Sparkles size={16} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif", marginBottom: 4 }}>
          Try AI-Generated Skills
        </div>
        <div style={{ fontSize: 12.5, color: "#52525B", lineHeight: 1.6, fontFamily: "Inter, system-ui, sans-serif", marginBottom: 12 }}>
          Discover skills extracted from your org's own performance reviews, check-ins, and profiles — unique to your company's language.
        </div>
        <button
          onClick={onSwitch}
          style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "#7C5CF6", border: "none", borderRadius: 7,
            padding: "7px 14px", color: "#fff",
            fontSize: 12.5, fontWeight: 600, cursor: "pointer",
            fontFamily: "Inter, system-ui, sans-serif",
            transition: "opacity 0.12s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <Sparkles size={12} />
          Switch to AI-Generated Skills
        </button>
      </div>
    </div>
  );
}

// ─── Predefined taxonomy browser ─────────────────────────────────────────────

function PredefinedTaxonomyBrowser() {
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(
    new Set(["Leadership", "Technical", "Communication"])
  );
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(["People Management"])
  );
  const toggleTheme = (t: string) => setExpandedThemes(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  const toggleCat   = (c: string) => setExpandedCats(prev =>   { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });

  return (
    <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, overflow: "hidden" }}>
      {PREDEFINED_TAXONOMY.map((theme, ti) => (
        <div key={theme.theme}>
          {/* Theme row */}
          <div
            onClick={() => toggleTheme(theme.theme)}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "13px 18px",
              background: "#FAFAFA", borderTop: ti > 0 ? "1px solid #F0F0F0" : "none",
              cursor: "pointer", userSelect: "none",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#F4F4F5")}
            onMouseLeave={e => (e.currentTarget.style.background = "#FAFAFA")}
          >
            <div style={{ transform: expandedThemes.has(theme.theme) ? "rotate(90deg)" : "none", transition: "transform 0.15s", display: "flex" }}>
              <ChevronRight size={15} color="#71717A" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif", flex: 1 }}>
              {theme.theme}
            </span>
            <span style={{
              background: "#EFF6FF", border: "1px solid #BFDBFE",
              borderRadius: 5, padding: "1px 7px",
              fontSize: 11, fontWeight: 500, color: "#2563EB",
              fontFamily: "Inter, system-ui, sans-serif",
            }}>
              {theme.count} skills
            </span>
          </div>

          {expandedThemes.has(theme.theme) && theme.categories.map(cat => (
            <div key={cat.name}>
              {/* Category row */}
              <div
                onClick={() => toggleCat(cat.name)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 18px 10px 44px", borderTop: "1px solid #F5F5F5",
                  cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ transform: expandedCats.has(cat.name) ? "rotate(90deg)" : "none", transition: "transform 0.15s", display: "flex" }}>
                  <ChevronRight size={13} color="#A1A1AA" />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 500, color: "#3F3F46", fontFamily: "Inter, system-ui, sans-serif", flex: 1 }}>
                  {cat.name}
                </span>
                <span style={{
                  background: "#F4F4F5", border: "1px solid #E4E4E7",
                  borderRadius: 5, padding: "1px 7px",
                  fontSize: 11, fontWeight: 500, color: "#71717A",
                  fontFamily: "Inter, system-ui, sans-serif",
                }}>
                  {cat.count} skills
                </span>
              </div>

              {expandedCats.has(cat.name) && cat.skills.map(skill => (
                <div
                  key={skill.name}
                  style={{
                    padding: "9px 18px 9px 68px",
                    borderTop: "1px solid #F9F9F9",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#52525B", fontFamily: "Inter, system-ui, sans-serif" }}>
                    {skill.name}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Floating version switcher ────────────────────────────────────────────────

function FloatingVersionSwitcher({
  current, onChange,
}: { current: "empty" | "populated"; onChange: (v: "empty" | "populated") => void }) {
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 200,
      background: "#18181B", borderRadius: 10,
      padding: "7px 10px",
      display: "flex", alignItems: "center", gap: 8,
      boxShadow: "0 4px 24px rgba(0,0,0,0.28), 0 1px 4px rgba(0,0,0,0.18)",
    }}>
      <span style={{
        fontSize: 10, fontWeight: 600, color: "#71717A",
        fontFamily: "Inter, system-ui, sans-serif", letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>
        View
      </span>
      <div style={{ display: "flex", background: "#27272A", borderRadius: 6, padding: 2, gap: 1 }}>
        {(["empty", "populated"] as const).map(v => (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              padding: "4px 10px", borderRadius: 5, border: "none", cursor: "pointer",
              background: current === v ? "#fff" : "transparent",
              color: current === v ? "#18181B" : "#71717A",
              fontSize: 11, fontWeight: current === v ? 600 : 400,
              fontFamily: "Inter, system-ui, sans-serif",
              transition: "all 0.15s",
            }}
          >
            {v === "empty" ? "Empty" : "Populated"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      background: "#fff", border: "1px solid #EBEBEB", borderRadius: 12,
      padding: "56px 32px", display: "flex", flexDirection: "column",
      alignItems: "center", gap: 12,
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: "#F4F4F5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BookOpen size={24} color="#D4D4D8" />
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#71717A", fontFamily: "Inter, system-ui, sans-serif" }}>
        No skills discovered yet
      </div>
      <div style={{ fontSize: 13, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif", textAlign: "center", maxWidth: 340, lineHeight: 1.6 }}>
        Skills will be generated once your org has data like performance reviews and feedback. Check back after your next review cycle.
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SkillsSearch() {
  const [activeTab, setActiveTab]     = useState<"ai" | "predefined">("ai");
  const [query, setQuery]             = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(
    new Set(["Building (Action & Execution)", "Leading (People & Influence)", "Thinking (Strategy & Analysis)"])
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Planning & Prioritization"])
  );
  const [selectedSkill, setSelectedSkill] = useState<FlatSkill | null>(null);
  const [aiResult, setAiResult]       = useState<string | null>(null);
  const [predefinedView, setPredefinedView] = useState<"empty" | "populated">("empty");

  const searchRef  = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    setSelectedSkill(skill); setQuery(skill.name); setShowDropdown(false);
  }, []);

  const handleAiSearch = useCallback((q: string) => {
    setAiResult(q); setShowDropdown(false);
  }, []);

  const toggleTheme    = (t: string) => setExpandedThemes(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });
  const toggleCategory = (c: string) => setExpandedCategories(prev => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", background: "#F9F9F9", overflow: "hidden" }}>

      {/* ── Main scroll area ──────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", minWidth: 0 }}>

        {/* Page header */}
        <h1 style={{ margin: "0 0 16px", fontSize: 22, fontWeight: 700, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif", letterSpacing: "-0.02em" }}>
          Skills Search
        </h1>

        {/* Tabs + timestamp */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", background: "#F0F0F0", borderRadius: 9, padding: 3, gap: 2 }}>
            {([
              { id: "ai",         label: "AI-Generated Skills", icon: <Sparkles size={13} />, activeColor: "#7C5CF6" },
              { id: "predefined", label: "Predefined Skills",   icon: <BookOpen  size={13} />, activeColor: "#2563EB" },
            ] as const).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer",
                transition: "all 0.15s", fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                background: activeTab === tab.id ? "#fff" : "transparent",
                color: activeTab === tab.id ? "#18181B" : "#71717A",
                boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}>
                <span style={{ color: activeTab === tab.id ? tab.activeColor : "#A1A1AA" }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab === "ai" && (
            <span style={{ fontSize: 12, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif" }}>
              Last updated: May 28, 2026
            </span>
          )}
        </div>

        {activeTab === "ai" ? (
          <>
            {/* Search bar */}
            <div style={{ position: "relative", marginBottom: 8 }} ref={dropdownRef}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "#fff", padding: "0 16px", height: 50,
                border: `1.5px solid ${showDropdown || query ? ORANGE : "#E4E4E7"}`,
                borderRadius: 12,
                boxShadow: showDropdown || query ? "0 0 0 3px rgba(124,92,246,0.10),0 2px 10px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.05)",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}>
                <Search size={18} color={query ? ORANGE : "#A1A1AA"} style={{ flexShrink: 0, transition: "color 0.15s" }} />
                <input
                  ref={searchRef}
                  type="text" value={query}
                  placeholder="Search for a skill..."
                  onChange={e => { setQuery(e.target.value); setShowDropdown(!!e.target.value); }}
                  onFocus={() => { if (query) setShowDropdown(true); }}
                  style={{
                    flex: 1, border: "none", outline: "none", background: "transparent",
                    fontSize: 15, color: "#18181B",
                    fontFamily: "Inter, system-ui, sans-serif",
                  }}
                />
                {query && (
                  <button onClick={() => { setQuery(""); setShowDropdown(false); setAiResult(null); }}
                    style={{ width: 22, height: 22, borderRadius: "50%", background: "#E4E4E7", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={12} color="#52525B" />
                  </button>
                )}
              </div>
              {showDropdown && query.length >= 1 && (
                <SearchDropdown query={query} onSelectSkill={handleSelectSkill} onAiSearch={handleAiSearch} />
              )}
            </div>
            <p style={{ margin: "0 0 24px", fontSize: 12.5, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif" }}>
              Search the AI-extracted skill taxonomy, or search for a phrase to extract skills on-demand.
            </p>

            {aiResult && <AiExtractionCard key={aiResult} query={aiResult} onClose={() => setAiResult(null)} />}

            {/* Taxonomy */}
            <div style={{ background: "#fff", border: "1px solid #EBEBEB", borderRadius: 12, overflow: "hidden" }}>
              {TAXONOMY.map((theme, ti) => (
                <div key={theme.theme}>
                  {/* Theme row */}
                  <div
                    onClick={() => toggleTheme(theme.theme)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "13px 18px",
                      background: "#FAFAFA", borderTop: ti > 0 ? "1px solid #F0F0F0" : "none",
                      cursor: "pointer", userSelect: "none",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#F4F4F5")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#FAFAFA")}
                  >
                    <div style={{ transform: expandedThemes.has(theme.theme) ? "rotate(90deg)" : "none", transition: "transform 0.15s", display: "flex" }}>
                      <ChevronRight size={15} color="#71717A" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#18181B", fontFamily: "Inter, system-ui, sans-serif", flex: 1 }}>
                      {theme.theme}
                    </span>
                    <CountBadge n={theme.count} />
                  </div>

                  {expandedThemes.has(theme.theme) && theme.categories.map(cat => (
                    <div key={cat.name}>
                      {/* Category row */}
                      <div
                        onClick={() => toggleCategory(cat.name)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 18px 10px 44px", borderTop: "1px solid #F5F5F5",
                          cursor: "pointer",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <div style={{ transform: expandedCategories.has(cat.name) ? "rotate(90deg)" : "none", transition: "transform 0.15s", display: "flex" }}>
                          <ChevronRight size={13} color="#A1A1AA" />
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: 500, color: "#3F3F46", fontFamily: "Inter, system-ui, sans-serif", flex: 1 }}>
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
                              borderTop: "1px solid #F9F9F9", cursor: "pointer",
                              background: isActive ? ORANGE_LIGHT : "transparent",
                              borderLeft: isActive ? `3px solid ${ORANGE}` : "3px solid transparent",
                              transition: "background 0.1s",
                            }}
                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#FAFAFA"; }}
                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                          >
                            <span style={{ flex: 1, fontSize: 13, fontWeight: isActive ? 500 : 400, color: isActive ? "#18181B" : "#52525B", fontFamily: "Inter, system-ui, sans-serif" }}>
                              {skill.name}
                            </span>
                            <div style={{
                              display: "flex", alignItems: "center", gap: 4,
                              background: isActive ? "#fff" : ORANGE_LIGHT, border: `1px solid ${ORANGE_BORDER}`,
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
          /* Predefined Skills tab */
          <>
            {predefinedView === "populated" ? (
              <>
                <PromoBanner onSwitch={() => setActiveTab("ai")} />
                <PredefinedTaxonomyBrowser />
              </>
            ) : (
              /* Empty state */
              <div style={{
                background: "#fff", border: "1px solid #EBEBEB", borderRadius: 12,
                padding: "56px 32px", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <BookOpen size={24} color="#93C5FD" />
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#71717A", fontFamily: "Inter, system-ui, sans-serif" }}>
                  Predefined Skills taxonomy
                </div>
                <div style={{ fontSize: 13, color: "#A1A1AA", fontFamily: "Inter, system-ui, sans-serif", textAlign: "center", maxWidth: 340, lineHeight: 1.6 }}>
                  Predefined Skills taxonomy — existing view, not redesigned in this project.
                </div>
              </div>
            )}
            <FloatingVersionSwitcher current={predefinedView} onChange={setPredefinedView} />
          </>
        )}
      </div>

      {/* ── Right rail ───────────────────────────────────────────────── */}
      {selectedSkill && (
        <RightRail skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
      )}
    </div>
  );
}
