import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Stack, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import MainCard from 'components/MainCard';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { agentVoucherApi } from 'api/voucher.api';
import { enqueueSnackbar } from 'notistack';
import { LineChart, BarChart } from 'components/organisms/chart';
import { TrendUp, DollarCircle, TicketDiscount, People } from 'iconsax-react';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';

interface AnalyticsData {
  total_revenue: number;
  total_vouchers: number;
  total_used: number;
  total_agents: number;
  revenue_by_agent: Array<{
    agent_name: string;
    revenue: number;
    voucher_count: number;
  }>;
  revenue_trend: {
    categories: string[];
    data: number[];
  };
  usage_rate: {
    used: number;
    unused: number;
    expired: number;
  };
}

const VoucherAnalytics = () => {
  const intl = useIntl();
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('7days');
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(7, 'day'),
    endDate: dayjs()
  });
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    total_revenue: 0,
    total_vouchers: 0,
    total_used: 0,
    total_agents: 0,
    revenue_by_agent: [],
    revenue_trend: {
      categories: [],
      data: []
    },
    usage_rate: {
      used: 0,
      unused: 0,
      expired: 0
    }
  });

  useEffect(() => {
    fetchAnalytics();
  }, [currentSite, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      let params: any = {};

      if (period === 'custom') {
        params = {
          startDate: dateRange.startDate.format('YYYY-MM-DD'),
          endDate: dateRange.endDate.format('YYYY-MM-DD')
        };
      } else {
        params = { period };
      }
      console.log(loading);
      const response = await agentVoucherApi.getStatistics(params);

      if (response.data.code === 0) {
        setAnalytics(response.data.data);
      } else {
        enqueueSnackbar(response.data.message || intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
      }
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
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

  const usageRate = analytics.total_vouchers > 0 ? ((analytics.total_used / analytics.total_vouchers) * 100).toFixed(1) : 0;

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4">{intl.formatMessage({ id: 'voucher-analytics' })}</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {intl.formatMessage({ id: 'voucher-analytics-description' })}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>{intl.formatMessage({ id: 'period' })}</InputLabel>
              <Select value={period} onChange={(e) => setPeriod(e.target.value)} label={intl.formatMessage({ id: 'period' })}>
                <MenuItem value="7days">{intl.formatMessage({ id: 'last-7-days' })}</MenuItem>
                <MenuItem value="30days">{intl.formatMessage({ id: 'last-30-days' })}</MenuItem>
                <MenuItem value="90days">{intl.formatMessage({ id: 'last-90-days' })}</MenuItem>
                <MenuItem value="custom">{intl.formatMessage({ id: 'custom' })}</MenuItem>
              </Select>
            </FormControl>
            {period === 'custom' && (
              <>
                <DatePicker
                  label={intl.formatMessage({ id: 'start-date' })}
                  value={dateRange.startDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      setDateRange({ ...dateRange, startDate: newValue });
                    }
                  }}
                  slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                  label={intl.formatMessage({ id: 'end-date' })}
                  value={dateRange.endDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      setDateRange({ ...dateRange, endDate: newValue });
                      fetchAnalytics();
                    }
                  }}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </>
            )}
          </Stack>
        </Box>
      </Grid>

      {/* Statistics Cards */}
      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title={intl.formatMessage({ id: 'total-revenue' })}
          value={analytics.total_revenue}
          icon={<DollarCircle size={32} color="#1976d2" />}
          color="#1976d2"
          isRevenue
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title={intl.formatMessage({ id: 'total-vouchers' })}
          value={analytics.total_vouchers}
          icon={<TicketDiscount size={32} color="#2e7d32" />}
          color="#2e7d32"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title={intl.formatMessage({ id: 'vouchers-used' })}
          value={analytics.total_used}
          icon={<TrendUp size={32} color="#ed6c02" />}
          color="#ed6c02"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title={intl.formatMessage({ id: 'total-agents' })}
          value={analytics.total_agents}
          icon={<People size={32} color="#9c27b0" />}
          color="#9c27b0"
        />
      </Grid>

      {/* Revenue Trend Chart */}
      <Grid item xs={12} lg={8}>
        <MainCard>
          <LineChart
            title={intl.formatMessage({ id: 'revenue-trend' })}
            categories={analytics.revenue_trend.categories}
            series={[
              {
                name: intl.formatMessage({ id: 'revenue' }),
                data: analytics.revenue_trend.data
              }
            ]}
            chartOptions={{
              chart: { type: 'line', height: 350 },
              stroke: { curve: 'smooth', width: 3 },
              colors: ['#1976d2'],
              tooltip: {
                y: {
                  formatter: (val: number) => formatCurrency(val)
                }
              },
              xaxis: {
                categories: analytics.revenue_trend.categories
              }
            }}
          />
        </MainCard>
      </Grid>

      {/* Usage Rate Distribution */}
      <Grid item xs={12} lg={4}>
        <MainCard title={intl.formatMessage({ id: 'usage-distribution' })}>
          <Stack spacing={3}>
            <Box textAlign="center">
              <Typography variant="h2" color="primary">
                {usageRate}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {intl.formatMessage({ id: 'overall-usage-rate' })}
              </Typography>
            </Box>

            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{intl.formatMessage({ id: 'used' })}</Typography>
                <Typography variant="body2" fontWeight="bold" color="success.main">
                  {analytics.usage_rate.used.toLocaleString()}
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
                    width: `${(analytics.usage_rate.used / analytics.total_vouchers) * 100}%`,
                    height: '100%',
                    backgroundColor: '#2e7d32'
                  }}
                />
              </Box>
            </Box>

            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{intl.formatMessage({ id: 'unused' })}</Typography>
                <Typography variant="body2" fontWeight="bold" color="info.main">
                  {analytics.usage_rate.unused.toLocaleString()}
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
                    width: `${(analytics.usage_rate.unused / analytics.total_vouchers) * 100}%`,
                    height: '100%',
                    backgroundColor: '#1976d2'
                  }}
                />
              </Box>
            </Box>

            <Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">{intl.formatMessage({ id: 'expired' })}</Typography>
                <Typography variant="body2" fontWeight="bold" color="error.main">
                  {analytics.usage_rate.expired.toLocaleString()}
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
                    width: `${(analytics.usage_rate.expired / analytics.total_vouchers) * 100}%`,
                    height: '100%',
                    backgroundColor: '#d32f2f'
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </MainCard>
      </Grid>

      {/* Revenue by Agent */}
      <Grid item xs={12}>
        <MainCard>
          <BarChart
            title={intl.formatMessage({ id: 'revenue-by-agent' })}
            titleX={intl.formatMessage({ id: 'agent-name' })}
            titleY={intl.formatMessage({ id: 'revenue' })}
            categories={analytics.revenue_by_agent.map((agent) => agent.agent_name)}
            series={[
              {
                name: intl.formatMessage({ id: 'revenue' }),
                data: analytics.revenue_by_agent.map((agent) => agent.revenue)
              },
              {
                name: intl.formatMessage({ id: 'voucher-count' }),
                data: analytics.revenue_by_agent.map((agent) => agent.voucher_count)
              }
            ]}
            barChartOptions={{
              chart: { type: 'bar', height: 350 },
              plotOptions: {
                bar: {
                  horizontal: false,
                  columnWidth: '55%'
                }
              },
              colors: ['#1976d2', '#2e7d32'],
              dataLabels: {
                enabled: false
              },
              stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
              },
              xaxis: {
                categories: analytics.revenue_by_agent.map((agent) => agent.agent_name)
              },
              yaxis: [
                {
                  title: {
                    text: intl.formatMessage({ id: 'revenue' })
                  },
                  labels: {
                    formatter: (val: number) => formatCurrency(val)
                  }
                },
                {
                  opposite: true,
                  title: {
                    text: intl.formatMessage({ id: 'voucher-count' })
                  }
                }
              ],
              tooltip: {
                y: {
                  formatter: (val: number, opts: any) => {
                    if (opts.seriesIndex === 0) {
                      return formatCurrency(val);
                    }
                    return val.toLocaleString();
                  }
                }
              }
            }}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default VoucherAnalytics;
