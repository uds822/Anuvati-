import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import Layout from "@/components/layout/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="py-28 md:py-40">
        <div className="container max-w-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-6">
            <Search className="text-primary" size={32} />
          </div>
          <h1 className="font-heading font-bold text-6xl md:text-7xl text-primary mb-4">404</h1>
          <h2 className="font-heading font-bold text-2xl text-foreground mb-3">Page Not Found</h2>
          <p className="font-body text-muted-foreground mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/">
              <Button className="font-heading font-semibold bg-primary hover:bg-primary/90">
                <ArrowLeft size={16} className="mr-2" /> Back to Homepage
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" className="font-heading font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;