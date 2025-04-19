import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import ErrorBoundary from "./ErrorBoundary";
import { useToast } from "@/components/ui/use-toast";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password validation
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp(email, password, fullName);
      toast({
        title: "Account created successfully",
        description: "Please check your email to verify your account.",
        duration: 5000,
      });
      navigate("/login");
    } catch (error: any) {
      console.error("Sign up error:", error);
      setError(error?.message || "Error creating account");
      toast({
        title: "Sign up failed",
        description: error?.message || "Error creating account",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <AuthLayout>
        <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="mt-2 space-y-1 text-xs">
                <p
                  className={
                    passwordValidation.length
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  ✓ At least 8 characters
                </p>
                <p
                  className={
                    passwordValidation.uppercase
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  ✓ At least one uppercase letter
                </p>
                <p
                  className={
                    passwordValidation.lowercase
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  ✓ At least one lowercase letter
                </p>
                <p
                  className={
                    passwordValidation.number
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  ✓ At least one number
                </p>
                <p
                  className={
                    passwordValidation.special
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  ✓ At least one special character
                </p>
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full h-12 rounded-full bg-black text-white hover:bg-gray-800 text-sm font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>

            <div className="text-xs text-center text-gray-500 mt-6">
              By creating an account, you agree to our{" "}
              <Link to="/" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </div>

            <div className="text-sm text-center text-gray-600 mt-6">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </AuthLayout>
    </ErrorBoundary>
  );
}
