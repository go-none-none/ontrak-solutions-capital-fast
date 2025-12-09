import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import UseCases from './pages/UseCases';
import Industries from './pages/Industries';
import Reviews from './pages/Reviews';
import Application from './pages/Application';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import HowItWorks from './pages/HowItWorks';
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
    "HowItWorks": HowItWorks,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};