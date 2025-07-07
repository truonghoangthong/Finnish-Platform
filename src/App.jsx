import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header/header";
import Main from "./pages/main/main";
import CoursePage from "./pages/CoursePage/CoursePage";
import Vocabulary from "./pages/module1/Vocabulary"; // ✅ Phải viết hoa 'V'

import Module3 from "./pages/module3/module3";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<><Main /><Module3 /></>} />
        <Route path="/course" element={<CoursePage />} />
    
        <Route
          path="/course/a1/lesson-1/vocabulary"
          element={<Vocabulary />}
        />
      </Routes>
    </Router>
  );
}

export default App;
