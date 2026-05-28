import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { OrgNode, getHeadcount } from "./data";

interface CirclePackingProps {
  data: OrgNode;
}

interface D3Node {
  name: string;
  title: string;
  score: number;
  value?: number;
  children?: D3Node[];
  orgNode: OrgNode;
}

function scoreColor(score: number): string {
  if (score < 0.33) return d3.interpolateRgb("#e74c3c", "#e67e22")(score / 0.33);
  if (score < 0.66) return d3.interpolateRgb("#e67e22", "#f1c40f")((score - 0.33) / 0.33);
  return d3.interpolateRgb("#2ecc71", "#27ae60")((score - 0.66) / 0.34);
}

function toHierarchy(node: OrgNode): D3Node {
  if (!node.children) {
    return { name: node.name, title: node.title, score: node.score, value: 1, orgNode: node };
  }
  return {
    name: node.name,
    title: node.title,
    score: node.score,
    children: node.children.map(toHierarchy),
    orgNode: node,
  };
}

function textColor(bg: string): string {
  const c = d3.color(bg);
  if (!c) return "#000";
  const rgb = c.rgb();
  const lum = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  return lum > 140 ? "#1a1a2e" : "#ffffff";
}

type PackedNode = d3.HierarchyCircularNode<D3Node>;

export default function CirclePacking({ data }: CirclePackingProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 960, height: 600 });
  const [focus, setFocus] = useState<PackedNode | null>(null);
  const [view, setView] = useState<[number, number, number]>([0, 0, 1]);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: OrgNode } | null>(null);

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(height, 400) });
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const size = Math.min(dimensions.width, dimensions.height);

  const root = useMemo(() => {
    const hierData = toHierarchy(data);
    const r = d3
      .hierarchy(hierData)
      .sum((d) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    d3.pack<D3Node>().size([size, size]).padding(4)(r);

    return r as PackedNode;
  }, [data, size]);

  useEffect(() => {
    setFocus(root);
    setView([root.x, root.y, root.r * 2]);
  }, [root]);

  const breadcrumb = useMemo(() => {
    if (!focus) return [];
    const path: PackedNode[] = [];
    let node: PackedNode | null = focus;
    while (node) {
      path.unshift(node);
      node = node.parent;
    }
    return path;
  }, [focus]);

  const zoomTo = useCallback(
    (node: PackedNode) => {
      setFocus(node);
      const targetView: [number, number, number] = [node.x, node.y, node.r * 2];
      const svg = d3.select(svgRef.current);
      const g = svg.select<SVGGElement>("g.pack-root");

      const startView = [...view] as [number, number, number];
      const interpolateView = d3.interpolate(startView, targetView);

      g.transition()
        .duration(750)
        .tween("zoom", () => {
          return (t: number) => {
            const v = interpolateView(t);
            setView(v);
          };
        });
    },
    [view]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent, node: PackedNode) => {
      e.stopPropagation();
      if (focus === node && node.parent) {
        zoomTo(node.parent);
      } else if (node.children) {
        zoomTo(node);
      }
      setTooltip(null);
    },
    [focus, zoomTo]
  );

  const handleBackgroundClick = useCallback(() => {
    if (focus && focus.parent) {
      zoomTo(focus.parent);
    } else {
      zoomTo(root);
    }
    setTooltip(null);
  }, [focus, root, zoomTo]);

  const handleBreadcrumbClick = useCallback(
    (node: PackedNode) => {
      zoomTo(node);
      setTooltip(null);
    },
    [zoomTo]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, orgNode: OrgNode) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, node: orgNode });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const k = size / view[2];
  const tx = dimensions.width / 2 - view[0] * k;
  const ty = dimensions.height / 2 - view[1] * k;

  const allNodes = useMemo(() => {
    const nodes: PackedNode[] = [];
    root.each((n) => nodes.push(n));
    return nodes;
  }, [root]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f7f7fa",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "12px 16px",
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
              onClick={() => handleBreadcrumbClick(node)}
              style={{
                background: i === breadcrumb.length - 1 ? "#f0f0f5" : "transparent",
                border: "none",
                color: i === breadcrumb.length - 1 ? "#1a1a2e" : "#999",
                fontSize: 13,
                fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                cursor: "pointer",
                padding: "4px 10px",
                borderRadius: 6,
                fontFamily: "Inter, system-ui, sans-serif",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f5")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = i === breadcrumb.length - 1 ? "#f0f0f5" : "transparent")
              }
            >
              {node.data.name}
              <span style={{ opacity: 0.5, marginLeft: 4, fontSize: 11 }}>{node.data.title}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: "block", cursor: "pointer" }}
          onClick={handleBackgroundClick}
        >
          <g className="pack-root" transform={`translate(${tx},${ty})`}>
            {allNodes.map((node, i) => {
              const cx = node.x * k;
              const cy = node.y * k;
              const r = node.r * k;

              if (r < 1) return null;

              const bg = scoreColor(node.data.score);
              const fg = textColor(bg);
              const isLeaf = !node.children;
              const depthFromFocus = focus ? node.depth - focus.depth : node.depth;
              const opacity = depthFromFocus < 0 ? 0.15 : depthFromFocus <= 2 ? 1 : 0.3;
              const showLabel = r > 28;
              const showScore = r > 40;

              return (
                <g key={`${node.data.name}-${i}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={isLeaf ? bg : "none"}
                    stroke={bg}
                    strokeWidth={isLeaf ? 0 : Math.max(1.5, Math.min(3, r * 0.04))}
                    strokeOpacity={0.8}
                    fillOpacity={isLeaf ? opacity * 0.85 : 0}
                    opacity={opacity}
                    style={{ cursor: node.children ? "pointer" : "default", transition: "opacity 0.3s" }}
                    onClick={(e) => handleClick(e, node)}
                    onMouseMove={(e) => handleMouseMove(e, node.data.orgNode)}
                    onMouseLeave={handleMouseLeave}
                  />
                  {!isLeaf && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={bg}
                      fillOpacity={opacity * 0.06}
                      pointerEvents="none"
                    />
                  )}
                  {showLabel && opacity > 0.2 && (
                    <>
                      <text
                        x={cx}
                        y={showScore ? cy - 4 : cy + 4}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={isLeaf ? fg : "#1a1a2e"}
                        fontSize={Math.min(14, r * 0.3)}
                        fontWeight={600}
                        fontFamily="Inter, system-ui, sans-serif"
                        pointerEvents="none"
                        opacity={opacity}
                        style={{ textShadow: isLeaf ? "0 1px 2px rgba(0,0,0,0.2)" : "none" }}
                      >
                        {node.data.name.length > r * 0.15
                          ? node.data.name.slice(0, Math.floor(r * 0.15)) + "…"
                          : node.data.name}
                      </text>
                      {showScore && (
                        <text
                          x={cx}
                          y={cy + Math.min(14, r * 0.3) * 0.8 + 2}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={isLeaf ? fg : scoreColor(node.data.score)}
                          fontSize={Math.min(11, r * 0.22)}
                          fontWeight={500}
                          fontFamily="Inter, system-ui, sans-serif"
                          pointerEvents="none"
                          opacity={opacity * 0.8}
                        >
                          {(node.data.score * 100).toFixed(0)}%
                        </text>
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {tooltip && (
          <div
            style={{
              position: "absolute",
              left: Math.min(tooltip.x + 12, dimensions.width - 220),
              top: Math.min(tooltip.y + 12, dimensions.height - 100),
              background: "#fff",
              border: "1px solid #e0e0e0",
              borderRadius: 10,
              padding: "10px 14px",
              pointerEvents: "none",
              zIndex: 100,
              minWidth: 180,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ color: "#1a1a2e", fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
              {tooltip.node.name}
            </div>
            <div style={{ color: "#999", fontSize: 12, marginBottom: 8 }}>
              {tooltip.node.title}
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
              <div>
                <div style={{ color: "#aaa", marginBottom: 2 }}>Score</div>
                <div style={{ color: scoreColor(tooltip.node.score), fontWeight: 700, fontSize: 16 }}>
                  {(tooltip.node.score * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <div style={{ color: "#aaa", marginBottom: 2 }}>Team size</div>
                <div style={{ color: "#1a1a2e", fontWeight: 700, fontSize: 16 }}>
                  {getHeadcount(tooltip.node)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
