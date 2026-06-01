import React, { useMemo, useState } from 'react';
import RadialGraph from './RadialGraph';
import SideNav from './SideNav';
import TopBar from './TopBar';
import SkillsSearch from './SkillsSearch';
import { generateOrgData } from './data';

export type Page = "heatmap" | "skills-search";

function App() {
  const data = useMemo(() => generateOrgData(), []);
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("heatmap");

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100vh", overflow: "hidden" }}>
      <TopBar
        collapsed={sideNavCollapsed}
        onToggleCollapse={() => setSideNavCollapsed(v => !v)}
        currentPage={currentPage}
      />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideNav collapsed={sideNavCollapsed} currentPage={currentPage} onNavigate={setCurrentPage} />
        <div style={{ flex: 1, position: "relative", minWidth: 0, display: "flex", overflow: "hidden" }}>
          {currentPage === "heatmap"        && <RadialGraph data={data} />}
          {currentPage === "skills-search"  && <SkillsSearch />}
        </div>
      </div>
    </div>
  );
}

export default App;
