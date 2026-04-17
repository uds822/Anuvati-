import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { KeyRound, Mail, ArrowLeft } from "lucide-react";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ title: "Error", description: "Please enter your email.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "Email Sent", description: "Check your inbox for the reset link." });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-border shadow-lg">
      <CardHeader className="text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <KeyRound className="text-primary" size={28} />
        </div>
        <CardTitle className="font-heading text-2xl text-foreground">Reset Password</CardTitle>
        <CardDescription className="font-body text-muted-foreground">
          {sent ? "Check your email for the reset link" : "Enter your email to receive a reset link"}
        </CardDescription>
      </CardHeader>
      {!sent ? (
        <form onSubmit={handleReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="font-heading text-sm">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-muted-foreground" size={16} />
                <Input id="reset-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full font-heading font-semibold" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <button type="button" onClick={onBack} className="text-sm text-primary hover:underline font-heading flex items-center gap-1">
              <ArrowLeft size={14} /> Back to Login
            </button>
          </CardFooter>
        </form>
      ) : (
        <CardFooter className="flex flex-col gap-3">
          <button type="button" onClick={onBack} className="text-sm text-primary hover:underline font-heading flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Login
          </button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ForgotPasswordForm;
