import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground mb-3">
            Stay Connected
          </h2>
          <p className="font-body text-muted-foreground mb-8">
            Subscribe for updates on programs, events, impact stories, and opportunities.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-primary font-body font-medium py-4">
              <CheckCircle size={20} />
              <span>Thank you for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 font-body h-11"
              />
              <Button type="submit" className="font-heading font-semibold bg-primary hover:bg-primary/90 h-11 shrink-0 px-6">
                Subscribe
              </Button>
            </form>
          )}
          <p className="text-xs text-muted-foreground mt-4 font-body">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
