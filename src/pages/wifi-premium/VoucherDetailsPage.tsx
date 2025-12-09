import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Box, Chip, Button, Divider, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import { useIntl } from 'react-intl';
import { agentVoucherApi } from 'api/voucher.api';
import { enqueueSnackbar } from 'notistack';
import { ArrowLeft, TicketDiscount, Calendar, User, DollarCircle, Location } from 'iconsax-react';
import dayjs from 'dayjs';

interface VoucherDetail {
  id: number;
  voucher_code: string;
  voucher_name: string;
  description: string;
  price: number;
  duration: number;
  duration_unit: string;
  status: number;
  created_at: string;
  expired_at: string;
  used_at?: string;
  user_name?: string;
  user_phone?: string;
  location?: string;
  total_used: number;
  total_available: number;
}

const VoucherDetailsPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [voucherDetail, setVoucherDetail] = useState<VoucherDetail | null>(null);

  useEffect(() => {
    if (id) {
      fetchVoucherDetails();
    }
  }, [id]);

  const fetchVoucherDetails = async () => {
    try {
      setLoading(true);
      const response = await agentVoucherApi.getVoucherDetails({ id });

      if (response.data.code === 0) {
        setVoucherDetail(response.data.data);
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

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return 'success';
      case 2:
        return 'warning';
      case 3:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 1:
        return intl.formatMessage({ id: 'active' });
      case 2:
        return intl.formatMessage({ id: 'used' });
      case 3:
        return intl.formatMessage({ id: 'expired' });
      default:
        return intl.formatMessage({ id: 'inactive' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const InfoRow = ({ icon, label, value }: any) => (
    <Box display="flex" alignItems="center" gap={2} mb={2}>
      <Box
        sx={{
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="body2" color="textSecondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="500">
          {value || '-'}
        </Typography>
      </Box>
    </Box>
  );

  if (loading || !voucherDetail) {
    return (
      <MainCard>
        <Typography align="center">{intl.formatMessage({ id: 'loading' })}</Typography>
      </MainCard>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button variant="outlined" onClick={() => navigate(-1)} startIcon={<ArrowLeft />}>
            {intl.formatMessage({ id: 'back' })}
          </Button>
          <Typography variant="h4">{intl.formatMessage({ id: 'voucher-details' })}</Typography>
        </Box>
      </Grid>

      {/* Voucher Information */}
      <Grid item xs={12} md={8}>
        <MainCard title={intl.formatMessage({ id: 'voucher-information' })}>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5">{voucherDetail.voucher_name}</Typography>
              <Chip label={getStatusLabel(voucherDetail.status)} color={getStatusColor(voucherDetail.status)} />
            </Box>

            <Divider />

            <InfoRow
              icon={<TicketDiscount size={24} />}
              label={intl.formatMessage({ id: 'voucher-code' })}
              value={voucherDetail.voucher_code}
            />

            <InfoRow
              icon={<DollarCircle size={24} />}
              label={intl.formatMessage({ id: 'price' })}
              value={formatCurrency(voucherDetail.price)}
            />

            <InfoRow
              icon={<Calendar size={24} />}
              label={intl.formatMessage({ id: 'duration' })}
              value={`${voucherDetail.duration} ${voucherDetail.duration_unit}`}
            />

            <InfoRow
              icon={<Calendar size={24} />}
              label={intl.formatMessage({ id: 'created-date' })}
              value={dayjs(voucherDetail.created_at).format('DD/MM/YYYY HH:mm')}
            />

            <InfoRow
              icon={<Calendar size={24} />}
              label={intl.formatMessage({ id: 'expired-date' })}
              value={dayjs(voucherDetail.expired_at).format('DD/MM/YYYY HH:mm')}
            />

            {voucherDetail.description && (
              <>
                <Divider />
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {intl.formatMessage({ id: 'description' })}
                  </Typography>
                  <Typography variant="body1">{voucherDetail.description}</Typography>
                </Box>
              </>
            )}
          </Stack>
        </MainCard>
      </Grid>

      {/* Usage Statistics */}
      <Grid item xs={12} md={4}>
        <MainCard title={intl.formatMessage({ id: 'usage-statistics' })}>
          <Stack spacing={2}>
            <Card sx={{ backgroundColor: '#e3f2fd' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {intl.formatMessage({ id: 'total-used' })}
                </Typography>
                <Typography variant="h4" color="primary">
                  {voucherDetail.total_used || 0}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ backgroundColor: '#e8f5e9' }}>
              <CardContent>
                <Typography variant="body2" color="textSecondary">
                  {intl.formatMessage({ id: 'total-available' })}
                </Typography>
                <Typography variant="h4" color="success.main">
                  {voucherDetail.total_available || 0}
                </Typography>
              </CardContent>
            </Card>

            {voucherDetail.used_at && (
              <Box>
                <Divider sx={{ mb: 2 }} />
                <InfoRow
                  icon={<User size={20} />}
                  label={intl.formatMessage({ id: 'user-name' })}
                  value={voucherDetail.user_name}
                />
                <InfoRow
                  icon={<User size={20} />}
                  label={intl.formatMessage({ id: 'phone-number' })}
                  value={voucherDetail.user_phone}
                />
                <InfoRow
                  icon={<Location size={20} />}
                  label={intl.formatMessage({ id: 'location' })}
                  value={voucherDetail.location}
                />
                <InfoRow
                  icon={<Calendar size={20} />}
                  label={intl.formatMessage({ id: 'used-date' })}
                  value={dayjs(voucherDetail.used_at).format('DD/MM/YYYY HH:mm')}
                />
              </Box>
            )}
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default VoucherDetailsPage;
