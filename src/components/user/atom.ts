import { atomWithSearch } from '../atomWithSearch';

export const userAtom = atomWithSearch('state', {
  id: 3,
  date: new Date().toISOString(),
});
