import React from "react";
import {
  ClipboardCheck,
  FileSearch,
  Handshake,
  MessageSquareText,
  Route,
} from "lucide-react";
import { PlatformPageLayout } from "./PlatformPageLayout";

export const HowItWorksPage: React.FC = () => (
  <PlatformPageLayout
    eyebrow="Platform / How it works"
    title="A clearer way to request, match, and complete skilled work."
    description="Skill-Link turns service hiring into a guided flow: customers describe the work, verified professionals respond, and every step stays visible from first request to final completion."
    heroIcon={Route}
    metrics={[
      { value: "01", label: "Create a structured job request" },
      { value: "02", label: "Compare verified responses" },
      { value: "03", label: "Track progress until completion" },
    ]}
    features={[
      {
        title: "Guided requests",
        description:
          "Customers share job details in a format workers can understand quickly, reducing back-and-forth before work begins.",
        icon: ClipboardCheck,
      },
      {
        title: "Relevant discovery",
        description:
          "Workers and organisations can be matched around skill, location, availability, and platform readiness.",
        icon: FileSearch,
      },
      {
        title: "Clear communication",
        description:
          "Important job context, timing, and decisions stay attached to the service flow instead of getting scattered.",
        icon: MessageSquareText,
      },
      {
        title: "Accountable delivery",
        description:
          "The platform keeps each participant aligned on expectations, updates, and completion signals.",
        icon: Handshake,
      },
    ]}
    processTitle="From request to resolution, every step has a place."
    processDescription="The experience is designed for practical service work, where clarity, speed, and trust matter more than flashy complexity."
    steps={[
      {
        label: "1",
        title: "Post the need",
        description:
          "A customer creates a request with the service type, location, timing, and expected outcome.",
      },
      {
        label: "2",
        title: "Review options",
        description:
          "Available workers and organisations respond with profiles, skills, and context that helps the customer choose confidently.",
      },
      {
        label: "3",
        title: "Coordinate the work",
        description:
          "Once selected, the job moves into a shared flow where both sides can understand what is happening next.",
      },
      {
        label: "4",
        title: "Complete with confidence",
        description:
          "Completion status, support paths, and quality signals help turn a one-time service into a reliable platform experience.",
      },
    ]}
    highlightTitle="Less confusion before the work. Fewer surprises after it."
    highlightDescription="Skill-Link gives service teams a professional operating layer without making customers learn a complicated system."
    highlightPoints={[
      "Structured job details help workers respond with the right information.",
      "Customers can evaluate people and organisations before committing.",
      "The same flow supports individual workers and larger service teams.",
      "Support and accountability stay close to the job journey.",
    ]}
  />
);
