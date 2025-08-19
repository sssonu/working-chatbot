import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/AuthPage';
import ChatPage from './components/ChatPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;