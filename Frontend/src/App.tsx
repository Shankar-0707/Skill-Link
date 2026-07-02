import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/routes/AppRoutes';
import { AuthProvider } from './app/context/AuthContext';
import { SocketConnectionManager } from './services/socket/SocketConnectionManager';
import { RateLimitBanner } from './components/RateLimitBanner';

function App() {
  return (
    <AuthProvider>
      <SocketConnectionManager />
      <RateLimitBanner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
