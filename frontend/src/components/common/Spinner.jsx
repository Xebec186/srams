import React from "react";
export default function Spinner({ center = false }) {
  if (center)
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    );
  return <div className="spinner" />;
}
