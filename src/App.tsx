import React, { useMemo } from 'react';
import RadialGraph from './RadialGraph';
import { generateOrgData } from './data';

function App() {
  const data = useMemo(() => generateOrgData(), []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <RadialGraph data={data} />
    </div>
  );
}

export default App;
