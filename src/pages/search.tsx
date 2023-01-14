import { atomWithSearch } from '@/components/atomWithSearch';
import { useDate } from '@/components/useDate';
import { useAtomValue } from 'jotai';
import { atomWithLocation } from 'jotai-location';

export const userWithSearch = atomWithSearch('state', {
  id: '3',
  date: new Date().toISOString(),
});

const UserPre = () => {
  const { id, date } = useAtomValue(userWithSearch);

  return (
    <>
      <h1>User {id}</h1>
      <h2>Date {date}</h2>
    </>
  );
};

export default UserPre;
