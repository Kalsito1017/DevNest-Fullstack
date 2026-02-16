import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Company from "./pages/Company/Company";
import Blogs from "./pages/Blogs/Blogs";
import AIWorkshops from "./pages/AIWorkshops/AIWorkshops/AIWorkshops";
import AboutUs from "./pages/AboutUs/AboutUs";
import "./App.css";
import Profile from "./featured/profile/Profile";
import Jobs from "./pages/Job/Job/Job";
import CompanyMap from "./pages/Company/CompanyMap";
import CompanySelectLocation from "./pages/Company/CompanySelectLocation";
import JobSearch from "./pages/Job/JobSearch/JobSearch";
import LocationHome from "./pages/Job/LocationHome";
import JobAdDetails from "./pages/Job/JobAdDetails/JobAdDetails";
import CompanyProfile from "./pages/Company/CompanyProfile/CompanyProfile";
import WorkshopDetails from "./pages/AIWorkshops/WorkshopDetails/WorkshopDetails";
import RegisterRouteTrigger from "./featured/auth/RegisterRouteTrigger";
import { SavedJobsProvider } from "./context/SavedJobsContext";
import ScrollToTop from "./routing/ScrollToTop";
import Terms from "./pages/terms/Terms";
import Cookies from "./pages/Coockies/Cookies";
import Contacts from "./pages/Contacts/Contacts";

function App() {
  return (
    <SavedJobsProvider>
      <Router>
        <ScrollToTop />

        <div className="app">
          <Header />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/search" element={<JobSearch />} />
              <Route path="/jobs/location/:city" element={<LocationHome />} />
              <Route path="/company/jobads/:jobId" element={<JobAdDetails />} />

              <Route path="/company" element={<Company />} />
              <Route path="/company/map" element={<CompanyMap />} />
              <Route
                path="/company/select/location/:locationSlug"
                element={<CompanySelectLocation />}
              />
              <Route path="/company/:companyId" element={<CompanyProfile />} />

              <Route path="/blogs" element={<Blogs />} />
              <Route path="/aiworkshops" element={<AIWorkshops />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/workshop/:slug" element={<WorkshopDetails />} />
              <Route path="/register" element={<RegisterRouteTrigger />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cookies" element={<Cookies />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="*" element={<div>404</div>} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </SavedJobsProvider>
  );
}

export default App;