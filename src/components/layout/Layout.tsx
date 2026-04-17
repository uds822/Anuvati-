import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AiAssistant from "./AiAssistant";

import BackToTop from "./BackToTop";
import CookieConsent from "./CookieConsent";

import PageTransition from "../motion/PageTransition";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md font-heading font-semibold text-sm">
        Skip to main content
      </a>
      
      <Header />
      <main id="main-content" className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <AiAssistant />
      
      <BackToTop />
      <CookieConsent />
    </div>
  );
};

export default Layout;
