import React from "react";
import { useAuth } from "../app/context/useAuth";
import { HomePageLayout } from "./HomePageLayout";

export const WorkerHomePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <HomePageLayout
      user={user}
      title="Worker dashboard"
      description="This is the temporary worker home page so we can confirm role-based redirects after login."
      buttons={[
        { label: "Find Jobs" },
        { label: "My Bids", variant: "secondary" },
        { label: "Update Availability" },
      ]}
    />
  );
};
