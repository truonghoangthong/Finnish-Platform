import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header/header";
import Main from "./pages/main/main";
import CoursePage from "./pages/CoursePage/CoursePage";
import Vocabulary from "./pages/module1/Vocabulary"; 
import Module3 from "./pages/module3/module3";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/course/a1" element={<CoursePage />} />
        <Route path="/course/a1/lesson-1/vocabulary" element={<Vocabulary />} />
        <Route path="/course/a1/lesson-1/writing" element={<Module3 />} />
      </Routes>
    </Router>
  );
}

export default App;
