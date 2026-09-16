import { currency } from '../utils/calculations';

const BalanceTable = ({ memberRows }) => {
  if (!memberRows.length) {
    return <div className="empty-state">No member data available yet.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Fair share</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {memberRows.map((member) => {
            let badgeText = 'Settled';
            let badgeClass = 'settled';

            if (member.balance > 0) {
              badgeText = 'Receives';
              badgeClass = 'receives';
            } else if (member.balance < 0) {
              badgeText = 'Owes';
              badgeClass = 'owes';
            }

            if (member.paid === 0 && member.fairShare > 0) {
              badgeText = 'Paid';
              badgeClass = 'paid';
            }

            if (member.paid > 0 && member.paid < member.fairShare) {
              badgeText = 'Partial';
              badgeClass = 'partial';
            }

            return (
              <tr key={member.id}>
                <td className="member-name-cell">
                  <span className="member-row-name">{member.name}</span>
                </td>
                <td>{currency(member.fairShare)}</td>
                <td>{currency(member.paid)}</td>
                <td className={member.balance > 0 ? 'positive' : member.balance < 0 ? 'negative' : ''}>
                  {currency(member.balance)}
                </td>
                <td>
                  <span className={`status-pill ${badgeClass}`}>{badgeText}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BalanceTable;
