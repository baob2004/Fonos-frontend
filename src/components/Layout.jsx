import { Outlet, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Menu,
  MenuItem,
  CircularProgress,
  Avatar,
  Stack,
  Divider,
} from '@mui/material';
import AudiobookIcon from '@mui/icons-material/Audiotrack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import MiniPlayer from './MiniPlayer';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
export default function Layout() {
  const { user, logout, setUser } = useAuth();
const BASE_URL = 'https://localhost:7232';
const [activeAudio, setActiveAudio] = useState({
  book: null,
  chapter: null,
  chapters: [],
  isPlaying: false,
});

const playAudio = (book, chapter, chapters = []) => {
  setActiveAudio((prev) => ({
    ...prev,
    book,
    chapter,
    chapters,
  }));
};



  const setGlobalIsPlaying = (status) => {
    setActiveAudio((prev) => ({ ...prev, isPlaying: status }));
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/Categories', {
          params: { PageNumber: 1, PageSize: 100 },
        });
        const rawData = response.data.data || response.data || [];
        setCategories(Array.isArray(rawData) ? rawData : []);
      } catch (error) {
        console.error('Lỗi fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (token && !user?.fullName) {
        try {
          const res = await api.get('/User/me');
          setUser((prev) => ({
            ...prev,
            fullName: res.data.fullName,
            avatarUrl: res.data.avatarUrl || null,
          }));
        } catch (err) {
          console.error('Lỗi fetch profile:', err);
        }
      }
    };

    fetchUserInfo();
  }, [user?.fullName, setUser]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'background.default',
        pb: activeAudio.chapter ? '110px' : 0,
      }}
    >
      {/* HEADER */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          color: 'white',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: 76,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* Logo */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                color: 'inherit',
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
                  flexShrink: 0,
                }}
              >
                <AudiobookIcon sx={{ fontSize: 24, color: 'white' }} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: 0.5,
                  }}
                >
                  Fonos
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    opacity: 0.72,
                    letterSpacing: 0.2,
                  }}
                >
                  Kho sách nói chất lượng cao
                </Typography>
              </Box>
            </Box>

            {/* Menu giữa */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                bgcolor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 999,
                px: 1,
                py: 0.75,
              }}
            >
              <Button
                color="inherit"
                component={Link}
                to="/"
                sx={{
                  px: 2,
                  borderRadius: 999,
                  textTransform: 'none',
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Trang chủ
              </Button>

              <Button
                color="inherit"
                onClick={handleClick}
                endIcon={<ExpandMoreIcon />}
                sx={{
                  px: 2,
                  borderRadius: 999,
                  textTransform: 'none',
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Thể loại
              </Button>
{user && (
  <Button
    color="inherit"
    component={Link}
    to="/my-library"
    startIcon={<LibraryBooksIcon />}
    sx={{
      px: 2,
      borderRadius: 999,
      textTransform: 'none',
      fontSize: '0.98rem',
      fontWeight: 600,
      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
    }}
  >
    Tủ sách
  </Button>
)}
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 220,
                    borderRadius: 3,
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                  },
                }}
              >
                {loadingCategories ? (
                  <MenuItem disabled>
                    <CircularProgress size={18} sx={{ mr: 1.5 }} />
                    Đang tải...
                  </MenuItem>
                ) : (
                  categories.map((cat) => (
                    <MenuItem
                      key={cat.id}
                      onClick={handleClose}
                      component={Link}
                      to={`/search?query=${encodeURIComponent(cat.name)}`}
                      sx={{
                        py: 1.25,
                        fontSize: '0.95rem',
                      }}
                    >
                      {cat.name}
                    </MenuItem>
                  ))
                )}
              </Menu>

              <Button
                color="inherit"
                component={Link}
                to="/search"
                sx={{
                  px: 2,
                  borderRadius: 999,
                  textTransform: 'none',
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Mới nhất
              </Button>
            </Stack>

            {/* User area */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
              {user ? (
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{
                    px: 1.2,
                    py: 0.8,
                    borderRadius: 999,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
<Box 
      component={Link} 
      to="/profile" 
      sx={{ 
        display: 'flex', 
        cursor: 'pointer',
        transition: '0.2s',
        '&:hover': { opacity: 0.8, transform: 'scale(1.05)' } 
      }}
    >
<Avatar
        // SỬA TẠI ĐÂY: Nếu là đường dẫn tương đối thì nối thêm BASE_URL
        src={user.avatarUrl?.startsWith('http') ? user.avatarUrl : `${BASE_URL}${user.avatarUrl}`}
        sx={{
          width: 38,
          height: 38,
          border: '2px solid rgba(255,255,255,0.9)',
        }}
      >
        {/* Nếu không có ảnh thì hiện chữ cái đầu của tên */}
        {user.fullName?.charAt(0).toUpperCase()}
      </Avatar>
    </Box>
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    <Typography sx={{ fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.2 }}>
                      {user.fullName}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', opacity: 0.7 }}>
                      Thành viên Fonos
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={logout}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.25)',
                      textTransform: 'none',
                      borderRadius: 999,
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.5)',
                        bgcolor: 'rgba(255,255,255,0.06)',
                      },
                    }}
                  >
                    Đăng xuất
                  </Button>
                </Stack>
              ) : (
                <Button
                  variant="contained"
                  component={Link}
                  to="/login"
                  sx={{
                    textTransform: 'none',
                    borderRadius: 999,
                    px: 2.5,
                    py: 1,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
                    color: '#1e3a8a',
                    boxShadow: '0 10px 24px rgba(255,255,255,0.18)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)',
                    },
                  }}
                >
                  Đăng nhập
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* MAIN CONTENT */}
      {/* Bỏ Container ở đây để tránh bọc 2 lớp khiến SearchPage/Home bị lệch layout */}
      <Box component="main" sx={{ flex: 1, width: '100%' }}>
        <Outlet
          context={{
            playAudio,
            playingId: activeAudio.chapter?.id,
            isGlobalPlaying: activeAudio.isPlaying,
          }}
        />
      </Box>

      {/* MINI PLAYER */}
<MiniPlayer
  currentBook={activeAudio.book}
  currentChapter={activeAudio.chapter}
  chapters={activeAudio.chapters}
  onSelectChapter={playAudio}
  onPlayingChange={setGlobalIsPlaying}
  onClear={() =>
    setActiveAudio({
      book: null,
      chapter: null,
      chapters: [],
      isPlaying: false,
    })
  }
/>



      {/* FOOTER */}
      <Box
        component="footer"
        sx={{
          bgcolor: '#0f172a',
          color: 'white',
          mt: 'auto',
          pt: 6,
          pb: 4,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Container maxWidth="xl">
          {/* Top CTA */}
          <Box
            sx={{
              mb: 5,
              p: { xs: 3, md: 4 },
              borderRadius: 4,
              background:
                'linear-gradient(135deg, rgba(59,130,246,0.16) 0%, rgba(6,182,212,0.12) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={3}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Box>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  Khám phá hàng ngàn đầu sách nói chất lượng cao
                </Typography>
                <Typography sx={{ opacity: 0.75, maxWidth: 720 }}>
                  Nghe sách mọi lúc, mọi nơi. Tìm kiếm theo thể loại, tác giả và theo dõi những đầu sách mới được cập nhật liên tục.
                </Typography>
              </Box>

              <Button
                component={Link}
                to="/search"
                variant="contained"
                sx={{
                  textTransform: 'none',
                  borderRadius: 999,
                  px: 3,
                  py: 1.2,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  boxShadow: '0 12px 28px rgba(59,130,246,0.35)',
                }}
              >
                Khám phá tất cả sách
              </Button>
            </Stack>
          </Box>

          {/* Footer columns */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: '1.5fr 1fr 1fr 1fr',
              },
              gap: 4,
            }}
          >
            {/* Cột 1 */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  }}
                >
                  <AudiobookIcon sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" fontWeight={800}>
                  Fonos
                </Typography>
              </Box>

              <Typography sx={{ opacity: 0.72, lineHeight: 1.8, mb: 2 }}>
                Nền tảng nghe sách nói hiện đại, giúp bạn tiếp cận tri thức dễ dàng hơn qua kho nội dung đa dạng và trải nghiệm nghe tiện lợi.
              </Typography>

              <Typography sx={{ opacity: 0.55, fontSize: '0.92rem' }}>
                Nghe chương mẫu, tìm sách theo chủ đề và theo dõi những cập nhật mới nhất mỗi ngày.
              </Typography>
            </Box>

            {/* Cột 2 */}
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Điều hướng
              </Typography>

              <Stack spacing={1.2}>
                <Typography
                  component={Link}
                  to="/"
                  sx={{
                    color: 'rgba(255,255,255,0.72)',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Trang chủ
                </Typography>

                <Typography
                  component={Link}
                  to="/search"
                  sx={{
                    color: 'rgba(255,255,255,0.72)',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Tìm kiếm sách
                </Typography>

                <Typography
                  component={Link}
                  to="/search"
                  sx={{
                    color: 'rgba(255,255,255,0.72)',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Sách mới cập nhật
                </Typography>
              </Stack>
            </Box>

            {/* Cột 3 */}
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Thể loại nổi bật
              </Typography>

              <Stack spacing={1.2}>
                {categories.slice(0, 5).map((cat) => (
                  <Typography
                    key={cat.id}
                    component={Link}
                    to={`/search?query=${encodeURIComponent(cat.name)}`}
                    sx={{
                      color: 'rgba(255,255,255,0.72)',
                      textDecoration: 'none',
                      '&:hover': { color: 'white' },
                    }}
                  >
                    {cat.name}
                  </Typography>
                ))}

                {!loadingCategories && categories.length === 0 && (
                  <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    Chưa có dữ liệu thể loại
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Cột 4 */}
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Tài khoản
              </Typography>

              <Stack spacing={1.2}>
                {user ? (
                  <>
                    <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                      Đã đăng nhập với tài khoản
                    </Typography>
                    <Typography sx={{ color: 'white', fontWeight: 600 }}>
                      {user.fullName}
                    </Typography>
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={logout}
                      sx={{
                        mt: 1,
                        alignSelf: 'flex-start',
                        borderColor: 'rgba(255,255,255,0.24)',
                        textTransform: 'none',
                        borderRadius: 999,
                      }}
                    >
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                      Đăng nhập để đồng bộ trải nghiệm nghe sách của bạn.
                    </Typography>
                    <Button
                      component={Link}
                      to="/login"
                      variant="contained"
                      sx={{
                        mt: 1,
                        alignSelf: 'flex-start',
                        textTransform: 'none',
                        borderRadius: 999,
                        px: 2.5,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                      }}
                    >
                      Đăng nhập ngay
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.08)' }} />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © {new Date().getFullYear()} Fonos - Dự án Bookas. All rights reserved.
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Thiết kế tối ưu cho trải nghiệm đọc và nghe sách hiện đại.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
