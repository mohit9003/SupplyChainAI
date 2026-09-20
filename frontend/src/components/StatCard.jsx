function StatCard({ title, value, icon, description }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon">{icon}</div>
      </div>

      <p className="stat-title">{title}</p>

      <h2 className="stat-value">
        {value}
      </h2>

      <p className="stat-description">
        {description}
      </p>
    </div>
  );
}

export default StatCard;