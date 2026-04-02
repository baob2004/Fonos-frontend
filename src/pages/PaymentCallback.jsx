import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function PaymentCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const confirmPayment = async () => {
            try {
                // Lấy toàn bộ tham số từ VNPay trên URL
                const params = Object.fromEntries(searchParams.entries());
                
                // Gửi về Backend để Backend thực hiện lưu Database
                const res = await api.get('/Payments/vnpay-return', { params });

                if (res.status === 200) {
                    alert("Thanh toán thành công! Sách đã được thêm vào tủ đồ.");
                    navigate('/my-library'); // Lưu xong mới cho về đây
                }
            } catch (error) {
                // alert("Lỗi xác thực thanh toán: " + (error.response?.data?.message || "Thất bại"));
                navigate('/');
            }
        };

        confirmPayment();
    }, []);

    return <div>Đang xác thực giao dịch, vui lòng không đóng trình duyệt...</div>;
}