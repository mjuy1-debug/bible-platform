import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import Home from './pages/Home';
import Read from './pages/Read';
import Devotion from './pages/Devotion';
import AiAssistant from './pages/AiAssistant';
import Plan from './pages/Plan';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider, UserContext } from './context/UserContext';
import { useContext } from 'react';

const AppInner = () => {
  const { toast } = useContext(UserContext);
  return (
    <>
      <Navbar />
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'calc(var(--navbar-height) + 1.5rem) 1.5rem calc(var(--bottomnav-height) + 2rem)',
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/read" element={<Read />} />
          <Route path="/devotion" element={<Devotion />} />
          <Route path="/ai" element={<AiAssistant />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <BottomNav />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <AppInner />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
