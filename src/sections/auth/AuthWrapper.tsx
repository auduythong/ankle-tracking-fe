import { Grid, useMediaQuery, useTheme } from '@mui/material';
import authBg from 'assets/images/auth-bg.png';
import { ReactNode, useEffect, useState } from 'react';
import settings, { ENV } from 'settings';
import AuthCard from './AuthCard';
import { useIntl } from 'react-intl';

interface Props {
  children: ReactNode;
}

const AuthWrapper = ({ children }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const intl = useIntl();
  const locale = intl.locale;
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Giờ theo locale
      const timeStr = now.toLocaleTimeString(locale, {
        hour12: locale === 'en',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      // Ngày tháng theo locale
      const dateStr = now.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      setTime(timeStr);
      setDate(dateStr);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, [locale]);

  return (
    <Grid
      container
      sx={{
        minHeight: '100vh',
        // backgroundColor: '#f5f8ff' //
      }}
    >
      {!isMobile && (
        <Grid item md={6} className="p-5">
          <div
            style={{
              borderRadius: 12,
              backgroundImage: `url(${authBg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              position: 'relative',
              height: '100%'
            }}
          >
            {/* Đồng hồ */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                color: 'white',
                zIndex: 2,
                backdropFilter: 'blur(8px)',
                background: 'rgba(0,0,0,0.03)',
                borderRadius: 8,
                padding: '8px 24px',
                fontFamily: 'monospace',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 'bold', lineHeight: 1 }}>{time}</div>
              <div style={{ fontSize: 18 }}>{date}</div>
            </div>
          </div>
        </Grid>
      )}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6, md: 10 }
        }}
      >
        <AuthCard>
          <div className="text-center">
            <img
              src={settings.logoDefault}
              alt="VTC Telecom"
              style={{
                marginBottom: ENV === 'staging' ? '24px' : ''
              }}
            />
          </div>
          {children}
        </AuthCard>
      </Grid>
    </Grid>
  );
};

export default AuthWrapper;
