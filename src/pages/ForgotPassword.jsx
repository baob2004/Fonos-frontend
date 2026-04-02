import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Alert, 
  Container,
  InputAdornment,
  IconButton
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      // Gửi email dưới dạng chuỗi (Plain Text) hoặc Object tùy Backend bạn nhận
      await api.post('/User/forgot-password', JSON.stringify(email), {
        headers: { 'Content-Type': 'application/json' }
      });
      
      setStatus({ 
        type: 'success', 
        msg: 'Một liên kết khôi phục đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (cả hòm thư rác).' 
      });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        msg: err.response?.data?.message || 'Không tìm thấy tài khoản với email này hoặc có lỗi xảy ra.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        px: 2,
      }}
    >
      <Paper 
        elevation={10}
        sx={{
          p: { xs: 3, md: 5 },
          width: '100%',
          maxWidth: 420,
          borderRadius: 4,
          bgcolor: 'background.paper',
          position: 'relative'
        }}
      >
        {/* Nút quay lại trang Login */}
        <IconButton 
          component={RouterLink} 
          to="/login"
          sx={{ position: 'absolute', top: 16, left: 16 }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Box sx={{ textAlign: 'center', mb: 4, mt: 2 }}>
          <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
            Quên mật khẩu?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nhập email đã đăng ký. Chúng tôi sẽ gửi một liên kết để bạn đặt lại mật khẩu mới.
          </Typography>
        </Box>

        {status.msg && (
          <Alert severity={status.type} sx={{ mb: 3, borderRadius: 2 }}>
            {status.msg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Địa chỉ Email"
            margin="normal"
            variant="outlined"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            disabled={loading || status.type === 'success'}
          />

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large"
            disabled={loading || status.type === 'success'}
            sx={{ 
              py: 1.5, 
              mt: 2,
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu khôi phục'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Bạn nhớ ra mật khẩu rồi?{' '}
              <Typography
                component={RouterLink}
                to="/login"
                variant="body2"
                fontWeight="bold"
                sx={{ color: 'primary.main', textDecoration: 'none', cursor: 'pointer' }}
              >
                Đăng nhập ngay
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}