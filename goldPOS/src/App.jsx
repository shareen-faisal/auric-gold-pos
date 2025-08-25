import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Login from './components/Login';
import Home from './pages/Home';
import Form from './pages/Form';
import Customers from './pages/Customers';
import Retailers from './pages/Retailers';
import PrivateRoute from './components/PrivateRoute'; 
import LandingPage from './pages/LandingPage';
import PaymentPage from './pages/PaymentPage'
import Settings from './pages/Settings'
import Modal from 'react-modal';
Modal.setAppElement('#root');

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/"  element={<LandingPage/>} />
        <Route path="/login"  element={<Login/>} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/dashboard" element={
             <PrivateRoute>
                  <DashboardLayout />
             </PrivateRoute>
         }>
          <Route path="" element={<Home />} />
          <Route path="customers" element={<Customers />} />
            <Route path="retailers" element={<Retailers />} />
            <Route path="record" element={<Form />} />
            <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<div>404 - Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
