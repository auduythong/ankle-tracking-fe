import { Autocomplete, Grid, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { DatePicker } from 'antd';
import MainCard from 'components/MainCard';
import { DonutChart } from 'components/organisms/chart';
import { AnalyticEcommerce } from 'components/organisms/statistics';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import useHandleAds from 'hooks/useHandleAds';
import useHandleDataLogin, { ParamsChartLogin, ParamsLoginCount } from 'hooks/useHandleDataLogin';
import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { DataAds } from 'types';
import { getDatePresets } from 'utils/datePresets';
import { formatChartData, formatNumberWithUnits, getInitialDate } from 'utils/handleData';

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;
interface Statistic {
  type: string;
  total_count: number;
  new_count: number;
  existing_count: number;
  isLoss: boolean;
  percentage: number;
}

interface DataStatistic {
  access: Statistic;
  login: Statistic;
  error: Statistic;
  loginDuplicate: Statistic;
}

interface FilterValue {
  start_date: string | Date | null;
  end_date: string | Date | null;
  adId?: number;
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
  wifiAccess: ChartDonut;
  userBehavior: ChartLine;
  userBrowser: ChartDonut;
  userDevice: ChartDonut;
  userOS: ChartDonut;
}

function NetworkStatistics() {
  const intl = useIntl();
  const theme = useTheme(); // Lấy theme hiện tại của MUI
  const isDark = theme.palette.mode === 'dark';
  const [dataStatistic, setDataStatistic] = useState<DataStatistic>();
  const [initial, setInitial] = useState(true);
  const [dataChart, setDataChart] = useState<DataChart>();
  const [filterValue, setFilterValue] = useState<FilterValue>({
    start_date: null,
    end_date: null
  });
  const [loadingDataStatistic, setLoadingDataStatistic] = useState(false);
  const [optionsAds, setOptionsAds] = useState<{ label: string; value: number }[]>([]);

  // const currentRegion = useSelector((state: RootState) => state.authSlice.user?.currentRegion ?? null);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds);

  const handleDateChange = (dates: any) => {
    if (dates) {
      const start_date = dates[0]?.format('YYYY/MM/DD');
      const end_date = dates[1]?.format('YYYY/MM/DD');

      setFilterValue((prev) => ({ ...prev, start_date, end_date }));
    } else {
      setFilterValue((prev) => ({
        ...prev,
        start_date: dayjs().subtract(15, 'day').startOf('day').format('YYYY/MM/DD'),
        end_date: dayjs().endOf('day').format('YYYY/MM/DD')
      }));
    }
  };

  const { fetchDataChartLogin, fetchDataLoginCount } = useHandleDataLogin();

  const { fetchDataAds } = useHandleAds();

  const handleGetOptionsAds = async () => {
    try {
      const dataAds: DataAds[] = await fetchDataAds({ page: 1, pageSize: 50, adDataInput: JSON.stringify(currentAds) });
      setOptionsAds(
        dataAds.map((item) => {
          return {
            label: item.template_name,
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

  const fetchDataStatistic = async (params: ParamsChartLogin) => {
    const { siteId, startDate, endDate, adId } = params;

    const commonParams = {
      siteId,
      startDate,
      endDate,
      adDataInput: JSON.stringify(currentAds),
      adId
    };

    try {
      setLoadingDataStatistic(true);
      const [dataAccess, dataError, dataLogin, dataLoginDuplicate] = await Promise.all([
        fetchDataLoginCount({ ...commonParams, type: 'access' }),
        fetchDataLoginCount({ ...commonParams, type: 'error' }),
        fetchDataLoginCount({ ...commonParams, type: 'login' }),
        fetchDataLoginCount({ ...commonParams, type: 'login_duplicate' })
      ]);

      setDataStatistic({
        access: dataAccess,
        error: dataError,
        login: dataLogin,
        loginDuplicate: dataLoginDuplicate
      });
    } catch (error) {
    } finally {
      setLoadingDataStatistic(false);
    }
  };

  const fetchDataChart = async (params: ParamsLoginCount) => {
    const { siteId, startDate, endDate, adId } = params;

    const commonParams = {
      siteId,
      startDate,
      endDate,
      adDataInput: JSON.stringify(currentAds),
      adId
    };

    const [dataWifiAccess, dataUserBehavior, dataUserBrowser, dataUserDevice, dataUserOS] = await Promise.all([
      fetchDataChartLogin({ ...commonParams, type: 'wifi_access_activities' }),
      fetchDataChartLogin({ ...commonParams, type: 'user_behavior' }),
      fetchDataChartLogin({ ...commonParams, type: 'user_browser_usage' }),
      fetchDataChartLogin({ ...commonParams, type: 'user_device_type' }),
      fetchDataChartLogin({ ...commonParams, type: 'user_os_type' })
    ]);

    setDataChart({
      wifiAccess: dataWifiAccess,
      userBehavior: formatChartData(dataUserBehavior, 'DD/MM'),
      userBrowser: dataUserBrowser,
      userDevice: dataUserDevice,
      userOS: dataUserOS
    });
  };

  useEffect(() => {
    const params = {
      siteId: currentSite,
      startDate: filterValue.start_date,
      endDate: filterValue.end_date,
      adId: filterValue.adId
    };

    if (initial) {
      getInitialDate(setFilterValue, filterValue);
      fetchDataStatistic({ siteId: currentSite }); // chưa có date filter
      setInitial(false);
    } else {
      fetchDataChart(params);
      fetchDataStatistic(params);
    }
    //eslint-disable-next-line
  }, [initial, filterValue.start_date, filterValue.end_date, filterValue.adId, currentSite, currentAds]);

  useEffect(() => {
    // Gọi dữ liệu lần đầu
    // refreshData();

    const params = {
      siteId: currentSite,
      startDate: filterValue.start_date,
      endDate: filterValue.end_date,
      adId: filterValue.adId
    };

    // Xử lý visibilitychange
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchDataChart(params);
        fetchDataStatistic(params);
      }
    };

    // Thêm event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line
  }, [filterValue.start_date, filterValue.end_date, currentSite, filterValue.adId, currentAds]);

  const isMobile = useMediaQuery('(max-width:600px)');

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

  const chartConfigTotalDataUser = {
    chart: { type: 'donut', height: '100%', width: '70%', background: isDark ? 'transparent' : '' },
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
      width: 200,
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
        formatter: (value: number) => `${value} người dùng`
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter var'
      },
      custom: function ({
        series,
        seriesIndex,
        dataPointIndex,
        w
      }: {
        series: number[];
        seriesIndex: number;
        dataPointIndex: number;
        w: any;
      }) {
        const color =
          w.config.colors[seriesIndex] && w.config.colors[seriesIndex].startsWith('#') ? w.config.colors[seriesIndex] : '#000000';
        let textColor = '#fff';
        // try {
        //   const rgb = parseInt(color.slice(1), 16);
        //   if (!isNaN(rgb)) {
        //     const r = (rgb >> 16) & 255;
        //     const g = (rgb >> 8) & 255;
        //     const b = rgb & 255;
        //     const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        //     textColor = brightness > 128 ? '#000' : '#fff';
        //   }
        // } catch (error) {
        //   console.error('Error calculating text color:', error);
        //   textColor = '#fff';
        // }
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
      foreColor: theme.palette.text.secondary
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },

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
        opacityFrom: 0.5,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: dataChart?.userBehavior?.categories || [],
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
    colors: [
      '#3B82F6', // Xem trang chào
      '#10B981', // Login vào wifi
      '#F59E0B', // Login trùng vào wifi
      '#EF4444', // Login Wifi lỗi
      '#6B7280' // Dừng ở trang chào
    ]
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard>
          <div className="flex md:flex-row flex-col gap-4 md:gap-3 items-center">
            {isMobile ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    onChange={handleStartDateChange}
                    style={{ width: '100%', height: '40px' }}
                    value={filterValue.start_date ? dayjs(filterValue.start_date) : undefined}
                    placeholder={intl.formatMessage({ id: 'start-date' })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    onChange={handleEndDateChange}
                    style={{ width: '100%', height: '40px' }}
                    value={filterValue.end_date ? dayjs(filterValue.end_date) : undefined}
                    placeholder={intl.formatMessage({ id: 'end-date' })}
                  />
                </Grid>
              </Grid>
            ) : (
              <RangePicker
                format="DD/MM/YYYY"
                onChange={handleDateChange}
                style={{ minWidth: '100px', maxWidth: '320px', height: '40px' }}
                value={
                  filterValue.start_date && filterValue.end_date ? [dayjs(filterValue.start_date), dayjs(filterValue.end_date)] : undefined
                }
                placeholder={[intl.formatMessage({ id: 'start-date' }), intl.formatMessage({ id: 'end-date' })]}
                presets={isMobile ? undefined : getDatePresets(intl)}
              />
            )}
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
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6} xl={3}>
            <AnalyticEcommerce
              loading={loadingDataStatistic}
              title={intl.formatMessage({ id: 'view-of-welcome-page' })}
              count={formatNumberWithUnits(dataStatistic?.access.total_count || 0)}
              extraLabel={intl.formatMessage({ id: 'new-collected' })}
              extraCount={formatNumberWithUnits(dataStatistic?.access.new_count || 0)}
              availableLabel={intl.formatMessage({ id: 'available' })}
              availableCount={formatNumberWithUnits(dataStatistic?.access.existing_count || 0)}
              percentage={formatNumberWithUnits(dataStatistic?.access.percentage || 0)}
              isLoss={dataStatistic?.access.isLoss}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <AnalyticEcommerce
              loading={loadingDataStatistic}
              title={intl.formatMessage({ id: 'times-logged-wifi' })}
              count={formatNumberWithUnits(dataStatistic?.login.total_count || 0)}
              extraLabel={intl.formatMessage({ id: 'new-collected' })}
              extraCount={formatNumberWithUnits(dataStatistic?.login.new_count || 0)}
              availableLabel={intl.formatMessage({ id: 'available' })}
              availableCount={formatNumberWithUnits(dataStatistic?.login.existing_count || 0)}
              percentage={formatNumberWithUnits(dataStatistic?.login.percentage || 0)}
              isLoss={dataStatistic?.login.isLoss}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <AnalyticEcommerce
              loading={loadingDataStatistic}
              title={intl.formatMessage({ id: 'times-logged-dup-wifi' })}
              count={formatNumberWithUnits(dataStatistic?.loginDuplicate.total_count || 0)}
              extraLabel={intl.formatMessage({ id: 'new-collected' })}
              extraCount={formatNumberWithUnits(dataStatistic?.loginDuplicate.new_count || 0)}
              availableLabel={intl.formatMessage({ id: 'available' })}
              availableCount={formatNumberWithUnits(dataStatistic?.loginDuplicate.existing_count || 0)}
              percentage={formatNumberWithUnits(dataStatistic?.loginDuplicate.percentage || 0)}
              isLoss={dataStatistic?.loginDuplicate.isLoss}
            />
          </Grid>
          <Grid item xs={12} md={6} xl={3}>
            <AnalyticEcommerce
              loading={loadingDataStatistic}
              title={intl.formatMessage({ id: 'times-error-login' })}
              count={formatNumberWithUnits(dataStatistic?.error.total_count || 0)}
              extraLabel={intl.formatMessage({ id: 'new-collected' })}
              extraCount={formatNumberWithUnits(dataStatistic?.error.new_count || 0)}
              availableLabel={intl.formatMessage({ id: 'available' })}
              availableCount={formatNumberWithUnits(dataStatistic?.error.existing_count || 0)}
              percentage={formatNumberWithUnits(dataStatistic?.error.percentage || 0)}
              isLoss={dataStatistic?.error.isLoss}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MainCard sx={{ height: '100%' }}>
              {/* <LineChart
                title={intl.formatMessage({ id: 'network-traffic' })}
                categories={dataChart?.userBehavior.categories || []}
                series={dataChart?.userBehavior.series || []}
                chartOptions={chartSpeedConfig}
              /> */}
              <Typography sx={{ fontWeight: 700 }} variant="h6">
                {intl.formatMessage({ id: 'network-traffic' })}
              </Typography>
              <ReactApexChart type="area" height={300} options={chartSpeedConfig} series={dataChart?.userBehavior?.series || []} />
            </MainCard>
          </Grid>
          <Grid item xs={12} xl={6}>
            <MainCard sx={{ height: '100%' }}>
              <DonutChart
                key={isDark ? 'dark' : 'light'}
                title={intl.formatMessage({ id: 'network-overview' })}
                labels={dataChart?.wifiAccess.labels || []}
                series={dataChart?.wifiAccess.series || []}
                chartOptions={chartConfigTotalDataUser}
              />
            </MainCard>
          </Grid>

          <Grid item xs={12} md={6} xl={6}>
            <MainCard>
              <DonutChart
                key={isDark ? 'dark' : 'light'}
                title={intl.formatMessage({ id: 'os' })}
                labels={dataChart?.userOS.labels || []}
                series={dataChart?.userOS.series || []}
                chartOptions={chartConfigTotalDataUser}
              />
            </MainCard>
          </Grid>
          <Grid item xs={12} md={6} xl={6}>
            <MainCard>
              <DonutChart
                key={isDark ? 'dark' : 'light'}
                title={intl.formatMessage({ id: 'device' })}
                labels={dataChart?.userDevice.labels || []}
                series={dataChart?.userDevice.series || []}
                chartOptions={chartConfigTotalDataUser}
              />
            </MainCard>
          </Grid>
          <Grid item xs={12} md={6} xl={6}>
            <MainCard>
              <DonutChart
                key={isDark ? 'dark' : 'light'}
                title={intl.formatMessage({ id: 'browser' })}
                labels={dataChart?.userBrowser.labels || []}
                series={dataChart?.userBrowser.series || []}
                chartOptions={chartConfigTotalDataUser}
              />
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default NetworkStatistics;
