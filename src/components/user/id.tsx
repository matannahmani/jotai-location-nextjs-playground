import { useAtomValue } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { userAtom } from './atom';

const idAtom = focusAtom(userAtom, (optic) => optic.prop('id'));

export default function UserId() {
  const id = useAtomValue(idAtom);
  return <h1>User {id}</h1>;
}
