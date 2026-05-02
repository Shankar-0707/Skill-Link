import React from "react";
import {
  BadgeCheck,
  IdCard,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { PlatformPageLayout } from "./PlatformPageLayout";

export const VerifiedWorkersPage: React.FC = () => (
  <PlatformPageLayout
    eyebrow="Platform / Verified workers"
    title="Professional profiles that help customers choose with trust."
    description="Skill-Link gives skilled workers a credible presence and gives customers the context they need before inviting someone into a home, office, or project site."
    heroIcon={BadgeCheck}
    metrics={[
      { value: "KYC", label: "Identity and profile readiness" },
      { value: "Skills", label: "Capability-led worker discovery" },
      { value: "Ratings", label: "Quality signals over time" },
    ]}
    features={[
      {
        title: "Identity checks",
        description:
          "Worker onboarding can include verification steps that make profiles more trustworthy and easier to evaluate.",
        icon: IdCard,
      },
      {
        title: "Skill visibility",
        description:
          "Profiles make specialities, service categories, and practical capabilities clearer before a job starts.",
        icon: Sparkles,
      },
      {
        title: "Quality signals",
        description:
          "Ratings and platform history help customers understand consistency, reliability, and previous work experience.",
        icon: Star,
      },
      {
        title: "Trust controls",
        description:
          "Verification and platform policies create a stronger foundation for safer service interactions.",
        icon: ShieldCheck,
      },
    ]}
    processTitle="A better worker profile is more than a name and phone number."
    processDescription="Skill-Link presents the information customers naturally look for when hiring skilled people, while giving workers a more professional way to grow."
    steps={[
      {
        label: "1",
        title: "Profile setup",
        description:
          "Workers add their trade, service areas, experience, and personal details needed for a credible account.",
      },
      {
        label: "2",
        title: "Verification review",
        description:
          "The platform can review documents and readiness signals before highlighting a worker as trusted.",
      },
      {
        label: "3",
        title: "Customer discovery",
        description:
          "Customers compare relevant workers using practical information instead of guessing from incomplete listings.",
      },
      {
        label: "4",
        title: "Reputation growth",
        description:
          "Completed work, feedback, and responsiveness help strong workers stand out over time.",
      },
    ]}
    highlightTitle="Trust becomes visible before the first conversation."
    highlightDescription="A verified profile helps good workers look professional and helps customers make decisions with less risk."
    highlightPoints={[
      "Customers see stronger context before selecting a worker.",
      "Workers get a credible digital presence for their skill set.",
      "Organisations can present teams with clearer quality standards.",
      "Verification and reputation help reduce low-confidence hiring.",
    ]}
  />
);
