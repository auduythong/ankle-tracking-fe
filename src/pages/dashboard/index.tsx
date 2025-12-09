import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/system';
import { DatePicker } from 'antd';
import MainCard from 'components/MainCard';
import { DonutChart } from 'components/organisms/chart';
import ListWidgets from 'components/template/ListWidget';
import dayjs from 'dayjs';

import useHandleDataLoginV2 from 'hooks/useHandleDataLoginV2';
import useHandleExcel from 'hooks/useHandleExcel';
import useHandleLoginWifiV2 from 'hooks/useHandleLoginWifiV2';
import useHandleSessionV2 from 'hooks/useHandleSessionV2';
import { ExportCurve } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { ChartDonut, ChartLine } from 'types/common';
import { getDatePresets } from 'utils/datePresets';
import { formatNumberWithUnits } from 'utils/handleData';
import TopMetrics from './MetrixTop3';

const { RangePicker } = DatePicker;

interface FilterValue {
  start_date: string | Date;
  end_date: string | Date;
}

const Dashboard = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme(); // Lấy theme hiện tại của MUI
  const isDark = theme.palette.mode === 'dark';
  const intl = useIntl();
  const [filterValue, setFilterValue] = useState<FilterValue>({
    start_date: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD')
  });
  const { fetchExportExcel } = useHandleExcel();
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectTypeReport, setSelectTypeReport] = useState<string>('');

  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds);
  console.log({ currentSite });

  const { useChartLogin, useTop3, useActivitiesCampaign } = useHandleDataLoginV2();
  const { useChartNetwork } = useHandleSessionV2();
  const { usePercentageUsage, useAverageUsage } = useHandleLoginWifiV2();

  const { data: percentageUsage = [{ avg_users_per_day: 0, percentage: 0, slot: '' }], isLoading: loadingPercentage } = usePercentageUsage(
    {
      startDate: filterValue.start_date,
      endDate: filterValue.end_date,
      siteId: currentSite,
      adDataInput: JSON.stringify(currentAds)
    },
    !!currentAds
  );

  const { data: averageUsageData = { total_users: 0, avg_users_per_day: 0 }, isLoading: loadingAverage } = useAverageUsage(
    {
      startDate: filterValue.start_date,
      endDate: filterValue.end_date,
      siteId: currentSite,
      adDataInput: JSON.stringify(currentAds)
    },
    !!currentAds
  );

  const { data: chartUserVisitData = { labels: [], series: [] }, isLoading: loadingChartUserVisit } = useChartLogin<ChartDonut>(
    {
      type: 'visit_frequency',
      startDate: filterValue.start_date,
      endDate: filterValue.end_date,
      siteId: currentSite,
      adDataInput: JSON.stringify(currentAds)
    },
    !!currentAds
  );

  const { data: top3Data = { clicks: [], impressions: [], new_customers: [] }, isLoading: loadingTop3 } = useTop3(
    { adDataInput: JSON.stringify(currentAds) },
    !!currentAds
  );

  const {
    data: activitiesCampaignData = { click_count: 0, ctr_count: 0, impression_count: 0, unique_user_count: 0 },
    isLoading: loadingActivitiesCampaign
  } = useActivitiesCampaign(
    {
      startDate: filterValue.start_date,
      endDate: filterValue.end_date,
      adDataInput: JSON.stringify(currentAds)
    },
    !!currentAds
  );

  const {
    data: chartUserCountData = {
      labels: [],
      series: []
    },
    isLoading: loadingChartUserCount
  } = useChartNetwork<ChartDonut>(
    {
      type: 'user_count',
      startDate: filterValue.start_date,
      endDate: filterValue.end_date,
      siteId: currentSite,
      adDataInput: JSON.stringify(currentAds)
    },
    !!currentAds
  );

  console.log({ loadingChartUserCount });
  console.log({ loadingChartUserVisit });
  const {
    data: chartUserTrafficData = {
      categories: [],
      series: []
    },
    isLoading: loadingChartUserTraffic
  } = useChartNetwork<ChartLine>(
    {
      type: 'user_traffic',
      startDate: filterValue.start_date,
      endDate: filterValue.end_date,
      siteId: currentSite,
      adDataInput: JSON.stringify(currentAds)
    },
    !!currentAds
  );

  const handleStartDateChange = (date: any) => {
    setFilterValue((prev) => ({
      ...prev,
      start_date: date?.format('YYYY-MM-DD') || prev.start_date
    }));
  };

  const handleEndDateChange = (date: any) => {
    setFilterValue((prev) => ({
      ...prev,
      end_date: date?.format('YYYY-MM-DD') || prev.end_date
    }));
  };

  const chartConfigTotalData = {
    chart: { type: 'donut', height: '100%', background: isDark ? 'transparent' : '' },
    colors: [
      '#008FFB', // xanh dương sáng
      '#00E396', // xanh lá ngọc
      '#FEB019', // vàng cam nhẹ
      '#FF4560', // đỏ hồng
      '#775DD0', // tím
      '#546E7A', // xám xanh
      '#26A69A', // xanh ngọc lam
      '#D10CE8', // tím sáng
      '#8D6E63', // nâu xám
      '#F9A825' // vàng đậm
    ],
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
              label: 'Tổng',
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
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return `${val.toFixed(2)}%`;
      }
    },
    legend: {
      show: true,
      position: 'right',
      horizontalAlign: 'left',
      floating: false,
      fontSize: '14px',
      fontFamily: 'Inter var',
      markers: {
        width: 10,
        height: 10,
        radius: 6
      },
      itemMargin: {
        vertical: 6
      },
      labels: {
        colors: theme.palette.secondary.main
      },
      offsetY: 50,
      offsetX: 0
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
      y: {
        formatter: (value: number) => `${formatNumberWithUnits(value)} người dùng`
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter var'
      },
      custom: function ({ series, seriesIndex, w }: { series: number[]; seriesIndex: number; w: any }) {
        const color =
          w.config.colors[seriesIndex] && w.config.colors[seriesIndex].startsWith('#') ? w.config.colors[seriesIndex] : '#000000';
        let textColor = '#fff';

        return `<div style="background-color: ${color}; color: ${textColor}; padding: 10px; border-radius: 4px; border: 1px solid #ddd; font-size: 14px;">
                <span>${w.globals.labels[seriesIndex] || 'Unknown'}: ${formatNumberWithUnits(series[seriesIndex])} người dùng</span>
              </div>`;
      }
    }
  };

  const handleExportReport = async () => {
    if (!exportDateRange) {
      enqueueSnackbar('Please select a date range', { variant: 'warning' });
      return;
    }

    const startDate = exportDateRange[0].format('YYYY-MM-DD');
    const endDate = exportDateRange[1].format('YYYY-MM-DD');

    try {
      const excelData = await fetchExportExcel({
        type: selectTypeReport,
        startDate,
        endDate,
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

  const chartSpeedConfig = {
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter var',
      foreColor: theme.palette.text.secondary // màu text từ theme
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    colors: [theme.palette.primary.main, theme.palette.success.main], // line colors
    legend: {
      show: true,
      fontSize: '14px',
      fontFamily: 'Inter var',
      offsetY: 20,
      labels: { colors: theme.palette.text.primary }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.8,
        opacityFrom: isDark ? 0.3 : 0.5,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: chartUserTrafficData.categories,
      labels: { style: { fontSize: '13px', colors: theme.palette.text.secondary }, offsetY: 5 },
      axisTicks: { show: false },
      axisBorder: { color: theme.palette.divider }
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val.toFixed(0)} người`,
        style: { fontSize: '13px', colors: theme.palette.text.secondary }
      },
      tickAmount: 5
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      style: { fontSize: '12px', fontFamily: 'Inter var', color: theme.palette.text.primary },
      y: { formatter: (val: number) => `${val} người dùng` }
    }
  };

  const optionTypes = [
    { label: intl.formatMessage({ id: 'total-report-by-date' }), value: 'total_report_by_date' },
    { label: intl.formatMessage({ id: 'weekly-report' }), value: 'weekly_report' }
  ];

  const handleDateChange = (dates: any) => {
    if (dates) {
      const start_date = dates[0]?.format('YYYY/MM/DD');
      const end_date = dates[1]?.format('YYYY/MM/DD');

      setFilterValue({ start_date, end_date });
    }
  };

  const categories = percentageUsage.map((h) => h.slot);
  const chartSeries = [{ name: intl.formatMessage({ id: 'user-rate' }), data: percentageUsage.map((item) => item.percentage) }];

  const chartOptions = {
    chart: {
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter var',
      foreColor: theme.palette.text.secondary // text theo theme
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    colors: [theme.palette.primary.main], // line color
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.8,
        opacityFrom: isDark ? 0.3 : 0.5,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    grid: {
      borderColor: theme.palette.divider, // grid màu theo theme
      strokeDashArray: 4,
      padding: { left: 20, right: 20 }
    },
    xaxis: {
      categories,
      labels: {
        rotate: -45,
        style: { fontSize: '13px', colors: theme.palette.text.secondary },
        offsetY: 5
      },
      axisBorder: { color: theme.palette.divider },
      axisTicks: { color: theme.palette.divider }
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val.toFixed(1)}%`,
        style: { fontSize: '13px', colors: theme.palette.text.secondary }
      },
      max: 100,
      tickAmount: 2
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      style: { fontSize: '12px', fontFamily: 'Inter var', color: theme.palette.text.primary },
      y: {
        formatter: (val: number, opts: any) => {
          const avgUsers = percentageUsage[opts.dataPointIndex].avg_users_per_day;
          return `${val.toFixed(1)}% (${avgUsers} ${intl.formatMessage({ id: 'user-per-day' })})`;
        }
      }
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard>
          <div className="flex flex-col gap-3">
            <div className="flex md:flex-row flex-col gap-3 md:items-center justify-between">
              {isMobile ? (
                <>
                  <DatePicker
                    format="DD/MM/YYYY"
                    onChange={handleStartDateChange}
                    style={{ width: '100%', height: '40px' }}
                    value={filterValue.start_date ? dayjs(filterValue.start_date) : undefined}
                    placeholder={intl.formatMessage({ id: 'start-date' })}
                  />

                  <DatePicker
                    format="DD/MM/YYYY"
                    onChange={handleEndDateChange}
                    style={{ width: '100%', height: '40px' }}
                    value={filterValue.end_date ? dayjs(filterValue.end_date) : undefined}
                    placeholder={intl.formatMessage({ id: 'end-date' })}
                  />
                </>
              ) : (
                <RangePicker
                  className="w-full md:w-auto"
                  format="DD/MM/YYYY"
                  onChange={handleDateChange}
                  style={{ minWidth: '100px', maxWidth: '320px', height: '40px' }}
                  value={
                    filterValue.start_date && filterValue.end_date
                      ? [dayjs(filterValue.start_date), dayjs(filterValue.end_date)]
                      : undefined
                  }
                  placeholder={[intl.formatMessage({ id: 'start-date' }), intl.formatMessage({ id: 'end-date' })]}
                  presets={isMobile ? undefined : getDatePresets(intl)}
                />
              )}

              <Button variant="contained" onClick={() => setOpenExportDialog(true)} className="h-10">
                <span className="flex items-center gap-2">
                  <ExportCurve />
                  {intl.formatMessage({ id: 'export' })}
                </span>
              </Button>
            </div>

            {<ListWidgets activitiesCampaignData={activitiesCampaignData} loading={loadingActivitiesCampaign} />}
          </div>
        </MainCard>
      </Grid>

      {/* Hai card chính */}
      <Grid item xs={12} md={4}>
        <MainCard
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'center',
            p: 3
          }}
        >
          {loadingAverage ? (
            <div className="flex flex-col items-center justify-center h-[100%] gap-2">
              <Skeleton variant="text" width={150} height={30} />
              <Skeleton variant="text" width={100} height={60} />
              <Skeleton variant="text" width={180} height={20} />
            </div>
          ) : (
            <>
              <Typography className="font-semibold text-lg">{intl.formatMessage({ id: 'user-traffic' })}</Typography>
              <Typography sx={{ my: 1, fontWeight: 700, color: 'primary.main' }} variant="h1">
                {formatNumberWithUnits(averageUsageData.total_users)}
              </Typography>
              <Typography sx={{ color: 'text.secondary' }} className="text-sm">
                {intl.formatMessage({ id: 'average-per-day' })}:{' '}
                <strong>{formatNumberWithUnits(averageUsageData.avg_users_per_day)}</strong> {intl.formatMessage({ id: 'user' })}
              </Typography>
            </>
          )}
        </MainCard>
      </Grid>

      <Grid item xs={12} md={8}>
        <MainCard sx={{ height: '100%' }} contentSX={{ pb: '5px !important' }}>
          {loadingPercentage ? (
            <>
              <Skeleton variant="text" width={200} height={28} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={150} sx={{ mt: 1, mb: 2, borderRadius: 1 }} />
            </>
          ) : (
            <>
              <Typography sx={{ fontWeight: 700 }} variant="h6">
                {intl.formatMessage({ id: 'user-rate-by-time' })}
              </Typography>
              <ReactApexChart type="area" height={165} series={chartSeries} options={chartOptions} />
            </>
          )}
        </MainCard>
      </Grid>
      <Grid item xs={12} md={8}>
        <MainCard sx={{ height: '100%' }}>
          {loadingChartUserTraffic ? (
            <>
              <Skeleton variant="text" width="40%" height={30} />
              <Skeleton variant="rectangular" height={300} sx={{ mt: 1, borderRadius: 1 }} />
            </>
          ) : (
            <>
              <Typography sx={{ fontWeight: 700 }} variant="h6">
                {intl.formatMessage({ id: 'user-traffic' })}
              </Typography>
              <ReactApexChart type="area" height={300} options={chartSpeedConfig} series={chartUserTrafficData.series || []} />
            </>
          )}
        </MainCard>
      </Grid>
      <Grid item xs={12} md={4}>
        <MainCard sx={{ height: '100%' }}>
          <TopMetrics data={top3Data} loading={loadingTop3} />
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard sx={{ height: '100%' }}>
          <DonutChart
            key={isDark ? 'dark' : 'light'}
            title={intl.formatMessage({ id: 'user-return' })}
            labels={chartUserCountData.labels}
            series={chartUserCountData.series}
            chartOptions={chartConfigTotalData}
          />
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard sx={{ height: '100%' }}>
          <DonutChart
            key={isDark ? 'dark' : 'light'}
            title={intl.formatMessage({ id: 'visit-frequency' })}
            labels={chartUserVisitData.labels}
            series={chartUserVisitData.series}
            chartOptions={chartConfigTotalData}
          />
        </MainCard>
      </Grid>

      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle> {intl.formatMessage({ id: 'select-date-range-weekly-report' })}</DialogTitle>
        <DialogContent>
          <RangePicker
            format="DD/MM/YYYY"
            onChange={(dates) => setExportDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            style={{ width: '100%', marginTop: '20px', height: 48 }}
            popupStyle={{ zIndex: 99999 }}
          />{' '}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{intl.formatMessage({ id: 'select-type-report' })}</InputLabel>
            <Select
              value={selectTypeReport || ''}
              onChange={(e) => setSelectTypeReport(String(e.target.value))}
              label={intl.formatMessage({ id: 'select-type-report' })}
              required
            >
              {optionTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>{intl.formatMessage({ id: 'cancel' })}</Button>

          <Button onClick={handleExportReport} variant="contained" disabled={!exportDateRange}>
            {intl.formatMessage({ id: 'export' })}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default Dashboard;
