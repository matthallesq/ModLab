import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Apple-style navigation */}
      <div className="min-h-screen flex items-center justify-center pt-12">
        <div className="max-w-md w-full px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-semibold tracking-tight">ModLab</h2>
            <p className="text-xl font-medium text-gray-500 mt-2">
              Sign in to access your account
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
