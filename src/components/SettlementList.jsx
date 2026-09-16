import { ArrowRightLeft } from 'lucide-react';
import { currency } from '../utils/calculations';

const SettlementList = ({ settlements }) => {
  if (!settlements.length) {
    return (
      <div className="empty-state success-state">
        <div className="empty-state-title">Everyone is settled</div>
        <p>No payments required.</p>
      </div>
    );
  }

  return (
    <div className="settlement-list">
      {settlements.map((item, index) => (
        <div key={`${item.from}-${item.to}-${index}`} className="settlement-item">
          <div className="settlement-person">
            <span className="transaction-label">From</span>
            <strong>{item.from}</strong>
          </div>
          <div className="transaction-arrow">
            <ArrowRightLeft size={16} />
            <span>pays</span>
          </div>
          <div className="settlement-person">
            <span className="transaction-label">To</span>
            <strong>{item.to}</strong>
          </div>
          <div className="amount-box">{currency(item.amount)}</div>
        </div>
      ))}
    </div>
  );
};

export default SettlementList;
