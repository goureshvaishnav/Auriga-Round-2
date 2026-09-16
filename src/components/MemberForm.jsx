import { useState } from 'react';
import { UserPlus } from 'lucide-react';

const MemberForm = ({ onAddMember, members }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalized = name.trim();

    if (!normalized) {
      setError('Please enter a member name.');
      return;
    }

    const duplicate = members.some(
      (member) => member.name.trim().toLowerCase() === normalized.toLowerCase(),
    );

    if (duplicate) {
      setError('A member with this name already exists.');
      return;
    }

    onAddMember(normalized);
    setName('');
    setError('');
  };

  return (
    <form className="member-form" onSubmit={handleSubmit}>
      <label className="field form-field">
        <span>Add member</span>
        <input
          type="text"
          placeholder="Enter member name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <button type="submit" className="primary with-icon">
        <UserPlus size={16} />
        <span>Add member</span>
      </button>
      {error ? <p className="error-text">{error}</p> : null}
    </form>
  );
};

export default MemberForm;
