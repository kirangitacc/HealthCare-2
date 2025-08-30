import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login/index.js';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
import Register from './components/Register';
import './App.css';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="*" element={<h1>Page Not Found</h1>} />
    </Routes>
  );
};

export default App;

