import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import AuthLayout from "./AuthLayout";
import { supabase } from "../../../supabase/supabase";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
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

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
        duration: 5000,
      });

      // Redirect to login page after successful password reset
      navigate("/login");
    } catch (error: any) {
      setError(error?.message || "Failed to reset password");
      toast({
        title: "Error",
        description: error?.message || "Failed to reset password",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Reset your password</h2>
          <p className="text-gray-600 mt-2">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              New Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />

            <div className="mt-2 space-y-1 text-xs">
              <p
                className={
                  passwordValidation.length ? "text-green-600" : "text-gray-500"
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
                  passwordValidation.number ? "text-green-600" : "text-gray-500"
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

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-12 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-black text-white hover:bg-gray-800 text-sm font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
