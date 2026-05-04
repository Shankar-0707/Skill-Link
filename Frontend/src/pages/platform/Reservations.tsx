import React from "react";
import {
  CalendarCheck2,
  CheckCheck,
  Clock3,
  LayoutList,
  WalletCards,
} from "lucide-react";
import { PlatformPageLayout } from "./PlatformPageLayout";

export const ReservationsPage: React.FC = () => (
  <PlatformPageLayout
    eyebrow="Platform / Reservations"
    title="Reservations that make service commitments easier to manage."
    description="Skill-Link supports cleaner booking and reservation flows for customers, workers, and organisations so everyone knows what is requested, approved, scheduled, and completed."
    heroIcon={CalendarCheck2}
    metrics={[
      { value: "Plan", label: "Service timing and expectations" },
      { value: "Approve", label: "Confirmed commitment before work" },
      { value: "Track", label: "Status clarity for every participant" },
    ]}
    features={[
      {
        title: "Organised requests",
        description:
          "Reservation details keep the service need, timing, and participant context in one reliable place.",
        icon: LayoutList,
      },
      {
        title: "Approval flow",
        description:
          "Customers and organisations can move from interest to confirmation with clearer status changes.",
        icon: CheckCheck,
      },
      {
        title: "Schedule awareness",
        description:
          "Timing, availability, and job expectations are easier to coordinate when the booking has structure.",
        icon: Clock3,
      },
      {
        title: "Payment context",
        description:
          "Reservation records can stay connected to wallet and payment activity without exposing unnecessary complexity.",
        icon: WalletCards,
      },
    ]}
    processTitle="A reservation should feel like a promise everyone can see."
    processDescription="The page flow keeps operational details readable for customers while still supporting the deeper controls organisations need."
    steps={[
      {
        label: "1",
        title: "Choose the service or product",
        description:
          "The customer starts from a worker, organisation, or listed offering and submits a reservation request.",
      },
      {
        label: "2",
        title: "Confirm availability",
        description:
          "The receiving side reviews the request and confirms whether the timing and conditions are workable.",
      },
      {
        label: "3",
        title: "Follow status changes",
        description:
          "Pending, approved, rejected, and completed states make the commitment easier to understand.",
      },
      {
        label: "4",
        title: "Keep records clean",
        description:
          "Reservation history gives both sides a reliable reference for support, follow-up, and future planning.",
      },
    ]}
    highlightTitle="Better bookings make the whole service experience calmer."
    highlightDescription="Reservations reduce uncertainty by turning scattered conversations into visible commitments."
    highlightPoints={[
      "Customers understand whether a request is pending, approved, or complete.",
      "Organisations can manage multiple reservations without losing context.",
      "Workers and teams get clearer expectations before arriving.",
      "Support teams can reason from structured records when issues appear.",
    ]}
  />
);
