import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Container,
  Grid,
  Skeleton,
  Avatar
} from '@mui/material';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { useNavigate } from 'react-router-dom';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// 1. Khai báo Base URL của Backend (không có dấu / ở cuối)
const BASE_URL = 'https://localhost:7232'; 
const DEFAULT_COVER = 'https://m.media-amazon.com/images/I/41ow4UWF+WL._SY445_SX342_.jpg';
// --- COMPONENT TÁC GIẢ (NEW) ---
const AuthorCircle = ({ author, onClick }) => (
  <Box 
    onClick={onClick}
    sx={{ 
      textAlign: 'center', 
      cursor: 'pointer',
      transition: 'transform 0.3s',
      '&:hover': { transform: 'scale(1.1)' }
    }}
  >
    <Avatar 
      src={author.avatarUrl ? `${BASE_URL}${author.avatarUrl}` : ""} 
      sx={{ 
        width: 120, 
        height: 120, 
        mx: 'auto', 
        mb: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '3px solid white'
      }}
    >
      {author.name?.charAt(0)}
    </Avatar>
    <Typography variant="subtitle1" fontWeight="bold" noWrap>
      {author.name}
    </Typography>
  </Box>
);
const BookCard = ({ book, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      borderRadius: 3,
      overflow: 'hidden',
      bgcolor: 'background.paper',
      boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-10px)',
        boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
      },
      cursor: 'pointer',
      position: 'relative',
    }}
  >
    <Box sx={{ position: 'relative' }}>
      <img
        // 2. Ghép Base URL với đường dẫn coverImageUrl (/images/sach_1.jpg)
        src={book.coverImageUrl ? `${BASE_URL}${book.coverImageUrl}` : DEFAULT_COVER}
        alt={book.title}
        style={{ width: '100%', height: 340, objectFit: 'contain' }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = DEFAULT_COVER;
        }}
      />
      {/* Overlay play icon */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0,0,0,0.3)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          '&:hover': { opacity: 1 },
        }}
      >
        <PlayCircleFilledIcon sx={{ fontSize: 80, color: 'white' }} />
      </Box>
    </Box>

    <Box sx={{ p: 2.5 }}>
      <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ mb: 0.5 }}>
        {book.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {book.authorName || 'Tác giả'} • {book.categoryName || 'Chưa phân loại'}
      </Typography>
      <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ mt: 1 }}>
        {book.price?.toLocaleString('vi-VN')} ₫
      </Typography>
    </Box>

    <Box sx={{ px: 2.5, pb: 2.5 }}>
      <Button
        fullWidth
        variant="outlined"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        Xem chi tiết
      </Button>
    </Box>
  </Box>
);

const BookSection = ({ title, searchQuery = '', pageSize = 10, isFeatured = false }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams({
      PageNumber: 1,
      PageSize: pageSize,
      ...(searchQuery && { Search: searchQuery }),
    });

    api
      .get(`/Books?${params.toString()}`)
      .then((res) => {
        setBooks(res.data.data || res.data || []);
      })
      .catch((err) => console.error(`Lỗi fetch sách cho ${title}:`, err))
      .finally(() => setLoading(false));
  }, [searchQuery, pageSize, title]);

  if (loading) {
    return (
      <Box sx={{ mb: 8 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={i}>
              <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 3 }} />
              <Skeleton variant="text" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (books.length === 0) return null;

  return (
    <Box sx={{ mb: 10 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: isFeatured ? 'primary.main' : 'inherit' }}>
          {title}
        </Typography>
        <Button
          variant="text"
          onClick={() => navigate(`/search?query=${encodeURIComponent(searchQuery)}`)}
        >
          Xem tất cả →
        </Button>
      </Box>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1.3}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop={books.length > 5}
        breakpoints={{
          480: { slidesPerView: 2, spaceBetween: 16 },
          768: { slidesPerView: 3, spaceBetween: 24 },
          1024: { slidesPerView: 4, spaceBetween: 32 },
          1280: { slidesPerView: 5, spaceBetween: 32 },
        }}
      >
        {books.map((book) => (
          <SwiperSlide key={book.id}>
            <BookCard
              book={book}
              onClick={() => navigate(`/book/${book.id}`)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]); // State cho tác giả
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    // 1. Lấy Categories
    api.get('/Categories')
      .then((res) => setCategories((res.data.data || res.data || []).slice(0, 5)))
      .finally(() => setLoadingCategories(false));

    // 2. Lấy Authors (Lấy khoảng 10 người tiêu biểu)
    api.get('/Authors?PageSize=10')
      .then((res) => setAuthors(res.data.data || res.data || []))
      .catch((err) => console.error('Lỗi lấy authors:', err))
      .finally(() => setLoadingAuthors(false));
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 6, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box sx={{ mb: 8, p: { xs: 4, md: 8 }, borderRadius: 4, background: 'linear-gradient(135deg, #6b48ff 0%, #00d4ff 100%)', color: 'white', textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>Khám phá kho sách nói chất lượng cao</Typography>
        <Typography variant="h6">Nghe mọi lúc, mọi nơi – miễn phí chương 1 cho hàng ngàn đầu sách bản quyền</Typography>
      </Box>

      {/* Sách Mới */}
      <BookSection title="Sách Mới Cập Nhật" pageSize={12} isFeatured />

      {/* --- SECTION TÁC GIẢ TIÊU BIỂU (NEW) --- */}
      <Box sx={{ mb: 10 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Tác giả tiêu biểu</Typography>
        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={2.5}
          navigation
          breakpoints={{
            640: { slidesPerView: 4 },
            1024: { slidesPerView: 6 },
            1280: { slidesPerView: 8 },
          }}
        >
          {loadingAuthors ? (
            [...Array(8)].map((_, i) => (
              <SwiperSlide key={i}>
                <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 1 }} />
                <Skeleton variant="text" width="60%" sx={{ mx: 'auto' }} />
              </SwiperSlide>
            ))
          ) : (
            authors.map((author) => (
              <SwiperSlide key={author.id}>
                <AuthorCircle 
                  author={author} 
                  onClick={() => navigate(`/search?query=${encodeURIComponent(author.name)}`)}
                />
              </SwiperSlide>
            ))
          )}
        </Swiper>
      </Box>

      {/* Danh mục sách (Categories) */}
      {!loadingCategories && categories.map((cat) => (
        <BookSection
          key={cat.id}
          title={cat.name}
          searchQuery={cat.name}
          pageSize={8}
        />
      ))}

      {/* Nút khám phá thêm */}
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Button variant="contained" size="large" onClick={() => navigate('/search')} sx={{ px: 6, py: 1.5 }}>
          Khám phá tất cả sách
        </Button>
      </Box>
    </Container>
  );
}