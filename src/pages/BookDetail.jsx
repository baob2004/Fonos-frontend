import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  Box,
  Typography,
  Grid,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Skeleton,
  IconButton,
  Stack,
  Snackbar,
  Alert,
  Collapse
} from '@mui/material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useOutletContext } from 'react-router-dom';

const BASE_URL = 'https://localhost:7232';
const DEFAULT_COVER =
  'https://www.jdandj.com/uploads/8/0/0/8/80083458/book-cover-designs-for-inspirational-books-webp.webp';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const [notif, setNotif] = useState({ open: false, message: '', severity: 'success' });
  const [showFullDesc, setShowFullDesc] = useState(false);

  const { playAudio, playingId, isGlobalPlaying } = useOutletContext();

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const [bookRes, chapterRes, ownershipRes] = await Promise.all([
          api.get(`/Books/${id}`),
          api.get(`/Books/${id}/chapters`),
          api.get(`/Books/${id}/ownership`).catch(() => ({ data: false }))
        ]);
        setBook(bookRes.data);
        setChapters(chapterRes.data || []);
        setIsOwned(ownershipRes.data);
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookData();
  }, [id]);

  const handlePurchase = async () => {
    if (!book) return;
    setIsProcessing(true);
    try {
      const res = await api.post('/Payments/create-vnpay-url', `"${id}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.data && res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Lỗi kết nối cổng thanh toán.';
      setNotif({ open: true, message: msg, severity: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNghe = (chapter) => {
    if (!chapter.audioUrl) {
      setNotif({
        open: true,
        message: 'Bạn phải sở hữu cuốn sách để có thể nghe chương này',
        severity: 'warning'
      });
      return;
    }
    playAudio(book, chapter, chapters);
  };

  const totalDurationMin =
    book?.totalDurationMin ||
    chapters.reduce((sum, ch) => sum + Math.floor(ch.durationInSeconds / 60), 0);

  /* ============ LOADING ============ */
  if (loading) {
    return (
      <Box sx={{ py: 4, maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={450} sx={{ borderRadius: 3, mb: 4 }} />
        <Skeleton width="60%" height={60} />
      </Box>
    );
  }

  if (!book)
    return (
      <Typography align="center" sx={{ mt: 10, color: '#333' }}>
        Không tìm thấy sách.
      </Typography>
    );

  /* ============ DESCRIPTION dài hay không ============ */
  const isLongDesc = book.description && book.description.length > 200;

  return (
    <Box sx={{ py: 4, maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 0 } }}>
      <IconButton onClick={() => navigate('/')} sx={{ mb: 2, color: '#1565c0' }}>
        <ArrowBackIcon fontSize="large" />
      </IconButton>

      {/* ==================== THÔNG TIN SÁCH ==================== */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 3,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          bgcolor: '#fff'
        }}
      >
        {/* 
          QUAN TRỌNG: dùng display flex thay vì Grid MUI
          để kiểm soát overflow tốt hơn 
        */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 5 },
            alignItems: 'flex-start'
          }}
        >
          {/* ---------- CỘT TRÁI: ẢNH BÌA ---------- */}
          <Box
            sx={{
              width: { xs: '100%', md: '40%' },
              maxWidth: 400,
              flexShrink: 0,
              mx: { xs: 'auto', md: 0 }
            }}
          >
            <Box
              sx={{
                width: '100%',
                aspectRatio: '3 / 4',
                borderRadius: 3,
                bgcolor: '#f0f2f5',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
              }}
            >
              <Box
                component="img"
                src={book.coverImageUrl ? `${BASE_URL}${book.coverImageUrl}` : DEFAULT_COVER}
                alt={book.title}
                onError={(e) => {
                  e.target.src = DEFAULT_COVER;
                }}
                sx={{
                  width: '78%',
                  height: '88%',
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  display: 'block'
                }}
              />
            </Box>
          </Box>

          {/* ---------- CỘT PHẢI: THÔNG TIN ---------- */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,          // ★ CHỐNG TRÀN trong flex
              overflow: 'hidden'    // ★ BACKUP chống tràn
            }}
          >
            {/* Tên sách */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1a237e',
                mb: 1,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere'
              }}
            >
              {book.title}
            </Typography>

            {/* Tác giả */}
            <Typography variant="subtitle1" sx={{ color: '#666', mb: 2, fontSize: '1.1rem' }}>
              Tác giả:{' '}
              <Box
                component="span"
                onClick={() => navigate(`/search?query=${encodeURIComponent(book.authorName)}`)}
                sx={{
                  color: '#1565c0',
                  cursor: 'pointer',
                  fontWeight: 700,
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {book.authorName}
              </Box>
            </Typography>

            {/* Thể loại */}
            <Chip
              label={book.categoryName || 'Sách nói'}
              variant="outlined"
              sx={{
                mb: 2.5,
                cursor: 'pointer',
                borderColor: '#1565c0',
                color: '#1565c0',
                fontWeight: 600
              }}
              onClick={() => navigate(`/search?query=${encodeURIComponent(book.categoryName)}`)}
            />

            {/* Thời lượng + Số chương */}
            <Stack direction="row" spacing={4} sx={{ mb: 2.5 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem' }}>
                  Thời lượng
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                  {totalDurationMin} phút
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem' }}>
                  Số chương
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#333' }}>
                  {chapters.length}
                </Typography>
              </Box>
            </Stack>

            {/* Giá */}
            <Typography variant="h4" sx={{ color: '#1565c0', fontWeight: 800, mb: 2.5 }}>
              {book.price === 0 ? 'Miễn phí' : `${book.price.toLocaleString('vi-VN')} ₫`}
            </Typography>

            {/* ===== MÔ TẢ — SỬA TRIỆT ĐỂ ===== */}
            <Box
              sx={{
                mb: 3,
                minWidth: 0,
                p: 2,
                bgcolor: '#f8f9fa',
                borderRadius: 2,
                border: '1px solid #e9ecef'
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: '#999', mb: 1, fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}
              >
                Mô tả
              </Typography>

              <Collapse in={showFullDesc} collapsedSize={80}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#444',
                    lineHeight: 1.9,
                    fontSize: '0.95rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'anywhere'
                  }}
                >
                  {book.description || 'Chưa có mô tả cho cuốn sách này.'}
                </Typography>
              </Collapse>

              {isLongDesc && (
                <Button
                  size="small"
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  endIcon={showFullDesc ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  sx={{
                    mt: 1,
                    px: 0,
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#1565c0',
                    fontSize: '0.85rem'
                  }}
                >
                  {showFullDesc ? 'Thu gọn' : 'Xem thêm'}
                </Button>
              )}
            </Box>

            {/* Nút hành động */}
            {isOwned ? (
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<HeadphonesIcon />}
                onClick={() => chapters.length > 0 && handleNghe(chapters[0])}
                sx={{
                  py: 1.8,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  bgcolor: '#2e7d32',
                  '&:hover': { bgcolor: '#1b5e20' }
                }}
              >
                NGHE NGAY
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<ShoppingCartIcon />}
                onClick={handlePurchase}
                disabled={isProcessing}
                sx={{
                  py: 1.8,
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  bgcolor: '#1565c0',
                  '&:hover': { bgcolor: '#0d47a1' }
                }}
              >
                {isProcessing ? 'ĐANG CHUYỂN HƯỚNG...' : 'MUA NGAY'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* ==================== DANH SÁCH CHƯƠNG ==================== */}
      <Typography variant="h5" sx={{ fontWeight: 700, mt: 6, mb: 3, color: '#333' }}>
        Danh sách chương
      </Typography>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <List disablePadding>
          {chapters.map((chapter, index) => {
            const isActive = playingId === chapter.id && isGlobalPlaying;

            return (
              <Box key={chapter.id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: { xs: 2, md: 4 },
                    bgcolor: playingId === chapter.id ? '#e8f0fe' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <ListItemIcon
                    onClick={() => handleNghe(chapter)}
                    sx={{ cursor: 'pointer', minWidth: 44, flexShrink: 0 }}
                  >
                    {isActive ? (
                      <PauseCircleOutlineIcon sx={{ color: '#1565c0', fontSize: 32 }} />
                    ) : (
                      <PlayCircleOutlineIcon sx={{ color: '#1565c0', fontSize: 32 }} />
                    )}
                  </ListItemIcon>

                  <ListItemText
                    sx={{ minWidth: 0, overflow: 'hidden' }}
                    primary={
                      <Typography
                        variant="subtitle1"
                        noWrap
                        sx={{
                          fontWeight: playingId === chapter.id ? 700 : 500,
                          color: '#333'
                        }}
                      >
                        Chương {chapter.orderNumber}: {chapter.title}
                      </Typography>
                    }
                    secondary={
                      <Stack component="span" direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: '#aaa' }} />
                        <Typography component="span" variant="caption" sx={{ color: '#aaa' }}>
                          {Math.floor(chapter.durationInSeconds / 60)} phút
                        </Typography>
                      </Stack>
                    }
                  />

                  <Button
                    variant={isActive ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleNghe(chapter)}
                    sx={{
                      minWidth: 80,
                      flexShrink: 0,
                      borderColor: '#1565c0',
                      color: isActive ? '#fff' : '#1565c0',
                      bgcolor: isActive ? '#1565c0' : 'transparent',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: isActive ? '#0d47a1' : '#e3f2fd',
                        borderColor: '#1565c0'
                      }
                    }}
                  >
                    {isActive ? 'Dừng' : 'Nghe'}
                  </Button>
                </ListItem>
                {index < chapters.length - 1 && <Divider />}
              </Box>
            );
          })}
        </List>
      </Paper>

      {/* ==================== SNACKBAR ==================== */}
      <Snackbar
        open={notif.open}
        autoHideDuration={4000}
        onClose={() => setNotif({ ...notif, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={notif.severity} variant="filled">
          {notif.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
