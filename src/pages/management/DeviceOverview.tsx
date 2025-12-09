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
  useTheme
} from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DatePicker, Spin } from 'antd';
import LoadingButton from 'components/@extended/LoadingButton';
import MainCard from 'components/MainCard';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import ScrollX from 'components/ScrollX';
import NetworkDiagram from 'components/template/NetworkDiagram';
import ViewDialog from 'components/template/ViewDialog';
import { columnsDeviceOverview } from 'components/ul-config/table-config';
import { deviceViewConfig } from 'components/ul-config/view-dialog-config';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useConfirmNavigation } from 'hooks/useConfirmNavigation';
import useHandleDevice from 'hooks/useHandleDevice';
import useHandleExcel from 'hooks/useHandleExcel';
import { ArrowRotateLeft, ExportSquare } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { DataDevice } from 'types';
import { processTrafficData } from 'utils/handleData';

interface ChartLine {
  categories: string[];
  series: { name: string; data: number[] }[];
}

interface DataChart {
  dataTraffic: ChartLine;
}

const DeviceOverview = () => {
  const intl = useIntl();
  dayjs.extend(customParseFormat);
  const { RangePicker } = DatePicker;

  const [openDialog, setOpenDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [record, setRecord] = useState<DataDevice | null>(null);
  const [selectTypeReport, setSelectTypeReport] = useState<string>('');

  const [isLoadingRefreshAll, setIsLoadingRefreshAll] = useState(false);
  const { fetchExportExcel } = useHandleExcel();

  // Kiểm tra xem có phải mobile không (dưới 600px)
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme(); // Lấy theme hiện tại của MUI
  const isDark = theme.palette.mode === 'dark';
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const {
    deviceQuery,
    dataDevice,
    fetchDataDevice,
    isLoadingDevices,
    totalPages,
    totalResults,
    diagramQuery,
    dataDiagramDevice,
    fetchDiagramDevice,
    isLoadingDiagrams,
    trafficQuery,
    setTrafficQuery,
    dataTrafficDevice,
    fetchTrafficDevice,
    isLoadingTraffics,
    refreshDevice,
    refreshDiagramDevice,
    refreshTrafficDevice,
    isRefreshDevices,
    isRefreshDiagrams,
    isRefreshTraffics
  } = useHandleDevice({
    initDeviceQuery: {
      page: 1,
      pageSize: 10,
      siteId: currentSite,
      statusId: 7,
      type: 'ap'
    },
    initTrafficDeviceQuery: {
      page: 1,
      pageSize: 10,
      siteId: currentSite,
      startDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD')
    }
  });

  const { ConfirmDialog } = useConfirmNavigation({
    when: isRefreshDevices || isRefreshDiagrams || isRefreshTraffics
  });

  const dataChart: DataChart = useMemo(() => {
    return {
      dataTraffic: processTrafficData(dataTrafficDevice?.apTrafficActivities, dataTrafficDevice?.switchTrafficActivities)
    };
  }, [dataTrafficDevice]);

  const fetchData = (currentSiteIds?: string) => {
    fetchDataDevice({ ...deviceQuery, siteId: currentSiteIds || '' });
    fetchTrafficDevice({ ...trafficQuery, siteId: currentSiteIds || '' });
    fetchDiagramDevice({ ...diagramQuery, siteId: currentSiteIds || '' });
  };

  useEffect(() => {
    fetchData();
    handleRefreshAll();

    const handleReloadDevice = async () => {
      await refreshDevice();
      fetchDataDevice({ ...deviceQuery, siteId: currentSite || '' });
    };

    // interval 45s gọi lại device
    const intervalId = setInterval(handleReloadDevice, 45 * 1000);

    // khi tab visibility thay đổi (ẩn → hiện)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleReloadDevice();
      }
    };

    // chỉ dùng visibilitychange, bỏ window.focus
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentSite]);

  const handleRefreshAll = async () => {
    setIsLoadingRefreshAll(true);
    try {
      await Promise.all([refreshDevice(), refreshTrafficDevice(), refreshDiagramDevice()]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRefreshAll(false);
    }
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    deviceQuery.page = newPage;
    deviceQuery.pageSize = newPageSize;
    fetchDataDevice();
  };

  const columns = useMemo(() => {
    return columnsDeviceOverview({
      currentPage: deviceQuery.page,
      pageSize: deviceQuery.pageSize
    });
    //eslint-disable-next-line
  }, [deviceQuery.page, deviceQuery.pageSize]);

  // const chartSpeedConfig = {
  //   chart: {
  //     type: 'line',
  //     height: 350
  //   },
  //   tooltip: {
  //     x: {
  //       format: 'HH:mm'
  //     }
  //   }
  // };

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
    colors: [
      theme.palette.info.main, // Upload AP (TX)
      theme.palette.warning.main, // Upload Switch (TX)
      theme.palette.primary.main, // Download AP (DX)
      theme.palette.success.main // Download Switch (DX)
    ],
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
      categories: dataChart?.dataTraffic?.categories || [],
      labels: { style: { fontSize: '13px', colors: theme.palette.text.secondary }, offsetY: 5 },
      axisTicks: { show: false },
      axisBorder: { color: theme.palette.divider }
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val.toFixed(0)}`,
        style: { fontSize: '13px', colors: theme.palette.text.secondary }
      },
      tickAmount: 5
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      style: { fontSize: '12px', fontFamily: 'Inter var', color: theme.palette.text.primary }
    }
  };

  // useEffect(() => {
  //   // Gọi dữ liệu lần đầu
  //   // refreshData();

  //   // Xử lý visibilitychange
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === 'visible') {
  //       // console.log('Tab is active, reloading APIs...');
  //       refreshData();
  //     }
  //   };

  //   // Thêm event listener
  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   // Cleanup
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  //   // eslint-disable-next-line
  // }, [filterValue.start_date, filterValue.end_date, currentSite]);

  const handleRangeChange = (dates: any) => {
    if (dates) {
      const startDate = dates[0]?.format('YYYY-MM-DD');
      const endDate = dates[1]?.format('YYYY-MM-DD');

      const newQuery = {
        ...trafficQuery,
        startDate,
        endDate
      };

      setTrafficQuery(newQuery);
      fetchTrafficDevice(newQuery);
    }
  };

  const handleDateChange = (key: 'startDate' | 'endDate', date: any) => {
    const newQuery = {
      ...trafficQuery,
      key
    };

    setTrafficQuery(newQuery);
    fetchTrafficDevice(newQuery);
  };

  const handleRowClick = (row: DataDevice) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
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

  const optionTypes = [{ label: intl.formatMessage({ id: 'device-traffic' }), value: 'traffic_devices' }];

  return (
    <Grid container spacing={3} alignItems="stretch">
      <Grid item xs={12}>
        {/* <MainCard> */}
        <div className="flex flex-col md:flex-row items-end md:items-center justify-end">
          <div className="flex items-center gap-2">
            <LoadingButton startIcon={<ArrowRotateLeft />} variant="outlined" onClick={handleRefreshAll} loading={isLoadingRefreshAll}>
              {intl.formatMessage({ id: 'refresh' })}
            </LoadingButton>
            <Button variant="contained" style={{ backgroundColor: 'green' }} onClick={() => setOpenExportDialog(true)}>
              <span className="flex items-center gap-2">
                <ExportSquare />
                {intl.formatMessage({ id: 'export' })}
              </span>
            </Button>
          </div>
        </div>
        {/* </MainCard> */}
      </Grid>
      <Grid item xs={12}>
        <div>
          <Spin spinning={isRefreshDiagrams || isLoadingDiagrams} tip={isRefreshTraffics && intl.formatMessage({ id: 'refreshing' })}>
            <NetworkDiagram data={dataDiagramDevice[0]} />
          </Spin>
        </div>
      </Grid>
      <Grid item xs={12}>
        <MainCard>
          <h1 className="text-lg font-bold mb-2">{intl.formatMessage({ id: 'device-lost-connect' })}</h1>
          <ScrollX>
            <Spin spinning={isRefreshDevices} tip={intl.formatMessage({ id: 'refreshing' })}>
              <GeneralizedTableV2
                sxContainer={{ maxHeight: 600 }}
                className=""
                isLoading={isLoadingDevices}
                columns={columns}
                data={dataDevice}
                onPageChange={handlePageChange}
                onRowClick={handleRowClick}
                totalPages={totalPages}
                totalResults={totalResults}
                size={deviceQuery.pageSize}
                currentPage={deviceQuery.page}
                // totalResults={totalResults}
                sortColumns="index"
                isDecrease={false}
                hiddenFilter
              />
            </Spin>
          </ScrollX>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard sx={{ height: '100%' }}>
          <h1 className="text-lg font-bold mb-2">{intl.formatMessage({ id: 'network-diagram' })}</h1>
          {isMobile ? (
            <Grid container spacing={2} className="mb-4">
              <Grid item xs={12}>
                <DatePicker
                  format="DD/MM/YYYY"
                  onChange={(date) => handleDateChange('startDate', date)}
                  style={{ width: '100%', height: '40px' }}
                  value={trafficQuery.startDate ? dayjs(trafficQuery.startDate) : undefined}
                  placeholder="Start Date"
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  size={'large'}
                  format="DD/MM/YYYY"
                  onChange={(date) => handleDateChange('endDate', date)}
                  style={{ width: '100%', height: '40px' }}
                  value={trafficQuery.endDate ? dayjs(trafficQuery.endDate) : undefined}
                  placeholder="End Date"
                />
              </Grid>
            </Grid>
          ) : (
            <div>
              <RangePicker
                format="DD/MM/YYYY"
                onChange={handleRangeChange}
                style={{ minWidth: '100px', maxWidth: '320px', height: '40px' }}
                value={
                  trafficQuery.startDate && trafficQuery.endDate ? [dayjs(trafficQuery.startDate), dayjs(trafficQuery.endDate)] : undefined
                }
              />
            </div>
          )}
          <Spin spinning={isRefreshTraffics || isLoadingTraffics} tip={isRefreshTraffics && intl.formatMessage({ id: 'refreshing' })}>
            <ReactApexChart height={350} type="area" series={dataChart?.dataTraffic?.series || []} options={chartSpeedConfig} />
          </Spin>
        </MainCard>
      </Grid>

      <ViewDialog title="device-info" open={openDialog} onClose={handleCloseView} data={record} config={deviceViewConfig} />
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle> {intl.formatMessage({ id: 'select-date-range-weekly-report' })}</DialogTitle>
        <DialogContent>
          <DatePicker.RangePicker
            format="DD/MM/YYYY"
            onChange={(dates) => setExportDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            style={{ width: '100%', marginTop: '20px' }}
            popupStyle={{ zIndex: 99999 }}
            size="large"
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
      {ConfirmDialog}
    </Grid>
  );
};

export default DeviceOverview;
