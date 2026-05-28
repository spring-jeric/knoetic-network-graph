import React, { useState, useCallback } from "react";
import { OrgNode, getHeadcount } from "./data";

interface CardViewProps {
  data: OrgNode;
}

const PROFESSIONAL_PORTRAITS = [
  "1560250097-0b93528c311a", "1573496359142-b8d87734a5a2",
  "1472099645785-5658abf4ff4e", "1519085360753-af0119f7cbe7",
  "1534528741775-53994a69daeb", "1566492031773-4f4e44671857",
  "1507003211169-0a1dd7228f2d", "1570295999919-56ceb5ecca61",
  "1494790108377-be9c29b29330", "1580489944761-15a19d674349",
  "1487412720507-e7ab37603c6f", "1500648767791-00dcc994a43e",
  "1552058544-f2b08422138a",   "1544005313-94ddf0286df2",
  "1531123897727-167b9f23d1e4","1612349317150-e413f6a5b16d",
  "1568602471122-7832951cc4c5","1614283233556-f35b0c801ef1",
  "1573497019940-1c28c88b4f3e","1488426862026-3ee34a7d66df",
];

function getAvatarUrl(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  const abs = Math.abs(hash);
  const gender = abs % 2 === 0 ? "male" : "female";
  const index = abs % 50;
  return `https://xsgames.co/randomusers/assets/avatars/${gender}/${index}.jpg`;
}

function getAvatarFallback(name: string): string {
  return `https://api.dicebear.com/7.x/lorelei/svg?seed=${encodeURIComponent(name)}&backgroundColor=e8edf2`;
}

function scoreColor(score: number): string {
  if (score < 0.33) return "#e74c3c";
  if (score < 0.66) return "#e6a117";
  return "#27ae60";
}

function scoreBucket(score: number): "red" | "yellow" | "green" {
  if (score < 0.33) return "red";
  if (score < 0.66) return "yellow";
  return "green";
}

function getDistribution(node: OrgNode): { red: number; yellow: number; green: number } {
  const dist = { red: 0, yellow: 0, green: 0 };
  function walk(n: OrgNode) {
    if (!n.children) {
      dist[scoreBucket(n.score)]++;
    } else {
      n.children.forEach(walk);
    }
  }
  walk(node);
  return dist;
}

function Card({ node, onClick }: { node: OrgNode; onClick: (node: OrgNode) => void }) {
  const isLeaf = !node.children;
  const headcount = getHeadcount(node);
  const dist = isLeaf ? null : getDistribution(node);
  const total = dist ? dist.red + dist.yellow + dist.green : 0;

  return (
    <div
      onClick={() => onClick(node)}
      style={{
        background: "#fff",
        borderRadius: 14,
        padding: "24px 28px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.06)",
        cursor: isLeaf ? "default" : "pointer",
        transition: "box-shadow 0.2s, transform 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
      onMouseEnter={(e) => {
        if (!isLeaf) {
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.08)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <img
          src={getAvatarUrl(node.name)}
          alt={node.name}
          onError={(e) => { (e.target as HTMLImageElement).src = getAvatarFallback(node.name); }}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            objectFit: "cover",
            border: `2.5px solid ${scoreColor(node.score)}`,
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#1a1a2e", marginBottom: 2 }}>
            {node.name}
          </div>
          <div style={{ fontSize: 13, color: "#888", fontWeight: 400 }}>
            {node.title}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: scoreColor(node.score),
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {(node.score * 100).toFixed(0)}%
        </span>
        {!isLeaf && (
          <span style={{ fontSize: 13, color: "#aaa" }}>
            avg score
          </span>
        )}
      </div>

      {dist && total > 0 && (
        <div>
          <div
            style={{
              display: "flex",
              height: 8,
              borderRadius: 4,
              overflow: "hidden",
              background: "#f0f0f0",
            }}
          >
            {dist.green > 0 && (
              <div
                style={{
                  width: `${(dist.green / total) * 100}%`,
                  background: "#27ae60",
                  transition: "width 0.3s",
                }}
              />
            )}
            {dist.yellow > 0 && (
              <div
                style={{
                  width: `${(dist.yellow / total) * 100}%`,
                  background: "#f1c40f",
                  transition: "width 0.3s",
                }}
              />
            )}
            {dist.red > 0 && (
              <div
                style={{
                  width: `${(dist.red / total) * 100}%`,
                  background: "#e74c3c",
                  transition: "width 0.3s",
                }}
              />
            )}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12, color: "#999" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: "#27ae60", display: "inline-block" }} />
              {dist.green}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: "#f1c40f", display: "inline-block" }} />
              {dist.yellow}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: "#e74c3c", display: "inline-block" }} />
              {dist.red}
            </span>
          </div>
        </div>
      )}

      {!isLeaf && (
        <div style={{ fontSize: 13, color: "#aaa", borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
          {headcount} {headcount === 1 ? "person" : "people"}
        </div>
      )}
    </div>
  );
}

export default function CardView({ data }: CardViewProps) {
  const [breadcrumb, setBreadcrumb] = useState<OrgNode[]>([data]);
  const currentRoot = breadcrumb[breadcrumb.length - 1];
  const cards = currentRoot.children ?? [currentRoot];

  const handleCardClick = useCallback((node: OrgNode) => {
    if (node.children && node.children.length > 0) {
      setBreadcrumb((prev) => [...prev, node]);
    }
  }, []);

  const handleBreadcrumbClick = useCallback((index: number) => {
    setBreadcrumb((prev) => prev.slice(0, index + 1));
  }, []);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#f7f7fa",
        fontFamily: "Inter, system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "14px 24px",
          background: "#fff",
          borderBottom: "1px solid #eee",
          flexShrink: 0,
        }}
      >
        {breadcrumb.map((node, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <span style={{ color: "#ccc", fontSize: 12 }}>›</span>
            )}
            <button
              onClick={() => handleBreadcrumbClick(i)}
              style={{
                background: i === breadcrumb.length - 1 ? "#f0f0f5" : "transparent",
                border: "none",
                color: i === breadcrumb.length - 1 ? "#1a1a2e" : "#999",
                fontSize: 13,
                fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                cursor: "pointer",
                padding: "5px 12px",
                borderRadius: 6,
                fontFamily: "Inter, system-ui, sans-serif",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f5")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = i === breadcrumb.length - 1 ? "#f0f0f5" : "transparent")
              }
            >
              {node.name}
              <span style={{ opacity: 0.5, marginLeft: 4, fontSize: 11 }}>{node.title}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          padding: "32px 32px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
          alignContent: "start",
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {cards.map((node) => (
          <Card key={node.name} node={node} onClick={handleCardClick} />
        ))}
      </div>
    </div>
  );
}
