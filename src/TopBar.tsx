import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronDown, ChevronRight, RotateCcw, VenetianMask,
  Bell, PanelLeftClose, PanelLeftOpen, Search,
} from "lucide-react";

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ on }: { on: boolean }) {
  return (
    <div style={{
      width: 28, height: 16, borderRadius: 8,
      background: on ? "#7C5CF6" : "#E4E4E7",
      position: "relative", flexShrink: 0,
      transition: "background 0.2s", pointerEvents: "none",
    }}>
      <div style={{
        position: "absolute", top: 2, left: on ? 12 : 2,
        width: 12, height: 12, borderRadius: "50%",
        background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
        transition: "left 0.18s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

// ─── Icon button ──────────────────────────────────────────────────────────────

function IconBtn({
  children, onClick, title,
}: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 30, height: 30,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: hov ? "#F4F4F5" : "transparent",
        border: "none", borderRadius: 7, cursor: "pointer",
        transition: "background 0.12s", flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

interface TopBarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function TopBar({ collapsed, onToggleCollapse }: TopBarProps) {
  const [xrayOn, setXrayOn]           = useState(false);
  const [classicHov, setClassicHov]   = useState(false);
  const [xrayHov, setXrayHov]         = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const leftW = collapsed ? 52 : 228;

  // ⌘K / Ctrl+K focuses the search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      searchRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const iconColor = "#52525B";

  return (
    <>
    <style>{`.topbar-search::placeholder { color: #595959; opacity: 1; }`}</style>
    <div style={{
      height: 52,
      background: "#FFFFFF",
      borderBottom: "1px solid #EBEBEB",
      display: "flex",
      alignItems: "center",
      flexShrink: 0,
      fontFamily: "Inter, system-ui, sans-serif",
    }}>

      {/* ── Left: Logo + collapse ─────────────────────────────────────── */}
      <div style={{
        width: leftW, flexShrink: 0,
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        padding: collapsed ? "0" : "0 10px",
        gap: collapsed ? 0 : 8,
        height: "100%",
        borderRight: "1px solid #EBEBEB",
        overflow: "hidden",
        transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {!collapsed && (
          <svg width="24" height="24" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
            <rect width="22" height="22" rx="4" fill="#18181B"/>
            <path d="M9.58325 5.76211C7.28203 6.38575 5.58325 8.47778 5.58325 10.9838C5.5835 13.9778 8.00618 16.3998 11.0002 16.3998C12.4738 16.3997 13.8034 15.8113 14.7766 14.8578L15.217 15.1166C14.1427 16.2165 12.6496 16.8998 10.9934 16.8998C7.72875 16.8998 5.0835 14.2503 5.08325 10.9838C5.08325 8.20099 6.9971 5.86966 9.58325 5.23672V5.76211ZM12.4163 5.23672C14.998 5.87106 16.9163 8.20757 16.9163 10.9838C16.9162 11.5418 16.8336 12.0818 16.6858 12.5941L16.2405 12.3324C16.3512 11.9051 16.4162 11.4548 16.4163 10.9838C16.4163 8.47758 14.7178 6.38459 12.4163 5.76113V5.23672Z" fill="black" stroke="#FAFAFA" strokeWidth="1.5"/>
          </svg>
        )}
        {!collapsed && (
          <>
            <span style={{
              flex: 1, fontWeight: 600, fontSize: 13.5, color: "#18181B",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              minWidth: 0, letterSpacing: "-0.01em",
            }}>
              People Intellig...
            </span>
            <ChevronDown size={14} color="#71717A" />
            <div style={{ width: 1, height: 16, background: "#E4E4E7", flexShrink: 0, marginLeft: 2 }} />
          </>
        )}
        <button
          onClick={onToggleCollapse}
          style={{
            width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent", border: "none", borderRadius: 6, cursor: "pointer",
            flexShrink: 0, marginLeft: collapsed ? 0 : 2,
            transition: "background 0.12s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#F4F4F5")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          {collapsed ? <PanelLeftOpen size={17} color="#71717A" /> : <PanelLeftClose size={17} color="#71717A" />}
        </button>
      </div>

      {/* ── Breadcrumb ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 16px 0 20px", flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: "#A1A1AA", fontWeight: 400 }}>Analytics</span>
        <ChevronRight size={12} color="#A1A1AA" />
        <span style={{ fontSize: 13.5, color: "#18181B", fontWeight: 600, letterSpacing: "-0.01em" }}>
          Network Graph
        </span>
      </div>

      {/* ── Search ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", minWidth: 0 }}>
        {/* Spec: 284×32px, pill, padding 6 9 6 12, gap 6 */}
        <div
          onClick={() => searchRef.current?.focus()}
          style={{
            boxSizing: "border-box",
            display: "flex", flexDirection: "row",
            alignItems: "center",
            padding: "6px 9px 6px 12px",
            gap: 6,
            width: 284, height: 32,
            background: "#FFFFFF",
            border: `1px solid ${searchFocused ? "#C4B5FD" : "#D9D9D9"}`,
            borderRadius: 100,
            cursor: "text",
            boxShadow: searchFocused ? "0 0 0 3px rgba(124,92,246,0.08)" : "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
            flexShrink: 0,
          }}
        >
          {/* Search icon 16×16, color #595959 */}
          <Search size={16} color="#595959" strokeWidth={1.8} style={{ flexShrink: 0 }} />

          {/* Input — fills remaining space */}
          <input
            ref={searchRef}
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search employees"
            className="topbar-search"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              padding: 0,
              margin: 0,
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 13,
              lineHeight: "16px",
              color: "#18181B",
              minWidth: 0,
            }}
          />

          {/* ⌘K badge: 36×20, bg #F5F5F5, border #E6E6E6, radius 5 */}
          {!searchValue ? (
            <div style={{
              display: "flex", flexDirection: "row",
              alignItems: "center", justifyContent: "center",
              padding: "4px 6px", gap: 4,
              width: 36, height: 20, flexShrink: 0,
              background: "#F5F5F5",
              border: "1px solid #E6E6E6",
              borderRadius: 5,
              opacity: searchFocused ? 0.5 : 1,
              transition: "opacity 0.15s",
              boxSizing: "border-box",
            }}>
              {/* ⌘ command symbol, 12×12 */}
              <span style={{
                fontSize: 12, lineHeight: "12px",
                color: "#737373", flexShrink: 0,
              }}>⌘</span>
              {/* K */}
              <span style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontWeight: 500, fontSize: 11, lineHeight: "16px",
                color: "#737373",
              }}>K</span>
            </div>
          ) : (
            /* Clear ✕ */
            <button
              onClick={e => { e.stopPropagation(); setSearchValue(""); searchRef.current?.focus(); }}
              style={{
                width: 18, height: 18, borderRadius: "50%",
                background: "#E4E4E7", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: "#52525B", fontWeight: 700, flexShrink: 0,
              }}
            >✕</button>
          )}
        </div>
      </div>

      {/* ── Right: Actions ────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "0 14px", flexShrink: 0,
      }}>

        {/* Go to Classic */}
        <button
          onMouseEnter={() => setClassicHov(true)}
          onMouseLeave={() => setClassicHov(false)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            height: 30, padding: "0 11px",
            background: classicHov ? "#F9F9F9" : "#fff",
            border: `1px solid ${classicHov ? "#D4D4D8" : "#E4E4E7"}`,
            borderRadius: 16, cursor: "pointer",
            fontSize: 12.5, fontWeight: 500, color: "#3F3F46",
            fontFamily: "Inter, system-ui, sans-serif",
            whiteSpace: "nowrap", transition: "all 0.12s",
          }}
        >
          <RotateCcw size={14} color={iconColor} />
          Go to Classic
        </button>

        {/* X-Ray Vision */}
        <button
          onMouseEnter={() => setXrayHov(true)}
          onMouseLeave={() => setXrayHov(false)}
          onClick={() => setXrayOn(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            height: 30, padding: "0 10px",
            background: xrayOn ? "rgba(124,92,246,0.06)" : xrayHov ? "#F9F9F9" : "#fff",
            border: `1px solid ${xrayOn ? "rgba(124,92,246,0.3)" : xrayHov ? "#D4D4D8" : "#E4E4E7"}`,
            borderRadius: 16, cursor: "pointer",
            fontFamily: "Inter, system-ui, sans-serif", transition: "all 0.15s",
          }}
        >
          <VenetianMask size={15} color={xrayOn ? "#7C5CF6" : "#71717A"} />
          <span style={{
            fontSize: 12.5, fontWeight: 500,
            color: xrayOn ? "#7C5CF6" : "#71717A",
            whiteSpace: "nowrap", transition: "color 0.15s",
          }}>
            X-Ray Vision
          </span>
          <Toggle on={xrayOn} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "#E4E4E7", margin: "0 4px" }} />

        {/* Bell with notification dot */}
        <div style={{ position: "relative" }}>
          <IconBtn title="Notifications">
            <Bell size={15} color={iconColor} />
          </IconBtn>
          {/* Red dot badge */}
          <div style={{
            position: "absolute", top: 5, right: 5,
            width: 7, height: 7, borderRadius: "50%",
            background: "#EF4444", border: "1.5px solid #fff",
            pointerEvents: "none",
          }} />
        </div>

        {/* Avatar */}
        <button
          title="Joseph Rey — open profile"
          style={{
            width: 32, height: 32, borderRadius: "50%",
            padding: 0, border: "2px solid #E4E4E7",
            cursor: "pointer", flexShrink: 0, overflow: "hidden",
            transition: "border-color 0.15s",
            background: "transparent",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "#7C5CF6")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "#E4E4E7")}
        >
          <img
            src="/joseph.png"
            alt="Joseph"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </button>

      </div>
    </div>
    </>
  );
}
