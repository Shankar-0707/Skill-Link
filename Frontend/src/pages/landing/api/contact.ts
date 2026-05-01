import { api } from "@/services/api/api";

export type ContactInquiryPayload = {
  fullName: string;
  email: string;
  message: string;
};

export async function submitContactInquiry(payload: ContactInquiryPayload) {
  return api.post("/contact/inquiry", payload);
}
