// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      {/* The root path ("/") goes to App component, which internally handles login vs. tracker. */}
      <Route path="/*" element={<App />} />
      {/* Any unknown path redirects to "/" */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);
