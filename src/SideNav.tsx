import React, { useState } from "react";

// ─── Inline SVG icons ────────────────────────────────────────────────────────

function IconDataUsage() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="9"  width="2.5" height="6" rx="0.5" fill="#FAFAFA"/>
      <rect x="4.5" y="6" width="2.5" height="9" rx="0.5" fill="#FAFAFA"/>
      <rect x="8" y="3" width="2.5" height="12" rx="0.5" fill="#FAFAFA"/>
      <rect x="11.5" y="1" width="2.5" height="14" rx="0.5" fill="#FAFAFA"/>
    </svg>
  );
}

function IconLayoutList({ color = "#326CF0" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="2.5" rx="1" stroke={color} strokeWidth="1.4"/>
      <rect x="2" y="6.75" width="12" height="2.5" rx="1" stroke={color} strokeWidth="1.4"/>
      <rect x="2" y="10.5" width="12" height="2.5" rx="1" stroke={color} strokeWidth="1.4"/>
    </svg>
  );
}

function IconPortal({ color = "#326CF0" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke={color} strokeWidth="1.4"/>
      <circle cx="2.5" cy="4"  r="1.5" stroke={color} strokeWidth="1.4"/>
      <circle cx="13.5" cy="4"  r="1.5" stroke={color} strokeWidth="1.4"/>
      <circle cx="2.5" cy="12" r="1.5" stroke={color} strokeWidth="1.4"/>
      <circle cx="13.5" cy="12" r="1.5" stroke={color} strokeWidth="1.4"/>
      <line x1="5.3" y1="6.5" x2="3.5" y2="5.3" stroke={color} strokeWidth="1.2"/>
      <line x1="10.7" y1="6.5" x2="12.5" y2="5.3" stroke={color} strokeWidth="1.2"/>
      <line x1="5.3" y1="9.5" x2="3.5" y2="10.7" stroke={color} strokeWidth="1.2"/>
      <line x1="10.7" y1="9.5" x2="12.5" y2="10.7" stroke={color} strokeWidth="1.2"/>
    </svg>
  );
}

function IconLibrary({ color = "#326CF0" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="3.5" height="12" rx="1" stroke={color} strokeWidth="1.4"/>
      <rect x="6.5" y="2" width="3.5" height="12" rx="1" stroke={color} strokeWidth="1.4"/>
      <path d="M11 2.5l3 10.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconEllipsis({ color = "#326CF0" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="4"  cy="8" r="1.3" fill={color}/>
      <circle cx="8"  cy="8" r="1.3" fill={color}/>
      <circle cx="12" cy="8" r="1.3" fill={color}/>
    </svg>
  );
}

function IconChevronDown({ color = "#3F3F46" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconChevronRight({ color = "#434343" }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 3l4 4-4 4" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSidebarCollapse() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2.5" y="2.5" width="13" height="13" rx="2" stroke="#354052" strokeWidth="1.2"/>
      <line x1="6.5" y1="2.5" x2="6.5" y2="15.5" stroke="#354052" strokeWidth="1.2"/>
      <path d="M10 7l2 2-2 2" stroke="#354052" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconPackages() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="7" width="6" height="7" rx="1" stroke="#fff" strokeWidth="1.2"/>
      <rect x="8" y="7" width="6" height="7" rx="1" stroke="#fff" strokeWidth="1.2"/>
      <rect x="4" y="2" width="8" height="5" rx="1" stroke="#fff" strokeWidth="1.2"/>
      <line x1="8" y1="2" x2="8" y2="7" stroke="#fff" strokeWidth="1.2"/>
    </svg>
  );
}

// ─── Nav item ────────────────────────────────────────────────────────────────

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  rightSlot?: React.ReactNode;
}

function NavItem({ icon, label, active = false, onClick, rightSlot }: NavItemProps) {
  const [hovered, setHovered] = useState(false);
  const highlighted = active || hovered;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "0 8px",
        gap: 8,
        height: 32,
        borderRadius: 6,
        cursor: "pointer",
        background: active
          ? "rgba(50, 108, 240, 0.08)"
          : hovered
          ? "rgba(0,0,0,0.04)"
          : "transparent",
        transition: "background 0.12s",
      }}
    >
      <span style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{icon}</span>
      <span style={{
        flex: 1,
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: active ? 500 : 400,
        fontSize: 14,
        color: active ? "#326CF0" : "#434343",
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

// ─── SideNav ─────────────────────────────────────────────────────────────────

export default function SideNav() {
  const [modulesExpanded, setModulesExpanded] = useState(false);

  const subMenuItems = [
    "Workforce Analytics",
    "Attrition Risk",
    "Compensation",
    "Headcount Planning",
    "Diversity & Inclusion",
    "Engagement Scores",
  ];

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

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ padding: 8, borderBottom: "1px solid #F5F5F5" }}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "8px 6px 8px 4px",
          gap: 12,
          borderRadius: 6,
          cursor: "pointer",
        }}>
          {/* App icon */}
          <div style={{
            width: 22, height: 22,
            background: "#18181B",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}>
            <IconDataUsage />
          </div>

          {/* App name + chevron */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 0 }}>
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
            <IconChevronDown />
          </div>

          {/* Separator */}
          <div style={{ width: 1, height: 16, background: "#F0F0F0", flexShrink: 0 }} />

          {/* Sidebar collapse */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            <IconSidebarCollapse />
          </div>
        </div>
      </div>

      {/* ── Nav body ───────────────────────────────────────────────────── */}
      <div style={{
        padding: "8px 8px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        flex: 1,
        overflowY: "auto",
      }}>

        {/* CPOHQ section */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>

          {/* Section label */}
          <div style={{
            padding: "4px 4px",
            fontSize: 13,
            fontWeight: 600,
            color: "#434343",
            marginBottom: 2,
          }}>
            CPOHQ
          </div>

          {/* Org Chart — active (current page) */}
          <NavItem
            icon={<IconLayoutList color="#326CF0" />}
            label="Org Chart"
            active
          />

          {/* Network */}
          <NavItem
            icon={<IconPortal color="#9CA3AF" />}
            label="Network"
          />

          {/* Data Packs */}
          <NavItem
            icon={<IconLibrary color="#9CA3AF" />}
            label="Data Packs"
          />

          {/* Modules — expandable */}
          <div>
            <NavItem
              icon={<IconEllipsis color="#9CA3AF" />}
              label="Modules"
              onClick={() => setModulesExpanded(v => !v)}
              rightSlot={
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {/* +6 others pill */}
                  <div style={{
                    background: "#326CF0",
                    borderRadius: 96,
                    padding: "0 6px 0 4px",
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                  }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#fff",
                      lineHeight: "22px",
                      whiteSpace: "nowrap",
                    }}>+6 others</span>
                  </div>
                  <div style={{
                    transform: modulesExpanded ? "rotate(90deg)" : "none",
                    transition: "transform 0.15s",
                    display: "flex",
                  }}>
                    <IconChevronRight />
                  </div>
                </div>
              }
            />

            {/* Submenu */}
            {modulesExpanded && (
              <div style={{
                marginTop: 2,
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid #F0F0F0",
              }}>
                {/* Green header */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  gap: 8,
                  height: 40,
                  background: "#3CB449",
                  borderBottom: "1px solid #F0F0F0",
                }}>
                  <IconPackages />
                  <span style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#fff",
                  }}>More Modules</span>
                </div>

                {/* Sub items */}
                <div style={{
                  padding: "8px 6px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  background: "#fff",
                }}>
                  {subMenuItems.map((item) => (
                    <div
                      key={item}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "0 8px",
                        height: 28,
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 14,
                        color: "#434343",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#F5F5F5")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
