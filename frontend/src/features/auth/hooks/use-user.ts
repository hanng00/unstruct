import { deriveAppUser } from '../types';
import { useAuth } from './use-auth';

export const useUser = () => {
  const { user, isLoading } = useAuth();

  const { id, email, displayName, attributes } = deriveAppUser(user);
  return {
    user: {
      id,
      email,
      displayName,
      attributes,
    },
    isLoading,
  };
};
