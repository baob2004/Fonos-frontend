import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  Typography,
  Box,
  Container,
  Button,
  Breadcrumbs,
  Link,
  Skeleton,
  Pagination,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const BASE_URL = 'https://localhost:7232';
const DEFAULT_COVER =
  'https://m.media-amazon.com/images/I/41ow4UWF+WL._SY445_SX342_.jpg';

// ==================== BOOK CARD GIỐNG HOME ====================
const BookCard = ({ book, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      width: '100%',
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
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <Box sx={{ position: 'relative' }}>
      <img
        src={book.coverImageUrl ? `${BASE_URL}${book.coverImageUrl}` : DEFAULT_COVER}
        alt={book.title}
        style={{
          width: '100%',
          height: 340,
          objectFit: 'cover',
          display: 'block',
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = DEFAULT_COVER;
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
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

    <Box sx={{ p: 2.5, flexGrow: 1, minWidth: 0 }}>
      <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ mb: 0.5 }}>
        {book.title}
      </Typography>

      <Typography variant="body2" color="text.secondary" noWrap>
        {book.authorName || 'Tác giả'} • {book.categoryName || 'Chưa phân loại'}
      </Typography>

      <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ mt: 1 }}>
        {book.price ? `${book.price.toLocaleString('vi-VN')} ₫` : 'Miễn phí'}
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

// ==================== SKELETON GIỐNG HOME ====================
const SkeletonCard = () => (
  <Box sx={{ width: '100%' }}>
    <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 3 }} />
    <Skeleton variant="text" sx={{ mt: 1 }} />
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="rectangular" height={36} sx={{ mt: 2, borderRadius: 1 }} />
  </Box>
);

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query') || '';

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(query);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const pageSize = 12;

  const fetchBooks = useCallback(
    async (pageNum) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          PageNumber: pageNum,
          PageSize: pageSize,
          ...(query && { Search: query }),
        });

        const res = await api.get(`/Books?${params.toString()}`);
        const data = res.data || {};
        const newBooks = data.data || data.items || data.results || [];
        const total =
          data.totalCount ||
          data.total ||
          data.count ||
          data.totalItems ||
          newBooks.length ||
          0;

        setBooks(newBooks);
        setTotalCount(total);
        setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
      } catch (err) {
        console.error('Lỗi tải sách:', err);
        setBooks([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  useEffect(() => {
    setInputValue(query);
    setPage(1);
    fetchBooks(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query, fetchBooks]);

  const handlePageChange = (_, value) => {
    setPage(value);
    fetchBooks(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    const trimmed = inputValue.trim();
    navigate(trimmed ? `/search?query=${encodeURIComponent(trimmed)}` : '/search');
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Hero */}
      <Box
        sx={{
          mb: 6,
          py: { xs: 5, md: 7 },
          background: 'linear-gradient(135deg, #6b48ff 0%, #00d4ff 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={2}
            >
              <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/')}
                  variant="outlined"
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  Quay lại
                </Button>

                <Breadcrumbs separator={<NavigateNextIcon sx={{ color: 'white' }} />}>
                  <Link component={RouterLink} to="/" color="inherit" underline="hover">
                    Trang chủ
                  </Link>
                  <Typography color="white">
                    {query ? `Tìm kiếm: ${query}` : 'Tất cả sách'}
                  </Typography>
                </Breadcrumbs>
              </Stack>
            </Stack>

            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {query ? `Kết quả cho "${query}"` : 'Khám phá tất cả sách'}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95 }}>
                Tìm kiếm sách nói, tác giả và thể loại bạn yêu thích
              </Typography>
            </Box>

            <TextField
              fullWidth
              placeholder="Tìm kiếm sách, tác giả hoặc thể loại..."
              variant="outlined"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch();
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.9)' }} />
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: 'rgba(255,255,255,0.15)',
                  borderRadius: 3,
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.4)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.7)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'white',
                  },
                  '& input::placeholder': {
                    color: 'rgba(255,255,255,0.9)',
                    opacity: 1,
                  },
                },
              }}
            />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ pb: 8 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {query ? 'Danh sách sách' : 'Tất cả đầu sách'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              {loading ? 'Đang tải dữ liệu...' : `${totalCount} kết quả`}
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(3, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
                lg: 'repeat(5, minmax(0, 1fr))',
              },
              gap: 3,
            }}
          >
            {[...Array(pageSize)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </Box>
        ) : books.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(3, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
                lg: 'repeat(5, minmax(0, 1fr))',
              },
              gap: 3,
            }}
          >
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => navigate(`/book/${book.id}`)}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              bgcolor: 'background.paper',
              borderRadius: 4,
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Không tìm thấy sách nào phù hợp với "{query}"
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{ mt: 3 }}
              onClick={() => navigate('/')}
            >
              Quay về trang chủ
            </Button>
          </Box>
        )}

        {books.length > 0 && (
          <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
