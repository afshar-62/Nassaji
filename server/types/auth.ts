export interface AuthenticatedUser {
  id: string; // UUID in database
  uid: string; // Firebase Auth UID or system actor identifier
  name: string;
  mobile?: string | null;
  email?: string | null;
}

export interface UserBusinessMembership {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  role: 'owner' | 'manager' | 'operator';
  isDefault: boolean;
}

export interface RequestAuthContext {
  user: AuthenticatedUser;
  activeBusinessId?: string | null;
  activeRole?: ('owner' | 'manager' | 'operator') | null;
  memberships: UserBusinessMembership[];
}
