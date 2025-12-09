import { Grid, useMediaQuery, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, MenuItem } from '@mui/material';
import MainCard from 'components/MainCard';
import { useEffect, useState } from 'react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import useHandleExcel from 'hooks/useHandleExcel';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { ExportSquare } from 'iconsax-react';
import { RootState, useSelector } from 'store';
import ListWidgetVoucher from 'components/template/ListWidgetVoucher';
import { LineChart } from 'components/organisms/chart';
import useHandleOrders from 'hooks/userHandleOrder';
import { formatChartData } from 'utils/handleData';
import { InputLabel } from '@mui/material';
import { Select } from '@mui/material';
// import useHandleSession from 'hooks/useHandleSession';
// import { formatChartData } from 'utils/handleData';

interface FilterValue {
  start_date: string | Date;
  end_date: string | Date;
}
interface ChartLine {
  categories: string[];
  series: { name: string; data: number[] }[];
}

interface DataChart {
  dataSummary?: any;
  dataIncome: ChartLine;
  dataOrders: ChartLine;
}

interface DataWidget {
  orderNumber: number;
  totalNetProfit: number;
  totalGrossProfit: number;
}

const VoucherOverview = () => {
  const intl = useIntl();
  dayjs.extend(customParseFormat);
  const { RangePicker } = DatePicker;
  const [dataChart, setDataChart] = useState<DataChart>();
  const [dataWidget, setDataWidget] = useState<DataWidget>();
  const [filterValue, setFilterValue] = useState<FilterValue>({
    start_date: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD')
  });
  const [selectTypeReport, setSelectTypeReport] = useState<string>('');

  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  // const { fetchDataChartNetwork } = useHandleSession();
  const { fetchDataChartOrders } = useHandleOrders();
  const { fetchExportExcel } = useHandleExcel();
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const getDataChart = async (startDate: string, endDate: string) => {
    try {
      const [dataSummary, dataChartIncome, dataChartOrders] = await Promise.all([
        fetchDataChartOrders({ type: 'summary', startDate, endDate }),
        fetchDataChartOrders({ type: 'income', startDate, endDate }),
        fetchDataChartOrders({ type: 'orders', startDate, endDate })
      ]);

      setDataChart({
        dataSummary: dataSummary,
        dataIncome: formatChartData(dataChartIncome, 'DD/MM'),
        dataOrders: formatChartData(dataChartOrders, 'DD/MM')
      });
      setDataWidget({
        orderNumber: dataSummary.total_orders,
        totalNetProfit: dataSummary.net_profit,
        totalGrossProfit: dataSummary.gross_profit
      });
    } catch (err) {
      // setError('Failed to fetch chart data');
      console.error(err);
    }
  };

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

  useEffect(() => {
    getDataChart(
      typeof filterValue.start_date === 'string' ? filterValue.start_date : dayjs(filterValue.start_date).format('YYYY-MM-DD'),
      typeof filterValue.end_date === 'string' ? filterValue.end_date : dayjs(filterValue.end_date).format('YYYY-MM-DD')
    );

    //eslint-disable-next-line
  }, [filterValue.start_date, filterValue.end_date, currentSite]);

  const refreshData = async () => {
    if (!filterValue.start_date || !filterValue.end_date) return;
    // setLoading(true);
    await Promise.all([
      getDataChart(
        typeof filterValue.start_date === 'string' ? filterValue.start_date : dayjs(filterValue.start_date).format('YYYY-MM-DD'),
        typeof filterValue.end_date === 'string' ? filterValue.end_date : dayjs(filterValue.end_date).format('YYYY-MM-DD')
      )
    ]);
    // setLoading(false);
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
        endDate
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

  const handleDateChange = (dates: any) => {
    if (dates) {
      const start_date = dates[0]?.format('YYYY/MM/DD');
      const end_date = dates[1]?.format('YYYY/MM/DD');

      setFilterValue({ start_date, end_date });
    }
  };

  useEffect(() => {
    // Gọi dữ liệu lần đầu
    // refreshData();

    // Xử lý visibilitychange
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // console.log('Tab is active, reloading APIs...');
        refreshData();
      }
    };

    // Thêm event listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line
  }, [filterValue.start_date, filterValue.end_date, currentSite]);

  const chartSpeedConfig = {
    chart: { type: 'line', height: 350 },
    tooltip: { x: { format: 'HH:mm' } }
  };

  const optionTypes = [
    { label: intl.formatMessage({ id: 'total-report-by-date' }), value: 'total_report_by_date' },
    { label: intl.formatMessage({ id: 'weekly-report' }), value: 'weekly_report' }
  ];

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
                    placeholder="Start Date"
                  />
                </Grid>
                <Grid item xs={12}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    onChange={handleEndDateChange}
                    style={{ width: '100%', height: '40px' }}
                    value={filterValue.end_date ? dayjs(filterValue.end_date) : undefined}
                    placeholder="End Date"
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
              />
            )}
            <Grid item sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button variant="contained" style={{ backgroundColor: 'green' }} onClick={() => setOpenExportDialog(true)}>
                <span className="flex items-center gap-2">
                  <ExportSquare />
                  {intl.formatMessage({ id: 'export-weekly-report' })}
                </span>
              </Button>
            </Grid>
          </div>
        </MainCard>
      </Grid>
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle> {intl.formatMessage({ id: 'select-date-range-weekly-report' })}</DialogTitle>
        <DialogContent>
          <RangePicker
            format="DD/MM/YYYY"
            onChange={(dates) => setExportDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            style={{ width: '100%', marginTop: '20px' }}
            popupStyle={{ zIndex: 99999 }}
          />
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
      <Grid item xs={12}>
        {/* <MainCard> */}
        {dataWidget && <ListWidgetVoucher dataWidget={dataWidget} />}
        {/* </MainCard> */}
      </Grid>
      <Grid item xs={12} className="flex flex-col md:flex-row gap-3">
        <Grid item xs={12} lg={6}>
          <MainCard sx={{ height: '100%' }}>
            <LineChart
              title={intl.formatMessage({ id: 'income-traffic' })}
              categories={dataChart?.dataIncome?.categories || []}
              series={dataChart?.dataIncome?.series || []}
              chartOptions={chartSpeedConfig}
            />
          </MainCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <MainCard sx={{ height: '100%' }}>
            <LineChart
              title={intl.formatMessage({ id: 'order-traffic' })}
              categories={dataChart?.dataOrders?.categories || []}
              series={dataChart?.dataOrders?.series || []}
              chartOptions={chartSpeedConfig}
            />
          </MainCard>
        </Grid>
      </Grid>
      <Grid item xs={12} className="flex flex-col md:flex-row gap-3">
        <Grid item xs={12} lg={6}>
          <MainCard sx={{ height: '100%' }}>
            {/* <LineChart
              title={intl.formatMessage({ id: 'best-seller-product' })}
              categories={dataChart?.userTraffic?.categories || []}
              series={dataChart?.userTraffic?.series || []}
              chartOptions={chartSpeedConfig}
            /> */}
          </MainCard>
        </Grid>
        <Grid item xs={12} lg={6}>
          <MainCard sx={{ height: '100%' }}>
            {/* <LineChart
              title={intl.formatMessage({ id: 'income-origin' })}
              categories={dataChart?.userTraffic?.categories || []}
              series={dataChart?.userTraffic?.series || []}
              chartOptions={chartSpeedConfig}
            /> */}
          </MainCard>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default VoucherOverview;
