"use client";

import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  // Wrapper แสดง children โดยตรง
  return <>{children}</>;
}
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <LoadScriptNext
      id="gmap-script"
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      language="th"
    >
      {children}
    </LoadScriptNext>
  );
}
