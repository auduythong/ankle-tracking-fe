import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import MainCard from 'components/MainCard';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { LineChart } from 'components/organisms/chart';
import { Crown1, Barcode, ShieldTick, TrendUp } from 'iconsax-react';
import dayjs from 'dayjs';
import { premiumOrderApi } from 'api/voucher.api';
import { enqueueSnackbar } from 'notistack';

interface PremiumStats {
  totalRevenue: number;
  activeSubscriptions: number;
  voucherRevenue: number;
  passpointRevenue: number;
}

interface RevenueChart {
  categories: string[];
  series: { name: string; data: number[] }[];
}

const PremiumOverview = () => {
  const intl = useIntl();
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const [stats, setStats] = useState<PremiumStats>({
    totalRevenue: 0,
    activeSubscriptions: 0,
    voucherRevenue: 0,
    passpointRevenue: 0
  });

  const [revenueChart, setRevenueChart] = useState<RevenueChart>({
    categories: [],
    series: []
  });

  useEffect(() => {
    // TODO: Replace with actual API call
    loadPremiumData();
  }, [currentSite]);

  const loadPremiumData = async () => {
    try {
      const endDate = dayjs().format('YYYY-MM-DD');
      const startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');

      const response = await premiumOrderApi.getStatistics({
        type: 'summary',
        startDate,
        endDate
      });

      if (response.data.code === 0) {
        const data = response.data.data;

        setStats({
          totalRevenue: data?.total_revenue || 0,
          activeSubscriptions: data?.active_subscriptions || 0,
          voucherRevenue: data?.voucher_revenue || 0,
          passpointRevenue: data?.passpoint_revenue || 0
        });

        setRevenueChart({
          categories: data?.revenue_chart?.categories || getLast7Days(),
          series: data?.revenue_chart?.series || []
        });
      } else {
        enqueueSnackbar(response.data.message || intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
      }
    } catch (err) {
      console.error('Failed to load premium data:', err);
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      days.push(dayjs().subtract(i, 'day').format('DD/MM'));
    }
    return days;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const StatCard = ({ title, value, icon, color, isRevenue = false }: any) => (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mt: 1 }}>
              {isRevenue ? formatCurrency(value) : value.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '12px',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Grid container spacing={3}>
      {/* Statistics Cards */}
      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title={intl.formatMessage({ id: 'total-revenue' })}
          value={stats.totalRevenue}
          icon={<TrendUp size={32} color="#1976d2" />}
          color="#1976d2"
          isRevenue
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title={intl.formatMessage({ id: 'active-subscriptions' })}
          value={stats.activeSubscriptions}
          icon={<Crown1 size={32} color="#9c27b0" />}
          color="#9c27b0"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title={intl.formatMessage({ id: 'voucher-revenue' })}
          value={stats.voucherRevenue}
          icon={<Barcode size={32} color="#2e7d32" />}
          color="#2e7d32"
          isRevenue
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title={intl.formatMessage({ id: 'passpoint-revenue' })}
          value={stats.passpointRevenue}
          icon={<ShieldTick size={32} color="#ed6c02" />}
          color="#ed6c02"
          isRevenue
        />
      </Grid>

      {/* Revenue Comparison Chart */}
      <Grid item xs={12}>
        <MainCard>
          <LineChart
            title={intl.formatMessage({ id: 'revenue-comparison' })}
            categories={revenueChart.categories}
            series={revenueChart.series}
            chartOptions={{
              chart: { type: 'line', height: 400 },
              stroke: { curve: 'smooth', width: 3 },
              colors: ['#2e7d32', '#ed6c02'],
              tooltip: {
                y: {
                  formatter: (val: number) => formatCurrency(val)
                }
              }
            }}
          />
        </MainCard>
      </Grid>

      {/* Service Distribution */}
      <Grid item xs={12} lg={6}>
        <MainCard>
          <Typography variant="h5" gutterBottom>
            {intl.formatMessage({ id: 'service-distribution' })}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Voucher Services</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {((stats.voucherRevenue / stats.totalRevenue) * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  backgroundColor: '#e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    width: `${(stats.voucherRevenue / stats.totalRevenue) * 100}%`,
                    height: '100%',
                    backgroundColor: '#2e7d32'
                  }}
                />
              </Box>
            </Box>

            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Passpoint Services</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {((stats.passpointRevenue / stats.totalRevenue) * 100).toFixed(1)}%
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  backgroundColor: '#e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    width: `${(stats.passpointRevenue / stats.totalRevenue) * 100}%`,
                    height: '100%',
                    backgroundColor: '#ed6c02'
                  }}
                />
              </Box>
            </Box>
          </Box>
        </MainCard>
      </Grid>

      {/* Recent Activity Placeholder */}
      <Grid item xs={12} lg={6}>
        <MainCard>
          <Typography variant="h5" gutterBottom>
            {intl.formatMessage({ id: 'recent-orders' })}
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
              Coming soon...
            </Typography>
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default PremiumOverview;
