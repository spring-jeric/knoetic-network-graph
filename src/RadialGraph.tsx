import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { OrgNode, getHeadcount, PERFORMANCE_CYCLES } from "./data";

interface RadialGraphProps {
  data: OrgNode;
}

interface LayoutNode {
  id: string;
  orgNode: OrgNode;
  x: number;
  y: number;
  depth: number;
  parentId: string | null;
  childCount: number;
  expanded: boolean;
  visible: boolean;
}

interface LayoutLink {
  sourceId: string;
  targetId: string;
}

function scoreColor(score: number): string {
  if (score < 0) return "#D1D5DB";
  if (score < 0.33) return "#EF4444";
  if (score < 0.66) return "#F59E0B";
  return "#22C55E";
}

function scoreRgba(score: number, alpha: number): string {
  if (score < 0.33) return `rgba(239, 68, 68, ${alpha})`;
  if (score < 0.66) return `rgba(245, 158, 11, ${alpha})`;
  return `rgba(34, 197, 94, ${alpha})`;
}

function findPathToName(node: OrgNode, name: string, path: string[] = ["0"]): string[] | null {
  if (node.name.toLowerCase().includes(name.toLowerCase())) return path;
  if (!node.children) return null;
  for (let i = 0; i < node.children.length; i++) {
    const childPath = findPathToName(node.children[i], name, [...path, `${path[path.length - 1]}-${i}`]);
    if (childPath) return childPath;
  }
  return null;
}

function buildIdMap(node: OrgNode, prefix: string = "0"): Map<string, OrgNode> {
  const map = new Map<string, OrgNode>();
  map.set(prefix, node);
  node.children?.forEach((c, i) => {
    const childMap = buildIdMap(c, `${prefix}-${i}`);
    childMap.forEach((v, k) => map.set(k, v));
  });
  return map;
}

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

function getNodeDepth(id: string): number {
  return id === "0" ? 0 : id.split("-").length - 1;
}

const RING_RADIUS = 160;
const NODE_RADIUS_BY_DEPTH = [30, 22, 16, 12, 9];

type ViewMode = "individual" | "team-average";
type ExpansionDepth = 1 | 2 | 3 | "all";

// Shared button style
const panelBtnBase: React.CSSProperties = {
  background: "transparent",
  border: "1px solid #e0e0e0",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
  padding: "5px 10px",
  color: "#666",
  fontFamily: "Inter, system-ui, sans-serif",
  transition: "all 0.15s",
};
const panelBtnActive: React.CSSProperties = {
  ...panelBtnBase,
  background: "#1a1a2e",
  color: "#fff",
  borderColor: "#1a1a2e",
};

export default function RadialGraph({ data }: RadialGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 960, height: 700 });
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["0"]));
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ nodeX: number; nodeY: number; nodeR: number; node: OrgNode; effectiveScore: number } | null>(null);
  const [search, setSearch] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const [boxZoomActive, setBoxZoomActive] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const isDraggingBox = useRef(false);
  // Ref mirror of tooltip — lets the keyboard handler read current tooltip state
  // without being added to the effect's deps (which would re-register on every hover).
  const tooltipRef = useRef(tooltip);
  tooltipRef.current = tooltip;

  // Panel state
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState(PERFORMANCE_CYCLES[0].id);
  const [viewMode, setViewMode] = useState<ViewMode>("individual");
  const [expansionDepth, setExpansionDepth] = useState<ExpansionDepth>(1);
  const [layoutVersion, setLayoutVersion] = useState<"v1" | "v2" | "v3">("v1");
  const [legendTooltip, setLegendTooltip] = useState(false);
  const [showColorBorder, setShowColorBorder] = useState(true);
  const [showColorBadge, setShowColorBadge] = useState(true);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "z" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLSelectElement)) {
        setBoxZoomActive(true);
      }
      if (e.key === "Escape") {
        // If a tooltip is open: dismiss it but keep hoveredId so the user can
        // trace connected nodes without the popup covering the graph.
        if (tooltipRef.current) {
          setTooltip(null);
          return;
        }
        setBoxZoomActive(false);
        setSelectionBox(null);
        isDraggingBox.current = false;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleBoxMouseDown = useCallback((e: React.MouseEvent) => {
    if (!boxZoomActive) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    isDraggingBox.current = true;
    setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
  }, [boxZoomActive]);

  const handleBoxMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingBox.current || !selectionBox) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setSelectionBox((prev) => prev ? { ...prev, endX: e.clientX - rect.left, endY: e.clientY - rect.top } : null);
  }, [selectionBox]);

  const handleBoxMouseUp = useCallback(() => {
    if (!isDraggingBox.current || !selectionBox || !zoomRef.current || !svgRef.current) {
      isDraggingBox.current = false;
      return;
    }
    isDraggingBox.current = false;

    const x0 = Math.min(selectionBox.startX, selectionBox.endX);
    const y0 = Math.min(selectionBox.startY, selectionBox.endY);
    const x1 = Math.max(selectionBox.startX, selectionBox.endX);
    const y1 = Math.max(selectionBox.startY, selectionBox.endY);
    const bw = x1 - x0;
    const bh = y1 - y0;

    if (bw < 10 || bh < 10) {
      setSelectionBox(null);
      return;
    }

    const svg = d3.select(svgRef.current!);
    const scale = Math.min(dimensions.width / bw, dimensions.height / bh) * 0.9;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;

    const sceneCx = (cx - transform.x) / transform.k;
    const sceneCy = (cy - transform.y) / transform.k;
    const clampedScale = Math.min(3, Math.max(0.3, scale));
    const finalTransform = d3.zoomIdentity
      .translate(dimensions.width / 2 - sceneCx * clampedScale, dimensions.height / 2 - sceneCy * clampedScale)
      .scale(clampedScale);

    svg.transition().duration(500).call(zoomRef.current!.transform as any, finalTransform);

    setSelectionBox(null);
    setBoxZoomActive(false);
  }, [selectionBox, dimensions, transform]);

  useEffect(() => {
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(height, 400) });
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const idMap = useMemo(() => buildIdMap(data), [data]);

  // Node counts per expansion depth
  const expansionCounts = useMemo(() => {
    const counts: Record<string, number> = { all: idMap.size };
    [1, 2, 3].forEach((depth) => {
      let n = 0;
      idMap.forEach((_, id) => { if (getNodeDepth(id) <= depth) n++; });
      counts[depth] = n;
    });
    return counts;
  }, [idMap]);

  // Compute effective scores based on cycle + view mode
  const effectiveScores = useMemo(() => {
    const scores = new Map<string, number>();
    idMap.forEach((node, id) => {
      if (viewMode === "individual") {
        scores.set(id, node.cycleScores[selectedCycle] ?? node.score);
      } else {
        // Team average: non-leaf nodes show average of direct children's cycle scores
        if (node.children?.length) {
          const childScores = node.children.map((c) => c.cycleScores[selectedCycle] ?? c.score);
          const avg = Math.round((childScores.reduce((a, b) => a + b, 0) / childScores.length) * 100) / 100;
          scores.set(id, avg);
        } else {
          scores.set(id, node.cycleScores[selectedCycle] ?? node.score);
        }
      }
    });
    return scores;
  }, [idMap, selectedCycle, viewMode]);

  // Expansion depth control
  const handleExpansionDepth = useCallback((depth: ExpansionDepth) => {
    setExpansionDepth(depth);
    const next = new Set<string>();
    idMap.forEach((node, id) => {
      if (!node.children?.length) return;
      const d = getNodeDepth(id);
      if (depth === "all" || d < depth) {
        next.add(id);
      }
    });
    setExpanded(next);
  }, [idMap]);

  // Initialize with depth 1
  useEffect(() => {
    handleExpansionDepth(1);
  }, [handleExpansionDepth]);

  const { nodes, links } = useMemo(() => {
    const nodes: LayoutNode[] = [];
    const links: LayoutLink[] = [];

    // V3 helper: minimum arc the entire subtree rooted at `node` needs so no
    // node in it visually stacks with its siblings.
    function subtreeMinArc(node: OrgNode, id: string, depth: number): number {
      const r = depth * RING_RADIUS;
      const nr = NODE_RADIUS_BY_DEPTH[Math.min(depth, NODE_RADIUS_BY_DEPTH.length - 1)];
      const selfMin = r > 0 ? (2 * nr * 1.8) / r : 0;
      if (!expanded.has(id) || !node.children || node.children.length === 0) return selfMin;
      const childrenMin = node.children.reduce((sum, child, i) =>
        sum + subtreeMinArc(child, `${id}-${i}`, depth + 1), 0);
      return Math.max(selfMin, childrenMin);
    }

    function layout(
      node: OrgNode, id: string, depth: number, parentId: string | null,
      angleStart: number, angleEnd: number
    ) {
      const isExpanded = expanded.has(id);
      const angleMid = (angleStart + angleEnd) / 2;
      const r = depth * RING_RADIUS;
      const x = r * Math.cos(angleMid);
      const y = r * Math.sin(angleMid);

      nodes.push({ id, orgNode: node, x, y, depth, parentId, childCount: node.children?.length ?? 0, expanded: isExpanded, visible: true });
      if (parentId !== null) links.push({ sourceId: parentId, targetId: id });

      if (isExpanded && node.children) {
        const arcSpan = angleEnd - angleStart;
        const n = node.children.length;

        if (layoutVersion === "v1") {
          // V1: perfectly equal arc per sibling.
          const slotSize = arcSpan / n;
          node.children.forEach((child, i) => {
            const start = angleStart + slotSize * i;
            layout(child, `${id}-${i}`, depth + 1, id, start, start + slotSize);
          });
        } else if (layoutVersion === "v3") {
          // V3: weight each child by its entire subtree's minimum arc requirement.
          // A single fully-expanded branch claims exactly what it needs at every depth
          // level → zero stacking anywhere in that branch. When many branches are all
          // expanded (L3 / Show All) every weight grows simultaneously → arc per child
          // stays small → natural stacking, same as V1.
          const r1 = (depth + 1) * RING_RADIUS;
          const nr1 = NODE_RADIUS_BY_DEPTH[Math.min(depth + 1, NODE_RADIUS_BY_DEPTH.length - 1)];
          const minArcSelf = r1 > 0 ? (2 * nr1 * 1.8) / r1 : 1;

          const weights = node.children.map((child, i) => {
            const childId = `${id}-${i}`;
            const need = subtreeMinArc(child, childId, depth + 1);
            return Math.max(1.0, need / minArcSelf);
          });
          const totalWeight = weights.reduce((a, b) => a + b, 0);
          let anglePos = angleStart;
          node.children.forEach((child, i) => {
            const childSpan = arcSpan * weights[i] / totalWeight;
            layout(child, `${id}-${i}`, depth + 1, id, anglePos, anglePos + childSpan);
            anglePos += childSpan;
          });
        } else {
          // V2: weight each expanded child by (n_grandchildren × minArcPerGC) / minArcSelf.
          // This gives the parent exactly the arc it needs so grandchildren won't stack,
          // while unexpanded siblings stay at weight 1.0.
          // When many nodes are all expanded, weights converge → near-equal → natural stacking.
          const childDepth = depth + 1;
          const gcDepth = depth + 2;
          const r1 = childDepth * RING_RADIUS;
          const r2 = gcDepth * RING_RADIUS;
          const nr1 = NODE_RADIUS_BY_DEPTH[Math.min(childDepth, NODE_RADIUS_BY_DEPTH.length - 1)];
          const nr2 = NODE_RADIUS_BY_DEPTH[Math.min(gcDepth, NODE_RADIUS_BY_DEPTH.length - 1)];
          const minArcSelf = r1 > 0 ? (2 * nr1 * 1.8) / r1 : 1;
          const minArcGC   = r2 > 0 ? (2 * nr2 * 1.8) / r2 : 0;

          const weights = node.children.map((child, i) => {
            const childId = `${id}-${i}`;
            if (expanded.has(childId) && (child.children?.length ?? 0) > 0) {
              return Math.max(1.0, (child.children!.length * minArcGC) / minArcSelf);
            }
            return 1.0;
          });
          const totalWeight = weights.reduce((a, b) => a + b, 0);
          let anglePos = angleStart;
          node.children.forEach((child, i) => {
            const childSpan = arcSpan * weights[i] / totalWeight;
            layout(child, `${id}-${i}`, depth + 1, id, anglePos, anglePos + childSpan);
            anglePos += childSpan;
          });
        }
      }
    }

    layout(data, "0", 0, null, 0, 2 * Math.PI);
    return { nodes, links };
  }, [data, expanded, layoutVersion]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, LayoutNode>();
    nodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [nodes]);

  const connectedIds = useMemo(() => {
    if (!hoveredId) return null;
    const ids = new Set<string>();
    ids.add(hoveredId);
    function addAncestors(id: string) {
      const node = nodeMap.get(id);
      if (node?.parentId) { ids.add(node.parentId); addAncestors(node.parentId); }
    }
    function addDescendants(id: string) {
      nodes.forEach((n) => { if (n.parentId === id) { ids.add(n.id); addDescendants(n.id); } });
    }
    addAncestors(hoveredId);
    addDescendants(hoveredId);
    return ids;
  }, [hoveredId, nodeMap, nodes]);

  useEffect(() => {
    const svg = d3.select(svgRef.current!);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => setTransform(event.transform));
    zoomRef.current = zoom;
    svg.call(zoom as any);
    return () => { svg.on(".zoom", null); };
  }, []);

  const handleNodeClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const node = idMap.get(id);
    if (!node?.children?.length) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        const toRemove: string[] = [];
        next.forEach((eid) => { if (eid.startsWith(id) && eid !== "0") toRemove.push(eid); });
        if (id !== "0") toRemove.forEach((r) => next.delete(r));
        else toRemove.forEach((r) => { if (r !== "0") next.delete(r); });
      } else {
        next.add(id);
      }
      return next;
    });
    setTooltip(null);
  }, [idMap]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearch(query);
      if (!query.trim()) { setHighlightId(null); return; }
      const path = findPathToName(data, query.trim());
      if (!path) { setHighlightId(null); return; }
      setExpanded((prev) => {
        const next = new Set(prev);
        path.slice(0, -1).forEach((id) => next.add(id));
        return next;
      });
      const targetId = path[path.length - 1];
      setHighlightId(targetId);
      setTimeout(() => {
        const targetNode = document.querySelector(`[data-node-id="${targetId}"]`);
        if (targetNode) {
          const svg = d3.select(svgRef.current);
          const cx = parseFloat(targetNode.getAttribute("cx") || "0");
          const cy = parseFloat(targetNode.getAttribute("cy") || "0");
          const zoom = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3, 3]);
          svg.transition().duration(750).call(
            zoom.transform as any,
            d3.zoomIdentity.translate(dimensions.width / 2, dimensions.height / 2).scale(1.5).translate(-cx, -cy)
          );
        }
      }, 100);
    },
    [data, dimensions]
  );


  const handleZoomIn = useCallback(() => {
    const svg = d3.select(svgRef.current!);
    if (zoomRef.current) svg.transition().duration(300).call(zoomRef.current.scaleBy as any, 1.4);
  }, []);

  const handleZoomOut = useCallback(() => {
    const svg = d3.select(svgRef.current!);
    if (zoomRef.current) svg.transition().duration(300).call(zoomRef.current.scaleBy as any, 0.7);
  }, []);

  const handleResetView = useCallback(() => {
    const svg = d3.select(svgRef.current!);
    if (zoomRef.current) svg.transition().duration(500).call(zoomRef.current.transform as any, d3.zoomIdentity);
    handleExpansionDepth(1);
    setBoxZoomActive(false);
    setSelectionBox(null);
  }, [handleExpansionDepth]);

  const clipIds = useMemo(() => {
    const map = new Map<string, string>();
    nodes.forEach((n) => map.set(n.id, `clip-${n.id.replace(/[^a-z0-9]/gi, '-')}`));
    return map;
  }, [nodes]);

  // Stable depth-based sort — never changes on hover, so no DOM reordering occurs.
  // DOM reordering was the root cause of the stuck-hover bug: when the sort changed
  // on hoveredId update, the browser fired spurious mouseLeave/mouseEnter events.
  const sortedNodes = useMemo(
    () => [...nodes].sort((a, b) => a.depth - b.depth),
    [nodes]
  );

  return (
    <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
      @keyframes tooltipPop {
        0%  { opacity: 0; transform: scale(0.88) translateY(6px); }
        100%{ opacity: 1; transform: scale(1)    translateY(0);   }
      }
    `}</style>
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
          padding: "10px 16px",
          background: "#fff",
          borderBottom: "1px solid #eee",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            background: "#f5f5f8",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            padding: "7px 14px",
            color: "#1a1a2e",
            fontSize: 13,
            fontFamily: "Inter, system-ui, sans-serif",
            outline: "none",
            width: 280,
          }}
        />

        {/* Version switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: "#9CA3AF", fontFamily: "Inter, system-ui, sans-serif", letterSpacing: "0.04em" }}>
            LAYOUT
          </span>
          <div style={{ display: "flex", background: "#f3f4f6", borderRadius: 7, padding: 2, gap: 2 }}>
            {(["v1", "v2", "v3"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setLayoutVersion(v)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 5,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'IBM Plex Mono', monospace",
                  transition: "all 0.15s",
                  background: layoutVersion === v ? "#1a1a2e" : "transparent",
                  color: layoutVersion === v ? "#fff" : "#6B7280",
                  boxShadow: layoutVersion === v ? "0 1px 3px rgba(0,0,0,0.18)" : "none",
                }}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{ flex: 1, position: "relative", overflow: "hidden", cursor: boxZoomActive ? "zoom-in" : "default" }}
        onMouseDown={handleBoxMouseDown}
        onMouseMove={handleBoxMouseMove}
        onMouseUp={handleBoxMouseUp}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{
            display: "block",
            cursor: boxZoomActive ? "zoom-in" : "grab",
            pointerEvents: boxZoomActive ? "none" : "auto",
          }}
        >
          <defs>
            <filter id="badge-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="rgba(0,0,0,0.22)" />
            </filter>
            {nodes.map((node) => {
              const r = NODE_RADIUS_BY_DEPTH[Math.min(node.depth, 4)];
              const clipId = clipIds.get(node.id)!;
              const es = effectiveScores.get(node.id) ?? node.orgNode.score;
              const bg = scoreColor(es);
              return (
                <React.Fragment key={`defs-${node.id}`}>
                  <clipPath id={clipId}>
                    <circle cx={node.x} cy={node.y} r={r - 3} />
                  </clipPath>
                  <filter id={`glow-${clipId}`} x="-200%" y="-200%" width="500%" height="500%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
                    <feColorMatrix type="matrix" values={
                      bg === "#EF4444" ? "0 0 0 0 0.937  0 0 0 0 0.267  0 0 0 0 0.267  0 0 0 0.8 0" :
                      bg === "#F59E0B" ? "0 0 0 0 0.961  0 0 0 0 0.620  0 0 0 0 0.043  0 0 0 0.8 0" :
                      bg === "#D1D5DB" ? "0 0 0 0 0.820  0 0 0 0 0.835  0 0 0 0 0.859  0 0 0 0.8 0" :
                                         "0 0 0 0 0.133  0 0 0 0 0.773  0 0 0 0 0.369  0 0 0 0.8 0"
                    } />
                  </filter>
                </React.Fragment>
              );
            })}
          </defs>
          <g transform={`${transform}`}>
            <g transform={`translate(${dimensions.width / 2}, ${dimensions.height / 2})`}>
              {/* Ring guides removed */}

              {links.map((link) => {
                const source = nodeMap.get(link.sourceId);
                const target = nodeMap.get(link.targetId);
                if (!source || !target) return null;

                const dimmed = connectedIds && !connectedIds.has(link.sourceId) && !connectedIds.has(link.targetId);
                const highlighted = connectedIds?.has(link.sourceId) && connectedIds?.has(link.targetId);

                // Single-direction curve: control point offset perpendicular (clockwise)
                const mx = (source.x + target.x) / 2;
                const my = (source.y + target.y) / 2;
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const offset = dist * 0.2;
                // Perpendicular direction (clockwise)
                const cx = mx + (dy / dist) * offset;
                const cy = my - (dx / dist) * offset;

                return (
                  <path
                    key={`${link.sourceId}-${link.targetId}`}
                    d={`M${source.x},${source.y} Q${cx},${cy} ${target.x},${target.y}`}
                    fill="none"
                    stroke={highlighted ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.08)"}
                    strokeWidth={highlighted ? 2 : 1}
                    opacity={dimmed ? 0.1 : 1}
                    style={{ transition: "opacity 0.3s, stroke 0.3s" }}
                  />
                );
              })}

              {/* Stable depth-sort — DOM order never changes on hover (fixes stuck-hover bug).
                  Hovered node is painted on top via a separate overlay below. */}
              {sortedNodes.map((node) => {
                const r = NODE_RADIUS_BY_DEPTH[Math.min(node.depth, 4)];
                const es = effectiveScores.get(node.id) ?? node.orgNode.score;
                const bg = scoreColor(es);
                const dimmed = connectedIds && !connectedIds.has(node.id);
                const isHighlighted = highlightId === node.id;
                const hasHiddenChildren = node.childCount > 0;
                const clipId = clipIds.get(node.id)!;
                const avatarUrl = getAvatarUrl(node.orgNode.name);
                const isTeamAvg = viewMode === "team-average" && node.childCount > 0;

                return (
                  <g
                    key={node.id}
                    style={{
                      opacity: dimmed ? 0.2 : 1,
                      transition: "opacity 0.3s",
                      cursor: node.childCount > 0 ? "pointer" : "default",
                    }}
                    onClick={(e) => handleNodeClick(e, node.id)}
                    onMouseEnter={() => {
                      setHoveredId(node.id);
                      setTooltip({ nodeX: node.x, nodeY: node.y, nodeR: r, node: node.orgNode, effectiveScore: es });
                    }}
                    onMouseLeave={() => { setHoveredId(null); setTooltip(null); }}
                  >
                    {isHighlighted && (
                      <circle cx={node.x} cy={node.y} r={r + 8} fill="none" stroke={bg} strokeWidth={2}>
                        <animate attributeName="r" from={r + 4} to={r + 20} dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Heatmap glow */}
                    <circle
                      cx={node.x} cy={node.y} r={r + 6}
                      fill={bg}
                      filter={`url(#glow-${clipId})`}
                      pointerEvents="none"
                    />

                    {/* Colored ring */}
                    <circle
                      data-node-id={node.id}
                      cx={node.x} cy={node.y} r={r}
                      fill="#fff"
                      stroke={showColorBorder ? bg : "rgba(0,0,0,0.10)"}
                      strokeWidth={showColorBorder ? 1.5 : 1}
                      strokeDasharray={isTeamAvg && showColorBorder ? `${Math.max(3, r * 0.3)} ${Math.max(2, r * 0.2)}` : "none"}
                    />

                    {/* Avatar photo */}
                    <image
                      href={avatarUrl}
                      x={node.x - (r - 3)}
                      y={node.y - (r - 3)}
                      width={(r - 3) * 2}
                      height={(r - 3) * 2}
                      clipPath={`url(#${clipId})`}
                      preserveAspectRatio="xMidYMid slice"
                      onError={(e) => { (e.target as SVGImageElement).setAttribute("href", getAvatarFallback(node.orgNode.name)); }}
                    />

                    {/* Badge for children count */}
                    {hasHiddenChildren && showColorBadge && (
                      <>
                        <circle
                          cx={node.x + r * 0.7} cy={node.y - r * 0.7} r={8}
                          fill={isTeamAvg ? bg : "#6B7280"} stroke="#fff" strokeWidth={2}
                        />
                        <text
                          x={node.x + r * 0.7} y={node.y - r * 0.7}
                          textAnchor="middle" dominantBaseline="central"
                          fill="#fff" fontSize={9} fontWeight={700}
                          fontFamily="Inter, system-ui, sans-serif" pointerEvents="none"
                        >
                          {node.childCount}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

              {/* Hover overlay — visual-only copy of the hovered node painted last
                  so it's always on top. pointerEvents="none" so events go to the
                  real <g> beneath, which never moved (no DOM reorder). */}
              {(() => {
                const node = hoveredId ? nodeMap.get(hoveredId) : null;
                if (!node) return null;
                const r = NODE_RADIUS_BY_DEPTH[Math.min(node.depth, 4)];
                const es = effectiveScores.get(node.id) ?? node.orgNode.score;
                const bg = scoreColor(es);
                const clipId = clipIds.get(node.id)!;
                const avatarUrl = getAvatarUrl(node.orgNode.name);
                const isTeamAvg = viewMode === "team-average" && node.childCount > 0;
                return (
                  <g pointerEvents="none">
                    <circle cx={node.x} cy={node.y} r={r + 6} fill={bg} filter={`url(#glow-${clipId})`} />
                    <circle
                      cx={node.x} cy={node.y} r={r} fill="#fff"
                      stroke={showColorBorder ? bg : "rgba(0,0,0,0.10)"}
                      strokeWidth={showColorBorder ? 1.5 : 1}
                      strokeDasharray={isTeamAvg && showColorBorder ? `${Math.max(3, r * 0.3)} ${Math.max(2, r * 0.2)}` : "none"}
                    />
                    <image
                      href={avatarUrl}
                      x={node.x - (r - 3)} y={node.y - (r - 3)}
                      width={(r - 3) * 2} height={(r - 3) * 2}
                      clipPath={`url(#${clipId})`}
                      preserveAspectRatio="xMidYMid slice"
                      onError={(e) => { (e.target as SVGImageElement).setAttribute("href", getAvatarFallback(node.orgNode.name)); }}
                    />
                    {node.childCount > 0 && showColorBadge && (
                      <>
                        <circle
                          cx={node.x + r * 0.7} cy={node.y - r * 0.7} r={8}
                          fill={isTeamAvg ? bg : "#6B7280"} stroke="#fff" strokeWidth={2}
                        />
                        <text
                          x={node.x + r * 0.7} y={node.y - r * 0.7}
                          textAnchor="middle" dominantBaseline="central"
                          fill="#fff" fontSize={9} fontWeight={700}
                          fontFamily="Inter, system-ui, sans-serif"
                        >{node.childCount}</text>
                      </>
                    )}
                  </g>
                );
              })()}
            </g>
          </g>
        </svg>

        {/* Box zoom selection rectangle */}
        {selectionBox && (
          <div
            style={{
              position: "absolute",
              left: Math.min(selectionBox.startX, selectionBox.endX),
              top: Math.min(selectionBox.startY, selectionBox.endY),
              width: Math.abs(selectionBox.endX - selectionBox.startX),
              height: Math.abs(selectionBox.endY - selectionBox.startY),
              border: "2px solid #3B82F6",
              background: "rgba(59, 130, 246, 0.08)",
              borderRadius: 2,
              pointerEvents: "none",
              zIndex: 200,
            }}
          />
        )}

        {/* ─── Floating Control Panel (left) ─── */}
        {(() => {
          // ── Unified design tokens ──────────────────────────────────
          const ACCENT       = "#3B82F6";
          const ACCENT_BG    = "rgba(59,130,246,0.06)";
          const ACCENT_BDR   = "#3B82F6";
          const ROW_IDLE_BDR = "#EAEAEC";
          const LABEL_CLR    = "#9CA3AF";
          const TEXT_CLR     = "#374151";
          const MUTED_CLR    = "#9CA3AF";
          const SECTION_PAD  = "9px 13px";
          const GAP          = 4;

          const sectionLabel: React.CSSProperties = {
            fontSize: 9, fontWeight: 600, color: LABEL_CLR,
            textTransform: "uppercase", letterSpacing: "0.07em",
            marginBottom: 6, fontFamily: "Inter, system-ui, sans-serif",
          };

          // Shared row style (expansion + node config + view mode)
          const rowStyle = (active: boolean): React.CSSProperties => ({
            width: "100%", display: "flex", alignItems: "center",
            justifyContent: "space-between",
            padding: "5px 10px", height: 30, boxSizing: "border-box",
            fontSize: 11, fontWeight: active ? 500 : 400,
            fontFamily: "Inter, system-ui, sans-serif",
            color: active ? TEXT_CLR : MUTED_CLR,
            background: active ? ACCENT_BG : "transparent",
            border: `1px solid ${active ? ACCENT_BDR : ROW_IDLE_BDR}`,
            borderRadius: 7, cursor: "pointer", transition: "all 0.15s",
            textAlign: "left",
          });

          return (
          <div
            style={{
              position: "absolute", top: 14, left: 14,
              width: panelOpen ? 196 : "auto",
              background: "#fff", border: "1px solid #EAEAEC",
              borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              zIndex: 100, overflow: "visible",
            }}
          >
            {/* Header */}
            <button
              onClick={() => setPanelOpen(p => !p)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "10px 13px",
                background: "transparent", border: "none", cursor: "pointer",
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 11, fontWeight: 600, color: "#111827", borderRadius: 12,
              }}
            >
              Employee Performance
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: panelOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {panelOpen && (
            <div style={{ borderTop: "1px solid #F3F4F6", overflow: "visible" }}>

              {/* 1. Performance Cycle */}
              <div style={{ padding: SECTION_PAD }}>
                <div style={sectionLabel}>Performance Cycle</div>
                <select
                  value={selectedCycle}
                  onChange={e => setSelectedCycle(e.target.value)}
                  style={{
                    width: "100%", height: 30, padding: "0 26px 0 10px",
                    fontSize: 11, fontFamily: "Inter, system-ui, sans-serif",
                    fontWeight: 500, color: TEXT_CLR,
                    border: `1px solid ${ROW_IDLE_BDR}`,
                    borderRadius: 7, background: "#FAFAFA",
                    cursor: "pointer", outline: "none", boxSizing: "border-box",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 9px center",
                  }}
                >
                  {PERFORMANCE_CYCLES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ height: 1, background: "#F3F4F6", margin: "0 13px" }} />

              {/* 2. Expansion */}
              <div style={{ padding: SECTION_PAD }}>
                <div style={sectionLabel}>Expansion</div>
                <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                  {([
                    { d: 1   as ExpansionDepth, label: "1 - Layer" },
                    { d: 2   as ExpansionDepth, label: "2 - Layer" },
                    { d: 3   as ExpansionDepth, label: "3 - Layer" },
                    { d: "all" as ExpansionDepth, label: "Show All" },
                  ]).map(({ d, label }) => (
                    <button key={String(d)} onClick={() => handleExpansionDepth(d)}
                      style={rowStyle(expansionDepth === d)}>
                      {label}
                      <span style={{ fontSize: 10, color: MUTED_CLR, fontWeight: 400 }}>
                        {expansionCounts[String(d)]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: "#F3F4F6", margin: "0 13px" }} />

              {/* 4. View Mode */}
              <div style={{ padding: SECTION_PAD }}>
                <div style={sectionLabel}>View Mode</div>
                <div style={{ display: "flex", gap: GAP }}>
                  {([
                    { mode: "individual"   as ViewMode, label: "Individual" },
                    { mode: "team-average" as ViewMode, label: "Team Avg"   },
                  ]).map(({ mode, label }) => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      style={{ ...rowStyle(viewMode === mode), flex: 1, justifyContent: "center", height: 30 }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: "#F3F4F6", margin: "0 13px" }} />

              {/* 5. Legend */}
              <div style={{ padding: SECTION_PAD }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={sectionLabel}>Legend</div>
                  <div
                    style={{ position: "relative", marginBottom: 6 }}
                    onMouseEnter={() => setLegendTooltip(true)}
                    onMouseLeave={() => setLegendTooltip(false)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ cursor: "help", display: "block" }}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    {legendTooltip && (
                      <div style={{
                        position: "fixed", left: 224, width: 180,
                        background: "#111827", color: "#fff",
                        fontSize: 10, lineHeight: 1.6,
                        padding: "8px 10px", borderRadius: 8,
                        zIndex: 9999, pointerEvents: "none",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                        fontFamily: "Inter, system-ui, sans-serif",
                      }}>
                        {viewMode === "individual"
                          ? "Scores are normalized from the selected performance cycle."
                          : "Manager averages include only scored direct reports."}
                      </div>
                    )}
                  </div>
                </div>
                {[
                  { color: "#22C55E", label: "High",    range: ">66%"   },
                  { color: "#F59E0B", label: "Medium",  range: "33–66%" },
                  { color: "#EF4444", label: "Low",     range: "<33%"   },
                  { color: "#D1D5DB", label: "N/A",     range: ""       },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                      background: item.color,
                      border: item.color === "#D1D5DB" ? "1px solid #ccc" : "none",
                    }} />
                    <span style={{ fontSize: 11, color: TEXT_CLR, fontWeight: 400, fontFamily: "Inter, system-ui, sans-serif" }}>
                      {item.label}
                    </span>
                    {item.range && (
                      <span style={{ fontSize: 11, color: MUTED_CLR, marginLeft: "auto", fontFamily: "Inter, system-ui, sans-serif" }}>
                        {item.range}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
          );
        })()}

        {/* ─── Zoom icon bar (bottom-right) ─── */}
        <div style={{ position: "absolute", bottom: 16, right: 16, display: "flex", flexDirection: "column", gap: 6, zIndex: 100 }}>
          {/* Zoom + Reset group */}
          <div style={{
            display: "flex", flexDirection: "column",
            background: "#fff",
            border: "1px solid #e8e8ec",
            borderRadius: 10,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
          }}>
            {([
              { onClick: handleZoomIn,  title: "Zoom in",   icon: <span style={{ fontSize: 16, fontWeight: 300, lineHeight: 1, color: "#555" }}>+</span> },
              { onClick: handleZoomOut, title: "Zoom out",  icon: <span style={{ fontSize: 16, fontWeight: 300, lineHeight: 1, color: "#555" }}>−</span> },
              { onClick: handleResetView, title: "Reset view", icon: (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                </svg>
              )},
            ] as const).map((btn, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div style={{ height: 1, background: "#f0f0f3" }} />}
                <button
                  onClick={btn.onClick}
                  title={btn.title}
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    padding: "9px 11px", color: "#555",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f8")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {btn.icon}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Help / keyboard shortcuts */}
          <button
            onClick={() => setShortcutsOpen(v => !v)}
            title="Keyboard shortcuts"
            style={{
              background: "#fff", border: "1px solid #e8e8ec",
              borderRadius: 10, padding: "9px 11px",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f8")}
            onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>

        {/* ─── Keyboard Shortcuts Modal ─── */}
        {shortcutsOpen && (
          <div
            style={{
              position: "absolute", inset: 0,
              zIndex: 400,
              display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                pointerEvents: "auto",
                margin: "0 16px 76px 0",
                width: 196,
                background: "#fff",
                border: "1px solid #EAEAEC",
                borderRadius: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                overflow: "hidden",
                animation: "tooltipPop 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
              }}
            >
              {/* Header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 13px",
                borderBottom: "1px solid #F3F4F6",
              }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#111827", fontFamily: "Inter, system-ui, sans-serif" }}>
                  Shortcuts
                </span>
                <button
                  onClick={() => setShortcutsOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: 2, display: "flex" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Shortcut list */}
              <div style={{ padding: "10px 13px 13px", display: "flex", flexDirection: "column", gap: 12 }}>
                {/* Ctrl / Alt + click */}
                {[
                  { modifier: "Ctrl", desc: "on each employee node to view details" },
                  { modifier: "Alt",  desc: "on each employee node to view details" },
                ].map(({ modifier, desc }) => (
                  <div key={modifier} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <kbd style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "3px 8px", fontSize: 10,
                        fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
                        color: "#3B82F6", background: "rgba(59,130,246,0.07)",
                        border: "1px solid rgba(59,130,246,0.25)",
                        borderRadius: 6, lineHeight: 1.3,
                      }}>{modifier}</kbd>
                      <span style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "Inter, system-ui, sans-serif" }}>+</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#374151", fontFamily: "Inter, system-ui, sans-serif" }}>click</span>
                    </div>
                    <div style={{ fontSize: 10, color: "#9CA3AF", lineHeight: 1.5, fontFamily: "Inter, system-ui, sans-serif", paddingLeft: 1 }}>
                      {desc}
                    </div>
                  </div>
                ))}

                {/* Esc */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <kbd style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "3px 8px", fontSize: 10,
                      fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
                      color: "#3B82F6", background: "rgba(59,130,246,0.07)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      borderRadius: 6, lineHeight: 1.3,
                    }}>Esc</kbd>
                  </div>
                  <div style={{ fontSize: 10, color: "#9CA3AF", lineHeight: 1.5, fontFamily: "Inter, system-ui, sans-serif", paddingLeft: 1 }}>
                    to hide popup, keep highlight
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tooltip && (() => {
          const es = tooltip.effectiveScore;
          const arc = 2 * Math.PI * 23;
          // Compute node center in screen space (relative to canvas container)
          const screenX = transform.x + transform.k * (tooltip.nodeX + dimensions.width / 2);
          const screenY = transform.y + transform.k * (tooltip.nodeY + dimensions.height / 2);
          const popupW = 232;
          const gap = tooltip.nodeR * transform.k + 10;
          const left = Math.max(10, Math.min(screenX - popupW / 2, dimensions.width - popupW - 10));
          const top = Math.min(screenY + gap, dimensions.height - 10);
          return (
            <div
              style={{
                position: "absolute",
                left,
                top,
                pointerEvents: "none",
                zIndex: 200,
                animation: "tooltipPop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                transformOrigin: "top center",
              }}
            >
              <div style={{
                width: popupW,
                background: "#ffffff",
                border: `1px solid rgba(0,0,0,0.08)`,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: `
                  0 4px 6px rgba(0,0,0,0.04),
                  0 12px 40px rgba(0,0,0,0.10),
                  0 0 0 1px rgba(0,0,0,0.04)
                `,
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              }}>
                {/* Score-color accent strip */}
                <div style={{
                  height: 3,
                  background: `linear-gradient(90deg, ${scoreColor(es)} 0%, ${scoreRgba(es, 0.15)} 100%)`,
                }} />

                <div style={{ padding: "14px 16px 12px" }}>
                  {/* Avatar + arc + name */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ position: "relative", width: 46, height: 46, flexShrink: 0 }}>
                      {/* Score progress arc */}
                      <svg width={52} height={52} style={{ position: "absolute", top: -3, left: -3, overflow: "visible" }}>
                        <circle cx={26} cy={26} r={23} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={2.5} />
                        <circle
                          cx={26} cy={26} r={23}
                          fill="none"
                          stroke={scoreColor(es)}
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeDasharray={`${es * arc} ${arc}`}
                          transform="rotate(-90 26 26)"
                        />
                      </svg>
                      <img
                        src={getAvatarUrl(tooltip.node.name)}
                        alt=""
                        onError={(e) => { (e.target as HTMLImageElement).src = getAvatarFallback(tooltip.node.name); }}
                        style={{ width: 46, height: 46, borderRadius: "50%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontSize: 14, fontWeight: 700, color: "#111827",
                        letterSpacing: "-0.01em", lineHeight: 1.25,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {tooltip.node.name}
                      </div>
                      <div style={{
                        fontSize: 11, color: "#6B7280",
                        marginTop: 2, fontWeight: 500, lineHeight: 1.3,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {tooltip.node.title}
                      </div>
                    </div>
                  </div>

                  {/* Stat chips */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {[
                      {
                        label: viewMode === "team-average" && tooltip.node.children ? "Team Avg" : "Rating",
                        value: `${(es * 100).toFixed(0)}%`,
                        color: scoreColor(es),
                      },
                      {
                        label: "Reports",
                        value: String(getHeadcount(tooltip.node)),
                        color: "#111827",
                      },
                    ].map((stat) => (
                      <div key={stat.label} style={{
                        flex: 1,
                        background: "#F9FAFB",
                        borderRadius: 10,
                        padding: "9px 10px",
                        border: "1px solid #F3F4F6",
                      }}>
                        <div style={{
                          fontSize: 9, fontWeight: 600, color: "#9CA3AF",
                          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5,
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}>
                          {stat.label}
                        </div>
                        <div style={{
                          fontSize: 22, fontWeight: 600, color: stat.color,
                          lineHeight: 1, letterSpacing: "-0.02em",
                          fontFamily: "'IBM Plex Mono', monospace",
                        }}>
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer hints */}
                  <div style={{
                    borderTop: "1px solid #F3F4F6", paddingTop: 10,
                    display: "flex", flexDirection: "column", gap: 6,
                  }}>
                    {/* Ctrl+click hint */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <kbd style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "2px 6px", fontSize: 9,
                        fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
                        color: "#9CA3AF", background: "#F9FAFB",
                        border: "1px solid #E5E7EB",
                        borderRadius: 4, lineHeight: 1.4, flexShrink: 0,
                      }}>Ctrl</kbd>
                      <span style={{ fontSize: 9, color: "#9CA3AF", fontFamily: "Inter, system-ui, sans-serif" }}>
                        + click on the node to view details
                      </span>
                    </div>
                    {/* Esc hint */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <kbd style={{
                        display: "inline-flex", alignItems: "center",
                        padding: "2px 6px", fontSize: 9,
                        fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
                        color: "#9CA3AF", background: "#F9FAFB",
                        border: "1px solid #E5E7EB",
                        borderRadius: 4, lineHeight: 1.4, flexShrink: 0,
                      }}>Esc</kbd>
                      <span style={{ fontSize: 9, color: "#9CA3AF", fontFamily: "Inter, system-ui, sans-serif" }}>
                        to hide popup, keep highlight
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
    </>
  );
}
