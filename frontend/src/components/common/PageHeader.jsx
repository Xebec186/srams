import React from "react";

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
