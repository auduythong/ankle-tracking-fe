import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { Theme } from '@mui/material/styles';
import { useMediaQuery, Divider, Grid, List, ListItem, ListItemIcon, ListItemSecondaryAction, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import { Brodcast, Building, Location } from 'iconsax-react';
import useHandleVouchersGroup from 'hooks/useHandleVouchers';
import { useSelector } from 'store';
import { RootState } from 'store';
import { CodeForm, DurationType, LimitType, RateLimitMode, TimingType, ValidityType, Voucher } from 'types/voucher';

// InfoItem component
const InfoItem = ({
  labelId,
  value,
  isSecondary = false
}: {
  labelId: string;
  value: string | number | Date | null | undefined;
  isSecondary?: boolean;
}) => {
  const displayValue = value instanceof Date ? value.toLocaleDateString() : value ?? '-';

  return (
    <Stack
      spacing={0.5}
      sx={{
        flexDirection: { xs: 'row', sm: 'column' },
        justifyContent: { xs: 'space-between', sm: 'flex-start' },
        alignItems: { xs: 'center', sm: 'flex-start' }
      }}
    >
      <Typography color={isSecondary ? 'secondary' : 'textPrimary'}>
        <FormattedMessage id={labelId} />
      </Typography>
      <Typography>{displayValue}</Typography>
    </Stack>
  );
};

// IconListItem component
const IconListItem = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <ListItem sx={{ p: 0, py: 1 }}>
    <ListItemIcon>
      <Icon size={20} />
    </ListItemIcon>
    <ListItemSecondaryAction>
      <Typography align="right">{text}</Typography>
    </ListItemSecondaryAction>
  </ListItem>
);

const VoucherDetail = () => {
  const matchDownMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();
  const { fetchVoucherGroup, isLoading } = useHandleVouchersGroup({});
  const [voucherGroup, setVoucherGroup] = useState<Voucher | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchVoucherGroupDetail = async (voucherId: number) => {
    try {
      setError(null);
      const data = await fetchVoucherGroup({
        page: 1, pageSize: 50,
        voucherId
      });

      if (data && data.length > 0) {
        setVoucherGroup(data[0]);
      } else {
        setError('No voucher group found');
      }
    } catch (err) {
      setError('Failed to fetch voucher group data. Please try again.');
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVoucherGroupDetail(+id);
    }
    //eslint-disable-next-line
  }, [id, currentSite]);

  if (isLoading) return <Typography>{intl.formatMessage({ id: 'loading' })}...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!voucherGroup) return <Typography>{intl.formatMessage({ id: 'no-voucher-group-found' })}</Typography>;

  const codeFormText =
    voucherGroup.code_form === CodeForm.NumbersOnly
      ? intl.formatMessage({ id: 'numbers-only' })
      : intl.formatMessage({ id: 'numbers-and-letters' });
  const limitTypeText = {
    [LimitType.LimitedUsageCounts]: intl.formatMessage({ id: 'limited-usage-counts' }),
    [LimitType.LimitedOnlineUsers]: intl.formatMessage({ id: 'limited-online-users' }),
    [LimitType.Unlimited]: intl.formatMessage({ id: 'unlimited' })
  }[voucherGroup.limit_type];

  const durationTypeText =
    voucherGroup.duration_type === DurationType.ClientDuration
      ? intl.formatMessage({ id: 'client-duration' })
      : intl.formatMessage({ id: 'voucher-duration' });

  const timingTypeText =
    voucherGroup.timing_type === TimingType.TimingByTime
      ? intl.formatMessage({ id: 'timing-by-time' })
      : intl.formatMessage({ id: 'timing-by-usage' });

  const rateLimitModeText =
    voucherGroup.rate_limit_mode === RateLimitMode.CustomRateLimit
      ? intl.formatMessage({ id: 'custom-rate-limit' })
      : intl.formatMessage({ id: 'rate-limit-profiled' });

  const validityTypeText = {
    [ValidityType.AnyTime]: intl.formatMessage({ id: 'any-time' }),
    [ValidityType.BetweenEffectiveAndExpirationTime]: intl.formatMessage({ id: 'between-effective-and-expiration-time' }),
    [ValidityType.SpecificTimePeriod]: intl.formatMessage({ id: 'specific-time-period' })
  }[voucherGroup.validity_type];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <MainCard>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <img
                src={'https://via.placeholder.com/300x150?text=Voucher+Group'}
                alt="Voucher Group"
                className="rounded-lg overflow-hidden w-full"
                loading="lazy"
              />
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <List component="nav" aria-label="voucher group details" sx={{ py: 0 }}>
                <IconListItem icon={Building} text={voucherGroup.name} />
                <IconListItem icon={Location} text={voucherGroup.site_id} />
                <IconListItem icon={Brodcast} text={validityTypeText} />
              </List>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={9}>
        <MainCard title={false} content={false} sx={{ p: 2.5 }}>
          <Typography variant="h5" sx={{ my: 2 }}>
            <FormattedMessage id="voucher-group-info" />
          </Typography>
          <List sx={{ py: 0 }}>
            <ListItem divider={!matchDownMD}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="name" value={voucherGroup.name} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="amount" value={voucherGroup.amount.toLocaleString()} />
                </Grid>
              </Grid>
            </ListItem>
            <ListItem divider={!matchDownMD}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="code-length" value={voucherGroup.code_length} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="code-from" value={codeFormText} />
                </Grid>
              </Grid>
            </ListItem>
            <ListItem divider={!matchDownMD}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="limit-type" value={limitTypeText} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="limit-num" value={voucherGroup.limit_num ?? '-'} />
                </Grid>
              </Grid>
            </ListItem>
            <ListItem divider={!matchDownMD}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="duration-type" value={durationTypeText} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="duration" value={`${voucherGroup.duration} seconds`} />
                </Grid>
              </Grid>
            </ListItem>
            <ListItem divider={!matchDownMD}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="voucher-timing-type" value={timingTypeText} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="Site Id" value={voucherGroup.site_id} />
                </Grid>
              </Grid>
            </ListItem>
          </List>

          <Typography variant="h5" sx={{ my: 2 }}>
            <FormattedMessage id="rate-limit-info" />
          </Typography>
          <List sx={{ py: 0 }}>
            <ListItem divider={!matchDownMD}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="rate-limit-mode" value={rateLimitModeText} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="rate-limit-id" value={voucherGroup.rate_limit_id ?? '-'} />
                </Grid>
              </Grid>
            </ListItem>
            <ListItem divider={!matchDownMD}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem
                    labelId="download-limit"
                    value={
                      voucherGroup.custom_ratelimit_down_enable === 'true'
                        ? `${voucherGroup.custom_ratelimit_down} Kbps`
                        : intl.formatMessage({ id: 'disabled' })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoItem
                    labelId="upload-limit"
                    value={
                      voucherGroup.custom_ratelimit_up_enable === 'true'
                        ? `${voucherGroup.custom_ratelimit_up} Kbps`
                        : intl.formatMessage({ id: 'disabled' })
                    }
                  />
                </Grid>
              </Grid>
            </ListItem>
            <ListItem divider={!matchDownMD}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem
                    labelId="traffic-limit"
                    value={
                      voucherGroup.traffic_limit_enable === 'true'
                        ? `${voucherGroup.traffic_limit} Kbps`
                        : intl.formatMessage({ id: 'disabled' })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoItem
                    labelId="traffic-limit-frequency"
                    value={voucherGroup.traffic_limit_enable === 'true' ? voucherGroup.traffic_limit_frequency : '-'}
                  />
                </Grid>
              </Grid>
            </ListItem>
          </List>

          <Typography variant="h5" sx={{ my: 2 }}>
            <FormattedMessage id="validity-info" />
          </Typography>
          <List sx={{ py: 0 }}>
            <ListItem divider={!matchDownMD}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="validity-type" value={validityTypeText} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="expiration-time" value={new Date(+voucherGroup.expiration_time * 1000).toLocaleString()} />
                </Grid>
              </Grid>
            </ListItem>
            <ListItem divider={!matchDownMD}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem
                    labelId="effective-time"
                    value={voucherGroup.effective_time ? new Date(+voucherGroup.effective_time * 1000).toLocaleString() : '-'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="apply-to-all-portals" value={voucherGroup.apply_to_all_portals} />
                </Grid>
              </Grid>
            </ListItem>
            <ListItem divider={!matchDownMD}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="portals" value={voucherGroup.portals ?? '-'} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="ssids" value={voucherGroup.ssid_id} />
                </Grid>
              </Grid>
            </ListItem>
          </List>

          <Typography variant="h5" sx={{ my: 2 }}>
            <FormattedMessage id="pricing-info" />
          </Typography>
          <List sx={{ py: 0 }}>
            <ListItem divider={!matchDownMD}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="unit-price" value={`${voucherGroup.unit_price.toLocaleString()} ${voucherGroup.currency}`} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InfoItem labelId="description" value={voucherGroup.description ?? '-'} />
                </Grid>
              </Grid>
            </ListItem>
          </List>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default VoucherDetail;
