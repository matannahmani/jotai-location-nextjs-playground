import { NoSSR } from '@/components/NoSSR';
import { useDate } from '@/components/useDate';
import { useAtomValue } from 'jotai';
import { atomWithLocation } from 'jotai-location';
import Link from 'next/link';
import { useRouter } from 'next/router';

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
  const router = useRouter();
  const id = location.searchParams?.get('id');
  const date = useDate();
  if (!id) return <h1>No user id</h1>;
  return (
    <div>
      <h1>User {id}</h1>
      <button onClick={() => router.back()}>Go back (return)</button>
      <span>date: {date}</span>
    </div>
  );
};

const NoSSRUserPage = () => {
  return (
    <NoSSR>
      <UserPage />
    </NoSSR>
  );
};

/*
Unhandled Runtime Error
Error: Text content does not match server-rendered HTML.
See more info here: https://nextjs.org/docs/messages/react-hydration-error
*/
// this one will throw error on direct url hit (without client side routing)
// example url: http://localhost:3000/user?id=1
// export default UserPage;

// this one will not throw error on direct url hit (without client side routing)
// example url: http://localhost:3000/user?id=1
export default NoSSRUserPage;
