import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Company from './pages/Company/Company';
import Blogs from './pages/Blogs/Blogs';
import AIWorkshops from './pages/AIWorkshops/AIWorkshops';
import AboutUs from './pages/AboutUs/AboutUs';
import './App.css';
import Profile from './auth/Profile';
function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/company" element={<Company />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/aiworkshops" element={<AIWorkshops />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/profile" element={<Profile />} />
            
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
export default App;