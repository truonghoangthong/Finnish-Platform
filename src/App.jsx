import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header/header";
import Main from "./pages/main/main";
import CoursePage from "./pages/CoursePage/CoursePage";
import IntroPage from "./pages/module1/intro/IntroPage"; 
import Vocabulary1ab from "./pages/module1/Vocabulary1ab";
import Module3 from "./pages/module3/module3";
import Part1Final from "./pages/module1/part1b/part1Final";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/course/a1" element={<CoursePage />} />
        <Route path="/course/a1/lesson-1/vocabulary" element={<IntroPage />} />
        <Route path="/course/a1/lesson-1/vocabulary/1a" element={<Vocabulary1ab />} />
        <Route path="/course/a1/lesson-1/vocabulary/1a/result" element={<Part1Final />} />
        <Route path="/course/a1/lesson-1/writing" element={<Module3 />} />
      </Routes>
    </Router>
  );
}

export default App;
