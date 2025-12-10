import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import UseCases from './pages/UseCases';
import Industries from './pages/Industries';
import Reviews from './pages/Reviews';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import FAQ from './pages/FAQ';
import HowItWorks from './pages/HowItWorks';
import application from './pages/application';
import ThankYou from './pages/ThankYou';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "About": About,
    "Contact": Contact,
    "UseCases": UseCases,
    "Industries": Industries,
    "Reviews": Reviews,
    "TermsOfService": TermsOfService,
    "PrivacyPolicy": PrivacyPolicy,
    "FAQ": FAQ,
    "HowItWorks": HowItWorks,
    "application": application,
    "ThankYou": ThankYou,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};