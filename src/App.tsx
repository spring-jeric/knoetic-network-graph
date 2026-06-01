import React, { useMemo, useState } from 'react';
import RadialGraph from './RadialGraph';
import SideNav from './SideNav';
import TopBar from './TopBar';
import { generateOrgData } from './data';

function App() {
  const data = useMemo(() => generateOrgData(), []);
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100vh", overflow: "hidden" }}>
      <TopBar
        collapsed={sideNavCollapsed}
        onToggleCollapse={() => setSideNavCollapsed(v => !v)}
      />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideNav collapsed={sideNavCollapsed} />
        <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
          <RadialGraph data={data} />
        </div>
      </div>
    </div>
  );
}

export default App;
