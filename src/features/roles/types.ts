/** A permission reference as embedded in a role. */
export interface PermissionRef {
  id: string;
  code: string;
}

/** Role with its granted permissions (`GET /api/roles`). */
export interface RoleResponse {
  id: string;
  name: string;
  permissions: PermissionRef[];
}
