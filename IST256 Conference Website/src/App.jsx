// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Import Pages
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import EventsPage from './pages/EventsPage';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import AdminApproval from './pages/AdminApproval';

// Import Global State
import { EventProvider } from './context/EventContext';

// Import Styles
import './index.css'; 

function App() {
  return (
    <EventProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          
          {/* The Routes handle which component shows up based on the URL */}
          <main className="content-area">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/admin" element={<AdminApproval />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </EventProvider>
  );
}

export default App;