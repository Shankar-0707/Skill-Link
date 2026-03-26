import React from "react";
import { useAuth } from "../app/context/useAuth";
import { HomePageLayout } from "./HomePageLayout";
import { TestTokenRefresh } from "../components/TestTokenRefresh";

export const UserHomePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <>
      <HomePageLayout
        user={user}
        title="Customer dashboard"
        description="This is the temporary customer home page so we can validate login, cookie storage, and protected routing."
        buttons={[
          { label: "Browse Workers" },
          { label: "My Requests", variant: "secondary" },
          { label: "Saved Jobs" },
        ]}
      />
      <TestTokenRefresh />
    </>
  );
};
