import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchPage from './pages/SearchPage';
import BookDetail from './pages/BookDetail';
import ScrollToTop from './components/ScrollToTop'; // 1. Import Component cuộn
import { AuthProvider } from './contexts/AuthContext';
import MyLibrary from './pages/MyLibrary';
import PaymentCallback from './pages/PaymentCallback';
import EditProfile from './pages/EditProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
function App() {
  return (
    <AuthProvider>
      {/* 2. Đặt ScrollToTop ở đây để nó theo dõi mọi sự thay đổi Route */}
      <ScrollToTop /> 
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="book/:id" element={<BookDetail />} /> 
          <Route path="/my-library" element={<MyLibrary />} />
          <Route path="/payment-callback" element={<PaymentCallback />} />
          <Route path="/profile" element={<EditProfile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;