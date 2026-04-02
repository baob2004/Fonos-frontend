import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- CƠ CHẾ KHÔI PHỤC ĐĂNG NHẬP ---
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/User/me');
                    setUser({ ...response.data });
                } catch (error) {
                    console.error("Token hết hạn hoặc lỗi:", error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        }
        checkLoggedIn();
    }, []);

    // --- HÀM ĐĂNG KÝ (ĐÃ ĐƯỢC THÊM VÀ SỬA) ---
    const signUp = async (email, password, fullName, username) => {
        try {
            // Backend của bạn nhận object: { email, password, fullName, username }
            const response = await api.post('/User/register', { 
                email, 
                password, 
                fullName, 
                username 
            });

            // Backend trả về string: "User Registered..." hoặc "Email ... is already registered."
            const message = response.data;

            if (message.includes("Registered")) {
                return { success: true, message: message };
            } else {
                // Email đã tồn tại (Trả về 200 nhưng nội dung là thông báo lỗi)
                return { success: false, message: message };
            }
        } catch (error) {
            // Lỗi từ phía server (400, 500...)
            return { 
                success: false, 
                message: error.response?.data || "Lỗi hệ thống khi đăng ký!" 
            };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/User/login', { email, password }); 
            if (response.data.isAuthenticated) {
                localStorage.setItem('token', response.data.token);
                const meResponse = await api.get('/User/me');
                setUser({
                    ...response.data,
                    fullName: meResponse.data.fullName,
                    avatarUrl: meResponse.data.avatarUrl
                });
                navigate('/');
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: "Lỗi đăng nhập!" };
        }
    };

const logout = () => {
    localStorage.clear();
    setUser(null);
    // Ép trình duyệt tải lại trang để xóa sạch mọi biến Global/State còn sót lại
    window.location.href = '/login'; 
};

    return (
        // QUAN TRỌNG: Phải thêm signUp vào đây
        <AuthContext.Provider value={{ user, login, logout, signUp, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);