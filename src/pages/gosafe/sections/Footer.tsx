import { Box, Container, Divider, Grid, IconButton, Link, Stack, Typography, alpha, useTheme } from '@mui/material';
import facebookIcon from 'assets/icons/facebook.png';
import linkedinIcon from 'assets/icons/linkedin.png';
import youtubeIcon from 'assets/icons/youtube.png';
import { isMobile } from 'react-device-detect';
import { FormattedMessage } from 'react-intl';
import settings from 'settings';

interface FooterProps {
  isDark: boolean;
  primaryColor: string;
}

const Footer = ({ isDark, primaryColor }: FooterProps) => {
  const theme = useTheme();

  // Style constants

  const footerBg = isDark ? '#020617' : '#F8F9FC';
  const borderColor = isDark ? alpha('#fff', 0.1) : alpha('#000', 0.08);

  const socialLinks = [
    { icon: facebookIcon, href: 'https://www.facebook.com/vtctelecomjsc', label: 'Facebook' },
    { icon: youtubeIcon, href: 'https://www.youtube.com/@VTCTelecom-VNPT', label: 'Youtube' },
    { icon: linkedinIcon, href: 'https://www.linkedin.com/company/vtc-telecom/', label: 'Linkedin' }
  ];

  const footerLinks = {
    product: {
      titleKey: 'gosafe-footer-product',
      titleDefault: 'Sản phẩm',
      links: [
        { labelKey: 'gosafe-footer-product-features', labelDefault: 'Tính năng', href: '#features' },
        { labelKey: 'gosafe-footer-product-solutions', labelDefault: 'Giải pháp', href: '#solutions' },
        { labelKey: 'gosafe-footer-product-specs', labelDefault: 'Thông số', href: '#specifications' }
      ]
    },
    company: {
      titleKey: 'gosafe-footer-company',
      titleDefault: 'Công ty',
      links: [
        { labelKey: 'gosafe-footer-company-about', labelDefault: 'Về VTC Telecom', href: 'https://vtctelecom.com.vn/' },
        { labelKey: 'gosafe-footer-company-contact', labelDefault: 'Liên hệ', href: '#contact' }
      ]
    },
    support: {
      titleKey: 'gosafe-footer-support',
      titleDefault: 'Hỗ trợ',
      links: [{ labelKey: 'gosafe-footer-support-help', labelDefault: 'Trung tâm trợ giúp', href: '#' }]
    }
  };

  const bottomLinks = [
    { labelKey: 'gosafe-footer-privacy', labelDefault: 'Privacy Policy', href: '#' },
    { labelKey: 'gosafe-footer-terms', labelDefault: 'Terms of Service', href: '#' }
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: footerBg,
        pt: { xs: 8, md: 12 },
        pb: 4,
        borderTop: `1px solid ${borderColor}`,
        position: 'relative',
        overflow: 'hidden'
        // Background Pattern nhẹ
        // backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        // backgroundSize: '32px 32px'
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 6, md: 4 }}>
          {/* --- COL 1: Brand & Newsletter --- */}
          <Grid item xs={12} md={4}>
            <Stack spacing={4} sx={{ maxWidth: 320 }}>
              <Box>
                <img
                  src={settings.logoDefault}
                  alt="Logo"
                  style={{
                    width: isMobile ? 160 : 240,
                    objectFit: 'contain',
                    filter: isDark ? 'brightness(0) invert(0.8)' : 'none',
                    transition: 'filter 0.3s ease'
                  }}
                />
                <Typography sx={{ color: theme.palette.text.secondary, mt: 2, lineHeight: 1.6, fontSize: '0.95rem' }}>
                  <FormattedMessage
                    id="gosafe-footer-desc"
                    defaultMessage="Giải pháp quản lý, giám sát tù nhân và các đối tượng theo dõi đặc biệt. Công nghệ tiên tiến, bảo mật cao và hỗ trợ tái hòa nhập cộng đồng."
                  />
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* --- COL 2, 3, 4: Links --- */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <Grid item xs={6} sm={4} md={2} key={key}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
                <FormattedMessage id={section.titleKey} defaultMessage={section.titleDefault} />
              </Typography>
              <Stack spacing={1.5}>
                {section.links.map((link) => (
                  <Link
                    key={link.labelKey}
                    href={link.href}
                    underline="none"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: '0.95rem',
                      transition: 'all 0.2s',
                      display: 'inline-block',
                      '&:hover': {
                        color: primaryColor,
                        transform: 'translateX(4px)' // Hiệu ứng trượt nhẹ khi hover
                      }
                    }}
                  >
                    <FormattedMessage id={link.labelKey} defaultMessage={link.labelDefault} />
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}

          {/* --- COL 5: Socials (Mobile layout adjustment or keep separate) --- */}
          <Grid item xs={12} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}>
              <FormattedMessage id="gosafe-footer-social" defaultMessage="Kết nối" />
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              {socialLinks.map((social, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                    border: `1px solid ${borderColor}`,
                    borderRadius: 2,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

                    // --- Style cho thẻ IMG bên trong ---
                    '& img': {
                      width: 24,
                      height: 24,
                      objectFit: 'contain',
                      transition: 'all 0.3s'
                      // Nếu ở Dark Mode mà icon gốc màu đen, bạn có thể cần đảo ngược màu ngay từ đầu:
                    },

                    // --- HOVER EFFECT ---
                    '&:hover': {
                      borderColor: primaryColor,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 4px 12px ${alpha(primaryColor, 0.3)}`

                      // Quan trọng: Biến ảnh thành màu trắng khi hover
                    }
                  }}
                >
                  <img src={social.icon} alt={social.label} />
                </IconButton>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: borderColor }} />

        {/* --- BOTTOM BAR --- */}
        <Stack
          direction={{ xs: 'column', md: 'row' }} // Mobile: dọc, PC: ngang
          justifyContent="space-between"
          alignItems="center"
          spacing={{ xs: 2, md: 0 }} // Mobile: cách nhau 16px, PC: tự giãn cách
          sx={{
            width: '100%',
            textAlign: { xs: 'center', md: 'left' } // Mobile: canh giữa chữ cho đẹp
          }}
        >
          {/* Phần Copyright */}
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary
            }}
          >
            <FormattedMessage
              id="gosafe-footer-copyright"
              defaultMessage="© {year} VTC Telecom. All rights reserved."
              values={{ year: new Date().getFullYear() }}
            />
          </Typography>

          {/* Phần Links */}
          <Stack
            direction="row"
            flexWrap="wrap" // Cho phép các link tự xuống hàng nếu màn hình quá bé
            justifyContent={{ xs: 'center', md: 'flex-end' }} // Mobile: canh giữa các link
            gap={{ xs: 2, md: 4 }} // Dùng gap thay spacing để wrap không bị lỗi margin
            sx={{ order: { xs: 1, md: 2 } }}
          >
            {bottomLinks.map((item) => (
              <Link
                key={item.labelKey}
                href={item.href}
                underline="hover"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap' // Giữ text link luôn trên 1 dòng
                }}
              >
                <FormattedMessage id={item.labelKey} defaultMessage={item.labelDefault} />
              </Link>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
