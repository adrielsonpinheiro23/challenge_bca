import { AuthPayload, UserPayload } from '../clients/ReqresClient';

export const reqresUsers = {
  existingUserId: 2,
  missingUserId: 23,
};

export const validAuthPayload: Required<AuthPayload> = {
  email: 'eve.holt@reqres.in',
  password: 'pistol',
};

export const userPayloads: UserPayload[] = [
  { name: 'morpheus', job: 'leader' },
  { name: 'trinity', job: 'zion resident' },
];

export const updatedUserPayload: UserPayload = {
  name: 'morpheus',
  job: 'zion manager',
};
