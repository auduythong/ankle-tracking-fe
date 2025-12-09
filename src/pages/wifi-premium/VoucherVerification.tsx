import { useState } from 'react';
import { Grid, TextField, Button, Typography, Box, Chip, Alert, Stack, Divider } from '@mui/material';
import MainCard from 'components/MainCard';
import { useIntl } from 'react-intl';
import { voucherApi } from 'api/voucher.api';
import { enqueueSnackbar } from 'notistack';
import { ScanBarcode, TicketDiscount, User, Calendar, DollarCircle, InfoCircle } from 'iconsax-react';
import dayjs from 'dayjs';

interface VerificationResult {
  valid: boolean;
  voucher_code: string;
  voucher_name: string;
  status: number;
  price: number;
  duration: number;
  duration_unit: string;
  expired_at: string;
  user_name?: string;
  user_phone?: string;
  used_at?: string;
  message?: string;
}

const VoucherVerification = () => {
  const intl = useIntl();
  const [voucherCode, setVoucherCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!voucherCode.trim()) {
      enqueueSnackbar(intl.formatMessage({ id: 'please-enter-voucher-code' }), {
        variant: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await voucherApi.verifyCode({ voucher_code: voucherCode.trim() });

      if (response.data.code === 0) {
        setResult(response.data.data);
        if (response.data.data.valid) {
          enqueueSnackbar(intl.formatMessage({ id: 'voucher-valid' }), {
            variant: 'success'
          });
        } else {
          enqueueSnackbar(response.data.data.message || intl.formatMessage({ id: 'voucher-invalid' }), {
            variant: 'error'
          });
        }
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

  const handleReset = () => {
    setVoucherCode('');
    setResult(null);
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

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Typography variant="h4">{intl.formatMessage({ id: 'voucher-verification' })}</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {intl.formatMessage({ id: 'verify-voucher-code-validity' })}
        </Typography>
      </Grid>

      {/* Verification Form */}
      <Grid item xs={12} md={6}>
        <MainCard>
          <Stack spacing={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <ScanBarcode size={24} color="#1976d2" />
              <Typography variant="h6">{intl.formatMessage({ id: 'enter-voucher-code' })}</Typography>
            </Box>

            <TextField
              fullWidth
              label={intl.formatMessage({ id: 'voucher-code' })}
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder={intl.formatMessage({ id: 'enter-voucher-code-placeholder' })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleVerify();
                }
              }}
              disabled={loading}
            />

            <Box display="flex" gap={2}>
              <Button fullWidth variant="contained" onClick={handleVerify} disabled={loading || !voucherCode.trim()}>
                {intl.formatMessage({ id: 'verify' })}
              </Button>
              <Button fullWidth variant="outlined" onClick={handleReset} disabled={loading}>
                {intl.formatMessage({ id: 'reset' })}
              </Button>
            </Box>

            <Alert severity="info" icon={<InfoCircle />}>
              {intl.formatMessage({ id: 'voucher-verification-note' })}
            </Alert>
          </Stack>
        </MainCard>
      </Grid>

      {/* Verification Result */}
      {result && (
        <Grid item xs={12} md={6}>
          <MainCard>
            <Stack spacing={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{intl.formatMessage({ id: 'verification-result' })}</Typography>
                <Chip
                  label={result.valid ? intl.formatMessage({ id: 'valid' }) : intl.formatMessage({ id: 'invalid' })}
                  color={result.valid ? 'success' : 'error'}
                />
              </Box>

              {result.valid ? (
                <>
                  <Divider />

                  <InfoRow
                    icon={<TicketDiscount size={24} />}
                    label={intl.formatMessage({ id: 'voucher-code' })}
                    value={result.voucher_code}
                  />

                  <InfoRow
                    icon={<TicketDiscount size={24} />}
                    label={intl.formatMessage({ id: 'voucher-name' })}
                    value={result.voucher_name}
                  />

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
                      <InfoCircle size={24} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" color="textSecondary">
                        {intl.formatMessage({ id: 'status' })}
                      </Typography>
                      <Chip label={getStatusLabel(result.status)} color={getStatusColor(result.status)} size="small" />
                    </Box>
                  </Box>

                  <InfoRow
                    icon={<DollarCircle size={24} />}
                    label={intl.formatMessage({ id: 'price' })}
                    value={formatCurrency(result.price)}
                  />

                  <InfoRow
                    icon={<Calendar size={24} />}
                    label={intl.formatMessage({ id: 'duration' })}
                    value={`${result.duration} ${result.duration_unit}`}
                  />

                  <InfoRow
                    icon={<Calendar size={24} />}
                    label={intl.formatMessage({ id: 'expired-date' })}
                    value={dayjs(result.expired_at).format('DD/MM/YYYY HH:mm')}
                  />

                  {result.used_at && (
                    <>
                      <Divider />
                      <Typography variant="subtitle2" color="textSecondary">
                        {intl.formatMessage({ id: 'usage-information' })}
                      </Typography>

                      <InfoRow icon={<User size={24} />} label={intl.formatMessage({ id: 'user-name' })} value={result.user_name} />

                      <InfoRow icon={<User size={24} />} label={intl.formatMessage({ id: 'phone-number' })} value={result.user_phone} />

                      <InfoRow
                        icon={<Calendar size={24} />}
                        label={intl.formatMessage({ id: 'used-date' })}
                        value={dayjs(result.used_at).format('DD/MM/YYYY HH:mm')}
                      />
                    </>
                  )}
                </>
              ) : (
                <Alert severity="error">{result.message || intl.formatMessage({ id: 'voucher-not-found' })}</Alert>
              )}
            </Stack>
          </MainCard>
        </Grid>
      )}
    </Grid>
  );
};

export default VoucherVerification;
