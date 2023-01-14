import { useAtomValue } from 'jotai';
import { atomWithLocation } from 'jotai-location';
import { NoSSR } from './NoSSR';

const loc = atomWithLocation();

/**
 * @description user profile, with id from query string
 * @returns {JSX.Element}
 * @note this can only work on the client side, because it uses the browser's location object
 * @note if you enter this page directly will get hydration error
 * @note to fix this problem you can use NoSSR Component
 */
const UserPage = () => {
  const location = useAtomValue(loc);
  const id = location.searchParams?.get('id');
  if (!id) return <h1>No user id</h1>;
  return <h1>User {id}</h1>;
};

const UserPageNoSSR = () => {
  return (
    <NoSSR>
      <UserPage />
    </NoSSR>
  );
};

export { UserPage, UserPageNoSSR };
