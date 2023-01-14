/* eslint-disable react/display-name */
import { NoSSR } from '@/components/NoSSR';
import { atomWithSearch } from '@/components/atomWithSearch';
import { useDate } from '@/components/useDate';
import { userAtom } from '@/components/user/atom';
import UserDate from '@/components/user/date';
import UserId from '@/components/user/id';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import Link from 'next/link';
import { useRouter } from 'next/router';

const UserPre = () => {
  const router = useRouter();
  const setUser = useSetAtom(userAtom);

  const randomID = () => {
    const id = Math.floor(Math.random() * 100);
    setUser((prev) => ({ ...prev, id }));
  };

  const randomDate = () => {
    const date = new Date().toISOString();
    setUser((prev) => ({ ...prev, date }));
  };

  return (
    <>
      <UserId />
      <UserDate />
      <button onClick={randomID}>Random ID</button>
      <button style={{ margin: 8 }} onClick={randomDate}>
        Random Date
      </button>
      <button onClick={() => router.back()}>Go Back</button>
      <Link href="/">Home page</Link>
    </>
  );
};

export default () => (
  <NoSSR>
    <UserPre />
  </NoSSR>
);
