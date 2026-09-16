import { BadgeDollarSign } from 'lucide-react';
import { currency, formatMoneyInputValue, parseMoneyInput } from '../utils/calculations';

const PoolSetup = ({ pool, onPoolChange, onReset }) => {
  const handleNameChange = (event) => onPoolChange({ ...pool, name: event.target.value });
  const handleTargetChange = (value) => {
    const cleaned = parseMoneyInput(String(value));
    onPoolChange({ ...pool, targetAmount: cleaned });
  };

  const hasPool = Boolean(pool?.name || Number(pool?.targetAmount) > 0 || pool?.members?.length);

  return (
    <section className="card panel-card">
      <div className="section-header">
        <div className="section-title-wrap">
          <span className="section-icon"><BadgeDollarSign size={16} /></span>
          <div>
            <p className="eyebrow">Pool setup</p>
            <h2>Gift details</h2>
          </div>
        </div>
        {hasPool && (
          <button className="secondary" type="button" onClick={onReset}>
            Reset pool
          </button>
        )}
      </div>

      <div className="grid two-col">
        <label className="field">
          <span>Pool / Gift name</span>
          <input
            type="text"
            value={pool.name}
            onChange={handleNameChange}
            placeholder="Farewell Gift"
          />
        </label>

        <label className="field money-field">
          <span>Target amount</span>
          <div className="money-input-shell premium-shell">
            <span className="money-prefix">₹</span>
            <input
              type="text"
              inputMode="decimal"
              value={formatMoneyInputValue(pool.targetAmount)}
              onChange={(event) => handleTargetChange(event.target.value)}
              placeholder="6,000"
            />
          </div>
        </label>
      </div>

      <div className="inline-meta">
        <span>Currency</span>
        <strong>INR</strong>
      </div>

      {pool.name || pool.targetAmount ? (
        <div className="pool-preview">
          <div>
            <span className="preview-label">Selected pool</span>
            <strong>{pool.name || 'Untitled Gift'}</strong>
          </div>
          <span className="preview-value">{currency(pool.targetAmount || 0)}</span>
        </div>
      ) : null}
    </section>
  );
};

export default PoolSetup;
