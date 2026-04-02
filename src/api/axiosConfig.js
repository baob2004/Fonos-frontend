import axios from 'axios';

const api = axios.create({
    // BẢO CHÚ Ý: Đổi port 7000 thành port thực tế đang chạy trên Visual Studio của bạn
    baseURL: 'https://localhost:7232/api', 
    withCredentials: true, // Bắt buộc phải có để nhận Cookie (Refresh Token)
});

// Tự động đính kèm Token vào Header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;