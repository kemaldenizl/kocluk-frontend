/**
 * Membership status as serialized by the Security API (string enum). Unknown values
 * are tolerated by falling back to a neutral presentation.
 */
export type MembershipStatus = "Active" | "Suspended" | "Removed" | (string & {});

/** A member of a tenant (`GET /api/memberships?tenantId=`). `roles` are role *names*. */
export interface TenantMember {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  status: MembershipStatus;
  roles: string[];
  joinedAtUtc: string;
  updatedAtUtc: string;
}

/** A membership record as returned when adding a member or listing your own. */
export interface Membership {
  id: string;
  userId: string;
  tenantId: string;
  status: MembershipStatus;
  roles: string[];
  joinedAtUtc: string;
  updatedAtUtc: string;
}
