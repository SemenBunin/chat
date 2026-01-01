import { useState } from 'react';
import { initSodium, generateKeyPair } from '../crypto/e2ee.js';

export default function Register({ onLogin }) {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await initSodium();
    const keys = generateKeyPair();

    // Сохраняем приватный ключ в localStorage
    localStorage.setItem('blizhe_private_key', keys.privateKey);
    localStorage.setItem('blizhe_username', username);
    localStorage.setItem('blizhe_display_name', displayName);

    // Отправляем на сервер
    const res = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, displayName, publicKey: keys.publicKey })
    });

    if (res.ok) {
      onLogin(username);
    } else {
      alert('Username taken or error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <form onSubmit={handleSubmit} className="bg-panel p-6 rounded-lg w-80">
        <h2 className="text-xl mb-4 text-accent">Blizhe</h2>
        <input
          type="text"
          placeholder="Username (unique)"
          className="w-full p-2 mb-3 bg-bg border border-gray-700 rounded"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Display name"
          className="w-full p-2 mb-4 bg-bg border border-gray-700 rounded"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-accent text-black py-2 rounded font-medium"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Enter Blizhe'}
        </button>
        <p className="text-xs mt-4 text-gray-400">
          Your messages are end-to-end encrypted. Keys stored only on this device.
        </p>
      </form>
    </div>
  );
}