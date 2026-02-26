import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Placeholder() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/hello')
      .then(res => {
        if (!res.ok)
          throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Backend unavailable'));
  }, []);

  return (
    <>
      <p>This is a placeholder page.</p>
      {message && <p>Message from the backend: "{message}" </p>}
      <p><Link to='/'>Go back to the home page</Link></p>
    </>
  );
}

export default Placeholder;
