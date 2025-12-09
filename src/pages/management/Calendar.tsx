// project-import
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  Grid,
  InputLabel,
  lighten,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MainCard from 'components/MainCard';
import GenericForm from 'components/organisms/GenericForm';
import Alert from 'components/template/Alert';
import { adFields } from 'components/ul-config/form-config';

// third-party
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { TimePicker } from 'antd';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import moment from 'moment';
// import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
// hooks
import { PopupTransition } from 'components/@extended/Transitions';
import useHandleAds from 'hooks/useHandleAds';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

// assets
import 'components/template/calendar/style.css';
import { Add } from 'iconsax-react';

// types
import useHandleSite from 'hooks/useHandleSites';
import useHandleSSID from 'hooks/useHandleSSID';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { OptionList, SSIDData } from 'types';
import { DataAds } from 'types/Ads';
import { SYSTEM_SITE_ID } from 'utils/constant';
import { getOption } from 'utils/handleData';

const { RangePicker } = TimePicker;

function calculateHourDifferenceMoment(timeStart: string | Date, timeEnd: string | Date) {
  const momentStart = moment(timeStart, 'HH:mm:ss');
  const momentEnd = moment(timeEnd, 'HH:mm:ss');

  const hours = momentEnd.diff(momentStart, 'hours', true); // 'true' để lấy giá trị số thực

  return hours;
}

const transformAdsToEvents = (adsArray: DataAds[]) => {
  const today = new Date().toISOString().slice(0, 10);
  return adsArray.map((ad, index) => {
    const color = adTypeColors[ad.ad_type] || '#E5E7EB';
    console.log({ ad });
    const lightBg = lighten(color, 0.7);

    return {
      id: ad.id.toString(),
      title: ad.template_name || 'No Title',
      templateName: ad.template_name,
      start: `${today}T${ad.time_start}`,
      end: `${today}T${ad.time_end}`,
      resourceId: ad.ssid,
      ssid: ad.ssid,
      siteId: ad.site_id,
      adType: ad.ad_type,
      placement: ad.placement,
      timeStart: ad.time_start,
      timeEnd: ad.time_end,
      imageUrl: ad.image_url,
      videoUrl: ad.video_url,
      hoursDifference: calculateHourDifferenceMoment(ad.time_start, ad.time_end),
      statusId: ad.status_id,
      backgroundColor: lightBg,
      borderColor: '#fff',
      // borderColor
      textColor: color
    };
  });
};

const transformSSIDToTitle = (SSIDs: SSIDData[]) => {
  return SSIDs.map((ssid) => ({
    id: ssid.name,
    title: ssid.name || 'No Title'
  }));
};

interface CalendarEvent {
  id: string;
  title: string;
  templateName: string;
  start: string | Date;
  end: string | Date;
  resourceId: string;
  ssid: string;
  adType: string;
  placement: string;
  imageUrl: string;
  videoUrl: string;
  timeStart: string | Date;
  timeEnd: string | Date;
  hoursDifference: number;
  statusId: number;
}

interface Resource {
  id: string;
  title: string;
}
const adTypeColors: Record<string, string> = {
  video1: '#3730A3', // Indigo đậm
  video2: '#047857', // Green đậm
  banner: '#6D28D9', // Purple đậm
  survey: '#0D9488', // Teal đậm (thay cho đỏ)
  survey2: '#0EA5E9', // Sky blue đậm
  app: '#B45309' // Amber/Orange đậm
};

const adTypeLabels: Record<string, string> = {
  video1: 'Video',
  video2: 'Video & Banner',
  banner: 'Banner',
  survey: 'Survey',
  survey2: 'Survey OTP',
  app: 'App'
};
function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [isReload, setIsReload] = useState(false);
  const [adToDelete, setAdToDelete] = useState<CalendarEvent | null>(null);

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const siteIdAccess = user?.sites?.map((item) => item.site_id);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds ?? '');
  const { fetchDataAds, handleAddAds, handleDeleteAds } = useHandleAds();
  const { fetchDataSSID } = useHandleSSID();
  const { fetchDataSites } = useHandleSite();

  const [optionSSID, setOptionSSID] = useState<OptionList[]>([]);
  const [optionSites, setOptionSites] = useState<OptionList[]>([]);
  const [filters, setFilters] = useState<{ site?: string; ssid?: string }>({});

  const intl = useIntl();
  // const navigate = useNavigate();

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('ads-calendar');

  const renderAdTypeLabel = (type: string) => adTypeLabels[type] || 'Unknown';

  const initialValues = {
    id: '',
    templateName: '',
    adType: '',
    timeStart: null,
    timeEnd: null,
    siteId: '',
    SSID: ''
  };

  const formik = useFormik({
    initialValues,
    // validationSchema: PartnerSchema,
    onSubmit: async (values: any) => {
      console.log({ values });
      const { time, ...rest } = values;
      const payload = {
        ...rest,
        timeStart: time[0],
        timeEnd: time[1]
      };
      const res = await handleAddAds(payload);
      if (res && res.code === 0) {
        // navigate(`/ad-handle/edit/ad-${res.data.ad_type}/${res.data.id}`);
        fetchAdSettings(currentSite);
        setDialogOpen(false);
      }
    },
    enableReinitialize: true
  });

  const fetchAdSettings = async (currentSite: string) => {
    try {
      const dataAds = await fetchDataAds({
        siteId: filters.site === SYSTEM_SITE_ID ? '' : filters.site || currentSite,
        filters: filters.ssid,
        adDataInput: JSON.stringify(currentAds)
      });
      const transformedEvents = transformAdsToEvents(dataAds);
      const dataSSID = await fetchDataSSID({ page: 1, pageSize: 20, siteDataInput: JSON.stringify(siteIdAccess), siteId: currentSite });
      const dataResources = transformSSIDToTitle(dataSSID);
      setResources(dataResources);
      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching ad settings:', error);
    }
  };

  const handleDelete = async (isDelete: boolean) => {
    if (isDelete && adToDelete) {
      const res = await handleDeleteAds(Number(adToDelete.id), true);
      if (res && res.code === 0) {
        setIsReload(true);
      }
    }
    setAdToDelete(null);
    setAlertOpen(false);
  };

  // const handleOpenDeleteAlert = (event: CalendarEvent, id: string) => {
  //   setAdToDelete({ ...event, id });
  //   setAlertOpen(true);
  // };

  const handleCloseAlert = () => {
    setAlertOpen(false);
    setAdToDelete(null);
  };

  const getOptionsSSID = async (siteId: string) => {
    const siteList = [];
    siteList.push(String(siteId));
    const dataSSID = await fetchDataSSID({ page: 1, pageSize: 20, siteDataInput: JSON.stringify(siteList), siteId });
    setOptionSSID(getOption(dataSSID, 'name', 'name'));
  };

  useEffect(() => {
    const fetchOptionSettings = async () => {
      const dataSite = await fetchDataSites({ page: 1, pageSize: 20, regionDataInput: JSON.stringify(regionIdAccess) });

      setOptionSites(getOption(dataSite, 'name', 'id'));
    };

    fetchOptionSettings();

    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (filters.site || formik.values.siteId) {
      getOptionsSSID(filters.site || formik.values.siteId);
    } else {
      setOptionSSID([]);
    }
    //eslint-disable-next-line
  }, [filters.site, formik.values.siteId]);

  useEffect(() => {
    fetchAdSettings(currentSite);
    // eslint-disable-next-line
  }, [filters.site, filters.ssid, currentSite, currentAds]);

  useEffect(() => {
    if (isReload) {
      fetchAdSettings(currentSite);
      setIsReload(false);
    }
    //eslint-disable-next-line
  }, [isReload, currentSite, currentAds]);

  const handleCloseDialog = () => {
    setDialogOpen(!dialogOpen);
  };

  const fieldsWithOptions = adFields.map((field) => {
    if (field.name === 'SSID') {
      return { ...field, options: optionSSID };
    }
    if (field.name === 'siteId') {
      return { ...field, options: optionSites };
    }
    return field;
  });
  console.log({ resources, events });

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <MainCard content={false} sx={{ padding: 2 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: `${matchDownSM ? 'flex-start' : 'center'}`,
                flexDirection: `${matchDownSM ? 'column' : 'row'}`
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: `${matchDownSM ? 'flex-start' : 'center'}`,
                  flexDirection: `${matchDownSM ? 'column' : 'row'}`
                }}
              >
                <Autocomplete
                  options={optionSites}
                  sx={{
                    minWidth: '200px'
                  }}
                  getOptionLabel={(option) => option.label as string}
                  renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'site' })} variant="outlined" />}
                  onChange={(event, value) => {
                    console.log({ value });
                    setFilters((prev) => ({ ...prev, site: value ? String(value) : '' }));
                  }}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                />
                <Autocomplete
                  disabled={!filters.site}
                  options={optionSSID}
                  sx={{
                    minWidth: '200px'
                  }}
                  getOptionLabel={(option) => option.label as string}
                  renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'ssid' })} variant="outlined" />}
                  onChange={(event, value) => setFilters((prev) => ({ ...prev, ssid: value?.value ? String(value.value) : '' }))}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                />
              </Box>
              <Button disabled={!canWrite} variant="contained" startIcon={<Add />} onClick={handleCloseDialog}>
                <FormattedMessage id="add-ad" />
              </Button>
            </Box>
          </MainCard>
        </Grid>
        <Grid item xs={12}>
          <MainCard content={false}>
            <div className="h-[800px]">
              <FullCalendar
                plugins={[resourceTimeGridPlugin, interactionPlugin]}
                initialView="resourceTimeGridDay"
                schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
                resources={resources}
                events={events}
                eventDidMount={(info) => {
                  // Set border radius
                  info.el.style.borderRadius = '8px';
                  info.el.style.overflow = 'hidden';
                }}
                slotMinTime="00:00:00"
                slotMaxTime="24:00:00"
                allDaySlot={false}
                height="100%"
                headerToolbar={false}
                resourceLabelContent={(info) => {
                  const ssid = info.resource.title; // tên SSID
                  // Tính summary số ad cho resource này
                  const adCount = events.filter((event) => event.resourceId === info.resource.id).length;

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      {/* Header trên cùng: SSID */}
                      <Typography style={{ fontWeight: 700 }}>{ssid}</Typography>
                      {/* Summary số ad */}
                      <Typography style={{ fontSize: '12px', color: 'secondary.main' }}>{adCount} ads</Typography>
                    </div>
                  );
                }}
                eventOverlap={false}
                slotEventOverlap={false}
                slotDuration="00:30:00"
                slotLabelFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false // <-- hiển thị giờ 24h
                }}
                eventTimeFormat={{
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false // chuyển sang 24h
                }}
                eventContent={(info) => {
                  console.log({ info });
                  const color = info.event.textColor; // màu chính theo adType
                  const eventType = info.event.extendedProps.adType || 'CONCEPT';
                  const startTime = moment(info.event.start).format('HH:mm');
                  const endTime = moment(info.event.end).format('HH:mm');
                  const siteName = optionSites.find((site) => site.value === info.event.extendedProps.siteId)?.label;

                  return (
                    <div
                      style={{
                        height: '100%',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '2px',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        window.open(`/ads/ads-management/detail?adId=${info.event.id}`, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      <div className="flex flex-col gap-3">
                        {/* Label trên cùng */}
                        <span style={{ color, fontWeight: 700, textTransform: 'uppercase', fontSize: 14 }}>
                          {renderAdTypeLabel(eventType)}
                        </span>

                        {/* Tiêu đề */}
                        <div className="flex flex-col">
                          <Typography
                            color={'text.primary'}
                            style={{
                              fontWeight: 500,
                              fontSize: '14px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {info.event.title}
                          </Typography>
                          <Typography
                            color={'text.secondary'}
                            style={{
                              fontWeight: 500,
                              fontSize: '12px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {siteName}
                          </Typography>
                        </div>
                      </div>

                      {/* Thời gian + icon */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#555' }}>
                        <span>
                          {startTime} - {endTime}
                        </span>
                      </div>
                    </div>
                  );
                }}
                // eventContent={(arg) => {
                //   const event = arg.event.extendedProps as CalendarEvent;
                //   return (
                //     <MainCard
                //       sx={{
                //         border: '1px solid black'
                //       }}
                //     >
                //       {event.hoursDifference < 3 ? (
                //         <Grid container spacing={3}>
                //           <Grid item xs={event.hoursDifference <= 2 ? 12 : 5}>
                //             <AdMedia ad={event} loadAssets={loadAssets as (url: string) => Promise<string>} />
                //           </Grid>
                //           <Grid item xs={event.hoursDifference <= 2 ? 12 : 7}>
                //             <div className="flex flex-col gap-2 mb-2">
                //               <Box
                //                 sx={{
                //                   display: event.hoursDifference < 2 ? 'block' : 'flex',
                //                   gap: '10px'
                //                 }}
                //               >
                //                 <Typography variant="body1">
                //                   <FormattedMessage id="name-template" />:
                //                 </Typography>
                //                 <Typography variant="body1" className="font-bold">
                //                   {event.templateName}
                //                 </Typography>
                //               </Box>
                //               <Box
                //                 sx={{
                //                   display: event.hoursDifference < 2 ? 'block' : 'flex',
                //                   gap: '10px'
                //                 }}
                //               >
                //                 <Typography variant="body1">SSID:</Typography>
                //                 <Typography variant="body1" className="font-bold">
                //                   {event.ssid}
                //                 </Typography>
                //               </Box>
                //               <Box
                //                 sx={{
                //                   display: event.hoursDifference < 2 ? 'block' : 'flex',
                //                   gap: '10px'
                //                 }}
                //               >
                //                 <Typography variant="body1">
                //                   <FormattedMessage id="type-ads" />:
                //                 </Typography>
                //                 <Typography variant="body1" className="block font-bold">
                //                   {event?.adType}
                //                 </Typography>
                //               </Box>
                //               <Box
                //                 sx={{
                //                   display: event.hoursDifference < 2 ? 'block' : 'flex',
                //                   gap: '10px'
                //                 }}
                //               >
                //                 <Typography variant="body1">
                //                   <FormattedMessage id="location" />:
                //                 </Typography>
                //                 <Typography variant="body1" className="font-bold">
                //                   {event?.placement}
                //                 </Typography>
                //               </Box>
                //               <Box
                //                 sx={{
                //                   display: event.hoursDifference < 2 ? 'block' : 'flex',
                //                   gap: '10px'
                //                 }}
                //               >
                //                 <Typography variant="body1">
                //                   <FormattedMessage id="time" />:
                //                 </Typography>
                //                 <Typography variant="body1" className="font-bold">
                //                   {event?.timeStart as string} - {event?.timeEnd as string}
                //                 </Typography>
                //               </Box>
                //             </div>
                //             <div className="flex flex-col gap-2">
                //               <Button
                //                 disabled={!canWrite}
                //                 className="bg-blue-500 text-white w-[calc(100% - 20px)]"
                //                 onClick={() => navigate(`/ad-handle/edit/ad-${event?.adType}/${arg.event.id}`)}
                //               >
                //                 <FormattedMessage id="edit" />
                //               </Button>
                //               <Button
                //                 disabled={!canWrite}
                //                 className="bg-red-500 text-white w-[calc(100% - 20px)] hover:bg-red-200 hover:text-red-500"
                //                 onClick={() => handleOpenDeleteAlert(event, arg.event.id)}
                //               >
                //                 <FormattedMessage id="delete" />
                //               </Button>
                //             </div>
                //           </Grid>
                //         </Grid>
                //       ) : (
                //         <Stack spacing={2} direction={'row'}>
                //           <Box sx={{ width: '100%', maxWidth: event.hoursDifference < 4 ? '250px' : '320px' }}>
                //             <AdMedia ad={event} loadAssets={loadAssets as (url: string) => Promise<string>} />
                //           </Box>
                //           <Stack>
                //             <div className="flex flex-col gap-2 mb-2">
                //               <Box
                //                 sx={{
                //                   display: event.hoursDifference < 2 ? 'block' : 'flex',
                //                   gap: '10px'
                //                 }}
                //               >
                //                 <Typography variant="body1">
                //                   <FormattedMessage id="name-template" />:
                //                 </Typography>
                //                 <Typography variant="body1" className="font-bold">
                //                   {event.templateName}
                //                 </Typography>
                //               </Box>
                //               <Box
                //                 sx={{
                //                   display: event.hoursDifference < 2 ? 'block' : 'flex',
                //                   gap: '10px'
                //                 }}
                //               >
                //                 <Typography variant="body1">SSID:</Typography>
                //                 <Typography variant="body1" className="font-bold">
                //                   {event.ssid}
                //                 </Typography>
                //               </Box>
                //               <Box
                //                 sx={{
                //                   display: event.hoursDifference < 2 ? 'block' : 'flex',
                //                   gap: '10px'
                //                 }}
                //               >
                //                 <Typography variant="body1">
                //                   <FormattedMessage id="type-ads" />:
                //                 </Typography>
                //                 <Typography variant="body1" className="block font-bold">
                //                   {event?.adType}
                //                 </Typography>
                //               </Box>
                //               <Box
                //                 sx={{
                //                   display: event.hoursDifference < 2 ? 'block' : 'flex',
                //                   gap: '10px'
                //                 }}
                //               >
                //                 <Typography variant="body1">
                //                   <FormattedMessage id="location" />:
                //                 </Typography>
                //                 <Typography variant="body1" className="font-bold">
                //                   {event?.placement}
                //                 </Typography>
                //               </Box>
                //               <Box
                //                 sx={{
                //                   display: event.hoursDifference < 2 ? 'block' : 'flex',
                //                   gap: '10px'
                //                 }}
                //               >
                //                 <Typography variant="body1">
                //                   <FormattedMessage id="time" />:
                //                 </Typography>
                //                 <Typography variant="body1" className="font-bold">
                //                   {event?.timeStart as string} - {event?.timeEnd as string}
                //                 </Typography>
                //               </Box>
                //             </div>
                //             <div className="flex flex-col gap-2">
                //               <Button
                //                 disabled={!canWrite}
                //                 className="bg-blue-500 text-white w-[calc(100% - 20px)]"
                //                 onClick={() => navigate(`/ad-handle/edit/ad-${event?.adType}/${arg.event.id}`)}
                //               >
                //                 <FormattedMessage id="edit" />
                //               </Button>
                //               <Button
                //                 disabled={!canWrite}
                //                 className="bg-red-500 text-white w-[calc(100% - 20px)] hover:bg-red-200 hover:text-red-500"
                //                 onClick={() => handleOpenDeleteAlert(event, arg.event.id)}
                //               >
                //                 <FormattedMessage id="delete" />
                //               </Button>
                //             </div>
                //           </Stack>
                //         </Stack>
                //       )}
                //     </MainCard>
                //   );
                // }}
              />
            </div>
          </MainCard>
        </Grid>
      </Grid>
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleCloseDialog}
        open={dialogOpen}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <GenericForm
          title={intl.formatMessage({ id: 'add-ad' })}
          onCancel={handleCloseDialog}
          formik={formik}
          fields={fieldsWithOptions}
          isEditMode={false}
          children={
            <Grid item xs={12} md={12}>
              <Stack spacing={1.25}>
                <InputLabel>
                  {intl.formatMessage({ id: 'range-time' })}
                  <span className=" text-red-500 text-[16px]"> *</span>
                </InputLabel>
                <RangePicker
                  style={{ width: '100%', lineHeight: '24px', height: '50px', borderColor: '#BEC8D0' }}
                  format="HH:mm"
                  getPopupContainer={(triggerNode) => {
                    return triggerNode.parentNode instanceof HTMLElement ? triggerNode.parentNode : document.body;
                  }}
                  value={[
                    formik.values.timeStart ? dayjs(formik.values.timeStart, 'HH:mm') : null,
                    formik.values.timeEnd ? dayjs(formik.values.timeEnd, 'HH:mm') : null
                  ]}
                  onChange={(times, timeStrings) => {
                    formik.setFieldValue('timeStart', `${timeStrings[0]}:00`);
                    formik.setFieldValue('timeEnd', `${timeStrings[1]}:00`);
                  }}
                  placeholder={[intl.formatMessage({ id: 'time-start' }), intl.formatMessage({ id: 'time-end' })]}
                />
              </Stack>
            </Grid>
          }
        />
      </Dialog>
      {adToDelete && (
        <Alert
          alertDelete="alert-delete-ad"
          nameRecord={adToDelete.templateName}
          open={alertOpen}
          handleClose={handleCloseAlert}
          handleDelete={handleDelete}
        />
      )}
    </>
  );
}

export default Calendar;

// interface AdMediaProps {
//   ad: CalendarEvent | undefined;
//   loadAssets: (url: string) => Promise<string>;
// }

// const AdMedia: React.FC<AdMediaProps> = ({ ad, loadAssets }) => {
//   const [mediaUrl, setMediaUrl] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchMedia = async () => {
//       try {
//         setIsLoading(true);
//         let url: string | null = null;

//         if (ad) {
//           switch (ad.adType) {
//             case 'banner':
//               url = ad.imageUrl ? await loadAssets(ad.imageUrl) : null;
//               break;
//             case 'video':
//               url = ad.videoUrl ? await loadAssets(ad.videoUrl) : null;
//               break;
//           }
//         }
//         setMediaUrl(url);
//       } catch (error) {
//         console.error('Error loading media:', error);
//         setMediaUrl(null);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchMedia();
//   }, [ad, loadAssets]);

//   if (isLoading) {
//     return <Skeleton variant="rectangular" width="100%" height={200} animation={'wave'} style={{ borderRadius: 4 }} />;
//   }

//   switch (ad?.adType) {
//     case 'banner':
//       return mediaUrl ? (
//         <img src={mediaUrl} alt="Banner" style={{ width: '100%', height: 200, borderRadius: 4, objectFit: 'cover' }} />
//       ) : (
//         <Skeleton variant="rectangular" width="100%" height={200} animation={'wave'} style={{ borderRadius: 4 }} />
//       );

//     case 'video':
//       return mediaUrl ? (
//         <video style={{ width: '100%', height: 200, borderRadius: 4 }} controls>
//           <source src={mediaUrl} type="video/mp4" />
//           <FormattedMessage id="browser-not-support-video-tag" />
//         </video>
//       ) : (
//         <Skeleton variant="rectangular" width="100%" height={200} animation={'wave'} style={{ borderRadius: 4 }} />
//       );

//     default:
//       return <Skeleton variant="rectangular" width="100%" height={200} animation={'wave'} style={{ borderRadius: 4 }} />;
//   }
// };
