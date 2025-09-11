export interface AppUserAttributes {
  sub?: string;
  email?: string;
  name?: string;
}

export interface AppUser {
  id: string | null;
  email: string | null;
  displayName: string | null;
  attributes: AppUserAttributes;
}

export function deriveAppUser(user: unknown): AppUser {
  interface AmplifyUserLike {
    attributes?: Partial<AppUserAttributes> | null;
    signInDetails?: { loginId?: string | null } | null;
    username?: string | null;
  }

  const u = (user ?? null) as AmplifyUserLike | null;

  const attributes: AppUserAttributes = {
    sub: u?.attributes?.sub ?? undefined,
    email: u?.attributes?.email ?? undefined,
    name: u?.attributes?.name ?? undefined,
  };

  const loginId = u?.signInDetails?.loginId ?? undefined;
  const username = u?.username ?? undefined;
  const email = attributes.email ?? loginId ?? username ?? null;

  const displayName: string | null = attributes.name ?? email;

  return {
    id: attributes.sub ?? username ?? null,
    email,
    displayName,
    attributes,
  };
}


