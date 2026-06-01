import React, { useState } from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconChevronDown() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M3.5 5.5l4 4 4-4" stroke="#3F3F46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCollapse() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2.5" y="2.5" width="13" height="13" rx="2" stroke="#71717A" strokeWidth="1.2"/>
      <line x1="6.5" y1="2.5" x2="6.5" y2="15.5" stroke="#71717A" strokeWidth="1.2"/>
      <path d="M10 6.5l2.5 2.5-2.5 2.5" stroke="#71717A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="#A1A1AA" strokeWidth="1.4"/>
      <line x1="10.2" y1="10.2" x2="13.5" y2="13.5" stroke="#A1A1AA" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="#52525B" strokeWidth="1.3"/>
      <path d="M7.5 4.5v3l2 1.5" stroke="#52525B" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconXRay() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1.5C5 4 2 5.5 2 8c0 3 2.5 5 5.5 5S13 11 13 8c0-2.5-3-4-5.5-6.5z" stroke="#A1A1AA" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

function IconLightning() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M9.5 2L4 9h5l-2.5 5L14 7H9L9.5 2z" stroke="#52525B" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

function IconSparkle() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2v2.5M8 11.5V14M2 8h2.5M11.5 8H14M4.05 4.05l1.77 1.77M10.18 10.18l1.77 1.77M11.95 4.05l-1.77 1.77M5.82 10.18l-1.77 1.77" stroke="#52525B" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="8" cy="8" r="2" stroke="#52525B" strokeWidth="1.3"/>
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M4.5 2.5l4 4-4 4" stroke="#A1A1AA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 1a3 3 0 013 3v2l1 1H1l1-1V4a3 3 0 013-3z" stroke="#fff" strokeWidth="1" strokeLinejoin="round"/>
      <path d="M4 8.5a1 1 0 002 0" stroke="#fff" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 32, height: 18,
        borderRadius: 9,
        background: on ? "#6D5FFA" : "#E4E4E7",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute",
        top: 2,
        left: on ? 14 : 2,
        width: 14, height: 14,
        borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transition: "left 0.18s",
      }} />
    </div>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

export default function TopBar() {
  const [xrayOn, setXrayOn] = useState(false);

  return (
    <div style={{
      height: 52,
      background: "#FFFFFF",
      borderBottom: "1px solid #F0F0F0",
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
      fontFamily: "Inter, system-ui, sans-serif",
    }}>

      {/* ── Left: Logo section (228px — aligns with side nav) ─────────── */}
      <div style={{
        width: 228,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        gap: 10,
        height: "100%",
        borderRight: "1px solid #F0F0F0",
      }}>
        {/* Logo */}
        <img
          src="/logo.png"
          alt="People Intelligence"
          style={{ width: 26, height: 26, borderRadius: 6, flexShrink: 0 }}
        />

        {/* App name + chevron */}
        <span style={{
          flex: 1,
          fontWeight: 600,
          fontSize: 14,
          color: "#3F3F46",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          minWidth: 0,
        }}>
          People Intellig...
        </span>
        <IconChevronDown />

        {/* Separator */}
        <div style={{ width: 1, height: 18, background: "#E4E4E7", flexShrink: 0 }} />

        {/* Sidebar collapse */}
        <div style={{ cursor: "pointer", display: "flex", flexShrink: 0 }}>
          <IconCollapse />
        </div>
      </div>

      {/* ── Center: Breadcrumb + Search ────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 20,
        minWidth: 0,
      }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 14, color: "#A1A1AA", fontWeight: 400 }}>Analytics</span>
          <IconChevronRight />
          <span style={{ fontSize: 14, color: "#18181B", fontWeight: 600 }}>Network Graph</span>
        </div>

        {/* Search */}
        <div style={{
          flex: 1,
          maxWidth: 360,
          height: 34,
          background: "#FAFAFA",
          border: "1px solid #E4E4E7",
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          cursor: "text",
        }}>
          <IconSearch />
          <span style={{ flex: 1, fontSize: 13, color: "#A1A1AA" }}>Search employees</span>
          {/* ⌘K badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "#F4F4F5",
            border: "1px solid #E4E4E7",
            borderRadius: 5,
            padding: "2px 5px",
          }}>
            <span style={{ fontSize: 11, color: "#71717A", fontWeight: 500, lineHeight: 1 }}>⌘</span>
            <span style={{ fontSize: 11, color: "#71717A", fontWeight: 500, lineHeight: 1 }}>K</span>
          </div>
        </div>
      </div>

      {/* ── Right: Actions ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 16px",
        flexShrink: 0,
      }}>

        {/* Go to Classic */}
        <button style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 32,
          padding: "0 12px",
          background: "#fff",
          border: "1px solid #E4E4E7",
          borderRadius: 20,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
          color: "#3F3F46",
          fontFamily: "Inter, system-ui, sans-serif",
          whiteSpace: "nowrap",
        }}>
          <IconClock />
          Go to Classic
        </button>

        {/* X-Ray Vision */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          height: 32,
          padding: "0 10px",
          background: "#fff",
          border: "1px solid #E4E4E7",
          borderRadius: 20,
          cursor: "pointer",
        }}
          onClick={() => setXrayOn(v => !v)}
        >
          <IconXRay />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#A1A1AA", whiteSpace: "nowrap" }}>X-Ray Vision</span>
          <Toggle on={xrayOn} onChange={() => setXrayOn(v => !v)} />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: "#E4E4E7" }} />

        {/* Lightning */}
        <button style={{
          width: 32, height: 32,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}>
          <IconLightning />
        </button>

        {/* Avatar */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img
            src="/joseph.png"
            alt="Joseph"
            style={{
              width: 34, height: 34,
              borderRadius: "50%",
              objectFit: "cover",
              display: "block",
              border: "2px solid #E4E4E7",
            }}
          />
          {/* Notification pin */}
          <div style={{
            position: "absolute",
            bottom: -6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 18, height: 18,
            background: "#18181B",
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid #fff",
          }}>
            <IconBell />
          </div>
        </div>

        {/* Sparkle */}
        <button style={{
          width: 32, height: 32,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "transparent",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}>
          <IconSparkle />
        </button>
      </div>
    </div>
  );
}
