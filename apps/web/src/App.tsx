import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './routes/Home';
import { BrewGuide } from './routes/BrewGuide';
import { ReverseBrew } from './routes/ReverseBrew';
import { Logbook } from './routes/Logbook';
import { Settings } from './routes/Settings';
import { Login } from './routes/Auth/Login';
import { Register } from './routes/Auth/Register';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          {/* Auth routes without navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main app routes with navbar */}
          <Route path="/*" element={
            <>
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/brew" element={<BrewGuide />} />
                  <Route path="/reverse" element={<ReverseBrew />} />
                  <Route path="/logbook" element={<Logbook />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;