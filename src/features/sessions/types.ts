/** An active session for the current user (`GET /api/sessions`). */
export interface SessionResponse {
  sessionId: string;
  deviceName: string | null;
  ipAddress: string | null;
  createdAtUtc: string;
  revoked: boolean;
  revokedAtUtc: string | null;
  isCurrent: boolean;
}
