import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: "",
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: "",
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo: errorInfo.componentStack,
    });
    console.error("Auth error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-10">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Authentication Error
          </h2>
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-sm text-red-800">
              {this.state.error?.message ||
                "Failed to connect to authentication service"}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Possible solutions:</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Check your internet connection</li>
                <li>Ensure Supabase service is available</li>
                <li>Verify that your API keys are correct</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try using a different browser</li>
              </ul>
            </div>
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded overflow-auto max-h-32">
              <p>Technical details (for support):</p>
              <pre>{this.state.errorInfo}</pre>
            </div>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: "" });
                window.location.reload();
              }}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
