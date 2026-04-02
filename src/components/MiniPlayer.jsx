import {
  Box,
  Typography,
  IconButton,
  Slider,
  Stack,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Replay10Icon from '@mui/icons-material/Replay10';
import Forward10Icon from '@mui/icons-material/Forward10';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CloseIcon from '@mui/icons-material/Close';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import SpeedIcon from '@mui/icons-material/Speed';
import { useState, useEffect, useRef, useMemo } from 'react';

export default function MiniPlayer({
  currentBook,
  currentChapter,
  chapters = [],
  onPlayingChange,
  onClear,
  onSelectChapter,
}) {
  const audioRef = useRef(new Audio());
  const baseUrl = 'https://localhost:7232';

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [timerAnchorEl, setTimerAnchorEl] = useState(null);
  const [sleepUntil, setSleepUntil] = useState(null);
  const [sleepRemaining, setSleepRemaining] = useState(0);

  const openTimerMenu = Boolean(timerAnchorEl);

  const chapterList = useMemo(() => {
    return Array.isArray(chapters) ? chapters : [];
  }, [chapters]);

  // So sánh Guid an toàn bằng string
  const currentChapterIndex = useMemo(() => {
    if (!currentChapter?.id || !chapterList.length) return -1;

    return chapterList.findIndex(
      (c) => String(c.id).toLowerCase() === String(currentChapter.id).toLowerCase()
    );
  }, [chapterList, currentChapter]);

  const hasPrevChapter = currentChapterIndex > 0;
  const hasNextChapter =
    currentChapterIndex !== -1 && currentChapterIndex < chapterList.length - 1;

  const getAudioSrc = (audioUrl) => {
    if (!audioUrl) return '';
    return audioUrl.startsWith('http') ? audioUrl : `${baseUrl}${audioUrl}`;
  };

  const getCoverSrc = (coverUrl) => {
    if (!coverUrl) return '';
    return coverUrl.startsWith('http') ? coverUrl : `${baseUrl}${coverUrl}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlayingChange?.(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPlayingChange?.(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onPlayingChange?.(false);

      // Tự động chuyển sang chương tiếp theo
      if (hasNextChapter && onSelectChapter) {
        const nextChapter = chapterList[currentChapterIndex + 1];
        onSelectChapter(currentBook, nextChapter, chapterList);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onPlayingChange, hasNextChapter, currentChapterIndex, chapterList, currentBook, onSelectChapter]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!currentChapter?.audioUrl) return;

    audio.pause();
    audio.src = getAudioSrc(currentChapter.audioUrl);
    audio.load();
    audio.currentTime = 0;
    setCurrentTime(0);
    setDuration(0);
    audio.volume = volume / 100;
    audio.playbackRate = playbackRate;

    const handleCanPlay = () => {
      audio
        .play()
        .catch(() => console.log('Chờ tương tác người dùng để phát audio...'));
    };

    audio.addEventListener('canplay', handleCanPlay, { once: true });

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentChapter, playbackRate, volume]);

  useEffect(() => {
    if (!sleepUntil) {
      setSleepRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const remain = Math.max(0, Math.floor((sleepUntil - Date.now()) / 1000));
      setSleepRemaining(remain);

      if (remain <= 0) {
        clearInterval(interval);
        audioRef.current.pause();
        setSleepUntil(null);
        setSleepRemaining(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepUntil]);

  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const formatSleepRemaining = (seconds) => {
    if (!seconds) return '';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleSliderChange = (_, newValue) => {
    audioRef.current.currentTime = newValue;
    setCurrentTime(newValue);
  };

  const handleSeekBy = (seconds) => {
    const audio = audioRef.current;
    const nextTime = Math.min(
      Math.max(0, audio.currentTime + seconds),
      duration || audio.currentTime + seconds
    );
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;

    try {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
    } catch (err) {
      console.error('Lỗi play/pause:', err);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
  };

  const handlePrevChapter = () => {
    if (!hasPrevChapter || !onSelectChapter) return;
    const prevChapter = chapterList[currentChapterIndex - 1];
    onSelectChapter(currentBook, prevChapter, chapterList);
  };

  const handleNextChapter = () => {
    if (!hasNextChapter || !onSelectChapter) return;
    const nextChapter = chapterList[currentChapterIndex + 1];
    onSelectChapter(currentBook, nextChapter, chapterList);
  };

  const handleSetSleepTimer = (minutes) => {
    setSleepUntil(Date.now() + minutes * 60 * 1000);
    setTimerAnchorEl(null);
  };

  const handleCancelSleepTimer = () => {
    setSleepUntil(null);
    setSleepRemaining(0);
    setTimerAnchorEl(null);
  };

  const handleClosePlayer = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.src = '';
    setCurrentTime(0);
    setDuration(0);
    setSleepUntil(null);
    setSleepRemaining(0);
    onClear?.();
  };

  if (!currentChapter) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: '#111827',
        color: 'white',
        zIndex: 1300,
        px: { xs: 2, md: 3 },
        pt: 1,
        pb: 1.5,
        boxShadow: '0 -8px 24px rgba(0,0,0,0.35)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ minWidth: 38 }}>
          {formatTime(currentTime)}
        </Typography>

        <Slider
          size="small"
          value={currentTime}
          max={duration || 100}
          onChange={handleSliderChange}
          sx={{
            color: '#3b82f6',
            height: 4,
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
            },
          }}
        />

        <Typography variant="caption" sx={{ minWidth: 38 }}>
          {formatTime(duration)}
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 1.5, md: 2 }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
          <Avatar
            src={getCoverSrc(currentBook?.coverImageUrl)}
            variant="rounded"
            sx={{ width: 52, height: 52, borderRadius: 2 }}
          />

          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap fontWeight={700}>
              {currentBook?.title}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }} noWrap display="block">
              Chương {currentChapter.orderNumber}: {currentChapter.title}
            </Typography>

            {sleepRemaining > 0 && (
              <Chip
                size="small"
                label={`Ngủ sau ${formatSleepRemaining(sleepRemaining)}`}
                sx={{
                  mt: 0.7,
                  height: 22,
                  bgcolor: 'rgba(59,130,246,0.18)',
                  color: '#bfdbfe',
                  fontSize: '0.72rem',
                }}
              />
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
          <IconButton color="inherit" onClick={handlePrevChapter} disabled={!hasPrevChapter}>
            <SkipPreviousIcon />
          </IconButton>

          <IconButton color="inherit" onClick={() => handleSeekBy(-10)}>
            <Replay10Icon />
          </IconButton>

          <IconButton
            onClick={togglePlay}
            sx={{
              bgcolor: 'white',
              color: 'black',
              '&:hover': { bgcolor: '#e5e7eb' },
              width: 44,
              height: 44,
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>

          <IconButton color="inherit" onClick={() => handleSeekBy(10)}>
            <Forward10Icon />
          </IconButton>

          <IconButton color="inherit" onClick={handleNextChapter} disabled={!hasNextChapter}>
            <SkipNextIcon />
          </IconButton>
        </Stack>

        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          justifyContent={{ xs: 'space-between', md: 'flex-end' }}
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <VolumeUpIcon fontSize="small" sx={{ opacity: 0.75 }} />
            <Slider
              size="small"
              value={volume}
              onChange={(_, v) => {
                setVolume(v);
                audioRef.current.volume = v / 100;
              }}
              sx={{
                width: { xs: 90, md: 110 },
                color: 'white',
              }}
            />
          </Stack>

          <Box
            onClick={cyclePlaybackRate}
            sx={{
              px: 1.2,
              py: 0.8,
              borderRadius: 999,
              cursor: 'pointer',
              bgcolor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Typography variant="caption">{playbackRate}x</Typography>
          </Box>

          <Box
            onClick={(e) => setTimerAnchorEl(e.currentTarget)}
            sx={{
              px: 1.2,
              py: 0.8,
              borderRadius: 999,
              cursor: 'pointer',
              bgcolor: sleepRemaining > 0 ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Typography variant="caption">Hẹn giờ</Typography>
          </Box>

          <IconButton color="inherit" onClick={handleClosePlayer} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Menu
        anchorEl={timerAnchorEl}
        open={openTimerMenu}
        onClose={() => setTimerAnchorEl(null)}
      >
        <MenuItem onClick={() => handleSetSleepTimer(15)}>Ngủ sau 15 phút</MenuItem>
        <MenuItem onClick={() => handleSetSleepTimer(30)}>Ngủ sau 30 phút</MenuItem>
        <MenuItem onClick={() => handleSetSleepTimer(45)}>Ngủ sau 45 phút</MenuItem>
        <MenuItem onClick={() => handleSetSleepTimer(60)}>Ngủ sau 60 phút</MenuItem>
        <MenuItem onClick={handleCancelSleepTimer}>Tắt hẹn giờ</MenuItem>
      </Menu>
    </Box>
  );
}
