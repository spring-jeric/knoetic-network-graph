import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import type { Page } from "./App";
import {
  LayoutList, AreaChart, Library, MoreHorizontal, ChevronRight,
  Globe, IdCard, TextSearch, Network, Share2,
  LayoutGrid, UserRoundSearch, Users2, UserMinus,
  Pin, List, UserPlus, UserPen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  blue:    "#4F72F5",
  purple:  "#7C5CF6",
  green:   "#22A658",
  magenta: "#C026D3",
};

// ─── Nav sections config ──────────────────────────────────────────────────────
type NavEntry =
  | { type: "item";  icon: LucideIcon; label: string; color: string; active?: boolean }
  | { type: "more";  color: string; count: number };

const NAV_SECTIONS: { label: string; items: NavEntry[] }[] = [
  {
    label: "CPOHQ",
    items: [
      { type: "item", icon: LayoutList, label: "Feed",       color: C.blue },
      { type: "item", icon: AreaChart,  label: "Benchmarks", color: C.blue },
      { type: "item", icon: Library,    label: "Library",    color: C.blue },
      { type: "more", color: C.blue, count: 2 },
    ],
  },
  {
    label: "AI",
    items: [
      { type: "item", icon: Globe,           label: "Portal",        color: C.purple },
      { type: "item", icon: IdCard,          label: "Team Cards",    color: C.purple },
      { type: "item", icon: TextSearch,       label: "Skills Search", color: C.purple },
      { type: "item", icon: Network,         label: "Heatmap",       color: C.purple, active: true },
      { type: "item", icon: Share2,          label: "Org Chart",     color: C.purple },
    ],
  },
  {
    label: "Analytics",
    items: [
      { type: "item", icon: LayoutGrid,      label: "Overview",       color: C.green },
      { type: "item", icon: UserRoundSearch, label: "Employee Lists", color: C.green },
      { type: "item", icon: Users2,          label: "Workforce",      color: C.green },
      { type: "item", icon: UserMinus,       label: "Attrition",      color: C.green },
      { type: "more", color: C.green, count: 2 },
    ],
  },
  {
    label: "Custom Dashboards",
    items: [
      { type: "item", icon: Pin,  label: "Pin 1",   color: C.green },
      { type: "item", icon: Pin,  label: "Pin 2",   color: C.green },
      { type: "item", icon: List, label: "See All", color: C.green },
    ],
  },
  {
    label: "Admin Superpowers",
    items: [
      { type: "item", icon: UserPlus, label: "Manage Users",       color: C.magenta },
      { type: "item", icon: UserPen,  label: "Manage Permissions", color: C.magenta },
      { type: "more", color: C.magenta, count: 2 },
    ],
  },
];

// ─── Tooltip portal ───────────────────────────────────────────────────────────

function NavTooltip({ label, anchor }: { label: string; anchor: HTMLElement | null }) {
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  return ReactDOM.createPortal(
    <div style={{
      position: "fixed",
      left: rect.right + 10,
      top: rect.top + rect.height / 2,
      transform: "translateY(-50%)",
      background: "#18181B",
      color: "#FAFAFA",
      fontSize: 12,
      fontWeight: 500,
      padding: "5px 10px",
      borderRadius: 7,
      whiteSpace: "nowrap",
      pointerEvents: "none",
      zIndex: 9999,
      fontFamily: "Inter, system-ui, sans-serif",
      letterSpacing: "0.01em",
      boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
    }}>
      {label}
    </div>,
    document.body
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({
  icon: Icon, label, color, active = false, collapsed = false,
  rightSlot, onClick,
}: {
  icon: LucideIcon; label: string; color: string;
  active?: boolean; collapsed?: boolean;
  rightSlot?: React.ReactNode; onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={ref}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? 0 : "0 8px",
          gap: 8,
          height: 34,
          borderRadius: 8,
          cursor: "pointer",
          background: active ? `${color}14` : hovered ? "rgba(0,0,0,0.05)" : "transparent",
          transition: "background 0.12s",
          ...(collapsed ? { margin: "0 auto", width: 36 } : {}),
        }}
      >
        <Icon size={16} color={color} strokeWidth={1.75} />
        {!collapsed && (
          <>
            <span style={{
              flex: 1,
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: active ? 500 : 400,
              fontSize: 13.5,
              lineHeight: "100%",
              color: active ? color : "#3F3F46",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {label}
            </span>
            {rightSlot}
          </>
        )}
      </div>
      {collapsed && hovered && <NavTooltip label={label} anchor={ref.current} />}
    </>
  );
}

// ─── MoreItem ─────────────────────────────────────────────────────────────────

function MoreItem({
  color, count, expanded, collapsed = false, onClick,
}: {
  color: string; count: number; expanded: boolean; collapsed?: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={ref}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? 0 : "0 8px",
          gap: 8,
          height: 34,
          borderRadius: 8,
          cursor: "pointer",
          background: hovered ? "rgba(0,0,0,0.05)" : "transparent",
          transition: "background 0.12s",
          ...(collapsed ? { margin: "0 auto", width: 36 } : {}),
        }}
      >
        <MoreHorizontal size={16} color={color} strokeWidth={1.75} />
        {!collapsed && (
          <>
            <span style={{
              flex: 1,
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 13.5,
              color: "#3F3F46",
            }}>
              More
            </span>
            <div style={{
              background: color, borderRadius: 96,
              padding: "0 7px", height: 18,
              display: "flex", alignItems: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: "#fff", whiteSpace: "nowrap" }}>
                +{count} others
              </span>
            </div>
            <div style={{
              transform: expanded ? "rotate(90deg)" : "none",
              transition: "transform 0.15s",
              display: "flex", flexShrink: 0,
            }}>
              <ChevronRight size={13} color={color} />
            </div>
          </>
        )}
      </div>
      {collapsed && hovered && <NavTooltip label={`+${count} more`} anchor={ref.current} />}
    </>
  );
}

// ─── SideNav ──────────────────────────────────────────────────────────────────

interface SideNavProps {
  collapsed?: boolean;
  currentPage?: Page;
  onNavigate?: (page: Page) => void;
}

// Map nav labels to page routes
const NAV_ROUTES: Partial<Record<string, Page>> = {
  "Heatmap":       "heatmap",
  "Skills Search": "skills-search",
};

export default function SideNav({ collapsed = false, currentPage, onNavigate }: SideNavProps) {
  // Track expanded state for each "More" row by section index
  const [moreExpanded, setMoreExpanded] = useState<Record<number, boolean>>({});
  const toggleMore = (si: number) =>
    setMoreExpanded(prev => ({ ...prev, [si]: !prev[si] }));

  return (
    <>
      <style>{`
        .sidenav-scroll::-webkit-scrollbar { width: 3px; }
        .sidenav-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidenav-scroll::-webkit-scrollbar-thumb { background: #E4E4E7; border-radius: 3px; }
        .sidenav-scroll::-webkit-scrollbar-thumb:hover { background: #D4D4D8; }
        .sidenav-scroll { scrollbar-width: thin; scrollbar-color: #E4E4E7 transparent; }
      `}</style>

      <div style={{
        width: collapsed ? 52 : 228,
        height: "100%",
        background: "#FFFFFF",
        borderRight: "1px solid #EBEBEB",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>
        <div
          className="sidenav-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: collapsed ? "10px 0 16px" : "8px 8px 16px",
            display: "flex",
            flexDirection: "column",
            gap: collapsed ? 2 : 20,
          }}
        >
          {NAV_SECTIONS.map((section, si) => (
            <div key={section.label} style={{ display: "flex", flexDirection: "column", gap: 1 }}>

              {/* Section label / divider */}
              {collapsed
                ? <div style={{ height: 1, background: "#EBEBEB", margin: "6px 12px" }} />
                : (
                  <div style={{
                    padding: "4px 4px",
                    fontSize: 11, fontWeight: 600,
                    color: "#A1A1AA",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}>
                    {section.label}
                  </div>
                )
              }

              {section.items.map((entry, ei) =>
                entry.type === "item" ? (
                  <NavItem
                    key={ei}
                    icon={entry.icon}
                    label={entry.label}
                    color={entry.color}
                    active={
                      NAV_ROUTES[entry.label]
                        ? currentPage === NAV_ROUTES[entry.label]
                        : entry.active
                    }
                    collapsed={collapsed}
                    onClick={NAV_ROUTES[entry.label] ? () => onNavigate?.(NAV_ROUTES[entry.label]!) : undefined}
                  />
                ) : (
                  <MoreItem
                    key={ei}
                    color={entry.color}
                    count={entry.count}
                    expanded={!!moreExpanded[si]}
                    collapsed={collapsed}
                    onClick={() => toggleMore(si)}
                  />
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
