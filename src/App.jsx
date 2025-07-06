// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header/header";
import Main from "./pages/main/main";
import CoursePage from "./pages/CoursePage/CoursePage";
import Vocabulary from "./module1/Vocabulary"; //

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<><Main /></>} />
        <Route path="/course" element={<CoursePage />} />
        <Route path="/course/a1/lesson-1/vocabulary" element={<Vocabulary />} />
      </Routes>
    </Router>
  );
}

export default App;
