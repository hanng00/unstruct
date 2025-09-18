export interface User {
  id: string;
  email: string;
  groups: string[];
  sharetribeId?: string;
  userType?: string;
}
