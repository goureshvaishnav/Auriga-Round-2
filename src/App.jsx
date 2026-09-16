import { useEffect, useMemo, useState } from 'react';
import { Moon, SunMedium } from 'lucide-react';
import PoolSetup from './components/PoolSetup';
import Dashboard from './components/Dashboard';
import MemberForm from './components/MemberForm';
import MemberList from './components/MemberList';
import BalanceTable from './components/BalanceTable';
import SettlementList from './components/SettlementList';
import {
  buildMembersView,
  generateSettlementPlan,
  getCollectedTotal,
  getFairShare,
  getRemaining,
} from './utils/calculations';
import { downloadReceipt } from './utils/receipt';
import { clearPool, loadPool, savePool } from './utils/storage';

const emptyPool = {
  name: 'Farewell Gift',
  targetAmount: 6000,
  members: [],
};

const makeMember = (name) => ({
  id: crypto.randomUUID(),
  name,
  paid: 0,
});

function App() {
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem('giftpool-theme');
    return storedTheme || 'light';
  });

  const [pool, setPool] = useState(() => {
    const saved = loadPool();
    return saved || emptyPool;
  });

  useEffect(() => {
    savePool(pool);
  }, [pool]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('giftpool-theme', theme);
  }, [theme]);

  const memberRows = useMemo(
    () => buildMembersView(pool.members, pool.targetAmount),
    [pool.members, pool.targetAmount],
  );

  const fairShare = useMemo(
    () => getFairShare(pool.targetAmount, pool.members.length),
    [pool.targetAmount, pool.members.length],
  );

  const settlements = useMemo(
    () => generateSettlementPlan(pool.members, pool.targetAmount),
    [pool.members, pool.targetAmount],
  );

  const addMember = (name) => {
    setPool((current) => ({
      ...current,
      members: [...current.members, makeMember(name)],
    }));
  };

  const removeMember = (memberId) => {
    setPool((current) => ({
      ...current,
      members: current.members.filter((member) => member.id !== memberId),
    }));
  };

  const updatePayment = (memberId, value) => {
    const normalized = Number(value);
    const safeValue = Number.isNaN(normalized) ? 0 : Math.max(0, normalized);

    setPool((current) => ({
      ...current,
      members: current.members.map((member) =>
        member.id === memberId ? { ...member, paid: safeValue } : member,
      ),
    }));
  };

  const resetPool = () => {
    clearPool();
    setPool(emptyPool);
  };

  const noMembers = pool.members.length === 0;
  const hasTarget = Number(pool.targetAmount) > 0;
  const targetReached = Boolean(hasTarget && pool.members.length > 0 && pool.members.reduce((sum, member) => sum + Number(member.paid || 0), 0) >= Number(pool.targetAmount));

  const handleDownloadReceipt = () => {
    if (noMembers) return;

    downloadReceipt({
      pool,
      memberRows,
      settlements,
      fairShare,
      totalCollected: getCollectedTotal(pool.members),
      remaining: getRemaining(pool.targetAmount, pool.members),
      targetReached,
    });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-bar">
          <div className="brand-copy">
            <p className="eyebrow">Contribution & settlement tracker</p>
            <h1>GiftPool</h1>
          </div>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <SunMedium size={18} />}
            <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>
        </div>
      </header>

      <main className="layout">
        <PoolSetup pool={pool} onPoolChange={setPool} onReset={resetPool} />

        <Dashboard
          pool={pool}
          members={pool.members}
          onDownloadReceipt={handleDownloadReceipt}
        />

        <section className="card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Members</p>
              <h2>Contributors</h2>
            </div>
          </div>
          <MemberForm onAddMember={addMember} members={pool.members} />
          <MemberList
            members={pool.members}
            onRemoveMember={removeMember}
            onUpdatePayment={updatePayment}
          />
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Fair share</p>
              <h2>Equal contribution</h2>
            </div>
          </div>

          {!noMembers && hasTarget ? (
            <div className="share-preview">
              <span>Fair share per person</span>
              <strong>{fairShare ? new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 2,
              }).format(fairShare) : '₹0.00'}</strong>
            </div>
          ) : (
            <div className="empty-state">Add members and set a valid target to view the fair share.</div>
          )}
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Balances</p>
              <h2>Member status</h2>
            </div>
          </div>
          <BalanceTable memberRows={memberRows} />
        </section>

        <section className="card">
          <div className="section-header">
            <div>
              <p className="eyebrow">Settlement</p>
              <h2>Settlement plan</h2>
            </div>
          </div>
          <div className="target-status">
            {targetReached ? (
              <span className="status-badge success">Target reached</span>
            ) : (
              <span className="status-badge neutral">Target not reached</span>
            )}
          </div>
          <SettlementList settlements={settlements} />
        </section>
      </main>
    </div>
  );
}

export default App;
