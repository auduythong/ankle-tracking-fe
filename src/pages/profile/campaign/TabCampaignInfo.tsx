import { Box, InputLabel, MenuItem } from '@mui/material';
import { Select } from '@mui/material';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  Typography
} from '@mui/material';
import { DatePicker } from 'antd';
import { campaignApi } from 'api/campaign.api';
import ConfirmationDialog from 'components/template/ConfirmationDialog';
// import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import useHandleAds from 'hooks/useHandleAds';
import useHandleCampaign from 'hooks/useHandleCampaign';
import useHandleExcel from 'hooks/useHandleExcel';
import useHandlePartner from 'hooks/useHandlePartner';
import useHandleRegion from 'hooks/useHandleRegion';
import useHandleSite from 'hooks/useHandleSites';

import {
  Building,
  Calendar,
  Call,
  Clock,
  DocumentDownload,
  Eye,
  Global,
  Location,
  Money,
  Mouse,
  PlayCircle,
  ShieldTick,
  TrendUp
} from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router';
import settings from 'settings';
import { RootState, useSelector } from 'store';
import { DataAds, DataCampaign, DataRegion, DataSites, OptionList, PartnerData } from 'types';
import { getOption } from 'utils/handleData';
// const InfoItem = ({
//   labelId,
//   value,
//   isSecondary = false
// }: {
//   labelId: string;
//   value: string | number | Date | null | undefined;
//   isSecondary?: boolean;
// }) => {
//   // Format Date values to strings
//   const displayValue = value instanceof Date ? value.toLocaleDateString() : value ?? '-';

//   return (
//     <Stack
//       spacing={0.5}
//       sx={{
//         flexDirection: { xs: 'row', sm: 'column' },
//         justifyContent: { xs: 'space-between', sm: 'flex-start' },
//         alignItems: { xs: 'center', sm: 'flex-start' }
//       }}
//     >
//       <Typography color={isSecondary ? 'secondary' : 'textPrimary'}>
//         <FormattedMessage id={labelId} />
//       </Typography>
//       <Typography>{displayValue}</Typography>
//     </Stack>
//   );
// };

// // Reusable component for list items with icons
// const IconListItem = ({ icon: Icon, text }: { icon: React.ElementType; text: React.ReactNode }) => (
//   <ListItem sx={{ p: 0, py: 1 }}>
//     <ListItemIcon>
//       <Icon size={20} />
//     </ListItemIcon>
//     <div className="w-full">
//       <ListItemSecondaryAction sx={{ width: '100%' }}>
//         <Typography align="right" width="100%">
//           {text}
//         </Typography>
//       </ListItemSecondaryAction>
//     </div>
//   </ListItem>
// );

interface UrlAccess {
  imgUrl: string | undefined | null;
  imgTabletUrl: string | undefined | null;
  imgDesktopUrl: string | undefined | null;
  videoUrl: string | undefined | null;
}

const InfoItem = ({ icon: Icon, labelId, value, iconColor = 'text-blue-500', label }: any) => {
  const displayValue = value instanceof Date ? value.toLocaleDateString() : value ?? '-';

  // Lấy class màu chữ (text-blue-500) để tạo background mờ
  // Tailwind không cho trực tiếp, nên dùng style
  const colorMap: Record<string, string> = {
    'text-blue-500': 'rgba(59, 130, 246, 0.05)',
    'text-red-500': 'rgba(239, 68, 68, 0.05)',
    'text-green-500': 'rgba(34, 197, 94, 0.05)',
    'text-purple-500': 'rgba(139, 92, 246, 0.05)',
    'text-orange-500': 'rgba(249, 115, 22, 0.05)',
    'text-indigo-500': 'rgba(99, 102, 241, 0.05)',
    'text-pink-500': 'rgba(236, 72, 153, 0.05)',
    'text-cyan-500': 'rgba(6, 182, 212, 0.05)'
  };

  const bgColor = colorMap[iconColor] || 'rgba(59, 130, 246, 0.1)'; // default blue

  return (
    <div className="flex items-center space-x-3 py-2">
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg`} style={{ backgroundColor: bgColor }}>
        <Icon size={16} className={iconColor} />
      </div>
      <div className="flex-1">
        <Typography color={'text.secondary'} className="text-sm font-medium">
          <FormattedMessage id={labelId || label} />
        </Typography>
        <Typography className="font-semibold">{displayValue}</Typography>
      </div>
    </div>
  );
};

const SectionCard = ({ title, children, className = '' }: any) => (
  <Card className={`shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}>
    <CardContent className="p-6">
      {title && (
        <>
          <Typography variant="h5" className="font-semibold mb-4 flex items-center">
            {title}
          </Typography>
          <Divider className="mb-4" />
        </>
      )}
      {children}
    </CardContent>
  </Card>
);

const TabCampaignInfo = ({ initId }: { initId?: string }) => {
  // const matchDownMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds ?? '');
  const params = useParams<{ id: string }>();
  // Nếu có initId thì dùng initId, không thì dùng id từ params
  const id = initId ?? params.id;
  const { fetchDataCampaign } = useHandleCampaign();
  const { fetchDataPartner } = useHandlePartner();
  const { fetchDataSites } = useHandleSite();
  const intl = useIntl();
  const { fetchDataAds, loadAssets } = useHandleAds();
  const { fetchDataRegion } = useHandleRegion();
  const [campaignInfo, setCampaignInfo] = useState<DataCampaign | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PartnerData | null>(null);
  const [adInfo, setAdInfo] = useState<DataAds | null>(null);
  const [regionInfo, setRegionInfo] = useState<DataRegion | null>(null);
  const [siteInfo, setSiteInfo] = useState<DataSites | null>(null);
  const [exportDateRange, setExportDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [openApprove, setOpenApprove] = useState(false);

  const { RangePicker } = DatePicker;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlAssets, setUrlAssets] = useState<UrlAccess>({
    imgUrl: '',
    imgTabletUrl: '',
    imgDesktopUrl: '',
    videoUrl: ''
  });
  const [selectAdId, setSelectAdId] = useState<number | undefined>(undefined);
  const [optionAd, setOptionAd] = useState<OptionList[]>([]);

  const { fetchExportExcel } = useHandleExcel();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadImg = async (settings: DataAds) => {
    const imgUrl = await loadAssets(settings.image_url);
    const videoUrl = await loadAssets(settings.video_url);
    const imgTabletUrl = await loadAssets(settings.image_tablet_url);
    const imgDesktopUrl = await loadAssets(settings.image_desktop_url);

    setUrlAssets({
      imgUrl,
      imgTabletUrl,
      imgDesktopUrl,
      videoUrl
    });
    // setIsLoading(false);
  };

  const getAdsForExport = async () => {
    const dataAds = await fetchDataAds({ page: 1, pageSize: 100, adDataInput: JSON.stringify(currentAds) });
    setOptionAd(getOption(dataAds, 'template_name', 'id'));
  };

  useEffect(() => {
    getAdsForExport();
    //eslint-disable-next-line
  }, [openExportDialog]);

  // Fetch all data sequentially to avoid dependency issues
  const fetchAllData = async (campaignId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch campaign data first
      const campaignData = await fetchDataCampaign({
        id: campaignId,
        siteId: currentSite,
        adDataInput: JSON.stringify(currentAds)
      });
      if (!campaignData[0]) throw new Error('No campaign data found');

      // Use campaign data to fetch partner and ads data
      const [partnerData, adsData] = await Promise.all([
        fetchDataPartner({
          type: 'ads',
          siteId: currentSite,
          id: campaignData[0].ad_partner_id,
          adDataInput: JSON.stringify(currentAds)
        }),
        fetchDataAds({ id: campaignData[0].ad_id, siteId: currentSite, adDataInput: JSON.stringify(currentAds) })
      ]);

      setCampaignInfo(campaignData[0] || null);
      setPartnerInfo(partnerData[0] || null);
      setAdInfo(adsData[0] || null);
      const regionData = await fetchDataRegion({ regionDataInput: JSON.stringify(Array(campaignData[0]?.region_id)) });
      const siteData = await fetchDataSites({
        siteId: campaignData[0]?.site_id,
        regionDataInput: JSON.stringify(Array(campaignData[0]?.region_id))
      });

      setRegionInfo(regionData[0]);
      setSiteInfo(siteData[0]);
      loadImg(adsData[0]);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleExportReport = async () => {
    if (!exportDateRange) {
      enqueueSnackbar('Please select a date range', { variant: 'warning' });
      return;
    }

    const startDate = exportDateRange[0].format('YYYY-MM-DD');
    const endDate = exportDateRange[1].format('YYYY-MM-DD');
    const adId = selectAdId;

    try {
      const excelData = await fetchExportExcel({
        type: 'campaign',
        startDate,
        endDate,
        adId,
        adDataInput: JSON.stringify(currentAds)
      });

      if (!excelData) {
        throw new Error('No data received from server');
      }

      if (!(excelData instanceof Blob)) {
        throw new Error('Invalid data type received for export');
      }
      const url = window.URL.createObjectURL(excelData);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao-cao-tuan_${startDate}_to_${endDate}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      setOpenExportDialog(false);
      setExportDateRange(null);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAllData(Number(id));
    }

    //eslint-disable-next-line
  }, [id, currentSite, currentAds]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const getStatusChip = (statusId: number) => {
    switch (statusId) {
      case 1:
        return <Chip color="success" label={<FormattedMessage id={'active'} />} size="small" variant="combined" />;
      case 2:
        return <Chip color="error" label={<FormattedMessage id={'inactive'} />} size="small" variant="combined" />;
      default:
        return <Chip color="warning" label={<FormattedMessage id={'pending-approval'} />} size="small" variant="combined" />;
    }
  };

  const handleOpenApprove = () => {
    setOpenApprove(true);
  };

  const handleApprove = async (campaignId: string) => {
    try {
      setIsLoadingApprove(true);
      const res = await campaignApi.approve({ id: campaignId, statusId: 1 });

      await fetchAllData(Number(campaignId));
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'campaign-approve-success' }), {
          variant: 'success'
        });
        setOpenApprove(false);
      }
    } catch (error) {
    } finally {
      setIsLoadingApprove(false);
    }
  };

  if (!id) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto">
        <Grid container spacing={3}>
          {/* Left Panel */}
          <Grid item xs={12} lg={4}>
            <SectionCard className="h-fit">
              <div className="space-y-4">
                {/* Media */}
                <div className="relative">
                  {adInfo?.ad_type === 'video1' || adInfo?.ad_type === 'video2' ? (
                    <div className="relative rounded-xl overflow-hidden bg-gray-100">
                      <video src={urlAssets.videoUrl || ''} className="w-full h-48 object-cover" autoPlay muted controls />
                      <div className="absolute top-2 right-2">
                        <div className="bg-black bg-opacity-50 rounded-full p-2">
                          <PlayCircle size={16} variant="Bold" className="text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={urlAssets.imgUrl || settings.logoDefault}
                        alt="Campaign"
                        className="w-full h-48"
                        loading="lazy"
                        style={{ objectFit: urlAssets.imgUrl ? 'cover' : 'contain' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  )}
                </div>

                <Divider />

                {/* Info */}
                <div className="space-y-3">
                  <InfoItem
                    icon={Building}
                    label={intl.formatMessage({ id: 'partner' })}
                    value={partnerInfo?.name || 'Unknown'}
                    iconColor="text-blue-500"
                  />
                  <InfoItem
                    icon={Location}
                    label={intl.formatMessage({ id: 'region' })}
                    value={regionInfo?.name || 'Unknown'}
                    iconColor="text-green-500"
                  />
                  <InfoItem
                    icon={TrendUp}
                    label={intl.formatMessage({ id: 'status' })}
                    value={campaignInfo?.status_id && getStatusChip(campaignInfo?.status_id)}
                    iconColor="text-purple-500"
                  />
                </div>
              </div>
            </SectionCard>
          </Grid>

          {/* Right Panel */}
          <Grid item xs={12} lg={8}>
            <div className="space-y-6">
              {/* Campaign Info */}
              <SectionCard
                title={
                  <div className="w-full flex items-center justify-between">
                    {intl.formatMessage({ id: 'campaign-info' })}
                    {campaignInfo?.status_id === 9 && (
                      <Button color="success" variant="contained" startIcon={<ShieldTick />} onClick={() => handleOpenApprove()}>
                        {intl.formatMessage({ id: 'approve' })}
                      </Button>
                    )}
                  </div>
                }
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Building}
                      labelId="campaign-name"
                      value={campaignInfo?.name || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-blue-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Eye}
                      labelId="ad-name"
                      value={adInfo?.template_name || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-indigo-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Money}
                      labelId="amount-ad"
                      value={campaignInfo?.amount ? `${campaignInfo.amount.toLocaleString()} VND` : 0}
                      iconColor="text-green-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Calendar}
                      labelId="expired-date"
                      value={campaignInfo?.expired_date || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-red-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Mouse}
                      labelId="click-limit"
                      value={campaignInfo?.click_limit ? campaignInfo.click_limit.toLocaleString() : 0}
                      iconColor="text-orange-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Eye}
                      labelId="impression-limit"
                      value={campaignInfo?.impression_limit ? campaignInfo.impression_limit.toLocaleString() : 0}
                      iconColor="text-purple-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Global}
                      labelId="site"
                      value={siteInfo?.name || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-cyan-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Location}
                      labelId="region"
                      value={regionInfo?.name || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-pink-500"
                    />
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Ad Info */}
              <SectionCard title={intl.formatMessage({ id: 'ad-info' })}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Eye}
                      labelId="template-name"
                      value={adInfo?.template_name || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-blue-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Building}
                      labelId="ssid"
                      value={adInfo?.ssid || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-indigo-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Clock}
                      labelId="time-start"
                      value={adInfo?.time_start || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-green-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Clock}
                      labelId="time-end"
                      value={adInfo?.time_end || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-red-500"
                    />
                  </Grid>
                </Grid>
              </SectionCard>

              {/* Partner Info */}
              <SectionCard title={intl.formatMessage({ id: 'partner-info' })}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Building}
                      labelId="partner-name"
                      value={partnerInfo?.name || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-blue-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Call}
                      labelId="phone-number"
                      value={partnerInfo?.phone_number || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-green-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Location}
                      labelId="address"
                      value={partnerInfo?.address || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-orange-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Global}
                      labelId="country"
                      value={partnerInfo?.country || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-purple-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Calendar}
                      labelId="start-date"
                      value={partnerInfo?.from_date || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-cyan-500"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <InfoItem
                      icon={Calendar}
                      labelId="expired-date"
                      value={partnerInfo?.expired_date || intl.formatMessage({ id: 'unknown' })}
                      iconColor="text-pink-500"
                    />
                  </Grid>
                </Grid>
              </SectionCard>
            </div>
          </Grid>
        </Grid>

        {/* Floating Export Button */}
        <button
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 z-50"
          onClick={() => setOpenExportDialog(true)}
        >
          <DocumentDownload size={20} color="white" variant="Bold" />
        </button>

        {/* Export Dialog */}
        <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
          <DialogTitle> {intl.formatMessage({ id: 'select-date-range-weekly-report' })}</DialogTitle>
          <DialogContent>
            <RangePicker
              size="large"
              format="DD/MM/YYYY"
              onChange={(dates) => setExportDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              style={{ width: '100%', marginTop: '20px' }}
              popupStyle={{ zIndex: 99999 }}
              placeholder={[intl.formatMessage({ id: 'start-date' }), intl.formatMessage({ id: 'end-date' })]}
            />
          </DialogContent>
          <DialogTitle> {intl.formatMessage({ id: 'ad-name' })}</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{intl.formatMessage({ id: 'select-ad' })}</InputLabel>
              <Select
                value={selectAdId || ''}
                onChange={(e) => setSelectAdId(Number(e.target.value))}
                label={intl.formatMessage({ id: 'select-ad' })}
                required
              >
                {optionAd.map((ad) => (
                  <MenuItem key={ad.value} value={ad.value}>
                    {ad.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenExportDialog(false)}>{intl.formatMessage({ id: 'cancel' })}</Button>
            <Button onClick={handleExportReport} variant="contained" disabled={!selectAdId}>
              {intl.formatMessage({ id: 'export' })}
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      {openApprove && (
        <ConfirmationDialog
          open={openApprove}
          variant="success"
          titleKey="alert-approve-campaign"
          description="alert-approve-campaign-desc"
          confirmLabel="confirm"
          confirmButtonColor="success"
          isLoading={isLoadingApprove}
          onClose={() => setOpenApprove(false)}
          onConfirm={() => handleApprove(id)}
          icon={
            <Box
              sx={{
                width: 72,
                height: 72,
                bgcolor: '#e8f5e9',
                color: '#2e7d32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px'
              }}
            >
              <ShieldTick variant="Bold" size="36" color="currentColor" />
            </Box>
          }
        />
      )}
    </div>
  );
};

export default TabCampaignInfo;
