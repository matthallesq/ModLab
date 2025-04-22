import UserProfile from "../auth/UserProfile";
import { useAuth } from "../../auth/fileAuth";
import { Navigate } from "react-router-dom";
import { LoadingScreen } from "../ui/loading-spinner";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Loading profile..." />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <UserProfile />;
}
