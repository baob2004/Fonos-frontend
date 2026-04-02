import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import {
  Container,
  Typography,
  Box,
  Button,
  Skeleton,
  Stack,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';

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
        Nghe ngay
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

export default function MyLibrary() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState('');
  const [pageSize] = useState(10);

  const fetchPurchasedBooks = useCallback(
    async (pageNum, isAppend = false) => {
      try {
        if (!isAppend) setLoading(true);

        const params = new URLSearchParams({
          PageNumber: pageNum,
          PageSize: pageSize,
          Search: search,
        });

        const res = await api.get(`/Books/purchased?${params.toString()}`);
        const result = res.data;

        if (isAppend) {
          setBooks((prev) => [...prev, ...(result.data || [])]);
        } else {
          setBooks(result.data || []);
        }

        setTotalPages(result.totalPages || 1);
      } catch (error) {
        console.error('Lỗi tải thư viện:', error);
      } finally {
        setLoading(false);
      }
    },
    [search, pageSize]
  );

  useEffect(() => {
    setPage(1);
    fetchPurchasedBooks(1, false);
  }, [search, fetchPurchasedBooks]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPurchasedBooks(nextPage, true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6, minHeight: '80vh' }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={3}
        sx={{ mb: 5 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #6b48ff 0%, #00d4ff 100%)',
              boxShadow: '0 12px 24px rgba(107,72,255,0.28)',
            }}
          >
            <MenuBookIcon sx={{ color: 'white', fontSize: 28 }} />
          </Box>

          <Box>
            <Typography variant="h3" fontWeight="bold">
              Tủ sách của tôi
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Danh sách các đầu sách bạn đã sở hữu
            </Typography>
          </Box>
        </Stack>

        <TextField
          placeholder="Tìm sách trong thư viện..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: { xs: '100%', md: 350 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'white',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Divider sx={{ mb: 5 }} />

      {/* Content */}
      {loading && books.length === 0 ? (
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
      ) : books.length === 0 ? (
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
            {search
              ? `Không tìm thấy sách nào khớp với "${search}"`
              : 'Bạn chưa sở hữu cuốn sách nào.'}
          </Typography>

          {!search && (
            <Button
              variant="contained"
              sx={{
                mt: 3,
                px: 5,
                borderRadius: 999,
                fontWeight: 700,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6b48ff 0%, #00d4ff 100%)',
              }}
              onClick={() => navigate('/')}
            >
              Khám phá ngay
            </Button>
          )}
        </Box>
      ) : (
        <>
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

          {page < totalPages && (
            <Box sx={{ textAlign: 'center', mt: 7 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleLoadMore}
                sx={{
                  px: 6,
                  borderRadius: 999,
                  fontWeight: 700,
                  textTransform: 'none',
                }}
              >
                Xem thêm sách
              </Button>
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
