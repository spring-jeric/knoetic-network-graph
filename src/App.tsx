import React, { useMemo } from 'react';
import RadialGraph from './RadialGraph';
import SideNav from './SideNav';
import { generateOrgData } from './data';

function App() {
  const data = useMemo(() => generateOrgData(), []);

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh", overflow: "hidden" }}>
      <SideNav />
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <RadialGraph data={data} />
      </div>
    </div>
  );
}

export default App;
