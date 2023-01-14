import { useState, useEffect, ReactElement } from 'react';

const NoSSR = ({ children }: { children: ReactElement | ReactElement[] }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <>{children}</>;
};

export { NoSSR };
