import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Skeleton, alpha } from '@mui/material';
import { keyframes } from '@emotion/react';
import dayjs from 'dayjs';
import { FormattedMessage } from 'react-intl';
import useConfig from 'hooks/useConfig';
import emptyBoxImg from 'assets/images/empty-box.png';
import { Top3Data } from 'hooks/useHandleDataLoginV2';

interface TopMetricsProps {
  data: Top3Data;
  loading?: boolean;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const TopMetrics: React.FC<TopMetricsProps> = ({ data, loading = false }) => {
  const { i18n } = useConfig();
  const [tab, setTab] = useState(0);

  if (loading) {
    // Hiển thị Skeleton khi loading
    return (
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3 }}>
        {/* Header */}
        <Skeleton variant="text" width={180} height={28} sx={{ mb: 2, mx: 'auto' }} />

        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center' }}>
          <Skeleton variant="rounded" width={'33%'} height={46} />
          <Skeleton variant="rounded" width={'33%'} height={46} />
          <Skeleton variant="rounded" width={'33%'} height={46} />
        </Box>

        {/* Metric Rows */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                borderRadius: 3
              }}
            >
              {/* Rank circle */}
              <Skeleton variant="circular" width={34} height={34} />

              {/* Date */}
              <Skeleton variant="text" width={100} height={24} />

              {/* Value */}
              <Skeleton variant="text" width={60} height={24} sx={{ marginLeft: 'auto' }} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  const formatDate = (d: string) => dayjs(d).format(i18n === 'vi' ? 'DD/MM/YYYY' : 'MM/DD/YYYY');

  const metrics = {
    clicks: [...data?.clicks].sort((a, b) => (b.clicks ?? 0) - (a.clicks ?? 0)).slice(0, 3),
    impressions: [...data.impressions].sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0)).slice(0, 3),
    new_users: [...data.new_customers].sort((a, b) => (b.new_users ?? 0) - (a.new_users ?? 0)).slice(0, 3)
  };

  const currentType = ['clicks', 'impressions', 'new_users'][tab] as keyof typeof metrics;

  const currentData = metrics[currentType];
  return (
    <Box
      sx={{
        bgcolor: 'background.paper'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          justifyContent: 'center',
          mb: 2,
          color: 'primary.main'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
          TOP 3 PERFORMANCE
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.secondary',
            transition: 'all 0.25s',
            '&.Mui-selected': {
              color: 'primary.main',
              backgroundColor: 'rgba(33,150,243,0.1)'
            }
          },
          '& .MuiTabs-indicator': { display: 'none' },
          mb: 2
        }}
      >
        <Tab label={<FormattedMessage id="click" />} />
        <Tab label={<FormattedMessage id="impression" />} />
        <Tab label={<FormattedMessage id="new-user" />} />
      </Tabs>

      {/* Metric Cards */}
      <Box
        sx={{
          animation: `${fadeIn} 0.3s ease-in-out`,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5
        }}
      >
        {currentData.length === 0 ? (
          <Box className="h-[250px] flex flex-col items-center justify-center gap-5">
            <img src={emptyBoxImg} width={160} alt="No data" />
            <Box className="flex flex-col items-center">
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                <FormattedMessage id="no-data" defaultMessage="No Data" />
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <FormattedMessage id="insufficient-data-message" defaultMessage="Insufficient data to render chart" />
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              animation: `${fadeIn} 0.3s ease-in-out`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            {currentData.map((item, i) => (
              <Box
                key={i}
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 3,

                  bgcolor:
                    i === 0
                      ? alpha(theme.palette.primary.main, 0.08)
                      : theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.06)
                      : theme.palette.grey[50],

                  border:
                    i === 0
                      ? `1.5px solid ${alpha(theme.palette.primary.main, 0.5)}`
                      : `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.grey[700], 0.5) : 'rgba(0,0,0,0.06)'}`,

                  boxShadow:
                    i === 0
                      ? theme.palette.mode === 'dark'
                        ? `0 3px 10px ${alpha(theme.palette.primary.main, 0.25)}`
                        : '0 3px 10px rgba(33,150,243,0.15)'
                      : 'none',

                  transition: 'transform 0.25s',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: theme.palette.mode === 'dark' ? '0 6px 16px rgba(255,255,255,0.08)' : '0 6px 16px rgba(0,0,0,0.08)'
                  }
                })}
              >
                {/* Rank */}
                <Box
                  sx={(theme) => ({
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    bgcolor: i === 0 ? 'primary.main' : theme.palette.grey[theme.palette.mode === 'dark' ? 700 : 300],
                    color: i === 0 ? '#fff' : theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 15
                  })}
                >
                  {i + 1}
                </Box>

                {/* Date */}
                <Typography
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    fontWeight: 500,
                    color: 'text.primary'
                  }}
                >
                  {formatDate(item.date)}
                </Typography>

                {/* Value */}
                <Typography
                  sx={{
                    minWidth: 90,
                    textAlign: 'right',
                    fontWeight: i === 0 ? 700 : 500,
                    fontSize: 16,
                    color: i === 0 ? 'primary.main' : 'text.secondary'
                  }}
                >
                  {(item[currentType] as number)?.toLocaleString() ?? 0}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TopMetrics;
