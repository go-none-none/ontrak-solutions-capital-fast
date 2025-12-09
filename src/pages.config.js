import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import UseCases from './pages/UseCases';
import Industries from './pages/Industries';
import Reviews from './pages/Reviews';
import Application from './pages/Application';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FAQ from './pages/FAQ';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "About": About,
    "Contact": Contact,
    "UseCases": UseCases,
    "Industries": Industries,
    "Reviews": Reviews,
    "Application": Application,
    "TermsOfService": TermsOfService,
    "PrivacyPolicy": PrivacyPolicy,
    "FAQ": FAQ,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};