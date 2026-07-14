import type { StudentType } from "@/config/student-type";

/** Current-user identity + resolved permissions, from `GET /api/users/me`. */
export interface CurrentUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  studentType: StudentType;
  sessionId: string;
  accessTokenJti: string;
  permissions: string[];
}
