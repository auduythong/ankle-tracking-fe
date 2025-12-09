import { Grid, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import MainCard from 'components/MainCard';
import { DatePicker } from 'antd';
import { DonutChart } from 'components/organisms/chart';
import AnalyticECommerce from 'components/organisms/statistics/AnalyticEcommerce';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import useHandleSessionV2 from 'hooks/useHandleSessionV2';
import { useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { formatNumberWithUnits } from 'utils/handleData';
import { getDatePresets } from 'utils/datePresets';

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;

// Interface for API response structure (kept for documentation)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Statistic {
  type: string;
  total_count: number;
  new_count: number;
  existing_count: number;
}

interface FilterValue {
  start_date: string | Date | null;
  end_date: string | Date | null;
}

function UserStatistics() {
  const intl = useIntl();
  const [filterValue, setFilterValue] = useState<FilterValue>({
    start_date: dayjs().subtract(2, 'week').format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD')
  });

  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds ?? '');

  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const { useUserAccess, useUserCollector, useChartNetwork } = useHandleSessionV2();

  // ========== React Query Parameters ==========
  const commonParams = useMemo(
    () => ({
      startDate: filterValue.start_date,
      endDate: filterValue.end_date,
      siteId: currentSite,
      adDataInput: JSON.stringify(currentAds)
    }),
    [filterValue.start_date, filterValue.end_date, currentSite, currentAds]
  );

  // ========== User Access Queries ==========
  // Each query returns a Statistic object containing total_count, new_count, existing_count
  const { data: fullnameData, isLoading: isLoadingFullname } = useUserAccess<Statistic>({ type: 'fullname', ...commonParams });
  const { data: emailData, isLoading: isLoadingEmail } = useUserAccess<Statistic>({ type: 'email', ...commonParams });
  const { data: phoneNumberData, isLoading: isLoadingPhone } = useUserAccess<Statistic>({ type: 'phone_number', ...commonParams });
  const { data: birthOfDateData, isLoading: isLoadingBirth } = useUserAccess<Statistic>({ type: 'birth_of_date', ...commonParams });
  const { data: genderData, isLoading: isLoadingGender } = useUserAccess<Statistic>({ type: 'gender', ...commonParams });

  const loadingDataStatistic = isLoadingFullname || isLoadingEmail || isLoadingPhone || isLoadingBirth || isLoadingGender;

  const dataStatistic = useMemo(
    () => ({
      fullname: fullnameData,
      email: emailData,
      phoneNumber: phoneNumberData,
      birthOfDate: birthOfDateData,
      gender: genderData
    }),
    [fullnameData, emailData, phoneNumberData, birthOfDateData, genderData]
  );

  // ========== Chart Queries ==========
  // Chart Network queries return objects with labels (string array) and series (number array) for donut charts
  const { data: userAgeData, isLoading: isLoadingUserAge } = useChartNetwork<{ labels: string[]; series: number[] }>({
    type: 'user_range_age',
    ...commonParams
  });

  const { data: userGenderData, isLoading: isLoadingUserGender } = useChartNetwork<{ labels: string[]; series: number[] }>({
    type: 'user_gender',
    ...commonParams
  });

  const { data: userMobileData, isLoading: isLoadingUserMobile } = useChartNetwork<{ labels: string[]; series: number[] }>({
    type: 'user_mobile_type',
    ...commonParams
  });

  // User Collector returns array of objects with date and count for line chart
  const { data: userCollectorRawData, isLoading: isLoadingUserCollector } = useUserCollector<Array<{ date: string; count: number }>>(commonParams);

  // ========== Chart Data Processing ==========
  const dataChart = useMemo(() => {
    const categoriesUserCollector = userCollectorRawData?.map((item: any) => new Date(item.date).toLocaleDateString()) || [];
    const seriesUserCollector = [
      {
        name: intl.formatMessage({ id: 'total-user' }),
        data: userCollectorRawData?.map((item: any) => item.count) || []
      }
    ];

    return {
      userAge: userAgeData || { labels: [], series: [] },
      userGender: userGenderData || { labels: [], series: [] },
      userMobile: userMobileData || { labels: [], series: [] },
      userCollector: {
        categories: categoriesUserCollector,
        series: seriesUserCollector
      }
    };
  }, [userAgeData, userGenderData, userMobileData, userCollectorRawData, intl]);

  // ========== Event Handlers ==========
  const handleDateChange = (dates: any) => {
    if (dates) {
      const start_date = dates[0]?.format('YYYY-MM-DD');
      const end_date = dates[1]?.format('YYYY-MM-DD');
      setFilterValue({ start_date, end_date });
    }
  };

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

  // ========== Chart Configurations ==========
  const chartConfigTotalData = {
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

  const customChartOptions = {
    ...chartConfigTotalData,
    legend: {
      ...chartConfigTotalData.legend,
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false,
      width: '100%',
      offsetY: 10,
      offsetX: 0,
      itemMargin: {
        horizontal: 10,
        vertical: 6
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
      categories: dataChart?.userCollector?.categories || [],
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
    },
    colors: ['#10B981']
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard>
          <div className="flex md:flex-row flex-col gap-3 items-center">
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
          </div>
        </MainCard>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4} xl={2.4}>
            <AnalyticECommerce
              loading={loadingDataStatistic}
              title={intl.formatMessage({ id: 'user-have-name' })}
              count={formatNumberWithUnits(dataStatistic?.fullname?.total_count || 0) || 0}
              extraLabel={intl.formatMessage({ id: 'new-collected' })}
              extraCount={formatNumberWithUnits(dataStatistic?.fullname?.new_count || 0)}
              availableLabel={intl.formatMessage({ id: 'available' })}
              availableCount={formatNumberWithUnits(dataStatistic?.fullname?.existing_count || 0)}
              // percentage={30)}
            />
          </Grid>
          <Grid item xs={12} md={4} xl={2.4}>
            <AnalyticECommerce
              loading={loadingDataStatistic}
              title={intl.formatMessage({ id: 'user-have-email' })}
              count={formatNumberWithUnits(dataStatistic?.email?.total_count || 0)}
              extraLabel={intl.formatMessage({ id: 'new-collected' })}
              extraCount={formatNumberWithUnits(dataStatistic?.email?.new_count || 0)}
              availableLabel={intl.formatMessage({ id: 'available' })}
              availableCount={formatNumberWithUnits(dataStatistic?.email?.existing_count || 0)}
              // percentage={30)}
            />
          </Grid>
          <Grid item xs={12} md={4} xl={2.4}>
            <AnalyticECommerce
              loading={loadingDataStatistic}
              title={intl.formatMessage({ id: 'user-have-phone' })}
              count={formatNumberWithUnits(dataStatistic?.phoneNumber?.total_count || 0)}
              extraLabel={intl.formatMessage({ id: 'new-collected' })}
              extraCount={formatNumberWithUnits(dataStatistic?.phoneNumber?.new_count || 0)}
              availableLabel={intl.formatMessage({ id: 'available' })}
              availableCount={formatNumberWithUnits(dataStatistic?.phoneNumber?.existing_count || 0)}
              // percentage={30)}
            />
          </Grid>
          <Grid item xs={12} md={4} xl={2.4}>
            <AnalyticECommerce
              loading={loadingDataStatistic}
              title={intl.formatMessage({ id: 'user-have-birthday' })}
              count={formatNumberWithUnits(dataStatistic?.birthOfDate?.total_count || 0)}
              extraLabel={intl.formatMessage({ id: 'new-collected' })}
              extraCount={formatNumberWithUnits(dataStatistic?.birthOfDate?.new_count || 0)}
              availableLabel={intl.formatMessage({ id: 'available' })}
              availableCount={formatNumberWithUnits(dataStatistic?.birthOfDate?.existing_count || 0)}
              // percentage={30}
            />
          </Grid>
          <Grid item xs={12} md={4} xl={2.4}>
            <AnalyticECommerce
              loading={loadingDataStatistic}
              title={intl.formatMessage({ id: 'gender' })}
              count={formatNumberWithUnits(dataStatistic?.gender?.total_count || 0)}
              extraLabel={intl.formatMessage({ id: 'new-collected' })}
              extraCount={formatNumberWithUnits(dataStatistic?.gender?.new_count || 0)}
              availableLabel={intl.formatMessage({ id: 'available' })}
              availableCount={formatNumberWithUnits(dataStatistic?.gender?.existing_count || 0)}
              // percentage={30}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <MainCard sx={{ height: '100%' }}>
              {/* <LineChart
                title={intl.formatMessage({ id: 'data-collect-user' })}
                categories={dataChart?.userCollector?.categories || []}
                series={dataChart?.userCollector?.series || []}
                chartOptions={userCollectorChartConfig}
              /> */}
              <Typography sx={{ fontWeight: 700 }} variant="h6">
                {intl.formatMessage({ id: 'data-collect-user' })}
              </Typography>
              {isLoadingUserCollector ? (
                <div className="h-[300px] flex flex-col gap-3 p-4">
                  <Skeleton variant="rectangular" height={40} animation="wave" />
                  <Skeleton variant="rectangular" height={40} animation="wave" />
                  <Skeleton variant="rectangular" height={60} animation="wave" />
                  <Skeleton variant="rectangular" height={80} animation="wave" />
                  <Skeleton variant="rectangular" height={60} animation="wave" />
                </div>
              ) : (
                <ReactApexChart type="area" height={300} options={chartSpeedConfig} series={dataChart?.userCollector?.series || []} />
              )}
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <MainCard sx={{ height: '100%' }}>
              <DonutChart
                key={isDark ? 'dark' : 'light'}
                title={intl.formatMessage({ id: 'mobile-telecom' })}
                labels={dataChart?.userMobile.labels || []}
                series={dataChart?.userMobile.series || []}
                chartOptions={customChartOptions}
                loading={isLoadingUserMobile}
              />
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard sx={{ height: '100%' }}>
              <DonutChart
                key={isDark ? 'dark' : 'light'}
                title={intl.formatMessage({ id: 'range-age' })}
                labels={dataChart?.userAge.labels || []}
                series={dataChart?.userAge.series || []}
                chartOptions={chartConfigTotalData}
                loading={isLoadingUserAge}
              />
            </MainCard>
          </Grid>
          <Grid item xs={12} lg={6}>
            <MainCard sx={{ height: '100%' }}>
              <DonutChart
                key={isDark ? 'dark' : 'light'}
                title={intl.formatMessage({ id: 'gender' })}
                labels={dataChart?.userGender.labels || []}
                series={dataChart?.userGender.series || []}
                chartOptions={chartConfigTotalData}
                loading={isLoadingUserGender}
              />
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default UserStatistics;
