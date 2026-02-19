/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import Industries from './pages/Industries';
import IndustryAuto from './pages/IndustryAuto';
import IndustryBeauty from './pages/IndustryBeauty';
import IndustryConstruction from './pages/IndustryConstruction';
import IndustryFitness from './pages/IndustryFitness';
import IndustryHealthcare from './pages/IndustryHealthcare';
import IndustryProfessional from './pages/IndustryProfessional';
import IndustryRestaurants from './pages/IndustryRestaurants';
import IndustryRetail from './pages/IndustryRetail';
import IndustryTransportation from './pages/IndustryTransportation';
import LenderDetail from './pages/LenderDetail';
import MerchantDetail from './pages/MerchantDetail';
import MissingDocs from './pages/MissingDocs';
import OwnerContact from './pages/OwnerContact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RecordHistory from './pages/RecordHistory';
import Reviews from './pages/Reviews';
import TermsOfService from './pages/TermsOfService';
import ThankYou from './pages/ThankYou';
import UseCases from './pages/UseCases';
import application from './pages/application';
import Status from './pages/Status';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Blog": Blog,
    "BlogPost": BlogPost,
    "Contact": Contact,
    "FAQ": FAQ,
    "Home": Home,
    "HowItWorks": HowItWorks,
    "Industries": Industries,
    "IndustryAuto": IndustryAuto,
    "IndustryBeauty": IndustryBeauty,
    "IndustryConstruction": IndustryConstruction,
    "IndustryFitness": IndustryFitness,
    "IndustryHealthcare": IndustryHealthcare,
    "IndustryProfessional": IndustryProfessional,
    "IndustryRestaurants": IndustryRestaurants,
    "IndustryRetail": IndustryRetail,
    "IndustryTransportation": IndustryTransportation,
    "LenderDetail": LenderDetail,
    "MerchantDetail": MerchantDetail,
    "MissingDocs": MissingDocs,
    "OwnerContact": OwnerContact,
    "PrivacyPolicy": PrivacyPolicy,
    "RecordHistory": RecordHistory,
    "Reviews": Reviews,
    "TermsOfService": TermsOfService,
    "ThankYou": ThankYou,
    "UseCases": UseCases,
    "application": application,
    "Status": Status,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};