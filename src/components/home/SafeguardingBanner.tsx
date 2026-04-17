import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const SafeguardingBanner = () => {
  return (
    <section className="py-6 bg-section-light border-t border-border/50">
      <div className="container">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
          <Shield size={18} className="text-primary shrink-0" />
          <p className="font-body text-muted-foreground text-sm">
            Committed to the highest standards of{" "}
            <Link to="/policies" className="text-primary font-medium hover:underline">
              safeguarding, ethics, and accountability
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default SafeguardingBanner;
