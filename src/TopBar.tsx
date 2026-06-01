import React, { useState } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 5l4 4 4-4" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCollapse({ collapsed }: { collapsed: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <rect x="2" y="2" width="13" height="13" rx="2.5" stroke="#71717A" strokeWidth="1.2"/>
      <line x1="6" y1="2.2" x2="6" y2="14.8" stroke="#71717A" strokeWidth="1.2"/>
      {collapsed
        ? <path d="M9.5 6.5l2.5 2-2.5 2" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        : <path d="M11.5 6.5L9 8.5l2.5 2" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      }
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4 2l4 4-4 4" stroke="#A1A1AA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M7 4.2V7l1.8 1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Venetian masquerade mask — for X-Ray Vision
function IconMask({ active }: { active: boolean }) {
  const c = active ? "#7C5CF6" : "#71717A";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      {/* Left half of mask */}
      <path d="M8 4.5C6.5 4.5 4 5.5 2.5 7C3.5 9 5.5 10 7.5 9.5C8 9 8 8 8 7.5z"
        stroke={c} strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      {/* Right half of mask */}
      <path d="M8 4.5C9.5 4.5 12 5.5 13.5 7C12.5 9 10.5 10 8.5 9.5C8 9 8 8 8 7.5z"
        stroke={c} strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
      {/* Left eye cutout */}
      <ellipse cx="5" cy="7" rx="1.4" ry="1.1" stroke={c} strokeWidth="1" fill={active ? "#7C5CF615" : "none"}/>
      {/* Right eye cutout */}
      <ellipse cx="11" cy="7" rx="1.4" ry="1.1" stroke={c} strokeWidth="1" fill={active ? "#7C5CF615" : "none"}/>
      {/* Left feather flourish */}
      <path d="M3.5 5C3 4 2.5 3 3 2.5" stroke={c} strokeWidth="1" strokeLinecap="round"/>
      {/* Right feather flourish */}
      <path d="M12.5 5C13 4 13.5 3 13 2.5" stroke={c} strokeWidth="1" strokeLinecap="round"/>
      {/* Handle */}
      <line x1="8" y1="9.5" x2="8" y2="12.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function IconLightning() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M9 2L4 8.5h4.5L6 13l8-7H9.5L9 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1.5v2.2M7.5 11.3v2.2M1.5 7.5h2.2M11.3 7.5h2.2M3.7 3.7l1.55 1.55M9.75 9.75l1.55 1.55M11.3 3.7L9.75 5.25M5.25 9.75L3.7 11.3"
        stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
      <circle cx="7.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.25"/>
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
      <path d="M4.5 1A2.5 2.5 0 012 3.5V5.5l-1 1h7l-1-1V3.5A2.5 2.5 0 014.5 1z"
        stroke="#fff" strokeWidth="1" strokeLinejoin="round"/>
      <path d="M3.5 7.5a1 1 0 002 0" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on }: { on: boolean }) {
  return (
    <div style={{
      width: 28, height: 16,
      borderRadius: 8,
      background: on ? "#7C5CF6" : "#E4E4E7",
      position: "relative",
      flexShrink: 0,
      transition: "background 0.2s",
      pointerEvents: "none",
    }}>
      <div style={{
        position: "absolute",
        top: 2, left: on ? 12 : 2,
        width: 12, height: 12,
        borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
        transition: "left 0.18s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function TopBar({ collapsed, onToggleCollapse }: TopBarProps) {
  const [xrayOn, setXrayOn] = useState(false);
  const [classicHover, setClassicHover] = useState(false);
  const [xrayHover, setXrayHover] = useState(false);

  const leftW = collapsed ? 52 : 228;

  return (
    <>
      <style>{`
        .topbar-iconbtn:hover { background: #F4F4F5 !important; }
        .topbar-iconbtn { transition: background 0.12s; }
      `}</style>
      <div style={{
        height: 52,
        background: "#FFFFFF",
        borderBottom: "1px solid #EBEBEB",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        fontFamily: "Inter, system-ui, sans-serif",
        boxShadow: "0 1px 0 #F0F0F0",
      }}>

        {/* ── Left: Logo + collapse ──────────────────────────────────────── */}
        <div style={{
          width: leftW,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "0" : "0 10px",
          gap: collapsed ? 0 : 8,
          height: "100%",
          borderRight: "1px solid #EBEBEB",
          overflow: "hidden",
          transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
        }}>
          {/* Logo */}
          <img
            src="/logo.png"
            alt="PI"
            style={{
              width: 24, height: 24,
              borderRadius: 5,
              flexShrink: 0,
              objectFit: "contain",
            }}
          />

          {!collapsed && (
            <>
              {/* App name */}
              <span style={{
                flex: 1,
                fontWeight: 600,
                fontSize: 13.5,
                color: "#18181B",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 0,
                letterSpacing: "-0.01em",
              }}>
                People Intellig...
              </span>
              <IconChevronDown />

              {/* Separator */}
              <div style={{ width: 1, height: 16, background: "#E4E4E7", flexShrink: 0, marginLeft: 2 }} />
            </>
          )}

          {/* Collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="topbar-iconbtn"
            style={{
              width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "transparent",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              flexShrink: 0,
              marginLeft: collapsed ? 0 : 2,
            }}
          >
            <IconCollapse collapsed={collapsed} />
          </button>
        </div>

        {/* ── Center: Breadcrumb ────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          minWidth: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              fontSize: 13,
              color: "#A1A1AA",
              fontWeight: 400,
              letterSpacing: "0.01em",
            }}>Analytics</span>
            <IconChevronRight />
            <span style={{
              fontSize: 13.5,
              color: "#18181B",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}>Network Graph</span>
          </div>
        </div>

        {/* ── Right: Actions ───────────────────────────────────────────── */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 14px",
          flexShrink: 0,
        }}>

          {/* Go to Classic */}
          <button
            onMouseEnter={() => setClassicHover(true)}
            onMouseLeave={() => setClassicHover(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              height: 30,
              padding: "0 11px",
              background: classicHover ? "#F9F9F9" : "#fff",
              border: `1px solid ${classicHover ? "#D4D4D8" : "#E4E4E7"}`,
              borderRadius: 16,
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: 500,
              color: "#3F3F46",
              fontFamily: "Inter, system-ui, sans-serif",
              whiteSpace: "nowrap",
              transition: "all 0.12s",
            }}
          >
            <IconClock />
            Go to Classic
          </button>

          {/* X-Ray Vision */}
          <button
            onMouseEnter={() => setXrayHover(true)}
            onMouseLeave={() => setXrayHover(false)}
            onClick={() => setXrayOn(v => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              height: 30,
              padding: "0 10px",
              background: xrayOn
                ? "rgba(124,92,246,0.06)"
                : xrayHover ? "#F9F9F9" : "#fff",
              border: `1px solid ${xrayOn ? "rgba(124,92,246,0.3)" : xrayHover ? "#D4D4D8" : "#E4E4E7"}`,
              borderRadius: 16,
              cursor: "pointer",
              fontFamily: "Inter, system-ui, sans-serif",
              transition: "all 0.15s",
            }}
          >
            <IconMask active={xrayOn} />
            <span style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: xrayOn ? "#7C5CF6" : "#71717A",
              whiteSpace: "nowrap",
              transition: "color 0.15s",
            }}>
              X-Ray Vision
            </span>
            <Toggle on={xrayOn} />
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: "#E4E4E7", marginLeft: 2, marginRight: 2 }} />

          {/* Lightning */}
          <button className="topbar-iconbtn" style={{
            width: 30, height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent",
            border: "none",
            borderRadius: 7,
            cursor: "pointer",
            color: "#52525B",
          }}>
            <IconLightning />
          </button>

          {/* Avatar with notification */}
          <div style={{ position: "relative", flexShrink: 0, marginLeft: 2, marginRight: 2 }}>
            <img
              src="/joseph.png"
              alt="Joseph"
              style={{
                width: 32, height: 32,
                borderRadius: "50%",
                objectFit: "cover",
                display: "block",
                border: "2px solid #E4E4E7",
              }}
            />
            {/* Notification badge — teardrop shape */}
            <div style={{
              position: "absolute",
              bottom: -5,
              left: "50%",
              transform: "translateX(-50%)",
              width: 16, height: 16,
              background: "#18181B",
              borderRadius: "50% 50% 50% 50% / 55% 55% 45% 45%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1.5px solid #fff",
            }}>
              <IconBell />
            </div>
          </div>

          {/* Sparkle */}
          <button className="topbar-iconbtn" style={{
            width: 30, height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent",
            border: "none",
            borderRadius: 7,
            cursor: "pointer",
            color: "#52525B",
          }}>
            <IconSparkle />
          </button>
        </div>
      </div>
    </>
  );
}
