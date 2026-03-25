import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './app/routes/AppRoutes';
import { AuthProvider } from './app/context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
