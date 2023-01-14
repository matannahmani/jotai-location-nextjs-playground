import { useAtom } from 'jotai';
import { atomWithLocation } from 'jotai-location';
import { useEffect } from 'react';

const loc = atomWithLocation();
/**
 * @description get date from query string and set it if not exist
 * @note this have a problem when date is not pre-defined in query string
 * @note it will cause double render | or better say double location change (inital null, then set date)
 * so if user will try to hit back button he will have to press 2+ times to go back to original place (in our case home page)
 * @returns {string} date
 */
export const useDate = () => {
  const [location, setLocation] = useAtom(loc);
  const date = location.searchParams?.get('date');
  useEffect(() => {
    console.log(date);
    if (!date)
      setLocation((prev) => {
        const searchParams = new URLSearchParams(prev.searchParams);
        searchParams.set('date', new Date().toISOString());
        return { ...prev, searchParams: searchParams };
      });
  }, []);
  return date;
};
