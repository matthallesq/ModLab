import { createContext, useContext, ReactNode } from "react";
import { useAuth0 as useAuth0SDK } from "@auth0/auth0-react";
import { supabase } from "../supabase/supabaseClient";

type Auth0ContextType = {
  user: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (data: {
    full_name?: string;
    avatar_url?: string;
  }) => Promise<void>;
  getUserProfile: () => Promise<any>;
};

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined);

export function Auth0Provider({ children }: { children: ReactNode }) {
  const {
    user: auth0User,
    isLoading,
    isAuthenticated,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0SDK();

  // Map Auth0 user to our app's user format
  const user =
    isAuthenticated && auth0User
      ? {
          id: auth0User.sub,
          email: auth0User.email,
          user_metadata: {
            full_name: auth0User.name,
            avatar_url: auth0User.picture,
          },
        }
      : null;

  const signIn = async (email: string, password: string) => {
    // Auth0 uses redirect-based login, so we'll just redirect to the login page
    await loginWithRedirect({
      appState: { returnTo: window.location.pathname },
      authorizationParams: {
        login_hint: email,
      },
    });
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    // Auth0 handles signup through the same redirect flow
    await loginWithRedirect({
      appState: { returnTo: window.location.pathname },
      authorizationParams: {
        screen_hint: "signup",
        login_hint: email,
      },
    });
  };

  const signOut = async () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const resetPassword = async (email: string) => {
    // Auth0 handles password reset through the universal login page
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: "reset_password",
        login_hint: email,
      },
    });
  };

  const updatePassword = async (password: string) => {
    // Password updates are handled through Auth0's universal login
    // This is a placeholder - in Auth0, users typically change passwords through the Auth0 interface
    console.warn(
      "Password updates are handled through Auth0's universal login",
    );
  };

  const updateProfile = async (data: {
    full_name?: string;
    avatar_url?: string;
  }) => {
    // For Auth0, profile updates would typically be done through Auth0 Management API
    // For this implementation, we'll still update the user_profiles table in Supabase
    if (user) {
      try {
        await supabase.from("user_profiles").upsert({
          id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        });
      } catch (dbError) {
        console.error("Error updating user_profiles table:", dbError);
      }
    }
  };

  const getUserProfile = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  return (
    <Auth0Context.Provider
      value={{
        user,
        loading: isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
        getUserProfile,
      }}
    >
      {children}
    </Auth0Context.Provider>
  );
}

export function useAuth() {
  const context = useContext(Auth0Context);
  if (context === undefined) {
    throw new Error("useAuth must be used within an Auth0Provider");
  }
  return context;
}
