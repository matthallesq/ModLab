import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ConnectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Connection error caught:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isConnectionError =
        this.state.error?.message?.includes("Failed to fetch") ||
        this.state.error?.message?.includes("connect to authentication") ||
        this.state.error?.message?.includes("Network Error");

      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-center">
              <div className="p-3 rounded-full bg-red-100">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-center text-gray-900">
              {isConnectionError ? "Connection Error" : "Something went wrong"}
            </h2>

            <p className="text-center text-gray-600">
              {isConnectionError
                ? "Unable to connect to the server. Please check your internet connection and try again."
                : this.state.error?.message || "An unexpected error occurred."}
            </p>

            <div className="flex justify-center">
              <Button onClick={this.handleRetry} className="px-6">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ConnectionErrorBoundary;
