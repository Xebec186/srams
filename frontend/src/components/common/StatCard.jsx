import { FiCalendar, FiCheck, FiX, FiBarChart2 } from "react-icons/fi";

function StatIcon({ name, className }) {
  const iconProps = { className };
  switch (name) {
    case "calendar":
      return <FiCalendar {...iconProps} />;
    case "check":
      return <FiCheck {...iconProps} />;
    case "x":
      return <FiX {...iconProps} />;
    case "chart":
      return <FiBarChart2 {...iconProps} />;
    default:
      return null;
  }
}

export default function StatCard({ icon, value, label, colorClass = "teal" }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}>
        <StatIcon name={icon} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
