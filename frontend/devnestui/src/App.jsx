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
import Jobs from './pages/Job/Job/Job';
import CompanyMap from './pages/Company/CompanyMap';
import CompanySelectLocation from './pages/Company/CompanySelectLocation';
import JobSearch from './pages/Job/JobSearch/JobSearch';
import LocationHome from './pages/Job/LocationHome';
import JobAdDetails from './pages/Job/JobAdDetails/JobAdDetails'
import CompanyProfile from "./pages/Company/CompanyProfile/CompanyProfile";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/" element={<Home />} />
            <Route path="/company" element={<Company />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/aiworkshops" element={<AIWorkshops />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<div>404</div>} />
            <Route path="/company/map" element={<CompanyMap />} />
            <Route path="/jobs/search" element={<JobSearch />} />
            <Route path="/company/select/location/:locationSlug" element={<CompanySelectLocation />} />
            <Route path="/jobs/location/:city" element={<LocationHome />} />
            <Route path="/company/jobads/:jobId" element={<JobAdDetails />} />
            <Route path="/company/:companyId" element={<CompanyProfile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
export default App;