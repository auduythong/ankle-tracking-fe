import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import { DatePicker } from 'antd';
import MainCard from 'components/MainCard';
import { DonutChart } from 'components/organisms/chart';
import ListWidgets from 'components/template/ListWidget';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import useHandleCampaign from 'hooks/useHandleCampaign';
import useHandleDataLogin from 'hooks/useHandleDataLogin';
import useHandleDataLoginV2 from 'hooks/useHandleDataLoginV2';
import useHandleExcel from 'hooks/useHandleExcel';
import useHandleSession from 'hooks/useHandleSession';
import { ExportSquare } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router';
import { RootState, useSelector } from 'store';
import { formatChartData, formatNumberWithUnits } from 'utils/handleData';
// import { Typography } from '@mui/material';

interface FilterValue {
  start_date: string;
  end_date: string;
}

interface ChartDonut {
  labels: string[];
  series: number[];
}

interface ChartLine {
  categories: string[];
  series: { name: string; data: number[] }[];
}

interface DataChart {
  userCount: ChartDonut;
  userTraffic: ChartLine;
  userVisit: ChartDonut;
  wifiAccess: ChartDonut;
  userBehavior: ChartLine;
  userBrowser: ChartDonut;
  userDevice: ChartDonut;
  userOS: ChartDonut;
}

const TabReport = () => {
  const theme = useTheme(); // Lấy theme hiện tại của MUI
  const isDark = theme.palette.mode === 'dark';
  const intl = useIntl();
  dayjs.extend(customParseFormat);
  const { id: campaignId } = useParams<{ id: string }>();
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds);

  const { fetchDataChartNetwork } = useHandleSession();
  const { fetchDataChartLogin } = useHandleDataLogin();
  const { fetchDataCampaign } = useHandleCampaign();
  const { fetchExportExcel } = useHandleExcel();
  const { RangePicker } = DatePicker;

  const [exportDateRange, setExportDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [dataChart, setDataChart] = useState<DataChart | null>(null);

  const [filterValue, setFilterValue] = useState<FilterValue>({ start_date: '', end_date: '' });
  const [adId, setAdId] = useState<number>(); // State to store adId
  const [loadingDataChart, setLoadingDataChart] = useState(false);
  const { useActivitiesCampaign } = useHandleDataLoginV2();

  const {
    data: activitiesCampaignData = { click_count: 0, ctr_count: 0, impression_count: 0, unique_user_count: 0 },
    isLoading: loadingActivitiesCampaign
  } = useActivitiesCampaign({
    startDate: filterValue.start_date,
    endDate: filterValue.end_date,
    adDataInput: JSON.stringify(currentAds),
    adId
  });
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // Fetch campaign data to get created_date, expired_date, and ad_id
  const fetchCampaignData = async (id: number) => {
    try {
      const campaignData = await fetchDataCampaign({ id, siteId: currentSite, adDataInput: JSON.stringify(currentAds) });
      if (!campaignData[0]) throw new Error('Campaign not found');
      const { created_date, expired_date, ad_id } = campaignData[0];
      if (!ad_id) throw new Error('Ad ID not found in campaign data');

      setFilterValue({
        start_date: dayjs(created_date).format('YYYY-MM-DD'),
        end_date: dayjs(expired_date, ['DD/MM/YYYY', 'MM/DD/YYYY']).format('YYYY-MM-DD')
      });
      setAdId(ad_id);
    } catch (err) {
      // setError('Failed to fetch campaign data');
      console.error(err);
    }
  };

  const getDataChart = async (startDate: string, endDate: string, currentSite: string, adId: number) => {
    try {
      setLoadingDataChart(true);
      const [
        dataChartUserCount,
        dataChartUserTraffic,
        dataChartVisitFrequency,
        dataWifiAccess,
        dataUserBehavior,
        dataUserBrowser,
        dataUserDevice,
        dataUserOS
      ] = await Promise.all([
        fetchDataChartNetwork({
          type: 'user_count',
          startDate,
          endDate,
          siteId: currentSite,
          adId,
          adDataInput: JSON.stringify(currentAds)
        }),
        fetchDataChartNetwork({
          type: 'user_traffic',
          startDate,
          endDate,
          siteId: currentSite,
          adId,
          adDataInput: JSON.stringify(currentAds)
        }),
        fetchDataChartLogin({
          type: 'visit_frequency',
          startDate,
          endDate,
          siteId: currentSite,
          adId,
          adDataInput: JSON.stringify(currentAds)
        }),
        fetchDataChartLogin({
          type: 'wifi_access_activities',
          startDate,
          endDate,
          siteId: currentSite,
          adId,
          adDataInput: JSON.stringify(currentAds)
        }),
        fetchDataChartLogin({
          type: 'user_behavior',
          startDate,
          endDate,
          siteId: currentSite,
          adId,
          adDataInput: JSON.stringify(currentAds)
        }),
        fetchDataChartLogin({
          type: 'user_browser_usage',
          startDate,
          endDate,
          siteId: currentSite,
          adId,
          adDataInput: JSON.stringify(currentAds)
        }),
        fetchDataChartLogin({
          type: 'user_device_type',
          startDate,
          endDate,
          siteId: currentSite,
          adId,
          adDataInput: JSON.stringify(currentAds)
        }),
        fetchDataChartLogin({
          type: 'user_os_type',
          startDate,
          endDate,
          siteId: currentSite,
          adId,
          adDataInput: JSON.stringify(currentAds)
        })
      ]);

      setDataChart({
        userCount: dataChartUserCount,
        userTraffic: formatChartData(dataChartUserTraffic, 'DD/MM'),
        userVisit: dataChartVisitFrequency,
        wifiAccess: dataWifiAccess,
        userBehavior: formatChartData(dataUserBehavior, 'DD/MM'),
        userBrowser: dataUserBrowser,
        userDevice: dataUserDevice,
        userOS: dataUserOS
      });
    } catch (err) {
      // setError('Failed to fetch chart data');
      console.error(err);
    } finally {
      setLoadingDataChart(false);
    }
  };

  const refreshData = async () => {
    if (!adId || !filterValue.start_date || !filterValue.end_date) return;
    // setLoading(true);
    await Promise.all([
      getDataChart(filterValue.start_date, filterValue.end_date, currentSite, adId)
      // getSummaryAds(filterValue.start_date, filterValue.end_date, adId)
    ]);
    // setLoading(false);
  };

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData(Number(campaignId));
    }
    //eslint-disable-next-line
  }, [campaignId, currentSite, currentAds]);

  useEffect(() => {
    if (filterValue.start_date && filterValue.end_date && adId) {
      refreshData();
    }
    //eslint-disable-next-line
  }, [filterValue.start_date, filterValue.end_date, adId, currentSite, currentAds]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    //eslint-disable-next-line
  }, [filterValue.start_date, filterValue.end_date, adId, currentSite, currentAds]);

  const chartDonutConfig = {
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
                console.log('Center value:', val, typeof val);

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
      width: 200,
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
      offsetY: 20,
      offsetX: 0
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          legend: {
            position: 'bottom',
            horizontalAlign: 'center',
            offsetY: 0,
            width: '100%'
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

  const chartSpeedConfig = {
    chart: {
      type: 'area' as 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Inter var',
      foreColor: theme.palette.text.secondary // màu text từ theme
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    legend: {
      show: true,
      fontSize: '14px',
      fontFamily: 'Inter var',
      offsetY: 20, // cách top 20px
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
      categories: dataChart?.userTraffic?.categories || [],
      labels: { style: { fontSize: '13px', colors: theme.palette.text.secondary }, offsetY: 5 },
      axisTicks: { show: false },
      axisBorder: { color: theme.palette.divider }
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val.toFixed(0)} người`,
        style: { fontSize: '13px' }
      },
      tickAmount: 5
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      style: { fontSize: '12px', fontFamily: 'Inter var' },
      y: { formatter: (val: number) => `${val} người dùng` }
    },
    colors: ['#3B82F6', '#10B981'] // xanh dương + xanh ngọc
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
        type: 'campaign',
        startDate,
        endDate,
        adId: adId ?? undefined,
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

  // if (loading) return <Typography>Loading...</Typography>;
  // if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {activitiesCampaignData && <ListWidgets activitiesCampaignData={activitiesCampaignData} loading={loadingActivitiesCampaign} />}
      </Grid>
      <Grid item xs={12}>
        <MainCard sx={{ height: '100%' }}>
          {/* <LineChart
            title={intl.formatMessage({ id: 'user-traffic' })}
            categories={dataChart?.userTraffic?.categories || []}
            series={dataChart?.userTraffic?.series || []}
            chartOptions={chartSpeedConfig}
          /> */}

          {loadingDataChart ? (
            <>
              <Skeleton variant="text" width="40%" height={30} />
              <Skeleton variant="rectangular" height={300} sx={{ mt: 1, borderRadius: 1 }} />
            </>
          ) : (
            <>
              <Typography sx={{ fontWeight: 700 }} variant="h6">
                {intl.formatMessage({ id: 'user-traffic' })}
              </Typography>
              <ReactApexChart type="area" height={325} options={chartSpeedConfig} series={dataChart?.userTraffic?.series || []} />
            </>
          )}
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard sx={{ height: '100%' }}>
          <DonutChart
            title={intl.formatMessage({ id: 'total-user' })}
            labels={dataChart?.userCount?.labels || []}
            series={dataChart?.userCount?.series || []}
            chartOptions={chartDonutConfig}
          />
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard sx={{ height: '100%' }}>
          <DonutChart
            title={intl.formatMessage({ id: 'visit-frequency' })}
            labels={dataChart?.userVisit?.labels || []}
            series={dataChart?.userVisit?.series || []}
            chartOptions={chartDonutConfig}
          />
        </MainCard>
      </Grid>
      <Grid item xs={12}>
        <MainCard sx={{ height: '100%' }}>
          {/* <LineChart
            title={intl.formatMessage({ id: 'network-traffic' })}
            categories={dataChart?.userBehavior.categories || []}
            series={dataChart?.userBehavior.series || []}
            chartOptions={chartSpeedConfig}
          /> */}
          {loadingDataChart ? (
            <>
              <Skeleton variant="text" width={200} height={28} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={300} sx={{ mt: 1, mb: 2, borderRadius: 1 }} />
            </>
          ) : (
            <>
              <Typography sx={{ fontWeight: 700 }} variant="h6">
                {intl.formatMessage({ id: 'network-traffic' })}
              </Typography>
              <ReactApexChart type="area" height={325} series={dataChart?.userBehavior?.series || []} options={chartSpeedConfig} />
            </>
          )}
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard sx={{ height: '100%' }}>
          <DonutChart
            title={intl.formatMessage({ id: 'network-overview' })}
            labels={dataChart?.wifiAccess.labels || []}
            series={dataChart?.wifiAccess.series || []}
            chartOptions={chartDonutConfig}
          />
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard>
          <DonutChart
            title={intl.formatMessage({ id: 'os' })}
            labels={dataChart?.userOS.labels || []}
            series={dataChart?.userOS.series || []}
            chartOptions={chartDonutConfig}
          />
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard>
          <DonutChart
            title={intl.formatMessage({ id: 'device' })}
            labels={dataChart?.userDevice.labels || []}
            series={dataChart?.userDevice.series || []}
            chartOptions={chartDonutConfig}
          />
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard>
          <DonutChart
            title={intl.formatMessage({ id: 'browser' })}
            labels={dataChart?.userBrowser.labels || []}
            series={dataChart?.userBrowser.series || []}
            chartOptions={chartDonutConfig}
          />
        </MainCard>
      </Grid>
      <button
        className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-green-700 transition z-50"
        onClick={() => setOpenExportDialog(true)}
      >
        <ExportSquare />
      </button>{' '}
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle> {intl.formatMessage({ id: 'select-date-range-weekly-report' })}</DialogTitle>
        <DialogContent>
          <RangePicker
            format="DD/MM/YYYY"
            onChange={(dates: any) => setExportDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            style={{ width: '100%', marginTop: '20px' }}
            popupStyle={{ zIndex: 99999 }}
            placeholder={[intl.formatMessage({ id: 'start-date' }), intl.formatMessage({ id: 'end-date' })]}
          />
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

export default TabReport;
