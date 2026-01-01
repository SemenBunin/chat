import { useState, useEffect } from 'react';
import Register from './components/Register';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('blizhe_username');
    if (user) {
      setUsername(user);
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return <Register onLogin={setUsername} />;
  }

  return (
    <div className="bg-bg min-h-screen">
      <h1 className="p-4 text-accent">Welcome, {username}!</h1>
      <p className="px-4">Chat UI coming soon...</p>
    </div>
  );
}

export default App;