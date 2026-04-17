/**
 * ANUVATI Backend API client.
 *
 * Base URL is read from VITE_API_URL in your .env:
 *   VITE_API_URL=http://localhost:8000
 *
 * Every request automatically attaches the logged-in user's Supabase JWT
 * so the FastAPI backend can verify identity + admin role.
 */

import { supabase } from "@/integrations/supabase/client";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated.");
  return { Authorization: `Bearer ${token}` };
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await getAuthHeader()),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "Request failed.");
  }

  return res.json() as Promise<T>;
}

// ── Application endpoints ──────────────────────────────────────────────────────

export interface ApproveApplicationResult {
  submission_id: string;
  status: string;
  approved_at: string;
  applicant_email: string;
  applicant_name: string;
  role: string;
  email_sent: boolean;
  message: string;
}

export async function approveApplication(
  submissionId: string
): Promise<ApproveApplicationResult> {
  return apiRequest<ApproveApplicationResult>(
    "POST",
    `/api/v1/admin/applications/${submissionId}/approve`
  );
}
