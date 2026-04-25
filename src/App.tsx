import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import LibraryView from './pages/LibraryView';
import AdminView from './pages/AdminView';
import KantinView from './pages/KantinView';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/library" element={<LibraryView />} />
      <Route path="/admin" element={<AdminView />} />
      <Route path="/kantin" element={<KantinView />} />
    </Routes>
  );
}
