export const RESUME_BUCKET = "private-resume";
export const RESUME_FILE_PATH = "current/gabriel-morgado-resume.pdf";

export type ResumeRequestStatus = "pending" | "approved" | "rejected" | "revoked";
export type ResumeNotificationStatus = "not_configured" | "pending" | "sent" | "failed";

export type ResumeRequest = {
  id: string;
  name: string;
  email: string;
  company: string;
  job_title: string;
  linkedin_url: string | null;
  purpose: string;
  locale: "en" | "pt";
  status: ResumeRequestStatus;
  access_expires_at: string | null;
  admin_note: string | null;
  request_notification_status: ResumeNotificationStatus;
  decision_notification_status: ResumeNotificationStatus;
  approved_at: string | null;
  rejected_at: string | null;
  revoked_at: string | null;
  last_download_at: string | null;
  download_count: number;
  created_at: string;
  updated_at: string;
};

export type ResumeFileState = {
  available: boolean;
  size: number | null;
  updatedAt: string | null;
};
