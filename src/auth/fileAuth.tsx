import { createContext, useContext, useEffect, useState } from "react";

// Define user type
type User = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
};

// Define stored user type (includes password)
type StoredUser = User & {
  password: string;
};

// Define auth context type
type AuthContextType = {
  user: User | null;
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

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user storage (in a real app, this would be a database)
let users: StoredUser[] = [
  {
    id: "user-123",
    email: "demo@example.com",
    password: "password123",
    full_name: "Demo User",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
  },
];

// Current session storage
let currentSession: User | null = null;

// Load users from localStorage if available
const loadUsers = () => {
  try {
    const storedUsers = localStorage.getItem("modellab_users");
    if (storedUsers) {
      users = JSON.parse(storedUsers);
    }

    const storedSession = localStorage.getItem("modellab_current_user");
    if (storedSession) {
      currentSession = JSON.parse(storedSession);
    }
  } catch (error) {
    console.error("Failed to load users from localStorage", error);
  }
};

// Save users to localStorage
const saveUsers = () => {
  try {
    localStorage.setItem("modellab_users", JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save users to localStorage", error);
  }
};

// Save current session to localStorage
const saveSession = (user: User | null) => {
  try {
    if (user) {
      localStorage.setItem("modellab_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("modellab_current_user");
    }
  } catch (error) {
    console.error("Failed to save session to localStorage", error);
  }
};

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize users and session from localStorage
  useEffect(() => {
    loadUsers();
    setUser(currentSession);
    setLoading(false);
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string) => {
    // Check if user already exists
    if (users.some((u) => u.email === email)) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      full_name: fullName,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
    };

    // Add user to storage
    users.push(newUser);
    saveUsers();

    // Return success (but don't log in automatically)
    return;
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    // Find user
    const user = users.find((u) => u.email === email);

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      throw new Error("Invalid email or password");
    }

    // Create session user (without password)
    const sessionUser: User = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
    };

    // Set current user
    currentSession = sessionUser;
    saveSession(sessionUser);
    setUser(sessionUser);
  };

  // Sign out function
  const signOut = async () => {
    currentSession = null;
    saveSession(null);
    setUser(null);
  };

  // Reset password function (simplified for demo)
  const resetPassword = async (email: string) => {
    // Find user
    const userIndex = users.findIndex((u) => u.email === email);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    // In a real app, this would send an email with a reset link
    // For demo purposes, we'll just reset to a default password
    users[userIndex].password = "resetpassword123";
    saveUsers();

    // Return success
    return;
  };

  // Update password function
  const updatePassword = async (password: string) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    // Find user
    const userIndex = users.findIndex((u) => u.id === user.id);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    // Update password
    users[userIndex].password = password;
    saveUsers();

    // Return success
    return;
  };

  // Update profile function
  const updateProfile = async (data: {
    full_name?: string;
    avatar_url?: string;
  }) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    // Find user
    const userIndex = users.findIndex((u) => u.id === user.id);

    if (userIndex === -1) {
      throw new Error("User not found");
    }

    // Update profile
    if (data.full_name) {
      users[userIndex].full_name = data.full_name;
    }
    if (data.avatar_url) {
      users[userIndex].avatar_url = data.avatar_url;
    }
    saveUsers();

    // Update current user
    const updatedUser = {
      ...user,
      ...data,
    };
    currentSession = updatedUser;
    saveSession(updatedUser);
    setUser(updatedUser);

    // Return success
    return;
  };

  // Get user profile function
  const getUserProfile = async () => {
    if (!user) {
      return null;
    }

    // Find user
    const foundUser = users.find((u) => u.id === user.id);

    if (!foundUser) {
      return null;
    }

    // Return user profile (without password)
    return {
      id: foundUser.id,
      email: foundUser.email,
      full_name: foundUser.full_name,
      avatar_url: foundUser.avatar_url,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
