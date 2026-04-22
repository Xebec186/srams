import { FiCalendar, FiCheck, FiX, FiBarChart2, FiUsers, FiClock, FiStar } from "react-icons/fi";

function StatIcon({ name, className }) {
  const iconProps = { className };
  switch (name) {
    case "calendar": return <FiCalendar {...iconProps} />;
    case "check": return <FiCheck {...iconProps} />;
    case "x": return <FiX {...iconProps} />;
    case "chart": return <FiBarChart2 {...iconProps} />;
    case "users": return <FiUsers {...iconProps} />;
    case "clock": return <FiClock {...iconProps} />;
    case "star": return <FiStar {...iconProps} />;
    default: return null;
  }
}

export default function StatCard({ icon, value, label, color = "blue" }) {
  // Map color to Tailwind classes
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-600",
    purple: "bg-purple-100 text-purple-600",
  };
  
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorMap[color] || colorMap.blue}`}>
        <StatIcon name={icon} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
