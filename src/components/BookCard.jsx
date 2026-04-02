import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
} from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { useNavigate } from 'react-router-dom';

const DEFAULT_COVER = 'https://via.placeholder.com/300x450/1e3a8a/ffffff?text=Book+Cover';

export default function BookCard({ book = {} }) {
  const navigate = useNavigate();

  const {
    id,
    title = 'Không có tiêu đề',
    authorName = 'Tác giả không xác định',
    categoryName = 'Chưa phân loại',
    coverImageUrl,
    price = 0,
  } = book;

  // Xử lý lỗi ảnh
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_COVER;
  };

  const isFree = price === 0 || price === null;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 28px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      {/* Phần ảnh bìa */}
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="320"
          image={coverImageUrl || DEFAULT_COVER}
          alt={title}
          onError={handleImageError}
          sx={{
            objectFit: 'cover',
            transition: 'transform 0.4s ease-in-out',
            '&:hover': {
              transform: 'scale(1.08)',
            },
          }}
        />

        {/* Overlay Play Icon */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.45)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': { opacity: 1 },
          }}
        >
          <PlayCircleIcon
            sx={{
              fontSize: 72,
              color: 'white',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))',
            }}
          />
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Tiêu đề sách */}
        <Typography
          variant="h6"
          component="h3"
          fontWeight={600}
          gutterBottom
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3,
            minHeight: '2.6em',
          }}
        >
          {title}
        </Typography>

        {/* Tên tác giả */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {authorName}
        </Typography>

        {/* Category + Rating */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={categoryName}
            size="small"
            color="primary"
            variant="outlined"
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Rating
              name="read-only"
              value={4.5}
              precision={0.5}
              size="small"
              readOnly
            />
            <Typography variant="caption" color="text.secondary">
              (128)
            </Typography>
          </Box>
        </Box>

        {/* Giá tiền */}
        <Typography
          variant="h6"
          color={isFree ? 'success.main' : 'primary.main'}
          fontWeight="bold"
        >
          {isFree ? 'Miễn phí' : `${price.toLocaleString('vi-VN')}đ`}
        </Typography>
      </CardContent>

      {/* Nút hành động */}
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<PlayCircleIcon />}
          onClick={() => id && navigate(`/book/${id}`)}
          sx={{
            borderRadius: 2,
            py: 1.3,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1.02rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
            },
          }}
        >
          Nghe ngay
        </Button>
      </Box>
    </Card>
  );
}