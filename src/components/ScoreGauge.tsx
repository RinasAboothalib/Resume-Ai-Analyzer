interface ScoreGaugeProps {
  score: number;
}

export function ScoreGauge({ score }: ScoreGaugeProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return "hsl(var(--success))";
    if (score >= 60) return "hsl(var(--accent))";
    return "hsl(var(--destructive))";
  };

  const getLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="10" />
        <circle
          cx="90" cy="90" r={radius} fill="none"
          stroke={getColor()}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
        <text x="90" y="82" textAnchor="middle" className="fill-foreground" style={{ fontSize: "36px", fontFamily: "var(--font-display)" }}>
          {score}
        </text>
        <text x="90" y="108" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: "14px", fontFamily: "var(--font-body)" }}>
          {getLabel()}
        </text>
      </svg>
    </div>
  );
}
