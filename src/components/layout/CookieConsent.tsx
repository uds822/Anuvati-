import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4 animate-fade-in">
      <div className="container">
        <div className="bg-card border border-border rounded-xl shadow-xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 max-w-4xl mx-auto">
          <div className="flex-1">
            <p className="font-heading font-semibold text-foreground text-sm mb-1">
              About cookies on this site
            </p>
            <p className="font-body text-muted-foreground text-xs leading-relaxed">
              We use cookies to enhance your experience, analyze site
              performance, and deliver relevant content. You can accept all
              cookies or reject non-essential ones. See our{" "}
              <a
                href="/policies"
                className="text-primary underline hover:text-primary/80"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={accept}
              className="font-heading font-semibold text-xs"
            >
              Accept All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={reject}
              className="font-heading font-semibold text-xs"
            >
              Reject All
            </Button>
            <button
              onClick={reject}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
