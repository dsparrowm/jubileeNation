import * as React from "react";

/** Optional artificial delay for demo loading skeletons */
export function useDemoDelay(ms = 300) {
  const [ready, setReady] = React.useState(ms === 0);
  React.useEffect(() => {
    if (ms === 0) return;
    const t = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return ready;
}
