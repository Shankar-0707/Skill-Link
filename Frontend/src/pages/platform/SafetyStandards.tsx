import React from "react";
import {
  AlertTriangle,
  FileCheck2,
  LifeBuoy,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { PlatformPageLayout } from "./PlatformPageLayout";

export const SafetyStandardsPage: React.FC = () => (
  <PlatformPageLayout
    eyebrow="Platform / Safety standards"
    title="A practical safety layer for real-world service work."
    description="Skill-Link is designed around trust, verification, support, and clear records so customers, workers, and organisations can operate with more confidence."
    heroIcon={ShieldCheck}
    metrics={[
      { value: "Verify", label: "Check identity and profile readiness" },
      { value: "Record", label: "Keep service context traceable" },
      { value: "Support", label: "Give users a path when things go wrong" },
    ]}
    features={[
      {
        title: "Verification first",
        description:
          "Account and profile checks help create a stronger foundation before service interactions happen.",
        icon: FileCheck2,
      },
      {
        title: "Safer records",
        description:
          "Structured job and reservation histories make it easier to understand what was requested and agreed.",
        icon: LockKeyhole,
      },
      {
        title: "Issue visibility",
        description:
          "Clear status, support flows, and admin visibility help surface problems before they become harder to resolve.",
        icon: AlertTriangle,
      },
      {
        title: "Human support",
        description:
          "Help center and ticketing experiences give users a direct place to ask for assistance.",
        icon: LifeBuoy,
      },
    ]}
    processTitle="Safety is built from small, repeatable checks."
    processDescription="For Skill-Link, safety is not only a policy page. It is a set of product decisions that make service work more transparent and accountable."
    steps={[
      {
        label: "1",
        title: "Verify participants",
        description:
          "Workers and organisations can complete account checks that improve trust before customer interaction.",
      },
      {
        label: "2",
        title: "Clarify expectations",
        description:
          "Job and reservation details reduce ambiguity around timing, service scope, and responsibilities.",
      },
      {
        label: "3",
        title: "Monitor platform activity",
        description:
          "Statuses, admin controls, and help workflows give the platform better operational visibility.",
      },
      {
        label: "4",
        title: "Resolve with context",
        description:
          "When support is needed, the team can rely on structured records instead of incomplete conversations.",
      },
    ]}
    highlightTitle="Trust improves when the platform remembers the important details."
    highlightDescription="Safety standards help Skill-Link feel professional, dependable, and ready for repeated service use."
    highlightPoints={[
      "Verification makes profiles more accountable.",
      "Structured service records reduce confusion during support.",
      "Admin and help flows create better escalation paths.",
      "Clear expectations protect both customers and service providers.",
    ]}
  />
);
