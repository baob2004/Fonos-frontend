import { useState } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Container, TextField, Button, Typography, Paper, Stack, Alert, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../api/axiosConfig';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  // Lấy dữ liệu từ URL: ?token=...&email=...
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setStatus({ type: 'error', msg: 'Mật khẩu xác nhận không khớp.' });
    }

    setLoading(true);
    try {
      await api.post('/User/reset-password', {
        email,
        token,
        newPassword: password
      });
      setStatus({ type: 'success', msg: 'Đặt lại mật khẩu thành công! Đang chuyển hướng...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Link đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.' });
    } finally {
      setLoading(false);
    }
  };

  // Nếu thiếu token hoặc email trên URL, báo lỗi luôn để tránh trắng trang
  if (!token || !email) {
    return (
      <Container maxWidth="xs" sx={{ py: 10 }}>
        <Alert severity="warning">Liên kết không hợp lệ. Vui lòng kiểm tra lại email.</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', px: 2 }}>
      <Paper sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 4, position: 'relative' }}>
        <IconButton component={RouterLink} to="/login" sx={{ position: 'absolute', top: 16, left: 16 }}>
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h5" fontWeight={800} textAlign="center" sx={{ mb: 1, mt: 2 }}>Thiết lập mật khẩu</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>Nhập mật khẩu mới cho tài khoản {email}</Typography>
        
        {status.msg && <Alert severity={status.type} sx={{ mb: 3 }}>{status.msg}</Alert>}
        
        <Box component="form" onSubmit={handleReset}>
          <Stack spacing={2}>
            <TextField label="Mật khẩu mới" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            <TextField label="Xác nhận mật khẩu" type="password" fullWidth required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
            <Button type="submit" variant="contained" fullWidth size="large" disabled={loading} sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}