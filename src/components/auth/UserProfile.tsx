import { useState, useEffect } from "react";
import { useAuth } from "../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "../../../supabase/supabase";
import { Loader2 } from "lucide-react";

export default function UserProfile() {
  const { user, loading, updateProfile, getUserProfile } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [userMetadata, setUserMetadata] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Password validation
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    if (newPassword) {
      setPasswordValidation({
        length: newPassword.length >= 8,
        uppercase: /[A-Z]/.test(newPassword),
        lowercase: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
        special: /[^A-Za-z0-9]/.test(newPassword),
      });
    }
  }, [newPassword]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        setEmail(user.email || "");

        try {
          const profileData = await getUserProfile();

          if (profileData) {
            setFullName(
              profileData.full_name || user.user_metadata?.full_name || "",
            );
          } else {
            // Fallback to user metadata if no profile record exists
            setFullName(user.user_metadata?.full_name || "");
          }

          setUserMetadata(user.user_metadata);
        } catch (error) {
          console.error("Error loading user profile:", error);
          // Fallback to user metadata
          setFullName(user.user_metadata?.full_name || "");
        } finally {
          setLoadingProfile(false);
        }
      }
    };

    loadUserProfile();
  }, [user, getUserProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Update user profile using our enhanced auth context
      await updateProfile({ full_name: fullName });

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error?.message || "Failed to update profile",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setIsChangingPassword(true);

    // Validate password
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      setIsChangingPassword(false);
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      setIsChangingPassword(false);
      return;
    }

    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        setPasswordError("Current password is incorrect");
        throw signInError;
      }

      // Then update to the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
        duration: 3000,
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      if (!passwordError) {
        setPasswordError(error?.message || "Failed to change password");
      }
      toast({
        title: "Password change failed",
        description:
          passwordError || error?.message || "Failed to change password",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Not Authenticated</h2>
          <p className="text-gray-500 mb-4">
            Please sign in to view your profile
          </p>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information and email address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                      alt={fullName || user.email || ""}
                    />
                    <AvatarFallback>
                      {(fullName || user.email || "").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">
                      {fullName || "(No name set)"}
                    </h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="h-12 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Email address cannot be changed. Contact support if you need
                    to use a different email.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to maintain account security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="h-12"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}

                <Button
                  type="submit"
                  className="w-full h-12"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
