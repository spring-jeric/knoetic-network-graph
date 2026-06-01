import React, { useState } from "react";
import {
  ChevronDown, ChevronRight, History, VenetianMask,
  Zap, Sparkles, Bell, PanelLeftClose, PanelLeftOpen,
} from "lucide-react";

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
  const iconStroke = "#71717A";
  const iconSize = 15;

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
      }}>

        {/* ── Left: Logo + collapse ─────────────────────────────────────── */}
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

          {/* People Intelligence logo — hidden when collapsed */}
          {!collapsed && (
            <svg width="24" height="24" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <rect width="22" height="22" rx="4" fill="#18181B"/>
              <path d="M9.58325 5.76211C7.28203 6.38575 5.58325 8.47778 5.58325 10.9838C5.5835 13.9778 8.00618 16.3998 11.0002 16.3998C12.4738 16.3997 13.8034 15.8113 14.7766 14.8578L15.217 15.1166C14.1427 16.2165 12.6496 16.8998 10.9934 16.8998C7.72875 16.8998 5.0835 14.2503 5.08325 10.9838C5.08325 8.20099 6.9971 5.86966 9.58325 5.23672V5.76211ZM12.4163 5.23672C14.998 5.87106 16.9163 8.20757 16.9163 10.9838C16.9162 11.5418 16.8336 12.0818 16.6858 12.5941L16.2405 12.3324C16.3512 11.9051 16.4162 11.4548 16.4163 10.9838C16.4163 8.47758 14.7178 6.38459 12.4163 5.76113V5.23672Z" fill="black" stroke="#FAFAFA" strokeWidth="1.5"/>
            </svg>
          )}

          {!collapsed && (
            <>
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
              <ChevronDown size={14} color={iconStroke} />
              <div style={{ width: 1, height: 16, background: "#E4E4E7", flexShrink: 0, marginLeft: 2 }} />
            </>
          )}

          {/* Collapse / expand toggle */}
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
            {collapsed
              ? <PanelLeftOpen size={17} color={iconStroke} />
              : <PanelLeftClose size={17} color={iconStroke} />
            }
          </button>
        </div>

        {/* ── Center: Breadcrumb ──────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          minWidth: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 13, color: "#A1A1AA", fontWeight: 400 }}>Analytics</span>
            <ChevronRight size={12} color="#A1A1AA" />
            <span style={{ fontSize: 13.5, color: "#18181B", fontWeight: 600, letterSpacing: "-0.01em" }}>
              Network Graph
            </span>
          </div>
        </div>

        {/* ── Right: Actions ──────────────────────────────────────────────── */}
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
              display: "flex", alignItems: "center", gap: 5,
              height: 30, padding: "0 11px",
              background: classicHover ? "#F9F9F9" : "#fff",
              border: `1px solid ${classicHover ? "#D4D4D8" : "#E4E4E7"}`,
              borderRadius: 16,
              cursor: "pointer",
              fontSize: 12.5, fontWeight: 500, color: "#3F3F46",
              fontFamily: "Inter, system-ui, sans-serif",
              whiteSpace: "nowrap",
              transition: "all 0.12s",
            }}
          >
            <History size={14} color="#52525B" />
            Go to Classic
          </button>

          {/* X-Ray Vision */}
          <button
            onMouseEnter={() => setXrayHover(true)}
            onMouseLeave={() => setXrayHover(false)}
            onClick={() => setXrayOn(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              height: 30, padding: "0 10px",
              background: xrayOn ? "rgba(124,92,246,0.06)" : xrayHover ? "#F9F9F9" : "#fff",
              border: `1px solid ${xrayOn ? "rgba(124,92,246,0.3)" : xrayHover ? "#D4D4D8" : "#E4E4E7"}`,
              borderRadius: 16,
              cursor: "pointer",
              fontFamily: "Inter, system-ui, sans-serif",
              transition: "all 0.15s",
            }}
          >
            <VenetianMask size={15} color={xrayOn ? "#7C5CF6" : "#71717A"} />
            <span style={{
              fontSize: 12.5, fontWeight: 500,
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
            background: "transparent", border: "none", borderRadius: 7, cursor: "pointer",
          }}>
            <Zap size={iconSize} color="#52525B" />
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
            <div style={{
              position: "absolute",
              bottom: -5, left: "50%",
              transform: "translateX(-50%)",
              width: 16, height: 16,
              background: "#18181B",
              borderRadius: "50% 50% 50% 50% / 55% 55% 45% 45%",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1.5px solid #fff",
            }}>
              <Bell size={8} color="#fff" strokeWidth={2.5} />
            </div>
          </div>

          {/* Sparkle */}
          <button className="topbar-iconbtn" style={{
            width: 30, height: 30,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent", border: "none", borderRadius: 7, cursor: "pointer",
          }}>
            <Sparkles size={iconSize} color="#52525B" />
          </button>
        </div>
      </div>
    </>
  );
}
