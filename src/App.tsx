import React, { useMemo } from 'react';
import RadialGraph from './RadialGraph';
import SideNav from './SideNav';
import TopBar from './TopBar';
import { generateOrgData } from './data';

function App() {
  const data = useMemo(() => generateOrgData(), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100vh", overflow: "hidden" }}>
      <TopBar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SideNav />
        <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
          <RadialGraph data={data} />
        </div>
      </div>
    </div>
  );
}

export default App;
