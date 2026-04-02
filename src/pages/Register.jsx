import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  Box, Button, TextField, Typography, Paper, 
  Alert, Link, Divider, InputAdornment, 
  Stack, IconButton // Thêm Stack và IconButton vào đây
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  AccountCircle as AccountCircleIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Schema validate với yêu cầu mật khẩu mạnh
const schema = yup.object({
  fullName: yup.string().required('Họ tên không được để trống'),
  username: yup.string().required('Tên đăng nhập không được để trống'),
  email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải ít nhất 6 ký tự')
    .matches(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .matches(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Mật khẩu xác nhận không khớp')
    .required('Vui lòng xác nhận mật khẩu'),
}).required();

export default function Register() {
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  // Lấy toàn bộ auth object để tránh trùng tên với register của useForm
  const auth = useAuth(); 

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setErrorMsg("");
    setSuccessMsg("");

    // Kiểm tra kỹ hàm signUp từ Context
    if (!auth || typeof auth.signUp !== 'function') {
        setErrorMsg("Lỗi hệ thống: Không tìm thấy hàm đăng ký trong AuthContext.");
        return;
    }

    const result = await auth.signUp(
      data.email, 
      data.password, 
      data.fullName, 
      data.username
    );

    if (result.success) {
      // Vì Backend trả về chuỗi "User Registered...", ta hiển thị thông báo thành công
      setSuccessMsg(result.message || "Đăng ký tài khoản thành công!");
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', px: 2, py: 4
    }}>
      <Paper elevation={10} sx={{
        p: { xs: 3, md: 5 }, width: '100%', maxWidth: 450, borderRadius: 4,
        bgcolor: 'rgba(255, 255, 255, 0.94)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
      }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" color="primary.main">Bookas</Typography>
          <Typography variant="body2" color="text.secondary">Tạo tài khoản để trải nghiệm ngay</Typography>
        </Box>

        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={1.5}>
            <TextField 
                fullWidth label="Họ và tên"
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment> }}
                {...register('fullName')} error={!!errors.fullName} helperText={errors.fullName?.message} 
            />

            <TextField 
                fullWidth label="Tên đăng nhập"
                InputProps={{ startAdornment: <InputAdornment position="start"><AccountCircleIcon color="action" /></InputAdornment> }}
                {...register('username')} error={!!errors.username} helperText={errors.username?.message} 
            />

            <TextField 
                fullWidth label="Email"
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment> }}
                {...register('email')} error={!!errors.email} helperText={errors.email?.message} 
            />

            <TextField 
                fullWidth label="Mật khẩu" 
                type={showPassword ? 'text' : 'password'}
                InputProps={{ 
                    startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    )
                }}
                {...register('password')} error={!!errors.password} helperText={errors.password?.message} 
            />

            <TextField 
                fullWidth label="Xác nhận mật khẩu" type="password"
                InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment> }}
                {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} 
            />

            <Button 
                type="submit" fullWidth variant="contained" size="large" 
                disabled={isSubmitting}
                sx={{ mt: 2, py: 1.5, fontWeight: 'bold', borderRadius: 2, textTransform: 'none', fontSize: '1.1rem' }}
            >
                {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }}>Hoặc</Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Đã có tài khoản?{' '}
              <Link component={RouterLink} to="/login" fontWeight="bold" underline="hover">
                Đăng nhập ngay
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}