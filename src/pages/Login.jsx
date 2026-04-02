import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Alert, 
  Link, 
  Divider,
  InputAdornment
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom'; // Giả sử bạn dùng react-router

// Schema validate (giữ nguyên)
const schema = yup.object({
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  password: yup.string().min(6, 'Mật khẩu ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu'),
}).required();

export default function Login() {
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setErrorMsg("");
    const result = await login(data.email, data.password);
    
    if (!result.success) {
      setErrorMsg(result.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // gradient đẹp
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
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 24,
          },
        }}
      >
        {/* Header / Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            color="primary.main"
            gutterBottom
          >
            Bookas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Đăng nhập để tiếp tục hành trình đọc sách
          </Typography>
        </Box>

        {/* Thông báo lỗi */}
        {errorMsg && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isSubmitting}
          />

          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            margin="normal"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
            }}
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isSubmitting}
          />

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mt: 1, 
              mb: 3 
            }}
          >
<Box 
  sx={{ 
    display: 'flex', 
    justifyContent: 'flex-end', // Đẩy sang phải cho đẹp cân đối
    alignItems: 'center', 
    mt: 1, 
    mb: 3 
  }}
>
  <Link 
    component={RouterLink}
    to="/forgot-password" // Link đến trang nhập email để lấy lại pass
    variant="body2" 
    underline="hover"
    sx={{ 
      color: 'primary.main', // Đổi màu xanh cho nổi bật
      fontWeight: 500 
    }}
  >
    Quên mật khẩu?
  </Link>
</Box>
          </Box>

          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            size="large"
            disabled={isSubmitting}
            sx={{ 
              py: 1.5, 
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              mb: 3
            }}
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          <Divider sx={{ my: 2 }}>hoặc</Divider>

          {/* Liên kết đến Register */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có tài khoản?{' '}
              <Link
                component={RouterLink}
                to="/register"  // ← thay đổi route nếu khác
                variant="body2"
                fontWeight="medium"
                underline="hover"
                color="primary.main"
              >
                Đăng ký ngay
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}