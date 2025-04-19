import React, { useEffect } from "react";
import SubscriptionPage from "@/components/subscription/SubscriptionPage";
import Toolbar from "@/components/dashboard/layout/Toolbar";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { supabase } from "../../../supabase/supabase";

const SubscriptionPageWrapper = () => {
  const [userId, setUserId] = React.useState<string | undefined>(undefined);

  useEffect(() => {
    const getUserId = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    getUserId();
  }, []);

  return (
    <ProjectProvider>
      <SubscriptionProvider userId={userId}>
        <div className="min-h-screen bg-gray-50">
          <Toolbar activeItem="Subscription" />
          <div className="pt-24 pb-8">
            <SubscriptionPage />
          </div>
        </div>
      </SubscriptionProvider>
    </ProjectProvider>
  );
};

export default SubscriptionPageWrapper;
