import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  alpha,
  useScrollTrigger,
  useTheme,
  Link,
  useMediaQuery,
  Drawer
} from '@mui/material';
import { HambergerMenu, Moon, Sun1, Translate, Login } from 'iconsax-react';
import { useIntl } from 'react-intl';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import settings from 'settings';

interface GosafeNavbarProps {
  primaryColor: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  currentLang: string;
}

const GosafeNavbar = ({ primaryColor, isDark, onToggleTheme, onToggleLanguage, currentLang }: GosafeNavbarProps) => {
  const theme = useTheme();
  const intl = useIntl();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50
  });

  // Force dark mode content (light text) when transparent (on top of dark Hero)
  const contentIsDark = isDark || !trigger;

  const navLinks = [
    { label: intl.formatMessage({ id: 'gosafe-nav-product', defaultMessage: 'Sản phẩm' }), href: '#products' },
    { label: intl.formatMessage({ id: 'gosafe-nav-specs', defaultMessage: 'Thông số' }), href: '#specifications' },
    { label: intl.formatMessage({ id: 'gosafe-nav-contact', defaultMessage: 'Liên hệ' }), href: '#contact' }
  ];

  const handleScrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: trigger ? (isDark ? alpha('#020617', 0.8) : alpha('#ffffff', 0.8)) : 'transparent',
        backdropFilter: trigger ? 'blur(20px)' : 'none',
        borderBottom: '1px solid',
        borderColor: trigger ? (isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)) : 'transparent',
        transition: 'all 0.3s ease-in-out',
        py: 1
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={settings.logoDefault}
              alt="Logo"
              style={{
                width: isMobile ? 140 : 180,
                objectFit: 'contain',
                filter: contentIsDark ? 'brightness(0) invert(1)' : 'none',
                transition: 'filter 0.3s ease'
              }}
            />
          </Link>

          {/* Desktop Nav */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              display: { xs: 'none', md: 'flex' },
              bgcolor: contentIsDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
              p: 0.5,
              borderRadius: '100px',
              border: `1px solid ${contentIsDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)}`
            }}
          >
            {navLinks.map((link) => (
              <Button
                key={link.label}
                onClick={() => handleScrollTo(link.href)}
                sx={{
                  color: contentIsDark ? '#94a3b8' : '#64748b',
                  borderRadius: '50px',
                  px: 3,
                  fontWeight: 600,
                  '&:hover': {
                    color: contentIsDark ? '#fff' : '#0f172a',
                    bgcolor: contentIsDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)
                  }
                }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              onClick={onToggleLanguage}
              size="small"
              sx={{
                color: contentIsDark ? '#94a3b8' : '#64748b',
                border: `1px solid ${contentIsDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                '&:hover': { color: primaryColor, borderColor: primaryColor }
              }}
            >
              <Translate size={20} />
            </IconButton>

            <IconButton
              onClick={onToggleTheme}
              size="small"
              sx={{
                color: contentIsDark ? '#94a3b8' : '#64748b',
                border: `1px solid ${contentIsDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                '&:hover': { color: primaryColor, borderColor: primaryColor }
              }}
            >
              {isDark ? <Sun1 size={20} /> : <Moon size={20} />}
            </IconButton>

            {/* <Button
              variant="contained"
              startIcon={<Login size={20} />}
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: contentIsDark ? '#fff' : '#0f172a',
                color: contentIsDark ? '#0f172a' : '#fff',
                borderRadius: '50px',
                px: 3,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: primaryColor,
                  color: '#fff',
                  boxShadow: `0 8px 20px ${alpha(primaryColor, 0.4)}`
                }
              }}
            >
              Đăng nhập
            </Button> */}

            {/* Mobile Menu Button */}
            <IconButton sx={{ display: { md: 'none' }, color: contentIsDark ? '#fff' : '#000' }} onClick={() => setMobileOpen(true)}>
              <HambergerMenu />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: 300,
            bgcolor: isDark ? '#020617' : '#ffffff',
            backgroundImage: 'none'
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Drawer Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
            <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={settings.logoDefault}
                alt="Logo"
                style={{
                  width: 140,
                  height: 'auto',
                  filter: isDark ? 'brightness(0) invert(1)' : 'none'
                }}
              />
            </Link>
            <IconButton onClick={() => setMobileOpen(false)} sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              <HambergerMenu size={24} style={{ transform: 'rotate(90deg)' }} />
            </IconButton>
          </Stack>

          {/* Drawer Links */}
          <Stack spacing={2} sx={{ mb: 'auto' }}>
            {navLinks.map((link) => (
              <Button
                key={link.label}
                onClick={() => {
                  handleScrollTo(link.href);
                  setMobileOpen(false);
                }}
                sx={{
                  justifyContent: 'flex-start',
                  color: isDark ? '#f8fafc' : '#0f172a',
                  fontSize: 16,
                  fontWeight: 600,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05)
                  }
                }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>

          {/* Drawer Footer Actions */}
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ width: '100%' }}>
              <IconButton
                onClick={onToggleLanguage}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  color: isDark ? '#94a3b8' : '#64748b',
                  border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                  '&:hover': { color: primaryColor, borderColor: primaryColor }
                }}
              >
                <Translate size={20} />
                <Box component="span" sx={{ ml: 1, fontSize: 14, fontWeight: 600 }}>
                  {currentLang === 'vi' ? 'Tiếng Việt' : 'English'}
                </Box>
              </IconButton>
              <IconButton
                onClick={onToggleTheme}
                sx={{
                  flex: 1,
                  borderRadius: 2,
                  color: isDark ? '#94a3b8' : '#64748b',
                  border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
                  '&:hover': { color: primaryColor, borderColor: primaryColor }
                }}
              >
                {isDark ? <Sun1 size={20} /> : <Moon size={20} />}
                <Box component="span" sx={{ ml: 1, fontSize: 14, fontWeight: 600 }}>
                  {isDark ? 'Light' : 'Dark'}
                </Box>
              </IconButton>
            </Stack>

            <Button
              variant="contained"
              fullWidth
              startIcon={<Login size={20} />}
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: primaryColor,
                color: '#fff',
                borderRadius: 2,
                py: 1.5,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: `0 8px 20px ${alpha(primaryColor, 0.4)}`,
                '&:hover': {
                  bgcolor: primaryColor,
                  boxShadow: `0 12px 24px ${alpha(primaryColor, 0.5)}`
                }
              }}
            >
              {intl.formatMessage({ id: 'gosafe-nav-login', defaultMessage: 'Đăng nhập' })}
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default GosafeNavbar;
