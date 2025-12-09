import { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination
} from '@mui/material';
import MainCard from 'components/MainCard';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { voucherApi } from 'api/voucher.api';
import { enqueueSnackbar } from 'notistack';
import { SearchNormal1, Eye, RefreshCircle } from 'iconsax-react';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { useNavigate } from 'react-router-dom';

interface VoucherUsage {
  id: number;
  voucher_code: string;
  voucher_name: string;
  user_name: string;
  user_phone: string;
  location: string;
  used_at: string;
  duration: number;
  duration_unit: string;
  price: number;
  status: number;
}

const VoucherUsageHistory = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VoucherUsage[]>([]);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState({
    page: 1,
    record: 10,
    search: '',
    status: 2, // Only show used vouchers
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD')
  });

  const [dateRange, setDateRange] = useState({
    startDate: dayjs().subtract(30, 'day'),
    endDate: dayjs()
  });

  useEffect(() => {
    fetchUsageHistory();
  }, [currentSite, query.page, query.record]);

  const fetchUsageHistory = async () => {
    try {
      setLoading(true);
      const response = await voucherApi.findAllDetails({
        ...query,
        status: 2 // Only used vouchers
      });

      if (response.data.code === 0) {
        setTotal(response.data.data?.total || 0);
        setData(response.data.data?.data || []);
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

  const handleSearch = () => {
    setQuery({
      ...query,
      page: 1,
      startDate: dateRange.startDate.format('YYYY-MM-DD'),
      endDate: dateRange.endDate.format('YYYY-MM-DD')
    });
    fetchUsageHistory();
  };

  const handleReset = () => {
    setQuery({
      page: 1,
      record: 10,
      search: '',
      status: 2,
      startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD')
    });
    setDateRange({
      startDate: dayjs().subtract(30, 'day'),
      endDate: dayjs()
    });
    fetchUsageHistory();
  };

  const handleViewDetails = (id: number) => {
    navigate(`/wifi-premium/voucher/details/${id}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setQuery({ ...query, page: newPage + 1 });
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery({ ...query, record: parseInt(event.target.value, 10), page: 1 });
  };

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Typography variant="h4">{intl.formatMessage({ id: 'voucher-usage-history' })}</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {intl.formatMessage({ id: 'usage-history-description' })}
        </Typography>
      </Grid>

      {/* Filters */}
      <Grid item xs={12}>
        <MainCard>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small"
                placeholder={intl.formatMessage({ id: 'search-voucher-code-name' })}
                value={query.search}
                onChange={(e) => setQuery({ ...query, search: e.target.value })}
                InputProps={{
                  startAdornment: <SearchNormal1 size={20} style={{ marginRight: 8 }} />
                }}
                sx={{ flex: 1 }}
              />
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
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" startIcon={<RefreshCircle />} onClick={handleReset}>
                {intl.formatMessage({ id: 'reset' })}
              </Button>
              <Button variant="contained" startIcon={<SearchNormal1 />} onClick={handleSearch}>
                {intl.formatMessage({ id: 'search' })}
              </Button>
            </Stack>
          </Stack>
        </MainCard>
      </Grid>

      {/* Summary Stats */}
      <Grid item xs={12} sm={4}>
        <MainCard>
          <Box textAlign="center">
            <Typography variant="h3" color="primary">
              {total.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {intl.formatMessage({ id: 'total-used-vouchers' })}
            </Typography>
          </Box>
        </MainCard>
      </Grid>

      <Grid item xs={12} sm={4}>
        <MainCard>
          <Box textAlign="center">
            <Typography variant="h3" color="success.main">
              {data.length > 0 ? formatCurrency(data.reduce((sum, item) => sum + item.price, 0)) : formatCurrency(0)}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {intl.formatMessage({ id: 'total-revenue-period' })}
            </Typography>
          </Box>
        </MainCard>
      </Grid>

      <Grid item xs={12} sm={4}>
        <MainCard>
          <Box textAlign="center">
            <Typography variant="h3" color="info.main">
              {new Set(data.map((item) => item.user_phone)).size}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {intl.formatMessage({ id: 'unique-users' })}
            </Typography>
          </Box>
        </MainCard>
      </Grid>

      {/* Usage History Table */}
      <Grid item xs={12}>
        <MainCard>
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{intl.formatMessage({ id: 'voucher-code' })}</TableCell>
                  <TableCell>{intl.formatMessage({ id: 'voucher-name' })}</TableCell>
                  <TableCell>{intl.formatMessage({ id: 'user-name' })}</TableCell>
                  <TableCell>{intl.formatMessage({ id: 'phone-number' })}</TableCell>
                  <TableCell>{intl.formatMessage({ id: 'location' })}</TableCell>
                  <TableCell align="center">{intl.formatMessage({ id: 'duration' })}</TableCell>
                  <TableCell align="right">{intl.formatMessage({ id: 'price' })}</TableCell>
                  <TableCell>{intl.formatMessage({ id: 'used-date' })}</TableCell>
                  <TableCell align="center">{intl.formatMessage({ id: 'actions' })}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      {intl.formatMessage({ id: 'loading' })}
                    </TableCell>
                  </TableRow>
                ) : data.length > 0 ? (
                  data.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="500">
                          {row.voucher_code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.voucher_name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.user_name || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.user_phone || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{row.location || '-'}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          {row.duration} {row.duration_unit}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="500">
                          {formatCurrency(row.price)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{dayjs(row.used_at).format('DD/MM/YYYY HH:mm')}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={() => handleViewDetails(row.id)}>
                          <Eye size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      {intl.formatMessage({ id: 'no-data' })}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={total}
            rowsPerPage={query.record}
            page={query.page - 1}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default VoucherUsageHistory;
