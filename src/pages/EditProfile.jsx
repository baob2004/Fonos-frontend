import { useState } from 'react';
import { Box, Container, TextField, Button, Typography, Paper, Avatar, Stack, Alert, Divider } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axiosConfig';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

export default function EditProfile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  
  // State để quản lý file và ảnh xem trước
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatarUrl || '');
  
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });

  // Base URL để hiển thị ảnh từ server (Nếu cần)
  const BASE_URL = 'https://localhost:7232';

  // Hàm xử lý khi chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Tạo đường dẫn tạm thời để hiển thị ngay lập tức lên Avatar
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    try {
      // BẮT BUỘC: Dùng FormData thay vì JSON khi gửi File
      const formData = new FormData();
      formData.append('fullName', fullName);
      if (selectedFile) {
        formData.append('avatarFile', selectedFile); // Phải khớp với tên tham số trong DTO Backend
      }

      await api.put('/User/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setStatus({ type: 'success', msg: 'Cập nhật thành công! Đang làm mới...' });

      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error("Lỗi thực tế:", err);
      setStatus({ type: 'error', msg: 'Lỗi cập nhật thông tin.' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      return setStatus({ type: 'error', msg: 'Mật khẩu mới không khớp.' });
    }
    try {
      await api.post('/User/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.next,
        confirmNewPassword: passwords.confirm
      });
      setStatus({ type: 'success', msg: 'Đổi mật khẩu thành công!' });
      setPasswords({ current: '', next: '', confirm: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Lỗi đổi mật khẩu.' });
    }
  };

  // Hàm xử lý đường dẫn ảnh hiển thị
  const getAvatarSrc = () => {
    if (!previewUrl) return '';
    // Nếu là blob (ảnh mới chọn) hoặc đã là link full http thì dùng luôn
    if (previewUrl.startsWith('blob:') || previewUrl.startsWith('http')) return previewUrl;
    // Nếu là đường dẫn tương đối từ DB (/images/...) thì nối thêm BaseUrl
    return `${BASE_URL}${previewUrl}`;
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <Typography variant="h5" fontWeight={800} gutterBottom color="primary.dark">
          Thiết lập tài khoản
        </Typography>
        
        {status.msg && <Alert severity={status.type} sx={{ mb: 3 }}>{status.msg}</Alert>}

        <Box component="form" onSubmit={handleUpdateInfo} sx={{ mb: 5 }}>
          <Stack spacing={3} alignItems="center">
            
            {/* Vùng chọn ảnh đại diện */}
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={getAvatarSrc()} 
                sx={{ width: 120, height: 120, border: '4px solid #f0f2f5', boxShadow: 2 }} 
              />
              <Button
                component="label"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                <PhotoCamera fontSize="small" />
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
            </Box>

            <TextField 
              label="Họ và tên" 
              fullWidth 
              variant="outlined"
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
            />

            <Button 
              type="submit" 
              variant="contained" 
              size="large" 
              fullWidth 
              sx={{ py: 1.5, fontWeight: 'bold' }}
            >
              Lưu thay đổi
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ my: 4 }}>Đổi mật khẩu</Divider>

        <Box component="form" onSubmit={handleChangePassword}>
          <Stack spacing={2.5}>
            <TextField label="Mật khẩu hiện tại" type="password" fullWidth value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
            <TextField label="Mật khẩu mới" type="password" fullWidth value={passwords.next} onChange={(e) => setPasswords({...passwords, next: e.target.value})} />
            <TextField label="Xác nhận mật khẩu mới" type="password" fullWidth value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
            <Button type="submit" variant="outlined" color="primary" fullWidth sx={{ py: 1.2 }}>
              Cập nhật mật khẩu
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}