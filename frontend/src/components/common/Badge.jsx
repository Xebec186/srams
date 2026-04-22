import React from "react";

export default function Badge({ children, className = "badge-neutral" }) {
  return <span className={`badge ${className}`}>{children}</span>;
}
