// TODO consider refactoring without atomWithStorage

import type { WritableAtom } from 'jotai';
import {
  atomWithStorage,
  unstable_NO_STORAGE_VALUE as NO_STORAGE_VALUE,
  RESET,
} from 'jotai/utils';

type SetStateActionWithReset<Value> =
  | Value
  | typeof RESET
  | ((prev: Value) => Value | typeof RESET);

const applySearch = (searchParams: URLSearchParams) => {
  const url = new URL(window.location.href);
  url.search = searchParams.toString();
  window.history.pushState(null, '', url.toString());
};

const extractKeyPairsFromSearch = (
  keys: IterableIterator<string>,
  searchParams: URLSearchParams
) => {
  const keyPairs = {};
  while (true) {
    const key = keys.next();
    if (key.done) break;
    const value = searchParams.get(key.value);
    // @ts-expect-error
    if (value) keyPairs[key.value] = value;
  }
  return keyPairs;
};

export function atomWithSearch<Value>(
  queryKey: string,
  initialValue: Value,
  options?: {
    subscribe?: (callback: () => void) => () => void;
  }
): WritableAtom<Value, SetStateActionWithReset<Value>> {
  const serialize = JSON.stringify;

  let cachedStr: string | undefined = serialize(initialValue);
  let cachedValue: any = initialValue;

  const deserialize = (str: string) => {
    str = str || '';
    if (cachedStr !== str) {
      try {
        cachedValue = JSON.parse(str);
      } catch {
        return NO_STORAGE_VALUE;
      }
      cachedStr = str;
    }
    return cachedValue;
  };

  const subscribe =
    options?.subscribe ||
    ((callback) => {
      window.addEventListener('popstate', callback);
      return () => {
        window.removeEventListener('popstate', callback);
      };
    });
  const serachStorage = {
    getItem: (k: string) => {
      if (typeof window === 'undefined' || !window.location) {
        return NO_STORAGE_VALUE;
      }
      console.log('GET ITEM');
      if (cachedStr !== undefined) {
        const currentSearchParams = new URLSearchParams(window.location.search);
        const currentStr = currentSearchParams.get(k);
        const currentKeys = currentSearchParams.keys();
        if (!!currentStr) {
          console.log('currentStr', currentStr);
          const extractedKeyPairs = extractKeyPairsFromSearch(
            currentKeys,
            currentSearchParams
          );
          cachedStr = serialize(extractedKeyPairs);
          cachedValue = extractedKeyPairs;
          return extractedKeyPairs;
        } else {
          // if first load and  no search params apply set inital value
          applySearch(new URLSearchParams({ [k]: cachedStr }));

          return initialValue;
        }
      }
      const searchParams = new URLSearchParams(window.location.search);
      const storeValue = searchParams.toString();
      return deserialize(storeValue);
    },
    setItem: (k: string, newValue: Value) => {
      //   const searchParams = new URLSearchParams(window.location.search);
      //   const serializedParamValue = serialize(newValue);
      //   searchParams.set(k, serializedParamValue);
      //   // Update local cache when setItem is called directly
      //   cachedStr = serializedParamValue;
      //   cachedValue = newValue;
      //   applySearch(searchParams);
    },
    removeItem: (k: string) => {
      console.log('REMOVE ITEM');
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete(k);
      applySearch(searchParams);
    },
    subscribe: (k: string, setValue: (v: Value) => void) => {
      const callback = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const str = searchParams.get(k);
        console.log('call back');
        if (str !== null) {
          setValue(deserialize(str));
        } else {
          setValue(initialValue);
        }
      };
      return subscribe(callback);
    },
  };

  return atomWithStorage(queryKey, initialValue, serachStorage);
}
