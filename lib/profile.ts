import { authClient } from './auth-client';

type ProfileData = {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  phone?: string;
  position?: string;
  department?: string;
  employeeId?: string;
  birthdate?: string;
};

// Pass undefined (not empty string) for optional fields so Better Auth
// omits them from the SQL SET clause — empty strings break DATE columns.
const orUndefined = (v?: string) => (v && v.trim() !== '' ? v : undefined);

export const updateProfile = async (profile: ProfileData) => {
  const { error } = await authClient.updateUser({
    firstName:  orUndefined(profile.firstName),
    lastName:   orUndefined(profile.lastName),
    middleName: orUndefined(profile.middleName),
    phone:      orUndefined(profile.phone),
    position:   orUndefined(profile.position),
    department: orUndefined(profile.department),
    employeeId: orUndefined(profile.employeeId),
    birthdate:  orUndefined(profile.birthdate),
  });
  if (error) throw new Error(error.message ?? 'Failed to update profile');
  return true;
};