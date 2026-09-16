import { formatMoneyInputValue, parseMoneyInput } from '../utils/calculations';

const MoneyInput = ({ label, value, onChange, placeholder }) => {
  const handleChange = (event) => {
    const nextValue = parseMoneyInput(event.target.value);
    onChange(nextValue);
  };

  const displayValue = value > 0 ? formatMoneyInputValue(value) : '';

  return (
    <label className="field money-field">
      <span>{label}</span>
      <div className="money-input-shell">
        <span className="money-prefix">₹</span>
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label={label}
        />
      </div>
    </label>
  );
};

export default MoneyInput;
