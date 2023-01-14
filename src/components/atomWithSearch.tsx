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

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: any) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
// @ts-expect-error
export function mergeDeep(target: any, ...sources: any) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

const applySearch = (searchParams: URLSearchParams) => {
  const url = new URL(window.location.href);
  url.search = searchParams.toString();
  window.history.pushState(null, '', url.toString());
};

const extractKeyPairsFromSearch = (
  keys: IterableIterator<string>,
  searchParams: URLSearchParams,
  initalStoreKeys: string[]
) => {
  const keyPairs = {};
  let hasKeys = false;
  while (true) {
    const key = keys.next();
    if (key.done) break;
    // skip keys that are not in the initial store
    if (!initalStoreKeys.includes(key.value)) continue;
    hasKeys = true;
    const value = searchParams.get(key.value);
    // @ts-expect-error
    if (value) keyPairs[key.value] = value;
  }
  return { keyPairs, hasKeys };
};

export function atomWithSearch<Value>(
  queryKey: string,
  initialValue: Value,
  options?: {
    subscribe?: (callback: () => void) => () => void;
  }
): WritableAtom<Value, SetStateActionWithReset<Value>> {
  const serialize = (v: any) => encodeURIComponent(JSON.stringify(v));

  let cachedStr: string | undefined = serialize(initialValue);
  let cachedValue: any = initialValue;

  const deserialize = (str: string) => {
    str = str || '';
    if (cachedStr !== str) {
      try {
        cachedValue = JSON.parse(decodeURIComponent(str));
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
      if (cachedStr === undefined) {
        cachedStr = serialize(initialValue);
        applySearch(new URLSearchParams(cachedStr));
        return initialValue;
      }
      // if cachedStr is defined, we have already applied the search params
      // we need to check if all keys exists otherwise merge inital value to it
      const searchParams = new URLSearchParams(window.location.search);
      const keys = searchParams.keys();
      const { keyPairs, hasKeys } = extractKeyPairsFromSearch(
        keys,
        searchParams,
        Object.keys(initialValue as object)
      );
      if (hasKeys) {
        const mergedValue = mergeDeep(initialValue, keyPairs);
        cachedStr = serialize(mergedValue);
        applySearch(new URLSearchParams(cachedStr));
        return mergedValue;
      }
      return initialValue;
    },
    setItem: (k: string, newValue: Value) => {
      // encode the value and seraialize it
      const serializedParamValue = serialize(newValue);
      // Update local cache when setItem is called directly
      cachedStr = serializedParamValue;
      cachedValue = newValue;
      applySearch(new URLSearchParams(serializedParamValue));
    },
    removeItem: (k: string) => {
      //   const searchParams = new URLSearchParams(window.location.search);
      //   searchParams.delete(k);
      applySearch(new URLSearchParams());
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
