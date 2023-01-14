import { useAtomValue } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { userAtom } from './atom';

const dateAtom = focusAtom(userAtom, (optic) => optic.prop('date'));

export default function UserDate() {
  const date = useAtomValue(dateAtom);
  return <h1>User {date}</h1>;
}
