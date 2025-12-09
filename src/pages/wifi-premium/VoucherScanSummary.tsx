import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { voucherApi } from 'api/voucher.api';
import { enqueueSnackbar } from 'notistack';
import { ScanBarcode, TicketDiscount, TrendUp, Eye } from 'iconsax-react';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';

interface ScanSummaryData {
  total_scans: number;
  successful_scans: number;
  failed_scans: number;
  unique_users: number;
  scan_details: Array<{
    date: string;
    total: number;
    successful: number;
    failed: number;
  }>;
  top_locations: Array<{
    location: string;
    scan_count: number;
  }>;
}

const VoucherScanSummary = () => {
  const intl = useIntl();
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(7, 'day'),
    endDate: dayjs()
  });
  const [summaryData, setSummaryData] = useState<ScanSummaryData>({
    total_scans: 0,
    successful_scans: 0,
    failed_scans: 0,
    unique_users: 0,
    scan_details: [],
    top_locations: []
  });

  useEffect(() => {
    fetchScanSummary();
  }, [currentSite]);

  const fetchScanSummary = async () => {
    try {
      setLoading(true);
      const response = await voucherApi.scanSummary({
        startDate: dateRange.startDate.format('YYYY-MM-DD'),
        endDate: dateRange.endDate.format('YYYY-MM-DD')
      });

      if (response.data.code === 0) {
        setSummaryData(response.data.data);
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

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card sx={{ height: '100%', boxShadow: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mt: 1 }}>
              {value.toLocaleString()}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
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

  const successRate = summaryData.total_scans > 0 ? ((summaryData.successful_scans / summaryData.total_scans) * 100).toFixed(1) : 0;

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Typography variant="h4">{intl.formatMessage({ id: 'voucher-scan-summary' })}</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {intl.formatMessage({ id: 'scan-summary-description' })}
        </Typography>
      </Grid>

      {/* Date Range Filter */}
      <Grid item xs={12}>
        <MainCard>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
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
                }
              }}
              slotProps={{ textField: { size: 'small' } }}
            />
            <Button variant="contained" onClick={fetchScanSummary} disabled={loading}>
              {intl.formatMessage({ id: 'apply' })}
            </Button>
          </Stack>
        </MainCard>
      </Grid>

      {/* Statistics Cards */}
      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title={intl.formatMessage({ id: 'total-scans' })}
          value={summaryData.total_scans}
          icon={<ScanBarcode size={32} color="#1976d2" />}
          color="#1976d2"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title={intl.formatMessage({ id: 'successful-scans' })}
          value={summaryData.successful_scans}
          icon={<TicketDiscount size={32} color="#2e7d32" />}
          color="#2e7d32"
          subtitle={`${successRate}% ${intl.formatMessage({ id: 'success-rate' })}`}
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title={intl.formatMessage({ id: 'failed-scans' })}
          value={summaryData.failed_scans}
          icon={<TrendUp size={32} color="#d32f2f" />}
          color="#d32f2f"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={3}>
        <StatCard
          title={intl.formatMessage({ id: 'unique-users' })}
          value={summaryData.unique_users}
          icon={<Eye size={32} color="#9c27b0" />}
          color="#9c27b0"
        />
      </Grid>

      {/* Daily Scan Details */}
      <Grid item xs={12} lg={8}>
        <MainCard title={intl.formatMessage({ id: 'daily-scan-details' })}>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{intl.formatMessage({ id: 'date' })}</TableCell>
                  <TableCell align="right">{intl.formatMessage({ id: 'total-scans' })}</TableCell>
                  <TableCell align="right">{intl.formatMessage({ id: 'successful' })}</TableCell>
                  <TableCell align="right">{intl.formatMessage({ id: 'failed' })}</TableCell>
                  <TableCell align="right">{intl.formatMessage({ id: 'success-rate' })}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {summaryData.scan_details.length > 0 ? (
                  summaryData.scan_details.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{dayjs(row.date).format('DD/MM/YYYY')}</TableCell>
                      <TableCell align="right">{row.total.toLocaleString()}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {row.successful.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        {row.failed.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">{row.total > 0 ? ((row.successful / row.total) * 100).toFixed(1) : 0}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {intl.formatMessage({ id: 'no-data' })}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>

      {/* Top Locations */}
      <Grid item xs={12} lg={4}>
        <MainCard title={intl.formatMessage({ id: 'top-scan-locations' })}>
          <Stack spacing={2}>
            {summaryData.top_locations.length > 0 ? (
              summaryData.top_locations.map((location, index) => (
                <Box key={index}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{location.location}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {location.scan_count.toLocaleString()}
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
                        width: `${(location.scan_count / summaryData.top_locations[0].scan_count) * 100}%`,
                        height: '100%',
                        backgroundColor: '#1976d2'
                      }}
                    />
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" align="center">
                {intl.formatMessage({ id: 'no-data' })}
              </Typography>
            )}
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default VoucherScanSummary;
