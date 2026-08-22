import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { ReuseComponent } from "@/pages/ReuseComponent";
import { CosmicDustBackground } from "@/components/background/CosmicDustBackground";

function App() {
  return (
    <>
      <CosmicDustBackground />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reuse-component" element={<ReuseComponent />} />
      </Routes>
    </>
  );
}

export default App;
