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
import { HambergerMenu, Moon, Sun1, Translate, Login, ArrowRight2 } from 'iconsax-react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import settings from 'settings';

interface GosafeNavbarProps {
  primaryColor: string;
  secondaryColor: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  currentLang: string;
}

const GosafeNavbar = ({ primaryColor, secondaryColor, isDark, onToggleTheme, onToggleLanguage, currentLang }: GosafeNavbarProps) => {
  const theme = useTheme();
  const intl = useIntl();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20
  });

  // Content color adaptation
  // Top section (Solutions) now respects theme (White in Light Mode), so we just follow isDark.
  const contentIsDark = isDark;

  const navLinks = [
    { label: intl.formatMessage({ id: 'gosafe-nav-solutions', defaultMessage: 'Giải pháp' }), href: '#solutions' },
    { label: intl.formatMessage({ id: 'gosafe-nav-product', defaultMessage: 'Sản phẩm' }), href: '#products' },
    { label: intl.formatMessage({ id: 'gosafe-nav-specs', defaultMessage: 'Thông số' }), href: '#specifications' },
    { label: intl.formatMessage({ id: 'gosafe-nav-contact', defaultMessage: 'Liên hệ' }), href: '#contact' }
  ];

  const handleScrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
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
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        py: trigger ? 1 : 2
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={settings.logoDefault}
              alt="Logo"
              style={{
                width: isMobile ? 120 : 160,
                objectFit: 'contain',
                filter: contentIsDark ? 'brightness(0) invert(1)' : 'none',
                transition: 'filter 0.3s ease'
              }}
            />
          </Link>

          {/* Desktop Nav - Floating Pill */}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              display: { xs: 'none', md: 'flex' },
              bgcolor: contentIsDark ? alpha('#fff', 0.08) : alpha('#000', 0.04),
              backdropFilter: 'blur(10px)',
              p: 0.75,
              borderRadius: '100px',
              border: `1px solid ${contentIsDark ? alpha('#fff', 0.08) : alpha('#000', 0.05)}`,
              boxShadow: trigger ? `0 8px 32px ${alpha('#000', 0.05)}` : 'none'
            }}
          >
            {navLinks.map((link) => (
              <Button
                key={link.label}
                onClick={() => handleScrollTo(link.href)}
                sx={{
                  color: contentIsDark ? alpha('#fff', 0.8) : alpha('#0f172a', 0.8),
                  borderRadius: '100px',
                  px: 2.5,
                  py: 1,
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: contentIsDark ? '#fff' : '#000',
                    bgcolor: contentIsDark ? alpha('#fff', 0.1) : alpha('#fff', 0.8),
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Theme & Lang Toggles */}
            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: { xs: 'none', md: 'flex' },
                bg: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                p: 0.5,
                borderRadius: 100
              }}
            >
              <IconButton
                onClick={onToggleLanguage}
                size="small"
                sx={{
                  color: contentIsDark ? '#94a3b8' : '#64748b',
                  transition: 'all 0.3s',
                  '&:hover': { color: primaryColor, bgcolor: alpha(primaryColor, 0.1) }
                }}
              >
                <Translate size={20} />
              </IconButton>

              <IconButton
                onClick={onToggleTheme}
                size="small"
                sx={{
                  color: contentIsDark ? '#94a3b8' : '#64748b',
                  transition: 'all 0.3s',
                  '&:hover': { color: primaryColor, bgcolor: alpha(primaryColor, 0.1) }
                }}
              >
                {isDark ? <Sun1 size={20} /> : <Moon size={20} />}
              </IconButton>
            </Stack>

            {/* Login Button */}
            <Button
              variant="contained"
              endIcon={<ArrowRight2 size={16} />}
              onClick={() => navigate('/login')}
              sx={{
                display: { xs: 'none', md: 'flex' },
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                color: '#fff',
                borderRadius: '100px',
                px: 3,
                py: 1.2,
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                boxShadow: `0 8px 20px -6px ${alpha(primaryColor, 0.5)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: `0 12px 25px -8px ${alpha(primaryColor, 0.6)}`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <FormattedMessage id="gosafe-nav-login" defaultMessage="Đăng nhập" />
            </Button>

            {/* Mobile Menu Button */}
            <IconButton
              sx={{
                display: { md: 'none' },
                color: contentIsDark ? '#fff' : '#0f172a',
                bgcolor: contentIsDark ? alpha('#fff', 0.1) : alpha('#000', 0.05),
                '&:hover': { bgcolor: contentIsDark ? alpha('#fff', 0.2) : alpha('#000', 0.1) }
              }}
              onClick={() => setMobileOpen(true)}
            >
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
            maxWidth: 320,
            bgcolor: isDark ? '#020617' : '#ffffff',
            backgroundImage: 'none',
            borderLeft: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`
          }
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Drawer Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
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
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  py: 1.5,
                  px: 2,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: isDark ? alpha(primaryColor, 0.1) : alpha(primaryColor, 0.05),
                    color: primaryColor,
                    transform: 'translateX(5px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                {link.label}
              </Button>
            ))}
          </Stack>

          {/* Drawer Footer Actions */}
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
              <Button
                fullWidth
                onClick={onToggleLanguage}
                startIcon={<Translate size={20} />}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  color: isDark ? '#94a3b8' : '#64748b',
                  bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                  border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
                  '&:hover': { color: primaryColor, borderColor: primaryColor, bgcolor: alpha(primaryColor, 0.05) }
                }}
              >
                {currentLang === 'vi' ? 'Tiếng Việt' : 'English'}
              </Button>
              <Button
                fullWidth
                onClick={onToggleTheme}
                startIcon={isDark ? <Sun1 size={20} /> : <Moon size={20} />}
                sx={{
                  borderRadius: 3,
                  py: 1.5,
                  color: isDark ? '#94a3b8' : '#64748b',
                  bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                  border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.05)}`,
                  '&:hover': { color: primaryColor, borderColor: primaryColor, bgcolor: alpha(primaryColor, 0.05) }
                }}
              >
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </Stack>

            <Button
              variant="contained"
              fullWidth
              startIcon={<Login size={20} />}
              onClick={() => navigate('/login')}
              sx={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                color: '#fff',
                borderRadius: 100,
                py: 2,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: `0 8px 20px ${alpha(primaryColor, 0.4)}`,
                '&:hover': {
                  boxShadow: `0 12px 24px ${alpha(primaryColor, 0.5)}`,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <FormattedMessage id="gosafe-nav-login" defaultMessage="Đăng nhập" />
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default GosafeNavbar;
