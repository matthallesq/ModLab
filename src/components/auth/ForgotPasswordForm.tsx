import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import AuthLayout from "./AuthLayout";
import { supabase } from "../../../supabase/supabase";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
        duration: 5000,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to send reset email",
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
        {isSuccess ? (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-gray-600">
              We've sent a password reset link to{" "}
              <span className="font-medium">{email}</span>
            </p>
            <Button
              onClick={() => setIsSuccess(false)}
              variant="outline"
              className="mt-4"
            >
              Back to reset form
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Reset your password</h2>
              <p className="text-gray-600 mt-2">
                Enter your email and we'll send you a link to reset your
                password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <Button
                type="submit"
                className="w-full h-12 rounded-full bg-black text-white hover:bg-gray-800 text-sm font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>

              <div className="text-sm text-center text-gray-600 mt-6">
                <Link
                  to="/login"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Back to login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
