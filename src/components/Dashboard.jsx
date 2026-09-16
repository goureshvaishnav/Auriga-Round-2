import { ArrowDownRight, CircleDollarSign, Target, Users } from 'lucide-react';
import { currency, getCollectedTotal, getProgress, getRemaining } from '../utils/calculations';

const Dashboard = ({ pool, members }) => {
  const totalCollected = getCollectedTotal(members);
  const remaining = getRemaining(pool.targetAmount, members);
  const progress = getProgress(pool.targetAmount, members);
  const overTarget = totalCollected > Number(pool.targetAmount || 0);

  const summaryCards = [
    { label: 'Target amount', value: currency(Number(pool.targetAmount || 0)), icon: Target, accent: 'violet' },
    { label: 'Collected', value: currency(totalCollected), icon: CircleDollarSign, accent: 'green' },
    { label: 'Remaining', value: currency(Math.max(0, remaining)), icon: ArrowDownRight, accent: 'amber' },
    { label: 'Members', value: String(members.length), icon: Users, accent: 'blue' },
  ];

  const progressState = overTarget ? 'Exceeded' : progress >= 100 ? 'Reached' : 'Not reached';

  return (
    <section className="dashboard-grid">
      {summaryCards.map((card) => {
        const Icon = card.icon;

        return (
          <article key={card.label} className={`stat-card stat-${card.accent}`}>
            <div className="stat-topline">
              <span className="stat-icon"><Icon size={16} /></span>
              <span className="stat-label">{card.label}</span>
            </div>
            <strong>{card.value}</strong>
          </article>
        );
      })}

      <div className="progress-panel">
        <div className="progress-header">
          <div>
            <span className="panel-label">Collection progress</span>
            <strong>{Math.round(progress)}%</strong>
          </div>
          <span className={`status-badge ${overTarget ? 'warning' : progress >= 100 ? 'success' : 'neutral'}`}>
            {progressState}
          </span>
        </div>
        <div className="progress-track">
          <div className={`progress-fill ${overTarget ? 'over' : ''}`} style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-meta">
          <span>{currency(totalCollected)} collected</span>
          <span>{currency(Math.max(0, remaining))} left</span>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
