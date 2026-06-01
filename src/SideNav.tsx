import React, { useState } from "react";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  blue:    "#4F72F5",
  purple:  "#7C5CF6",
  green:   "#22A658",
  magenta: "#C026D3",
};

// ─── Icon primitives ──────────────────────────────────────────────────────────
const Svg = ({ children, size = 16 }: { children: React.ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    {children}
  </svg>
);

const icons: Record<string, (color: string) => React.ReactNode> = {
  // Header
  logo: (_c) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="#FAFAFA" strokeWidth="1.8"/>
      <circle cx="7" cy="7" r="2"   fill="#FAFAFA"/>
    </svg>
  ),
  collapse: (_c) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2.5" y="2.5" width="13" height="13" rx="2" stroke="#354052" strokeWidth="1.2"/>
      <line x1="6.5" y1="2.5" x2="6.5" y2="15.5" stroke="#354052" strokeWidth="1.2"/>
      <path d="M10 6.5l2.5 2.5-2.5 2.5" stroke="#354052" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevronDown: (_c) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="#3F3F46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  chevronRight: (c) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 3l4 4-4 4" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // CPOHQ
  feed: (c) => <Svg>
    <rect x="2" y="2" width="5.5" height="5.5" rx="1" stroke={c} strokeWidth="1.4"/>
    <rect x="8.5" y="2" width="5.5" height="5.5" rx="1" stroke={c} strokeWidth="1.4"/>
    <rect x="2" y="8.5" width="5.5" height="5.5" rx="1" stroke={c} strokeWidth="1.4"/>
    <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1" stroke={c} strokeWidth="1.4"/>
  </Svg>,
  benchmarks: (c) => <Svg>
    <rect x="2" y="2" width="12" height="9" rx="1.5" stroke={c} strokeWidth="1.4"/>
    <path d="M5 9l2-3 2 2 2-4" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="4" y1="13" x2="12" y2="13" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
  </Svg>,
  library: (c) => <Svg>
    <rect x="2"   y="2" width="3" height="12" rx="0.8" stroke={c} strokeWidth="1.3"/>
    <rect x="6.5" y="2" width="3" height="12" rx="0.8" stroke={c} strokeWidth="1.3"/>
    <path d="M11 2.5l2.5 11" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
  </Svg>,
  more: (c) => <Svg>
    <circle cx="4"  cy="8" r="1.2" fill={c}/>
    <circle cx="8"  cy="8" r="1.2" fill={c}/>
    <circle cx="12" cy="8" r="1.2" fill={c}/>
  </Svg>,

  // AI
  portal: (c) => <Svg>
    <circle cx="8" cy="8" r="5.5" stroke={c} strokeWidth="1.4"/>
    <ellipse cx="8" cy="8" rx="2.5" ry="5.5" stroke={c} strokeWidth="1.2"/>
    <line x1="2.5" y1="8" x2="13.5" y2="8" stroke={c} strokeWidth="1.2"/>
  </Svg>,
  teamCards: (c) => <Svg>
    <rect x="2" y="4" width="12" height="9" rx="1.5" stroke={c} strokeWidth="1.4"/>
    <circle cx="6" cy="8" r="1.8" stroke={c} strokeWidth="1.2"/>
    <path d="M10 7h2.5M10 9.5h2" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
  </Svg>,
  skillsSearch: (c) => <Svg>
    <line x1="3" y1="4.5" x2="13" y2="4.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="3" y1="8"   x2="9"  y2="8"   stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="3" y1="11.5" x2="7" y2="11.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="11.5" cy="10.5" r="2" stroke={c} strokeWidth="1.2"/>
    <line x1="13" y1="12" x2="14.5" y2="13.5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
  </Svg>,
  heatmap: (c) => <Svg>
    <circle cx="8" cy="8" r="2.2" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="1.2"/>
    <circle cx="3" cy="5" r="1.5" stroke={c} strokeWidth="1.2"/>
    <circle cx="13" cy="5" r="1.5" stroke={c} strokeWidth="1.2"/>
    <circle cx="3" cy="11" r="1.5" stroke={c} strokeWidth="1.2"/>
    <circle cx="13" cy="11" r="1.5" stroke={c} strokeWidth="1.2"/>
    <line x1="4.4" y1="5.9" x2="6.3" y2="6.8"  stroke={c} strokeWidth="1.1"/>
    <line x1="11.6" y1="5.9" x2="9.7" y2="6.8" stroke={c} strokeWidth="1.1"/>
    <line x1="4.4" y1="10.1" x2="6.3" y2="9.2" stroke={c} strokeWidth="1.1"/>
    <line x1="11.6" y1="10.1" x2="9.7" y2="9.2" stroke={c} strokeWidth="1.1"/>
  </Svg>,
  orgChart: (c) => <Svg>
    <rect x="5.5" y="1.5" width="5" height="3.5" rx="1" stroke={c} strokeWidth="1.3"/>
    <rect x="1"   y="11"  width="4.5" height="3.5" rx="1" stroke={c} strokeWidth="1.3"/>
    <rect x="10.5" y="11" width="4.5" height="3.5" rx="1" stroke={c} strokeWidth="1.3"/>
    <line x1="8" y1="5" x2="8" y2="8" stroke={c} strokeWidth="1.3"/>
    <line x1="3.25" y1="8" x2="12.75" y2="8" stroke={c} strokeWidth="1.3"/>
    <line x1="3.25" y1="8" x2="3.25" y2="11" stroke={c} strokeWidth="1.3"/>
    <line x1="12.75" y1="8" x2="12.75" y2="11" stroke={c} strokeWidth="1.3"/>
  </Svg>,

  // Analytics
  overview: (c) => <Svg>
    <rect x="2"   y="2"   width="5" height="5" rx="1" stroke={c} strokeWidth="1.3"/>
    <rect x="9"   y="2"   width="5" height="5" rx="1" stroke={c} strokeWidth="1.3"/>
    <rect x="2"   y="9"   width="5" height="5" rx="1" stroke={c} strokeWidth="1.3"/>
    <rect x="9"   y="9"   width="5" height="5" rx="1" stroke={c} strokeWidth="1.3"/>
  </Svg>,
  employeeLists: (c) => <Svg>
    <circle cx="6" cy="5.5" r="2.5" stroke={c} strokeWidth="1.3"/>
    <path d="M2 14c0-3.3 1.8-5 4-5s4 1.7 4 5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="11" y1="6"  x2="14.5" y2="6"  stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="11" y1="9"  x2="14.5" y2="9"  stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="11" y1="12" x2="14.5" y2="12" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
  </Svg>,
  workforce: (c) => <Svg>
    <circle cx="5.5" cy="5" r="2.2" stroke={c} strokeWidth="1.3"/>
    <path d="M1.5 14c0-2.8 1.8-4.5 4-4.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <circle cx="10.5" cy="5" r="2.2" stroke={c} strokeWidth="1.3"/>
    <path d="M14.5 14c0-2.8-1.8-4.5-4-4.5s-4 1.7-4 4.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
  </Svg>,
  attrition: (c) => <Svg>
    <circle cx="8" cy="5.5" r="2.5" stroke={c} strokeWidth="1.3"/>
    <path d="M3 14c0-3 2.2-5 5-5s5 2 5 5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="11" y1="10" x2="11" y2="14.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M9 13l2 1.5 2-1.5" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>,

  // Custom Dashboards
  pin: (c) => <Svg>
    <path d="M8 2l1.5 4.5H13l-3 2.5 1 4L8 11l-3 2.5 1-4-3-2.5h3.5L8 2z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
    <line x1="8" y1="13.5" x2="8" y2="15.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
  </Svg>,
  seeAll: (c) => <Svg>
    <line x1="2" y1="4.5"  x2="14" y2="4.5"  stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="2" y1="8"    x2="14" y2="8"    stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="2" y1="11.5" x2="14" y2="11.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
  </Svg>,

  // Admin
  manageUsers: (c) => <Svg>
    <circle cx="7" cy="5.5" r="2.5" stroke={c} strokeWidth="1.3"/>
    <path d="M2 14c0-3 2.2-5 5-5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="12.5" y1="9.5" x2="12.5" y2="14.5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
    <line x1="10" y1="12"    x2="15"   y2="12"   stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
  </Svg>,
  managePermissions: (c) => <Svg>
    <circle cx="7" cy="5.5" r="2.5" stroke={c} strokeWidth="1.3"/>
    <path d="M2 14c0-3 2.2-5 5-5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <rect x="10" y="9" width="5" height="5.5" rx="1" stroke={c} strokeWidth="1.2"/>
    <path d="M11.5 9V7.5a1 1 0 012 0V9" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
  </Svg>,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Icon({ name, color }: { name: string; color: string }) {
  const fn = icons[name];
  if (!fn) return null;
  return <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{fn(color)}</span>;
}

interface NavItemProps {
  iconName: string;
  label: string;
  color: string;
  active?: boolean;
  rightSlot?: React.ReactNode;
  onClick?: () => void;
}

function NavItem({ iconName, label, color, active = false, rightSlot, onClick }: NavItemProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        gap: 8,
        height: 32,
        borderRadius: 6,
        cursor: "pointer",
        background: active
          ? `${color}14`
          : hovered ? "rgba(0,0,0,0.04)" : "transparent",
        transition: "background 0.12s",
      }}
    >
      <Icon name={iconName} color={active ? color : `${color}99`} />
      <span style={{
        flex: 1,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: active ? 500 : 400,
        fontSize: 14,
        lineHeight: "100%",
        color: active ? color : "#434343",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {label}
      </span>
      {rightSlot}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      padding: "4px 4px",
      fontSize: 13,
      fontWeight: 600,
      color: "#434343",
      fontFamily: "Inter, system-ui, sans-serif",
      marginBottom: 2,
    }}>
      {label}
    </div>
  );
}

function MoreItem({ color, count = 2, onClick, expanded }: { color: string; count?: number; onClick: () => void; expanded: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        gap: 8,
        height: 32,
        borderRadius: 6,
        cursor: "pointer",
        background: hovered ? "rgba(0,0,0,0.04)" : "transparent",
        transition: "background 0.12s",
      }}
    >
      <Icon name="more" color={`${color}99`} />
      <span style={{
        flex: 1,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 400,
        fontSize: 14,
        color: "#434343",
      }}>More</span>
      <div style={{
        background: color,
        borderRadius: 96,
        padding: "0 8px",
        height: 20,
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#fff", whiteSpace: "nowrap" }}>
          +{count} others
        </span>
      </div>
      <div style={{
        transform: expanded ? "rotate(90deg)" : "none",
        transition: "transform 0.15s",
        display: "flex",
        flexShrink: 0,
      }}>
        {icons.chevronRight(color)}
      </div>
    </div>
  );
}

// ─── SideNav ──────────────────────────────────────────────────────────────────

export default function SideNav() {
  const [cpohqMore, setCpohqMore]     = useState(false);
  const [analyticsMore, setAnalyticsMore] = useState(false);
  const [adminMore, setAdminMore]     = useState(false);

  return (
    <div style={{
      width: 228,
      height: "100vh",
      background: "#FFFFFF",
      borderRight: "1px solid #F5F5F5",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      fontFamily: "Inter, system-ui, sans-serif",
    }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ padding: 8, borderBottom: "1px solid #F5F5F5" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 6px 8px 4px",
          gap: 12,
          borderRadius: 6,
          cursor: "pointer",
        }}>
          {/* App logo */}
          <div style={{
            width: 22, height: 22,
            background: "#18181B",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            {icons.logo("")}
          </div>

          {/* Name + chevron */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 0, gap: 4 }}>
            <span style={{
              flex: 1,
              fontWeight: 600,
              fontSize: 14,
              color: "#3F3F46",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              People Intelligence
            </span>
            {icons.chevronDown("")}
          </div>

          {/* Separator */}
          <div style={{ width: 1, height: 16, background: "#F0F0F0", flexShrink: 0 }} />

          {/* Collapse */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            {icons.collapse("")}
          </div>
        </div>
      </div>

      {/* ── Nav body ────────────────────────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "8px 8px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>

        {/* CPOHQ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <SectionLabel label="CPOHQ" />
          <NavItem iconName="feed"       label="Feed"       color={C.blue} />
          <NavItem iconName="benchmarks" label="Benchmarks" color={C.blue} />
          <NavItem iconName="library"    label="Library"    color={C.blue} />
          <MoreItem color={C.blue} count={2} onClick={() => setCpohqMore(v => !v)} expanded={cpohqMore} />
        </div>

        {/* AI */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <SectionLabel label="AI" />
          <NavItem iconName="portal"       label="Portal"       color={C.purple} />
          <NavItem iconName="teamCards"    label="Team Cards"   color={C.purple} />
          <NavItem iconName="skillsSearch" label="Skills Search" color={C.purple} />
          <NavItem iconName="heatmap"      label="Heatmap"      color={C.purple} active />
          <NavItem iconName="orgChart"     label="Org Chart"    color={C.purple} />
        </div>

        {/* Analytics */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <SectionLabel label="Analytics" />
          <NavItem iconName="overview"       label="Overview"       color={C.green} />
          <NavItem iconName="employeeLists"  label="Employee Lists" color={C.green} />
          <NavItem iconName="workforce"      label="Workforce"      color={C.green} />
          <NavItem iconName="attrition"      label="Attrition"      color={C.green} />
          <MoreItem color={C.green} count={2} onClick={() => setAnalyticsMore(v => !v)} expanded={analyticsMore} />
        </div>

        {/* Custom Dashboards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <SectionLabel label="Custom Dashboards" />
          <NavItem iconName="pin"    label="Pin 1"   color={C.green} />
          <NavItem iconName="pin"    label="Pin 2"   color={C.green} />
          <NavItem iconName="seeAll" label="See All" color={C.green} />
        </div>

        {/* Admin Superpowers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <SectionLabel label="Admin Superpowers" />
          <NavItem iconName="manageUsers"       label="Manage Users"       color={C.magenta} />
          <NavItem iconName="managePermissions" label="Manage Permissions" color={C.magenta} />
          <MoreItem color={C.magenta} count={2} onClick={() => setAdminMore(v => !v)} expanded={adminMore} />
        </div>

      </div>
    </div>
  );
}
