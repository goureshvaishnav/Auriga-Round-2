import { MinusCircle } from 'lucide-react';
import { currency, formatMoneyInputValue, parseMoneyInput } from '../utils/calculations';

const MemberList = ({ members, onRemoveMember, onUpdatePayment }) => {
  return (
    <div className="member-list">
      {members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No members yet</div>
          <p>Add the first contributor to begin tracking the pool.</p>
        </div>
      ) : (
        members.map((member) => (
          <div key={member.id} className="member-item">
            <div className="member-information">
              <strong>{member.name}</strong>
              <small>Paid: {currency(member.paid || 0)}</small>
            </div>

            <div className="member-actions">
              <label className="field inline-field money-field compact-money">
                <span>Contribution</span>
                <div className="money-input-shell compact-shell">
                  <span className="money-prefix">₹</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formatMoneyInputValue(member.paid)}
                    onChange={(event) => onUpdatePayment(member.id, parseMoneyInput(event.target.value))}
                  />
                </div>
              </label>
              <button type="button" className="danger danger-compact" onClick={() => onRemoveMember(member.id)}>
                <MinusCircle size={15} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MemberList;
