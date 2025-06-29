import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // 

import Header from './components/header/header';
// import Module3 from './pages/module3/module3'
import Main from './pages/main/main';
import CoursePage from './pages/CoursePage/CoursePage'; // 
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        
        <Route path="/" element={<Main />} />

        
        <Route path="/course" element={<CoursePage />} />
      </Routes>
      
    </Router>
    
  );
}

export default App;
