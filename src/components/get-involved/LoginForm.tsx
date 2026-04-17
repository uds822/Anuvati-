import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

const LoginForm = ({ onSwitchToSignUp, onForgotPassword }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-border shadow-lg">
      <CardHeader className="text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <LogIn className="text-primary" size={28} />
        </div>
        <CardTitle className="font-heading text-2xl text-foreground">Welcome Back</CardTitle>
        <CardDescription className="font-body text-muted-foreground">Sign in to your ANUVATI account</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="font-heading text-sm">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-muted-foreground" size={16} />
              <Input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password" className="font-heading text-sm">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-muted-foreground" size={16} />
              <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="button" onClick={onForgotPassword} className="text-sm text-primary hover:underline font-heading">
            Forgot Password?
          </button>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full font-heading font-semibold" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
          <p className="text-sm text-muted-foreground font-body">
            Don't have an account?{" "}
            <button type="button" onClick={onSwitchToSignUp} className="text-primary hover:underline font-semibold">
              Sign Up
            </button>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
