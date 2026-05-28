import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { OrgNode, getHeadcount } from "./data";

interface TreemapProps {
  data: OrgNode;
}

interface D3HierarchyNode {
  name: string;
  title: string;
  score: number;
  value?: number;
  children?: D3HierarchyNode[];
  orgNode: OrgNode;
}

function scoreColor(score: number): string {
  if (score < 0.33) return d3.interpolateRgb("#e74c3c", "#e67e22")(score / 0.33);
  if (score < 0.66) return d3.interpolateRgb("#e67e22", "#f1c40f")((score - 0.33) / 0.33);
  return d3.interpolateRgb("#2ecc71", "#27ae60")((score - 0.66) / 0.34);
}

function toHierarchy(node: OrgNode): D3HierarchyNode {
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

export default function Treemap({ data }: TreemapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 960, height: 600 });
  const [breadcrumb, setBreadcrumb] = useState<OrgNode[]>([data]);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    node: OrgNode;
  } | null>(null);

  const currentRoot = breadcrumb[breadcrumb.length - 1];

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(height, 400) });
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setBreadcrumb([data]);
  }, [data]);

  const treemapLayout = useMemo(() => {
    const hierData = toHierarchy(currentRoot);
    const root = d3
      .hierarchy(hierData)
      .sum((d) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    d3.treemap<D3HierarchyNode>()
      .size([dimensions.width, dimensions.height])
      .paddingTop(28)
      .paddingRight(3)
      .paddingBottom(3)
      .paddingLeft(3)
      .paddingInner(2)
      .round(true)(root);

    return root as d3.HierarchyRectangularNode<D3HierarchyNode>;
  }, [currentRoot, dimensions]);

  const handleClick = useCallback(
    (orgNode: OrgNode) => {
      if (orgNode.children && orgNode.children.length > 0) {
        setBreadcrumb((prev) => [...prev, orgNode]);
        setTooltip(null);
      }
    },
    []
  );

  const handleBreadcrumbClick = useCallback((index: number) => {
    setBreadcrumb((prev) => prev.slice(0, index + 1));
    setTooltip(null);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, orgNode: OrgNode) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        node: orgNode,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const renderNodes = useCallback(
    (node: d3.HierarchyRectangularNode<D3HierarchyNode>, depth: number = 0) => {
      const x0 = node.x0 ?? 0;
      const y0 = node.y0 ?? 0;
      const x1 = node.x1 ?? 0;
      const y1 = node.y1 ?? 0;
      const w = x1 - x0;
      const h = y1 - y0;

      if (w < 1 || h < 1) return null;

      const bg = scoreColor(node.data.score);
      const fg = textColor(bg);
      const hasChildren = node.children && node.children.length > 0;
      const isLeaf = !hasChildren;
      const showLabel = isLeaf ? w > 40 && h > 18 : w > 60;

      return (
        <g key={`${node.data.name}-${depth}-${x0}-${y0}`}>
          <rect
            x={x0}
            y={y0}
            width={w}
            height={h}
            fill={bg}
            stroke={isLeaf ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)"}
            strokeWidth={isLeaf ? 0.5 : 1.5}
            rx={isLeaf ? 2 : 4}
            style={{ cursor: hasChildren ? "pointer" : "default" }}
            onClick={() => handleClick(node.data.orgNode)}
            onMouseMove={(e) => handleMouseMove(e, node.data.orgNode)}
            onMouseLeave={handleMouseLeave}
          />
          {!isLeaf && showLabel && (
            <text
              x={x0 + 6}
              y={y0 + 18}
              fill={fg}
              fontSize={13}
              fontWeight={700}
              fontFamily="Inter, system-ui, sans-serif"
              pointerEvents="none"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
            >
              {node.data.name}
            </text>
          )}
          {isLeaf && showLabel && (
            <foreignObject x={x0 + 2} y={y0 + 2} width={w - 4} height={h - 4}>
              <div
                style={{
                  color: fg,
                  fontSize: Math.min(12, Math.max(9, w / 8)),
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  padding: "2px",
                  lineHeight: 1.2,
                  pointerEvents: "none",
                  textShadow: "0 1px 1px rgba(0,0,0,0.1)",
                }}
              >
                {node.data.name}
                {h > 32 && (
                  <div style={{ fontSize: Math.max(8, Math.min(10, w / 10)), opacity: 0.8 }}>
                    {(node.data.score * 100).toFixed(0)}%
                  </div>
                )}
              </div>
            </foreignObject>
          )}
          {hasChildren && node.children?.map((child) => renderNodes(child, depth + 1))}
        </g>
      );
    },
    [handleClick, handleMouseMove, handleMouseLeave]
  );

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
              onClick={() => handleBreadcrumbClick(i)}
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
              {node.name}
              <span style={{ opacity: 0.5, marginLeft: 4, fontSize: 11 }}>{node.title}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      <div style={{ flex: 1, position: "relative", padding: 8 }}>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: "block" }}
        >
          {renderNodes(treemapLayout)}
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
