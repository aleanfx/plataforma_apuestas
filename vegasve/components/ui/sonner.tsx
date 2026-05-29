"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-center"
      toastOptions={{
        style: {
          background: "var(--gray-2)",
          border: "1px solid var(--gold)",
          color: "var(--text)",
          borderRadius: "999px",
        },
      }}
      {...props}
    />
  );
}
