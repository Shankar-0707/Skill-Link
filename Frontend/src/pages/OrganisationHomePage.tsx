import React from "react";
import { useAuth } from "../app/context/useAuth";
import { HomePageLayout } from "./HomePageLayout";

export const OrganisationHomePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <HomePageLayout
      user={user}
      title="Organisation dashboard"
      description="This is the temporary organisation home page so we can verify organisation login and auth state."
      buttons={[
        { label: "Manage Products" },
        { label: "Orders", variant: "secondary" },
        { label: "Hire Workers" },
      ]}
    />
  );
};
