import { Box, Button, Dialog, Divider, FormControl, Grid, IconButton, MenuItem, TextField, Tooltip, Typography, useMediaQuery } from '@mui/material';
import {
  Spin,
  Switch,
  // DatePicker
  TimePicker
} from 'antd';
import MainCard from 'components/MainCard';
import AdPreview from 'components/organisms/adSample/AdPreview';
import Alert from 'components/template/Alert';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import useHandleAds from 'hooks/useHandleAds';
// import { debounce } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { RootState, useSelector } from 'store';
import { AdType, DataAds, NewDataAds } from 'types/Ads';
import { getOption } from 'utils/handleData';

import { DialogContent, InputAdornment, useTheme } from '@mui/material';
import { adApi } from 'api/ad.api';
import LoadingButton from 'components/@extended/LoadingButton';
import AdsForm, { FileType } from 'components/organisms/adSample/AdsForm';
import ConfirmationDialog from 'components/template/ConfirmationDialog';
import { useHandleSiteV2 } from 'hooks/useHandleSitesV2';
import { ParamsGetSSID, useHandleSSIDV2 } from 'hooks/useHandleSSIDV2';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { useSingleAd } from 'hooks/useSingleAd';
import { Back, CloseCircle, MessageQuestion, Repeat, ShieldTick, Trash } from 'iconsax-react';
import { isEqual } from 'lodash';
import { enqueueSnackbar } from 'notistack';
import { useSearchParams } from 'react-router-dom';
import { decryptId, encryptId, isEncrypted } from 'utils/crypto-utils';
import * as Yup from 'yup';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
const { RangePicker } = TimePicker;

type Assets = 'img' | 'logo' | 'img_tablet' | 'img_desktop' | 'video' | 'banner';

interface PropTypes {
  initId?: string;
}

function AdsSamplePage({ initId }: PropTypes) {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Nếu có initId thì dùng initId, không thì lấy từ query param `adId`
  const rawId = initId ?? searchParams.get('adId');
  const [realId, setRealId] = useState<string | null>(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState<'delete' | 'changeStatus'>('delete');
  const [isSwitchOn, setIsSwitchOn] = useState<boolean>();
  const user = useSelector((state: RootState) => state.authSlice.user);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  // const currentRegion = useSelector((state: RootState) => state.authSlice.user?.currentRegion ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds ?? '');

  console.log({ currentAds });
  const siteIdAccess = user?.sites?.map((item) => item.site_id);
  const [previewImages, setPreviewImages] = useState<{
    video: string;
    banner: string;
    logo: string;
    img: string;
    img_tablet: string;
    img_desktop: string;
  }>({
    logo: '',
    banner: '',
    img: '',
    img_tablet: '',
    img_desktop: '',
    video: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  // const [isMobile, setIsMobile] = useState<boolean>(false); // New state for mobile detection
  const [openPreview, setOpenPreview] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [openConfirmPending, setOpenConfirmPending] = useState(false);
  const [pendingValues, setPendingValues] = useState<NewDataAds | null>(null);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);

  const handleImageChange = (type: FileType, url: string) => {
    setPreviewImages((prev) => ({ ...prev, [type]: url }));
  };
  const [openApprove, setOpenApprove] = useState(false);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);

  const { checkPermissionByAccess } = usePermissionChecker();

  const { canWrite } = checkPermissionByAccess('ads-management');

  const { handleUploadAssets, handleDeleteAds, handleChangeStatus, handleEditAds } = useHandleAds();

  // Tour guide states
  const [runTour, setRunTour] = useState(false);

  // Check if user has seen the tour before
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('adDetailTourCompleted');
    if (!hasSeenTour && realId) {
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [realId]);

  // Tour steps configuration
  const tourSteps: Step[] = useMemo(
    () => [
      {
        target: 'body',
        content: intl.formatMessage({ id: 'tour-ad-detail-welcome-content' }),
        title: intl.formatMessage({ id: 'tour-ad-detail-welcome-title' }),
        placement: 'center',
        disableBeacon: true
      },
      {
        target: '.tour-ad-actions',
        content: intl.formatMessage({ id: 'tour-ad-detail-actions-content' }),
        title: intl.formatMessage({ id: 'tour-ad-detail-actions-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-template-name',
        content: intl.formatMessage({ id: 'tour-ad-detail-template-name-content' }),
        title: intl.formatMessage({ id: 'tour-ad-detail-template-name-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-site',
        content: intl.formatMessage({ id: 'tour-ad-detail-site-content' }),
        title: intl.formatMessage({ id: 'tour-ad-detail-site-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-ssid',
        content: intl.formatMessage({ id: 'tour-ad-detail-ssid-content' }),
        title: intl.formatMessage({ id: 'tour-ad-detail-ssid-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-ad-type',
        content: intl.formatMessage({ id: 'tour-ad-detail-ad-type-content' }),
        title: intl.formatMessage({ id: 'tour-ad-detail-ad-type-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-time-range',
        content: intl.formatMessage({ id: 'tour-ad-detail-time-range-content' }),
        title: intl.formatMessage({ id: 'tour-ad-detail-time-range-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-device-selector',
        content: intl.formatMessage({ id: 'tour-ad-detail-device-selector-content' }),
        title: intl.formatMessage({ id: 'tour-ad-detail-device-selector-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-ad-form',
        content: intl.formatMessage({ id: 'tour-ad-detail-form-content' }),
        title: intl.formatMessage({ id: 'tour-ad-detail-form-title' }),
        placement: 'top'
      },

      {
        target: '.tour-preview-stepper',
        content: intl.formatMessage({ id: 'tour-ad-detail-preview-stepper-content' }),
        title: intl.formatMessage({ id: 'tour-ad-detail-preview-stepper-title' }),
        placement: 'bottom'
      },
      {
        target: '.tour-ad-preview',
        content: intl.formatMessage({ id: 'tour-ad-detail-preview-content' }),
        title: intl.formatMessage({ id: 'tour-ad-detail-preview-title' }),
        placement: 'left'
      },
      {
        target: '.tour-save-button',
        content: intl.formatMessage({ id: 'tour-ad-detail-save-content' }),
        title: intl.formatMessage({ id: 'tour-ad-detail-save-title' }),
        placement: 'top'
      }
    ],
    [intl]
  );

  // Handle tour callback
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('adDetailTourCompleted', 'true');
    }
  };

  const queryParams = useMemo(
    () => ({
      id: realId ? +realId : undefined,
      siteId: currentSite,
      adDataInput: JSON.stringify(currentAds)
    }),
    [realId, currentSite, currentAds]
  );

  const { data: adSettings, isLoading, refetch: refetchAd } = useSingleAd(queryParams);

  const initialValues = useMemo(() => getInitialValues(adSettings), [adSettings]);
  const validationSchema = Yup.object().shape({
    footerEmail: Yup.string().email(intl.formatMessage({ id: 'email-invalid' })), // validate email chuẩn
    footerPhone: Yup.string().matches(/^\+?\d{9,15}$/, intl.formatMessage({ id: 'phone-number-invalid' })) // chỉ cho số, có thể có dấu +, từ 9-15 chữ số
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => handleSave(values),
    enableReinitialize: true
  });

  console.log({ adSettings, isLoading });

  const paramsSSID: ParamsGetSSID = useMemo(() => {
    return {
      pageSize: 30,
      page: 1,
      siteDataInput: JSON.stringify(siteIdAccess),
      siteId: formik.values.siteId
    };
  }, [formik.values.siteId, siteIdAccess]);

  console.log({ siteId: formik.values.siteId });
  const { ssid, isLoading: isLoadingSSID } = useHandleSSIDV2(paramsSSID, {
    enabled: !!formik.values.siteId // chỉ chạy query khi siteId có giá trị
  });

  console.log({ ssid, isLoadingSSID });

  const optionSSID = useMemo(() => {
    if (!ssid || ssid.length === 0) return [];
    const uniqueSSID = [...new Map(ssid.map((item) => [item.name, item])).values()];
    return getOption(uniqueSSID, 'name', 'name');
  }, [ssid]);

  // const getAd = async (id: number, currentSite: string) => {
  //   if (id <= 0) return;
  //   const res = await fetchDataAds({ id, siteId: currentSite, adDataInput: JSON.stringify(currentAds) });
  //   setAdSettings(res[0]);
  //   setIsSwitchOn(res[0]?.status_id === 1 ? true : false);

  //   const dataSSID = await fetchDataSSID({ pageSize: 30, page: 1, siteDataInput: JSON.stringify(siteIdAccess), siteId: currentSite });
  //   const uniqueSSID = [...new Map(dataSSID.map((item: any) => [item.name, item])).values()];
  //   setOptionSSID(getOption(uniqueSSID, 'name', 'name'));
  // };

  const { useSitesQuery } = useHandleSiteV2();

  const { data: siteData, isLoading: isLoadingSites } = useSitesQuery({
    page: 1,
    pageSize: 20,
    regionDataInput: JSON.stringify(regionIdAccess)
  });

  console.log({ isLoadingSites });

  // const getOptionSite = async (regionId: string) => {
  //   if (!regionId) {
  //     setOptionSite([]);
  //     return;
  //   }
  //   // const regionInput = [regionId];
  //   const dataSite = await fetchDataSites({
  //     pageSize: 100,
  //     regionDataInput: '',
  //     regionId: null
  //   });
  //   const newOptionSite = getOption(dataSite, 'name', 'id');
  //   setOptionSite(newOptionSite);
  // };

  const optionSite = useMemo(() => {
    return siteData?.list ? getOption(siteData.list, 'name', 'id') : [];
  }, [siteData]);

  // useEffect(() => {
  //   getAd(Number(realId), currentSite);
  //   //eslint-disable-next-line
  // }, [realId, currentSite, currentAds]);

  // useEffect(() => {
  //   getOptionSite(currentRegion);
  //   //eslint-disable-next-line
  // }, [currentRegion]);

  useEffect(() => {
    if (!rawId) return;

    // Nếu URL đã được mã hóa → decode để lấy id thật
    if (isEncrypted(rawId)) {
      // decodeURIComponent trước khi decrypt
      const id = decryptId(decodeURIComponent(rawId));
      if (id) setRealId(id);
      else navigate('/not-found');
      return;
    }

    // Nếu URL đang là id thật → mã hóa, encode để dùng trong query param
    setRealId(rawId);
    const encrypted = encodeURIComponent(encryptId(rawId));

    if (initId) {
      const url = new URL(window.location.href);
      url.searchParams.set('adId', encrypted);
      window.history.replaceState({}, '', url.toString());
    } else {
      const replaceUrl = `/ads/ads-management/detail?adId=${encrypted}`;
      window.history.replaceState({}, '', replaceUrl);
    }
  }, [rawId]);

  const handleSave = async (newSettings: NewDataAds) => {
    // Nếu quảng cáo đang hoạt động (status_id = 1) hoặc không hoạt động (status_id = 2) và có thay đổi
    if (adSettings?.status_id !== 9) {
      const originalValues = getInitialValues(adSettings);
      const changed = !isEqual(originalValues, newSettings);

      if (changed) {
        setPendingValues(newSettings); // lưu tạm values để confirm sau
        setOpenConfirmPending(true); // mở dialog confirm
        return;
      }
    }

    await saveToServer(newSettings);
  };

  const saveToServer = async (newSettings: NewDataAds) => {
    const filesToUpload: { type: Assets; file: File | string | undefined }[] = [
      { type: 'logo', file: newSettings.logoImgUrl },
      { type: 'banner', file: newSettings.bannerUrl },
      { type: 'img', file: newSettings.imageUrl },
      { type: 'img_tablet', file: newSettings.imageTabletUrl },
      { type: 'img_desktop', file: newSettings.imageDesktopUrl },
      { type: 'video', file: newSettings.videoUrl }
    ];

    try {
      setLoadingSubmit(true);
      for (const item of filesToUpload) {
        if (item.file && typeof item.file !== 'string' && item.file instanceof File) {
          const uploadedUrl = await handleUploadAssets(item.type, item.file, Number(realId));
          if (uploadedUrl) {
            if (item.type === 'logo') newSettings.logoImgUrl = uploadedUrl;
            if (item.type === 'banner') newSettings.bannerUrl = uploadedUrl;
            if (item.type === 'video') newSettings.videoUrl = uploadedUrl;
            if (item.type === 'img') newSettings.imageUrl = uploadedUrl;
            if (item.type === 'img_tablet') newSettings.imageTabletUrl = uploadedUrl;
            if (item.type === 'img_desktop') newSettings.imageDesktopUrl = uploadedUrl;
          }
        }
      }

      const parsedSettings = Object.fromEntries(
        Object.entries(newSettings).map(([key, value]) => [key, typeof value === 'boolean' ? String(value) : value])
      );

      if (newSettings.adType === '3rd_party' && newSettings.impressionTag3rdPartyClick) {
        parsedSettings.destinationUrl = newSettings.impressionTag3rdPartyClick;
      }

      if (Array.isArray(newSettings.optionalAnswer)) {
        parsedSettings.optionalAnswer = JSON.stringify(newSettings.optionalAnswer);
      }

      if (Array.isArray(newSettings.optionalAnswer1)) {
        parsedSettings.optionalAnswer1 = JSON.stringify(newSettings.optionalAnswer1);
      }

      await handleEditAds(parsedSettings as NewDataAds, Number(realId));
      refetchAd();
      // getAd(Number(realId), currentSite);
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleOpenAlert = (type: 'delete' | 'changeStatus') => {
    setAlertType(type);
    setOpenAlert(true);
  };

  const handleConfirmAction = async (status: boolean) => {
    if (alertType === 'delete') {
      const res = await handleDeleteAds(adSettings?.id, status); // Xử lý xóa
      if (res.code === 0) {
        navigate('/ads/ads-management');
      }
    } else if (alertType === 'changeStatus') {
      await handleChangeStatus(adSettings?.id, isSwitchOn ? 2 : 1); // Thay đổi trạng thái
      setIsSwitchOn(!isSwitchOn); // Cập nhật trạng thái local
    }
    setOpenAlert(false);
  };

  // useEffect(() => {
  //   const updateDeviceType = debounce(() => {
  //     const screenWidth = window.innerWidth;
  //     const tabletBreakpoint = 1024;
  //     setIsMobile(screenWidth < tabletBreakpoint);
  //   }, 200);

  //   updateDeviceType();
  //   window.addEventListener('resize', updateDeviceType);
  //   return () => {
  //     window.removeEventListener('resize', updateDeviceType);
  //     updateDeviceType.cancel();
  //   };
  // }, []);

  // Memoized preview images for AdPreview
  const memoizedPreviewImages = useMemo(
    () => ({
      banner: previewImages.banner || '',
      logo: previewImages.logo || '',
      video: previewImages.video || '',
      img: previewImages.img || '',
      imgDesktopUrl: previewImages.img_desktop || '',
      imgTabletUrl: previewImages.img_tablet || ''
    }),
    [previewImages]
  );

  // // Memoized time range value
  // const timeRangeValue = useMemo(
  //   () => [
  //     formik.values.timeStart ? dayjs(formik.values.timeStart, 'HH:mm') : null,
  //     formik.values.timeEnd ? dayjs(formik.values.timeEnd, 'HH:mm') : null
  //   ],
  //   [formik.values.timeStart, formik.values.timeEnd]
  // );

  const memoizedSiteOptions = useMemo(
    () =>
      optionSite.map((item, index) => (
        <MenuItem key={index} value={item.value}>
          {item.label}
        </MenuItem>
      )),
    [optionSite]
  );

  const memoizedSSIDOptions = useMemo(
    () =>
      optionSSID.map((item, index) => (
        <MenuItem key={index} value={item.value}>
          {item.label}
        </MenuItem>
      )),
    [optionSSID]
  );

  // Memoized alert icon
  const alertIcon = useMemo(() => {
    if (alertType === 'changeStatus') {
      return (
        <Box
          sx={{
            width: 72,
            height: 72,
            bgcolor: '#e3f2fd',
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '9999px'
          }}
        >
          <Repeat variant="Bold" size="36" color="currentColor" />
        </Box>
      );
    }
    return false;
  }, [alertType]);

  const handleApprove = async (record: DataAds) => {
    try {
      setIsLoadingApprove(true);
      const res = await adApi.approve({ id: record.id, statusId: 1 });
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'approve-success' }), { variant: 'success' });
        setOpenApprove(false);
        refetchAd();
        // getAd(Number(realId), currentSite);
      }
    } finally {
      setIsLoadingApprove(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        scrollOffset={120}
        scrollToFirstStep
        disableScrolling={false}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: theme.palette.primary.main,
            zIndex: 10000,
            arrowColor: theme.palette.background.paper,
            backgroundColor: theme.palette.background.paper,
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            textColor: theme.palette.text.primary,
            width: 400
          },
          tooltip: {
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)',
            fontSize: 14,
            lineHeight: 1.6
          },
          tooltipContainer: {
            textAlign: 'left'
          },
          tooltipTitle: {
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 12,
            color: theme.palette.primary.main,
            lineHeight: 1.4
          },
          tooltipContent: {
            padding: '8px 0',
            fontSize: 14,
            color: theme.palette.text.secondary,
            lineHeight: 1.7
          },
          buttonNext: {
            backgroundColor: theme.palette.primary.main,
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s ease',
            boxShadow: `0 2px 8px ${theme.palette.primary.main}40`
          },
          buttonBack: {
            color: theme.palette.text.secondary,
            marginRight: 8,
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 500
          },
          buttonSkip: {
            color: theme.palette.text.secondary,
            fontSize: 14,
            fontWeight: 500,
            borderRadius: 8,
            padding: '10px 16px'
          },
          buttonClose: {
            top: '16px',
            right: '16px',
            width: 16,
            height: 16,
            padding: 0,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          },
          spotlight: {
            borderRadius: 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)'
          },
          beacon: {
            borderRadius: '50%'
          },
          beaconInner: {
            backgroundColor: theme.palette.primary.main,
            borderRadius: '50%'
          },
          beaconOuter: {
            backgroundColor: `${theme.palette.primary.main}40`,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: '50%'
          }
        }}
        locale={{
          back: intl.formatMessage({ id: 'tour-back' }),
          close: intl.formatMessage({ id: 'close' }),
          last: intl.formatMessage({ id: 'tour-finish' }),
          next: intl.formatMessage({ id: 'tour-next' }),
          skip: intl.formatMessage({ id: 'tour-skip' })
        }}
      />

      {/* Floating Tour Guide Button */}
      <Tooltip title={intl.formatMessage({ id: 'tour-start' })} placement="left">
        <IconButton
          onClick={() => setRunTour(true)}
          sx={{
            borderRadius: 999,
            position: 'fixed',
            bottom: 30,
            right: 30,
            zIndex: 9999,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            width: 56,
            height: 56,
            boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.7)'
              },
              '70%': {
                boxShadow: '0 0 0 15px rgba(33, 150, 243, 0)'
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)'
              }
            },
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              transform: 'scale(1.1)',
              transition: 'all 0.3s ease'
            }
          }}
        >
          <MessageQuestion size="28" variant="Bold" />
        </IconButton>
      </Tooltip>

      <Spin spinning={loading}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MainCard contentSX={isMobile && { padding: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row', // Vertical for mobile, horizontal for desktop
                  flexWrap: 'wrap',
                  gap: 4
                }}
              >
                <Grid container spacing={isMobile ? 2 : 3}>
                  {/* Actions section */}
                  <Grid item xs={12}>
                    <div className="flex items-center justify-between">
                      {/* Nút quay về */}
                      {!initId ? (
                        <Button variant="text" color="primary" startIcon={<Back />} onClick={() => navigate(-1)}>
                          <FormattedMessage id="back" defaultMessage="Back" />
                        </Button>
                      ) : (
                        <div></div>
                      )}

                      <Box
                        className="tour-ad-actions"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          height: '100%',
                          justifyContent: 'flex-end'
                        }}
                      >
                        {adSettings?.status_id !== 9 && (
                          <>
                            <Switch disabled={!canWrite} checked={isSwitchOn} onChange={() => handleOpenAlert('changeStatus')} />

                            <Divider orientation="vertical" variant="middle" flexItem />
                          </>
                        )}

                        <div className="flex items-center gap-2">
                          {adSettings?.status_id === 9 && (
                            <Box>
                              <Button
                                startIcon={<ShieldTick />}
                                variant="contained"
                                disabled={!canWrite}
                                color="success"
                                onClick={() => {
                                  setOpenApprove(true);
                                }}
                              >
                                <FormattedMessage id="approve" />
                              </Button>
                            </Box>
                          )}

                          <Box>
                            <Button
                              startIcon={<Trash />}
                              variant="contained"
                              disabled={!canWrite}
                              sx={{
                                width: 100,
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                fontWeight: 500,
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(244, 67, 54, 0.2)'
                                }
                              }}
                              onClick={() => handleOpenAlert('delete')}
                            >
                              <FormattedMessage id="delete" />
                            </Button>
                          </Box>
                        </div>
                      </Box>
                    </div>
                  </Grid>
                  {/* Main form section */}
                  <Grid item xs={12}>
                    <Grid container spacing={isMobile ? 2 : 3}>
                      {/* Template Name */}
                      <Grid item xs={12} sm={6} md={6}>
                        <Box className="tour-template-name">
                          <TextField
                            disabled={!canWrite}
                            fullWidth
                            type="text"
                            name="templateName"
                            value={formik.values.templateName}
                            onChange={formik.handleChange}
                            size={'medium'}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Typography
                                    variant={isMobile ? 'caption' : 'body2'}
                                    color="text.secondary"
                                    sx={{
                                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {intl.formatMessage({ id: 'name-template' })}
                                  </Typography>
                                </InputAdornment>
                              )
                            }}
                          />
                        </Box>
                      </Grid>

                      {/* Placement */}
                      <Grid item xs={12} sm={6} md={6}>
                        <Box className="tour-site">
                          <FormControl fullWidth variant="standard">
                            <TextField
                              disabled={!canWrite}
                              select
                              value={formik.values.siteId}
                              onChange={(e) => {
                                formik.setFieldValue('siteId', e.target.value);
                              }}
                              size={'medium'}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Typography
                                      variant={isMobile ? 'caption' : 'body2'}
                                      color="text.secondary"
                                      sx={{
                                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {intl.formatMessage({ id: 'site' })}
                                    </Typography>
                                  </InputAdornment>
                                )
                              }}
                            >
                              {memoizedSiteOptions}
                            </TextField>
                          </FormControl>
                        </Box>
                      </Grid>

                      {/* SSID */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Box className="tour-ssid">
                          <FormControl fullWidth variant="standard">
                            <TextField
                              disabled={!canWrite}
                              select
                              value={formik.values.SSID}
                              onChange={(e) => {
                                const newSSID = e.target.value;
                                formik.setFieldValue('SSID', newSSID);
                              }}
                              size={'medium'}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Typography
                                      variant={isMobile ? 'caption' : 'body2'}
                                      color="text.secondary"
                                      sx={{
                                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {intl.formatMessage({ id: 'ssid' })}
                                    </Typography>
                                  </InputAdornment>
                                )
                              }}
                            >
                              {memoizedSSIDOptions}
                            </TextField>
                          </FormControl>
                        </Box>
                      </Grid>

                      {/* Ad Type */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Box className="tour-ad-type">
                          <FormControl fullWidth variant="standard">
                            <TextField
                              disabled={!canWrite}
                              select
                              value={formik.values.adType}
                              onChange={(e) => {
                                setLoading(true);
                                const newAdType = e.target.value;
                                formik
                                  .setFieldValue('adType', newAdType, false)
                                  .then(() => {
                                    handleSave({ ...formik.values, adType: newAdType });
                                    // navigate(`/ad-handle/edit/ad-${newAdType == '3rd_party' ? 'third-party' : newAdType}/${id}`);
                                  })
                                  .finally(() => setLoading(false));
                              }}
                              size={'medium'}
                              inputProps={{
                                name: 'adType',
                                id: 'ad-type-select'
                              }}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Typography
                                      variant={isMobile ? 'caption' : 'body2'}
                                      color="text.secondary"
                                      sx={{
                                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {intl.formatMessage({ id: 'ad-type' })}
                                    </Typography>
                                  </InputAdornment>
                                )
                              }}
                            >
                              <MenuItem value="video1">Video</MenuItem>
                              <MenuItem value="video2">Video & Banner</MenuItem>
                              <MenuItem value="banner">Banner</MenuItem>
                              <MenuItem value="survey">Survey</MenuItem>
                              <MenuItem value="survey2">Survey OTP</MenuItem>
                              <MenuItem value="app">App</MenuItem>
                              {/* <MenuItem value="3rd_party">Third Party</MenuItem> */}
                            </TextField>
                          </FormControl>
                        </Box>
                      </Grid>

                      {/* Time Range */}
                      <Grid item xs={12} sm={12} md={4}>
                        <Box className="tour-time-range">
                          <RangePicker
                            disabled={!canWrite}
                            style={{
                              width: '100%',
                              height: 44,
                              fontSize: 14
                            }}
                            format="HH:mm"
                            value={[
                              formik.values.timeStart ? dayjs(formik.values.timeStart, 'HH:mm') : null,
                              formik.values.timeEnd ? dayjs(formik.values.timeEnd, 'HH:mm') : null
                            ]}
                            onChange={(times, timeStrings) => {
                              formik.setFieldValue('timeStart', timeStrings[0]);
                              formik.setFieldValue('timeEnd', timeStrings[1]);
                            }}
                            placeholder={[intl.formatMessage({ id: 'time-start' }), intl.formatMessage({ id: 'time-end' })]}
                            size={isMobile ? 'small' : 'middle'}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            </MainCard>
          </Grid>
          <Grid item xs={12}>
            <MainCard contentSX={isMobile && { padding: 2 }}>
              {isMobile ? (
                // Mobile: AdPreview above AdTypeApp
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* {adSettings && <AdPreview settings={formik.values} previewImages={memoizedPreviewImages} />} */}
                  <div className="tour-ad-form">
                    <AdsForm
                      adType={formik.values.adType as AdType}
                      formik={formik}
                      onFileChange={handleImageChange}
                      previewImages={memoizedPreviewImages}

                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button fullWidth size="large" variant="outlined" onClick={() => setOpenPreview(true)}>
                      {intl.formatMessage({ id: 'preview' })}
                    </Button>
                    <Button fullWidth size="large" onClick={formik.submitForm} variant="contained">
                      {intl.formatMessage({ id: 'save' })}
                    </Button>
                  </div>
                  <Dialog
                    open={openPreview}
                    onClose={() => setOpenPreview(false)}
                    PaperProps={{
                      sx: {
                        margin: 0,
                        maxHeight: '100%',
                        minHeight: '100vh',
                        borderRadius: 0
                      }
                    }}
                  >
                    {/* Nút đóng */}
                    <Box sx={{ position: 'absolute', top: 4, right: 2, zIndex: 10 }}>
                      <IconButton onClick={() => setOpenPreview(false)} color="inherit">
                        <CloseCircle size={20} />
                      </IconButton>
                    </Box>
                    <DialogContent sx={{ padding: 2 }}>
                      <AdPreview settings={formik.values} previewImages={memoizedPreviewImages} />
                    </DialogContent>
                  </Dialog>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <AdsForm
                      adType={formik.values.adType as AdType}
                      formik={formik}
                      onFileChange={handleImageChange}
                      previewImages={memoizedPreviewImages}

                    />
                    <LoadingButton
                      className="tour-save-button"
                      loading={loadingSubmit}
                      disabled={!canWrite}
                      onClick={formik.submitForm}
                      variant="contained"
                      sx={{
                        width: '100%'
                      }}
                    >
                      {intl.formatMessage({ id: 'save' })}
                    </LoadingButton>
                  </Grid>
                  <Grid item xs={6} className="tour-ad-preview">
                    {adSettings && <AdPreview settings={formik.values} previewImages={memoizedPreviewImages} />}
                  </Grid>
                </Grid>
              )}
            </MainCard>
          </Grid>
        </Grid>
      </Spin>

      <Alert
        open={openAlert}
        handleDelete={handleConfirmAction}
        handleClose={() => setOpenAlert(!openAlert)}
        alertDelete={alertType === 'delete' ? 'alert-delete-ads' : 'alert-change-status'}
        descDelete={alertType === 'delete' ? intl.formatMessage({ id: 'alert-delete' }) : intl.formatMessage({ id: 'alert-change' })}
        nameRecord={adSettings && adSettings.template_name ? adSettings.template_name : ''}
        labelDeleteButton={alertType === 'delete' ? intl.formatMessage({ id: 'delete' }) : intl.formatMessage({ id: 'change' })}
        icon={alertIcon}
        confirmButtonColor={alertType == 'changeStatus' ? 'primary' : 'error'}
      />
      <ConfirmationDialog
        titleKey="alert-change-to-pending"
        description="alert-change-to-pending-description"
        open={openConfirmPending}
        onClose={() => setOpenConfirmPending(false)}
        onConfirm={() => {
          if (pendingValues) {
            saveToServer(pendingValues);
          }
          setOpenConfirmPending(false);
        }}
        variant="warning"
        confirmLabel="confirm"
        cancelLabel="cancel"
        confirmButtonColor="warning"
      />

      {adSettings && (
        <ConfirmationDialog
          showItemName
          itemName={adSettings.template_name}
          open={openApprove}
          variant="success"
          titleKey={'alert-approve-advertisement'}
          description={'alert-approve-advertisement-desc'}
          confirmLabel="confirm"
          confirmButtonColor="success"
          isLoading={isLoadingApprove}
          onClose={() => setOpenApprove(false)}
          onConfirm={() => handleApprove(adSettings)}
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
}

export default AdsSamplePage;

const getInitialValues = (adSetting: DataAds | undefined) => {
  return {
    adType: adSetting?.ad_type || '',
    deviceType: adSetting?.device_type || 'mobile',
    imageUrl: adSetting?.image_url || '',
    backgroundColor: adSetting?.background_color || 'rgb(255, 255, 255)',
    buttonColor: adSetting?.button_color || '#003580',
    buttonText: adSetting?.button_text || 'Truy cập Wi-Fi',
    buttonTextEn: adSetting?.button_text_en || 'Access the internet',
    footerEmail: adSetting?.footer_email || '',
    footerPhone: adSetting?.footer_phone || '',
    titleSurvey: adSetting?.title_survey || '',
    subtitleSurvey: adSetting?.subtitle_survey || '',
    ratingTitle: adSetting?.rating_title || '',
    isRating: adSetting?.is_rating || '',
    destinationUrl: adSetting?.destination_url || '',
    videoUrl: adSetting?.video_url || '',
    bannerUrl: adSetting?.banner_url || '',
    nonSkip: adSetting?.non_skip || 0,
    maxLength: adSetting?.max_length || 0,
    timeStart: adSetting?.time_start || '',
    timeEnd: adSetting?.time_end || '',
    SSID: adSetting?.ssid || '',
    templateName: adSetting?.template_name || '',
    backgroundImgUrl: adSetting?.background_img_url || '',
    logoImgUrl: adSetting?.logo_img_url || '',
    placement: adSetting?.placement || '',
    siteId: adSetting?.site_id || '',
    fullname: adSetting?.fullname || 'false',
    BoD: adSetting?.BoD || 'false',
    email: adSetting?.email || 'false',
    phoneNumber: adSetting?.phone_number || 'false',
    gender: adSetting?.gender || 'false',
    oneClick: adSetting?.one_click || 'true',
    twitter: adSetting?.twitter || 'false',
    facebook: adSetting?.facebook || 'false',
    google: adSetting?.google || 'false',
    layoutNum: adSetting?.layout_num || 1,
    appStoreUrl: adSetting?.app_store_url || '',
    chPlayUrl: adSetting?.ch_play_url || '',
    googleAnalyticsKey: adSetting?.google_analytics_key || '',
    imageTabletUrl: adSetting?.image_tablet_url || '',
    imageDesktopUrl: adSetting?.image_desktop_url || '',
    isEnable3rdParty: adSetting?.is_enable_3rd_party || '',
    impressionTag3rdPartyImage: adSetting?.impression_tag_3rd_party_image || '',
    impressionTag3rdPartyIframe: adSetting?.impression_tag_3rd_party_iframe || '',
    impressionTag3rdPartyJs: adSetting?.impression_tag_3rd_party_js || '',
    impressionTag3rdPartyClick: adSetting?.impression_tag_3rd_party_click || '',
    isOtpEnable: adSetting?.is_otp_enable || '',
    isOptionalQuestion: adSetting?.is_optional_question || '',
    optionalQuestion: adSetting?.optional_question || '',
    typeOptionalAnswer: adSetting?.type_optional_answer || '',
    optionalAnswer: !!adSetting?.optional_answer ? JSON.parse(adSetting?.optional_answer as string) : [''],
    isOptionalQuestion1: adSetting?.is_optional_question_1 || '',
    optionalQuestion1: adSetting?.optional_question_1 || '',
    typeOptionalAnswer1: adSetting?.type_optional_answer_1 || '',
    optionalAnswer1: !!adSetting?.optional_answer_1 ? JSON.parse(adSetting?.optional_answer_1 as string) : ['']
  };
};
