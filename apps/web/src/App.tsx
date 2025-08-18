import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Home } from './routes/Home';
import { BrewGuide } from './routes/BrewGuide';
import { ReverseBrew } from './routes/ReverseBrew';
import { Logbook } from './routes/Logbook';
import { SessionDetail } from './routes/SessionDetail';
import { Settings } from './routes/Settings';
import { Login } from './routes/Auth/Login';
import { Register } from './routes/Auth/Register';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            {/* Auth routes without navbar - redirect if already authenticated */}
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <Register />
                </ProtectedRoute>
              } 
            />
            
            {/* Main app routes with navbar */}
            <Route path="/*" element={
              <>
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    
                    {/* Protected routes - require authentication */}
                    <Route 
                      path="/brew" 
                      element={
                        <ProtectedRoute>
                          <BrewGuide />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/reverse" 
                      element={
                        <ProtectedRoute>
                          <ReverseBrew />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/logbook" 
                      element={
                        <ProtectedRoute>
                          <Logbook />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/logbook/:id" 
                      element={
                        <ProtectedRoute>
                          <SessionDetail />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
              </>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;