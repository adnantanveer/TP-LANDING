import { Routes, Route } from "react-router-dom";
import { Home } from "@/pages/Home";
import { ReuseComponent } from "@/pages/ReuseComponent";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reuse-component" element={<ReuseComponent />} />
    </Routes>
  );
}

export default App;
