import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/routes/AppRoutes';
import { AuthProvider } from './app/context/AuthContext';
import { SocketConnectionManager } from './services/socket/SocketConnectionManager';

function App() {
  return (
    <AuthProvider>
      <SocketConnectionManager />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
