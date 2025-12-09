import { Autocomplete, Grid, Skeleton, TextField, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/system';
import { DatePicker } from 'antd';
import MainCard from 'components/MainCard';
import { DonutChart } from 'components/organisms/chart';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import dayjs from 'dayjs';
import useHandleAds from 'hooks/useHandleAds';
import useHandleUserBehaviors from 'hooks/useHandleUserBehaviors';
import { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { FormattedMessage, useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { DataAds } from 'types';
import { getDatePresets } from 'utils/datePresets';
import { formatNumberWithUnits } from 'utils/handleData';

const { RangePicker } = DatePicker;

interface FilterValue {
  start_date: string | Date;
  end_date: string | Date;
  adId?: number;
}

type TableKey = 'topUsers' | 'sessions' | 'topPages' | 'trackingEvents';

interface PaginationState {
  page: number;
  size: number;
}

const UserBehaviorDashboard = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const intl = useIntl();
  const [pagination, setPagination] = useState<Record<TableKey, PaginationState>>({
    topUsers: { page: 1, size: 5 },
    sessions: { page: 1, size: 5 },
    topPages: { page: 1, size: 5 },
    trackingEvents: { page: 1, size: 5 }
  });

  // --- STATE & FILTERS ---
  const [filterValue, setFilterValue] = useState<FilterValue>({
    start_date: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD')
  });

  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds);

  const [optionsAds, setOptionsAds] = useState<{ label: string; value: number }[]>([]);

  const commonParams = {
    startDate: filterValue.start_date,
    endDate: filterValue.end_date,
    siteId: currentSite,
    adDataInput: JSON.stringify(currentAds),
    adId: filterValue.adId
  };

  const isEnabled = !!currentAds;

  // --- HOOKS ---
  const {
    // 1. Overview
    useOverview,
    // 2. Charts Trends
    useStatsEngagementOverTime,
    useSessionsOverTime,
    useHourlyActivityHeatmap,
    // 3. Charts Distribution
    useEngagementFunnel,
    useEventTypeDistribution,
    usePlatformDistribution,
    useLanguageDistribution,
    useScreenResolutionDistribution,
    useVisitFrequencyDistribution,
    useUserSegmentDistribution, // Chart phân bố segment
    // 4. Stats & Tables
    useStatsDevices,
    useStatsUserSegments, // List table segment
    // useTopUsers,
    // useSessions,
    useTopPagesVisited,
    useTrackingEvents
    // useStatsEventTypes // Stats raw data (optional usage)
  } = useHandleUserBehaviors();
  const { fetchDataAds } = useHandleAds();

  // 1. Overview
  const {
    data: overviewData = { totalUniqueUsers: 0, totalSessions: 0, totalEvents: 0, avgSessionDuration: 0, totalClicks: 0, totalScrolls: 0 },
    isLoading: loadingOverview
  } = useOverview(commonParams, isEnabled);

  // 2. Trends
  // Engagement Over Time trả về mảng object -> Cần map sang chart series
  const { data: engagementRaw = [], isLoading: loadingEngTrend } = useStatsEngagementOverTime(commonParams, isEnabled);

  // Transform Engagement Data
  const engagementChartData = {
    categories: engagementRaw.map((item) => item.period),
    series: [
      { name: 'Sessions', data: engagementRaw.map((item) => item.sessions) },
      { name: 'Clicks', data: engagementRaw.map((item) => parseInt(item.clicks, 10) || 0) } // API trả string "2" -> parse int
    ]
  };

  // Sessions Over Time trả về object chứa mảng labels, sessions... -> Dùng trực tiếp được
  const { data: sessionsTimeData = { labels: [], sessions: [], uniqueUsers: [] }, isLoading: loadingSessTrend } = useSessionsOverTime(
    commonParams,
    isEnabled
  );

  const { data: hourlyData = { hours: [], sessions: [], uniqueUsers: [] }, isLoading: loadingHourly } = useHourlyActivityHeatmap(
    commonParams,
    isEnabled
  );

  console.log({ hourlyData, loadingHourly });
  const sessionsChartData = {
    categories: sessionsTimeData.labels || [],
    series: [
      { name: 'Sessions', data: sessionsTimeData.sessions || [] },
      { name: 'Unique Users', data: sessionsTimeData.uniqueUsers || [] }
    ]
  };

  // 3. Distribution Charts
  const { data: funnelData = { stages: [], counts: [] }, isLoading: loadingFunnel } = useEngagementFunnel(commonParams, isEnabled);
  const { data: eventTypeData = { labels: [], data: [] }, isLoading: loadingEventType } = useEventTypeDistribution(commonParams, isEnabled);
  const { data: platformData = { labels: [], data: [] }, isLoading: loadingPlatform } = usePlatformDistribution(commonParams, isEnabled);
  const { data: languageData = { labels: [], data: [] }, isLoading: loadingLanguage } = useLanguageDistribution(commonParams, isEnabled);

  const { data: screenData = { labels: [], data: [] }, isLoading: loadingScreen } = useScreenResolutionDistribution(
    commonParams,
    isEnabled
  );
  const { data: visitFreqData = { labels: [], data: [] }, isLoading: loadingVisitFreq } = useVisitFrequencyDistribution(
    commonParams,
    isEnabled
  );
  const { data: userSegDistData = { labels: [], data: [] }, isLoading: loadingUserSegDist } = useUserSegmentDistribution(
    commonParams,
    isEnabled
  );
  const { data: devicesData = { labels: [], data: [] }, isLoading: loadingDevices } = useStatsDevices(commonParams, isEnabled);

  console.log({
    screenData,
    loadingScreen,
    visitFreqData,
    loadingVisitFreq,
    userSegDistData,
    loadingUserSegDist,
    devicesData,
    loadingDevices,
    loadingPlatform,
    loadingLanguage,
    loadingEventType
  });

  // 4. Tables
  // Bảng 1: Segments (Đã sửa: Truyền page/size vào hook)
  const { data: segmentsData = [], isLoading: loadingSegments } = useStatsUserSegments({ ...commonParams }, isEnabled);

  // // Bảng 2: Top Users
  // const { data: topUsersData = { list: [], total: 0, totalPages: 0 }, isLoading: loadingTopUsers } = useTopUsers(
  //   { ...commonParams, page: pagination.topUsers.page, pageSize: pagination.topUsers.size },
  //   isEnabled
  // );

  // // Bảng 3: Sessions
  // const { data: sessionsListData = { list: [], total: 0, totalPages: 0 }, isLoading: loadingSessionsList } = useSessions(
  //   { ...commonParams, page: pagination.sessions.page, pageSize: pagination.sessions.size },
  //   isEnabled
  // );

  // Top Pages (Server-side)
  const { data: topPagesData = { list: [], total: 0, totalPages: 0 }, isLoading: loadingTopPages } = useTopPagesVisited(
    { ...commonParams, page: pagination.topPages.page, pageSize: pagination.topPages.size },
    isEnabled
  );

  // Tracking Events (Server-side)
  const { data: trackingEventsData = { list: [], total: 0, totalPages: 0 }, isLoading: loadingTrackingEvents } = useTrackingEvents(
    { ...commonParams, page: pagination.trackingEvents.page, pageSize: pagination.trackingEvents.size },
    isEnabled
  );

  console.log({ topPagesData, loadingTopPages, trackingEventsData, loadingTrackingEvents });

  const handleGetOptionsAds = async () => {
    try {
      const dataAds: DataAds[] = await fetchDataAds({ page: 1, pageSize: 50, adDataInput: JSON.stringify(currentAds) });
      setOptionsAds(
        dataAds.map((item) => {
          return {
            label: item.template_name || '',
            value: item.id
          };
        })
      );
    } catch (error) {}
  };

  useEffect(() => {
    handleGetOptionsAds();
    return () => {};
    //eslint-disable-next-line
  }, []);
  // --- HANDLERS ---
  const handleDateChange = (dates: any) => {
    if (dates) {
      setFilterValue({
        start_date: dates[0]?.format('YYYY-MM-DD'),
        end_date: dates[1]?.format('YYYY-MM-DD')
      });
    }
  };

  const handlePageChange = (tableKey: TableKey) => (newPage: number, newSize: number) => {
    setPagination((prev) => ({
      ...prev,
      [tableKey]: { page: newPage, size: newSize }
    }));
  };

  console.log({ handlePageChange });

  // --- CHART CONFIGS ---
  const getAreaChartConfig = (categories: string[]) => ({
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      fontFamily: 'Inter var',
      foreColor: theme.palette.text.secondary,
      zoom: { enabled: false }
    },
    colors: [theme.palette.primary.main, theme.palette.success.main],
    stroke: { curve: 'smooth' as const, width: 2 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 0.8, opacityFrom: isDark ? 0.3 : 0.5, opacityTo: 0.05, stops: [0, 100] }
    },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
    dataLabels: { enabled: false },
    xaxis: {
      categories: categories.map((value) => dayjs(value).format('DD/MM/YYYY')),
      labels: {
        style: {
          fontSize: '12px',
          colors: theme.palette.text.secondary
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px', colors: theme.palette.text.secondary },
        formatter: (val: number) => formatNumberWithUnits(val)
      }
    },
    tooltip: { theme: isDark ? 'dark' : 'light' }
  });

  // Config riêng cho biểu đồ Hourly (24h)
  const hourlyChartConfig = {
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      fontFamily: 'Inter var',
      foreColor: theme.palette.text.secondary,
      zoom: { enabled: false }
    },
    colors: [theme.palette.primary.main, theme.palette.success.main],
    stroke: { curve: 'smooth' as const, width: 2 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 0.8, opacityFrom: isDark ? 0.3 : 0.5, opacityTo: 0.05, stops: [0, 100] }
    },
    dataLabels: { enabled: false },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 4 },
    xaxis: {
      categories: hourlyData.hours || [], // Map từ JSON: ["0:00", "1:00"...]
      tickAmount: 6, // Chỉ hiện mốc 3 tiếng/lần cho đỡ rối
      labels: { style: { fontSize: '12px', colors: theme.palette.text.secondary } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { fontSize: '12px', colors: theme.palette.text.secondary },
        formatter: (val: number) => formatNumberWithUnits(val)
      }
    },
    // Quan trọng: Tooltip shared để so sánh Sessions vs Users tại 1 thời điểm
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      shared: true,
      intersect: false,
      y: {
        formatter: function (val: number) {
          return formatNumberWithUnits(val);
        }
      }
    },
    legend: { show: true, position: 'top' as const, horizontalAlign: 'right' as const }
  };

  const barChartConfig = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
      fontFamily: 'Inter var',
      foreColor: theme.palette.text.secondary
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true, // 1. BẮT BUỘC: Phải quay ngang thì mới ra dáng phễu
        barHeight: '70%', // 2. Độ dày của thanh (nên để to một chút)
        isFunnel: true // 3. QUAN TRỌNG: Biến thanh chữ nhật thành hình thang
      }
    },
    colors: [theme.palette.primary.main],
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: {
        lines: { show: false } // Nên ẩn lưới dọc đi cho sạch mắt
      }
    },
    dataLabels: {
      enabled: true,
      // Cấu hình chữ
      style: {
        fontSize: '12px',
        fontWeight: 600,
        // Chữ tự động theo Theme (Sáng -> Đen, Tối -> Trắng)
        colors: [theme.palette.text.primary]
      },
      // Cấu hình cái HỘP NỀN bao quanh chữ (Quan trọng)
      background: {
        enabled: true,
        // Màu nền của hộp: Lấy theo màu nền giấy của theme (Trắng hoặc Đen xám)
        color: theme.palette.background.paper,

        // Viền nhẹ cho hộp để tách biệt hẳn với thanh Bar
        borderWidth: 1,
        borderColor: theme.palette.divider,

        borderRadius: 4, // Bo góc nhẹ
        padding: 6, // Khoảng cách đệm
        opacity: 0.4, // Hơi mờ nhẹ 1 chút cho đẹp
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 1,
          color: '#000',
          opacity: 0.1
        }
      },
      formatter: function (val: any, opt: any) {
        return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val;
      }
    },
    xaxis: {
      categories: funnelData.stages,
      labels: {
        show: false, // Ẩn trục số bên dưới đi vì đã có dataLabels
        style: { fontSize: '12px', colors: theme.palette.text.secondary }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    tooltip: { theme: isDark ? 'dark' : 'light' }
  };

  const donutColors = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26A69A', '#D10CE8'];

  const donutChartOptions = {
    chart: { type: 'donut', background: 'transparent' },
    colors: donutColors,
    legend: {
      show: true,
      position: 'right',
      width: 200,
      fontSize: '14px',
      fontFamily: 'Inter var',
      labels: { colors: theme.palette.text.secondary }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return `${val.toFixed(2)}%`;
      }
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Inter var',
              color: theme.palette.secondary.main,
              offsetY: -10
            },
            value: {
              show: true,
              fontSize: '24px',
              fontFamily: 'Inter var',
              color: isDark ? theme.palette.secondary.main : theme.palette.text.primary,
              fontWeight: 700,
              formatter: function (val: any) {
                // Convert về number nếu là string
                const numVal = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;

                return formatNumberWithUnits(numVal);
              }
            },
            total: {
              show: true,
              label: intl.formatMessage({ id: 'user-behavior-total', defaultMessage: 'Tổng' }),
              fontSize: '16px',
              fontFamily: 'Inter var',
              color: theme.palette.secondary.main,
              formatter: function (w: any) {
                // Tính tổng tất cả các giá trị series
                const total = w.globals.series.reduce((a: number, b: number) => a + b, 0);
                return formatNumberWithUnits(total);
              }
            }
          }
        }
      }
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            offsetY: 0
          }
        }
      }
    ],
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      custom: function ({ series, seriesIndex, w }: { series: number[]; seriesIndex: number; w: any }) {
        const color =
          w.config.colors[seriesIndex] && w.config.colors[seriesIndex].startsWith('#') ? w.config.colors[seriesIndex] : '#000000';
        let textColor = '#fff';

        return `<div style="background-color: ${color}; color: ${textColor}; padding: 10px; border-radius: 4px; border: 1px solid #ddd; font-size: 14px;">
                <span>${w.globals.labels[seriesIndex] || 'Unknown'}: ${formatNumberWithUnits(series[seriesIndex])}</span>
              </div>`;
      }
    }
  };

  // --- RENDER HELPERS ---
  const renderOverviewCard = (title: string, value: number, loading: boolean) => (
    <MainCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', p: 2 }}>
      {loading ? (
        <div className="flex flex-col items-center gap-2">
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="text" width={120} height={40} />
        </div>
      ) : (
        <>
          <Typography className="font-semibold text-base" color="textSecondary">
            {title}
          </Typography>
          <Typography sx={{ my: 1, fontWeight: 700, color: 'primary.main' }} variant="h1">
            {formatNumberWithUnits(value)}
          </Typography>
        </>
      )}
    </MainCard>
  );

  const segmentColumns = useMemo(
    () => [
      {
        width: 100,
        Header: <FormattedMessage id="segment" defaultMessage="Segment" />,
        accessor: 'segment',
        disableSortBy: true,
        Cell: ({ value }: { value: string }) => (
          <Typography variant="body2" className="capitalize font-medium">
            {value}
          </Typography>
        )
      },
      {
        width: 100,
        Header: <FormattedMessage id="count" defaultMessage="Count" />,
        accessor: 'count',
        align: 'right',
        disableSortBy: true,
        Cell: ({ value }: { value: number }) => (
          <Typography variant="body2" fontWeight={600}>
            {formatNumberWithUnits(value)}
          </Typography>
        )
      },
      {
        width: 100,
        Header: <FormattedMessage id="avg-clicks" defaultMessage="Avg. Clicks" />,
        accessor: 'avg_clicks',
        align: 'right',
        disableSortBy: true,
        Cell: ({ value }: { value: number }) => <Typography variant="body2">{value ? value.toFixed(2) : '0'}</Typography>
      },
      {
        width: 100,
        Header: <FormattedMessage id="avg-duration" defaultMessage="Avg. Duration" />,
        accessor: 'avg_duration',
        align: 'right',
        disableSortBy: true,
        Cell: ({ value }: { value: number | null }) => <Typography variant="body2">{value ? `${value.toFixed(1)}s` : '-'}</Typography>
      }
    ],
    []
  );

  // const topUsersColumns = useMemo(
  //   () => [
  //     {
  //       width: 150,
  //       Header: <FormattedMessage id="user" />,
  //       accessor: 'device_fingerprint',
  //       disableSortBy: true,
  //       Cell: ({ value }: { value: string }) => (
  //         <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
  //           {value}
  //         </Typography>
  //       )
  //     },
  //     {
  //       width: 100,
  //       Header: <FormattedMessage id="total-visits" />,
  //       accessor: 'total_visits',
  //       align: 'right',
  //       disableSortBy: true
  //     },
  //     {
  //       width: 120,
  //       Header: <FormattedMessage id="total-duration" />,
  //       accessor: 'total_session_duration',
  //       align: 'right',
  //       disableSortBy: true,
  //       Cell: ({ value }: { value: number }) => <Typography variant="body2">{value ? `${value}s` : '-'}</Typography>
  //     },
  //     {
  //       width: 100,
  //       Header: <FormattedMessage id="segment" />,
  //       accessor: 'current_segment',
  //       disableSortBy: true
  //     }
  //   ],
  //   []
  // );

  // const recentSessionsColumns = useMemo(
  //   () => [
  //     {
  //       width: 150,
  //       Header: <FormattedMessage id="user" />,
  //       accessor: 'device_fingerprint',
  //       disableSortBy: true,
  //       Cell: ({ value }: { value: string }) => (
  //         <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
  //           {value}
  //         </Typography>
  //       )
  //     },
  //     {
  //       width: 100,
  //       Header: <FormattedMessage id="duration" />,
  //       accessor: 'session_duration',
  //       align: 'right',
  //       disableSortBy: true,
  //       Cell: ({ value }: { value: number }) => <Typography variant="body2">{value ? `${value}s` : '-'}</Typography>
  //     },
  //     {
  //       width: 100,
  //       Header: <FormattedMessage id="total-clicks" />,
  //       accessor: 'total_clicks',
  //       align: 'right',
  //       disableSortBy: true
  //     },
  //     {
  //       width: 100,
  //       Header: <FormattedMessage id="segment" />,
  //       accessor: 'user_segment',
  //       disableSortBy: true
  //     }
  //   ],
  //   []
  // );

  // Helper function to translate event type labels
  const translateEventTypeLabel = (label: string): string => {
    const labelMap: Record<string, string> = {
      page_load: 'event-type-page-load',
      session_end: 'event-type-session-end',
      click: 'event-type-click',
      wifi_session_end: 'event-type-wifi-session-end',
      scroll_milestone: 'event-type-scroll-milestone',
      user_session_end: 'event-type-user-session-end',
      user_idle: 'event-type-user-idle',
      user_interaction: 'event-type-user-interaction'
    };

    const translationKey = labelMap[label];
    if (translationKey) {
      return intl.formatMessage({ id: translationKey, defaultMessage: label });
    }
    return label;
  };

  // Translate event type labels
  const translatedEventTypeLabels = useMemo(() => eventTypeData.labels.map(translateEventTypeLabel), [eventTypeData.labels, intl.locale]);

  return (
    <Grid container spacing={3}>
      {/* --- HEADER: DATE PICKER --- */}
      <Grid item xs={12}>
        <MainCard>
          <div className="flex flex-col md:flex-row  items-center gap-3">
            <RangePicker
              className="w-full md:w-auto"
              format="DD/MM/YYYY"
              onChange={handleDateChange}
              style={{ minWidth: '100px', maxWidth: '320px', height: '40px' }}
              value={filterValue.start_date ? [dayjs(filterValue.start_date), dayjs(filterValue.end_date)] : undefined}
              presets={isMobile ? undefined : getDatePresets(intl)}
            />

            <Autocomplete
              options={optionsAds}
              sx={{
                minWidth: '200px',
                height: 40
              }}
              className="w-full md:w-auto"
              getOptionLabel={(option) => option.label}
              renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'select-ad' })} variant="outlined" />}
              onChange={(event, value) => setFilterValue((prev) => ({ ...prev, adId: value?.value }))}
              isOptionEqualToValue={(option, value) => option.value === value.value}
            />
          </div>
        </MainCard>
      </Grid>
      {/* --- ROW 1: OVERVIEW CARDS --- */}
      {/* Sử dụng các field từ UserBehaviorOverview interface */}
      <Grid item xs={12} md={4}>
        {renderOverviewCard(
          intl.formatMessage({ id: 'user-behavior-total-users', defaultMessage: 'Total Users' }),
          overviewData.totalUniqueUsers,
          loadingOverview
        )}
      </Grid>
      <Grid item xs={12} md={4}>
        {renderOverviewCard(
          intl.formatMessage({ id: 'user-behavior-total-sessions', defaultMessage: 'Total Sessions' }),
          overviewData.totalSessions,
          loadingOverview
        )}
      </Grid>
      <Grid item xs={12} md={4}>
        {renderOverviewCard(
          intl.formatMessage({ id: 'user-behavior-total-events', defaultMessage: 'Total Events' }),
          overviewData.totalEvents,
          loadingOverview
        )}
      </Grid>
      {/* --- ROW 2: LINE CHARTS (TRENDS) --- */}
      <Grid item xs={12} md={6}>
        <MainCard sx={{ height: '100%' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            <FormattedMessage id="user-behavior-engagement-over-time" defaultMessage="Engagement Over Time" />
          </Typography>
          {loadingEngTrend ? (
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
          ) : (
            <ReactApexChart
              options={getAreaChartConfig(engagementChartData.categories)}
              series={engagementChartData.series}
              type="area"
              height={300}
            />
          )}
        </MainCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <MainCard sx={{ height: '100%' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            <FormattedMessage id="user-behavior-sessions-over-time" defaultMessage="Sessions Over Time" />
          </Typography>
          {loadingSessTrend ? (
            <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 1 }} />
          ) : (
            <ReactApexChart
              options={getAreaChartConfig(sessionsChartData.categories)}
              series={sessionsChartData.series}
              type="area"
              height={300}
            />
          )}
        </MainCard>
      </Grid>
      {/* --- ROW 3: HOURLY ACTIVITY (NEW) --- */}
      <Grid item xs={7}>
        <MainCard sx={{ height: '100%' }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            <FormattedMessage id="user-behavior-hourly-activity" defaultMessage="Hourly Activity (24h)" />
          </Typography>
          {loadingHourly ? (
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
          ) : (
            <ReactApexChart
              options={hourlyChartConfig}
              series={[
                { name: intl.formatMessage({ id: 'sessions' }), data: hourlyData.sessions || [] },
                { name: intl.formatMessage({ id: 'unique-users' }), data: hourlyData.uniqueUsers || [] }
              ]}
              type="area"
              height={300}
            />
          )}
        </MainCard>
      </Grid>
      {/* Donut Charts: API trả về { labels: [], data: [] } -> map vào DonutChart */}
      <Grid item xs={12} md={5}>
        <MainCard sx={{ height: '100%' }}>
          <DonutChart
            title={intl.formatMessage({ id: 'user-behavior-event-types', defaultMessage: 'Event Types' })}
            // loading={loadingEventType}
            labels={translatedEventTypeLabels}
            series={eventTypeData.data} // JSON field là data, không phải series
            chartOptions={{ ...donutChartOptions, labels: translatedEventTypeLabels }}
            key={isDark ? 'evt-dark' : 'evt-light'}
          />
        </MainCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <MainCard sx={{ height: '100%' }}>
          <DonutChart
            title={intl.formatMessage({ id: 'user-behavior-language', defaultMessage: 'Language' })}
            // loading={loadingLanguage}
            labels={languageData.labels}
            series={languageData.data}
            chartOptions={{ ...donutChartOptions, labels: languageData.labels }}
            key={isDark ? 'lang-dark' : 'lang-light'}
          />
        </MainCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <MainCard sx={{ height: '100%' }}>
          <DonutChart
            title={intl.formatMessage({ id: 'user-behavior-platform', defaultMessage: 'Platform' })}
            // loading={loadingPlatform}
            labels={platformData.labels}
            series={platformData.data}
            chartOptions={{ ...donutChartOptions, labels: platformData.labels }}
            key={isDark ? 'plt-dark' : 'plt-light'}
          />
        </MainCard>
      </Grid>
      {/* --- ROW 4: TABLES --- */}
      <Grid item xs={12} md={7}>
        <MainCard
          title={<FormattedMessage id="user-behavior-user-segments" defaultMessage="User Segments" />}
          sx={{ height: '100%' }}
          contentSX={{ p: 0 }}
        >
          <GeneralizedTableV2
            scroll={{ x: 500 }}
            isLoading={loadingSegments}
            columns={segmentColumns}
            data={segmentsData}
            hiddenPagination
            hiddenFilter
            currentPage={0}
          />
        </MainCard>
      </Grid>
      <Grid item xs={12} md={5}>
        <MainCard sx={{ height: '100%' }}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            <FormattedMessage id="user-behavior-engagement-funnel" defaultMessage="Engagement Funnel" />
          </Typography>
          {loadingFunnel ? (
            <Skeleton height={200} variant="rectangular" />
          ) : (
            <ReactApexChart
              options={barChartConfig}
              series={[{ name: 'Count', data: funnelData.counts }]} // Map đúng counts
              type="bar"
              height={250}
            />
          )}
        </MainCard>
      </Grid>
      {/* <Grid item xs={12} md={6}>
        <MainCard
          title={<FormattedMessage id="user-behavior-top-users" defaultMessage="Top Users" />}
          sx={{ height: '100%' }}
          contentSX={{ p: 0 }}
        >
          <GeneralizedTableV2
            scroll={{ x: 500 }}
            isLoading={loadingTopUsers}
            columns={topUsersColumns}
            data={topUsersData.list}
            hiddenPagination
            hiddenFilter
            currentPage={0}
          />
        </MainCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <MainCard
          title={<FormattedMessage id="user-behavior-recent-sessions" defaultMessage="Recent Sessions" />}
          sx={{ height: '100%' }}
          contentSX={{ p: 0 }}
        >
          <GeneralizedTableV2
            scroll={{ x: 500 }}
            isLoading={loadingSessionsList}
            columns={recentSessionsColumns}
            data={sessionsListData.list}
            hiddenPagination
            hiddenFilter
            currentPage={0}
          />
        </MainCard>
      </Grid> */}
    </Grid>
  );
};

export default UserBehaviorDashboard;
