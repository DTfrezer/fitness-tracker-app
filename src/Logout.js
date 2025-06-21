// Logout.js
import React from 'react';
import { Button } from 'react-bootstrap';
import { auth } from './firebase'; // Firebase config
import { signOut } from 'firebase/auth';

function Logout() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("User Logged Out!");
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div>
      <Button variant="danger" onClick={handleLogout}>
        Log Out
      </Button>
    </div>
  );
}

export default Logout;
