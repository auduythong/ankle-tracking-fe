import { Grid } from '@mui/material';
import MainCard from 'components/MainCard';
import { DonutChart, LineChart } from 'components/organisms/chart';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import useHandleCampaign from 'hooks/useHandleCampaign';
import useHandleDataLogin from 'hooks/useHandleDataLogin';
import useHandleSession from 'hooks/useHandleSession';
import TopMetrics from 'pages/dashboard/MetrixTop3';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router';
import { RootState, useSelector } from 'store';
import { formatChartData } from 'utils/handleData';
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
}

interface DataWidget {
  totalClicks: number;
  totalImpressions: number;
  totalNewCustomers: number;
}

interface Metric {
  date: string;
  clicks?: number;
  impressions?: number;
  new_users?: number;
}

interface ResponseData {
  clicks: Metric[];
  impressions: Metric[];
  new_customers: Metric[];
}

const TabReport = () => {
  const intl = useIntl();
  dayjs.extend(customParseFormat);
  const { id: campaignId } = useParams<{ id: string }>();
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds);

  const { fetchDataChartNetwork } = useHandleSession();
  const { fetchDataChartLogin, fetchDataTop3, fetchDataActivitiesCampaign } = useHandleDataLogin();
  const { fetchDataCampaign } = useHandleCampaign();

  const [dataChart, setDataChart] = useState<DataChart | null>(null);
  const [dataWidget, setDataWidget] = useState<DataWidget | null>(null);
  const [dataTop3, setDataTop3] = useState<ResponseData>({ clicks: [], impressions: [], new_customers: [] });
  const [filterValue, setFilterValue] = useState<FilterValue>({ start_date: '', end_date: '' });
  const [adId, setAdId] = useState<number | null>(null); // State to store adId
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // Fetch campaign data to get created_date, expired_date, and ad_id

  console.log({ dataWidget });
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
      const [dataChartUserCount, dataChartUserTraffic, dataChartVisitFrequency] = await Promise.all([
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
        })
      ]);

      setDataChart({
        userCount: dataChartUserCount,
        userTraffic: formatChartData(dataChartUserTraffic, 'DD/MM'),
        userVisit: dataChartVisitFrequency
      });
    } catch (err) {
      // setError('Failed to fetch chart data');
      console.error(err);
    }
  };

  const getRawData = async (adId: number) => {
    try {
      const dataTop3 = await fetchDataTop3({ adId, adDataInput: JSON.stringify(currentAds) });
      setDataTop3(dataTop3);
    } catch (err) {
      // setError('Failed to fetch top 3 data');
      console.error(err);
    }
  };

  const getSummaryAds = async (startDate: string, endDate: string, adId: number) => {
    try {
      const dataSummary = await fetchDataActivitiesCampaign({ startDate, endDate, adId, adDataInput: JSON.stringify(currentAds) });
      setDataWidget({
        totalClicks: dataSummary.click_count,
        totalImpressions: dataSummary.impression_count,
        totalNewCustomers: dataSummary.unique_user_count
      });
    } catch (err) {
      // setError('Failed to fetch summary data');
      console.error(err);
    }
  };

  const refreshData = async () => {
    if (!adId || !filterValue.start_date || !filterValue.end_date) return;
    // setLoading(true);
    await Promise.all([
      getRawData(adId),
      getDataChart(filterValue.start_date, filterValue.end_date, currentSite, adId),
      getSummaryAds(filterValue.start_date, filterValue.end_date, adId)
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

  const chartConfigTotalData = {
    chart: { type: 'donut', height: '100%' },
    colors: ['#18538C', '#A6D3FE', '#D9D9D9', '#006FDB', '#548CC3', '#4A96DF', '#347BC0', '#4393E0', '#DEDEDE'],
    plotOptions: { bar: { borderRadius: 4, horizontal: true, distributed: true } },
    dataLabels: { enabled: true },
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
        try {
          const rgb = parseInt(color.slice(1), 16);
          if (!isNaN(rgb)) {
            const r = (rgb >> 16) & 255;
            const g = (rgb >> 8) & 255;
            const b = rgb & 255;
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            textColor = brightness > 128 ? '#000' : '#fff';
          }
        } catch (error) {
          console.error('Error calculating text color:', error);
          textColor = '#fff';
        }
        return `<div style="background-color: ${color}; color: ${textColor}; padding: 10px; border-radius: 4px; border: 1px solid #ddd; font-size: 12px;">
              <span>${w.globals.labels[seriesIndex] || 'Unknown'}: ${series[seriesIndex]} người dùng</span>
            </div>`;
      }
    }
  };

  const chartSpeedConfig = {
    chart: { type: 'line', height: 350 },
    tooltip: { x: { format: 'HH:mm' } }
  };

  // if (loading) return <Typography>Loading...</Typography>;
  // if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {/* {dataWidget && <ListWidgets dataWidget={dataWidget} />} */}
      </Grid>
      <Grid item xs={12} md={8}>
        <MainCard sx={{ height: '100%' }}>
          <LineChart
            title={intl.formatMessage({ id: 'network-traffic' })}
            categories={dataChart?.userTraffic?.categories || []}
            series={dataChart?.userTraffic?.series || []}
            chartOptions={chartSpeedConfig}
          />
        </MainCard>
      </Grid>
      <Grid item xs={12} md={4}>
        <MainCard sx={{ height: '100%' }}>
          <TopMetrics data={dataTop3 ?? undefined} />
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard sx={{ height: '100%' }}>
          <DonutChart
            title={intl.formatMessage({ id: 'total-user' })}
            labels={dataChart?.userCount?.labels || []}
            series={dataChart?.userCount?.series || []}
            chartOptions={chartConfigTotalData}
          />
        </MainCard>
      </Grid>
      <Grid item xs={12} lg={6}>
        <MainCard sx={{ height: '100%' }}>
          <DonutChart
            title={intl.formatMessage({ id: 'visit-frequency' })}
            labels={dataChart?.userVisit?.labels || []}
            series={dataChart?.userVisit?.series || []}
            chartOptions={chartConfigTotalData}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default TabReport;
