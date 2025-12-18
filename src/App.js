import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer';
import SupportChatbot from './components/SupportChatbot';
import AuthPromptModal from './components/AuthPromptModal';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Projects from './pages/Projects';
import JournalServices from './pages/JournalServices';
import ProjectDetails from './pages/ProjectDetails';
import Checkout from './pages/Checkout';
import Cart from './pages/Cart';
import Orders from './pages/Dashboard';
import Admin from './pages/Admin';
import AdminAnalytics from './pages/AdminAnalytics';
import Workshops from './pages/Workshops';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import NotFound from './pages/NotFound';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
        <div className="min-h-screen bg-white">
          <Toaster position="top-right" />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/journals" element={<JournalServices />} />
            <Route path="/journal-services" element={<Navigate to="/journals" replace />} />
            <Route path="/journalservices" element={<Navigate to="/journals" replace />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/catalog" element={<Navigate to="/projects" replace />} />
            <Route path="/project/:id" element={<ProjectDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route
              path="/checkout"
              element={
                <RequireAuth>
                  <Checkout />
                </RequireAuth>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireAuth>
                  <Orders />
                </RequireAuth>
              }
            />
            <Route path="/dashboard" element={<Navigate to="/orders" replace />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <Admin />
                </RequireAuth>
              }
            />
            <Route path="/admin/dashboard" element={<AdminAnalytics />} />
            <Route path="/workshops" element={<Workshops />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SupportChatbot />
          <CartDrawer />
          <AuthPromptModal />
          <Footer />
        </div>
      </Router>
    </CartProvider>
    </AuthProvider>
  );
}

export default App;
