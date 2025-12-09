import { useEffect, useMemo, useState } from 'react';

//project-import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Grid, Tab, useMediaQuery } from '@mui/material';
import { DatePicker, Spin } from 'antd';
import { deviceConnectionLogApi } from 'api/deviceConnectionLog.api';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import { EcommerceMetrix } from 'components/organisms/statistics';
import ConfirmationDialog from 'components/template/ConfirmationDialog';
import ViewDialog from 'components/template/ViewDialog';
import { columnsAlertsMonitoring } from 'components/ul-config/table-config/alertsMonitoring';
import { columnsDeviceLogs } from 'components/ul-config/table-config/deviceLog';
import { deviceConnectionLogViewConfig } from 'components/ul-config/view-dialog-config';
import dayjs, { Dayjs } from 'dayjs';
import useHandleDeviceConnectionLog from 'hooks/useHandleDeviceConnectionLog';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { ShieldTick } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { DeviceConnectionLog, DeviceSolveStatus } from 'types/device-connection-log';
import { QueryParam } from 'types/query';
import { getDatePresets } from 'utils/datePresets';

const { RangePicker } = DatePicker;

type TabValue = 'history' | 'alert';

interface FetchDataStatisticParams extends QueryParam {
  startDate?: string;
  endDate?: string;
}

interface ApiResponseItem {
  disconnect: number;
  reconnect: number;
  date: string; // ISO string
}

const DeviceConnectionManagement = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const [open, setOpen] = useState(false);
  const [loadingResolve, setLoadingResolve] = useState(false);
  const [loadingStatistic, setLoadingStatistic] = useState(false);

  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [record, setRecord] = useState<DeviceConnectionLog | null>(null);
  const [recordResolve, setRecordResolve] = useState<DeviceConnectionLog | null>(null);

  const [statistics, setStatistics] = useState<ApiResponseItem>();
  const intl = useIntl();

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs(), // startDate mặc định hôm nay
    dayjs() // endDate mặc định hôm nay
  ]);

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('passpoint-management');
  const [tabValue, setTabValue] = useState<TabValue>('history');

  const {
    fetchDeviceConnectionLog,
    deviceConnectionLogs,
    loadingDeviceConnectionLog,
    totalPages,
    totalDeviceConnectionLog,
    queryDeviceConnectionLog
  } = useHandleDeviceConnectionLog({
    initQuery: {
      page: 1,
      pageSize: 10
    }
  });

  const fetchDataStatistic = async (params: FetchDataStatisticParams) => {
    try {
      setLoadingStatistic(true);
      const { data } = await deviceConnectionLogApi.statistics(params);

      setStatistics(data.data);
    } catch (error) {
      // handle error
    } finally {
      setLoadingStatistic(false);
    }
  };

  useEffect(() => {
    fetchDeviceConnectionLog();
    fetchDataStatistic({ page: 1, pageSize: 100, endDate: '', startDate: '' });
  }, []);

  const handleFilterDate = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates) return;
    setDateRange(dates as [Dayjs, Dayjs]);

    const [start, end] = dates;
    fetchDataStatistic({
      page: 1,
      pageSize: 100,
      startDate: start ? start.format('YYYY-MM-DD') : '',
      endDate: end ? end.format('YYYY-MM-DD') : ''
    });
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    queryDeviceConnectionLog.page = newPage;
    queryDeviceConnectionLog.pageSize = newPageSize;
    fetchDeviceConnectionLog({ ...queryDeviceConnectionLog });
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleCloseView = () => {
    setOpenViewDialog(false);
    setRecord(null);
  };

  const handleRowClick = (row: DeviceConnectionLog) => {
    setRecord(row);
    setOpenViewDialog(true);
  };

  const handleSearch = (value: string) => {
    fetchDeviceConnectionLog({ ...queryDeviceConnectionLog, page: 1, search: value });
  };

  const handleResolveClick = (record: DeviceConnectionLog) => {
    setOpen(true);
    setRecordResolve(record);
  };

  const handleResolveStatus = async (_: boolean, record: DeviceConnectionLog) => {
    setLoadingResolve(true);
    try {
      await deviceConnectionLogApi.resolve(record.id, { solveStatus: DeviceSolveStatus.RESOLVED });
      fetchDeviceConnectionLog({ ...queryDeviceConnectionLog, page: 1, solveStatus: DeviceSolveStatus.UNRESOLVED });
      enqueueSnackbar(intl.formatMessage({ id: 'resolve-successfully' }), {
        variant: 'success'
      });
    } catch (error: any) {
      if (error) {
        enqueueSnackbar(error.error, { variant: 'error' });
      }
    } finally {
      setLoadingResolve(false);
      setOpen(false);
    }
  };

  const columnsHistory: any = useMemo(() => {
    return columnsDeviceLogs({
      currentPage: queryDeviceConnectionLog.page,
      pageSize: queryDeviceConnectionLog.pageSize,
      handleClose,
      canWrite,
      setViewRecord: handleRowClick
    });
    //eslint-disable-next-line
  }, [queryDeviceConnectionLog.page, queryDeviceConnectionLog.pageSize]);

  const columnsAlerts: any = useMemo(() => {
    return columnsAlertsMonitoring({
      currentPage: queryDeviceConnectionLog.page,
      pageSize: queryDeviceConnectionLog.pageSize,
      handleClose,
      canWrite,
      handleResolveStatus: (record: DeviceConnectionLog) => {
        handleResolveClick(record);
      }
    });
    //eslint-disable-next-line
  }, [queryDeviceConnectionLog.page, queryDeviceConnectionLog.pageSize]);

  const handleTabChange = (_: any, newValue: TabValue) => {
    queryDeviceConnectionLog.page = 1;
    if (newValue === 'alert') {
      queryDeviceConnectionLog.solveStatus = DeviceSolveStatus.UNRESOLVED;
      fetchDeviceConnectionLog({ ...queryDeviceConnectionLog });
    } else {
      fetchDeviceConnectionLog({ page: 1, pageSize: 10 });
    }
    setTabValue(newValue);
  };

  return (
    <MainCard content={false}>
      <TabContext value={tabValue}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
            <TabList onChange={handleTabChange} aria-label="device connection tabs">
              <Tab label={intl.formatMessage({ id: 'disconnection-history' })} value="history" />
              <Tab label={intl.formatMessage({ id: 'device-warning' })} value="alert" />
            </TabList>
          </Box>

          <TabPanel value={'history'}>
            {/* Summary Cards */}
            <RangePicker
              size="large"
              value={dateRange}
              onChange={handleFilterDate}
              allowClear={false}
              format="DD/MM/YYYY"
              style={{ width: 300 }}
              presets={isMobile ? undefined : getDatePresets(intl)}
            />
            <Spin spinning={loadingStatistic}>
              <Grid container spacing={3} sx={{ my: 0 }}>
                <Grid item xs={6}>
                  <EcommerceMetrix
                    primary={intl.formatMessage({ id: 'connection-count' })}
                    secondary={statistics?.reconnect || 0}
                    color={'green'}
                    isShowRevenue={false}
                    revenueBefore=""
                    revenueAfter=""
                    unit=""
                  />
                </Grid>
                <Grid item xs={6}>
                  <EcommerceMetrix
                    primary={intl.formatMessage({ id: 'disconnection-count' })}
                    secondary={statistics?.disconnect || 0}
                    color={'red'}
                    isShowRevenue={false}
                    revenueBefore=""
                    revenueAfter=""
                    unit=""
                  />
                </Grid>
              </Grid>
            </Spin>
            {/* Original Table */}
            <ScrollX>
              <GeneralizedTableV2
                isLoading={loadingDeviceConnectionLog}
                columns={columnsHistory}
                data={deviceConnectionLogs}
                onPageChange={handlePageChange}
                totalResults={totalDeviceConnectionLog}
                totalPages={totalPages}
                size={queryDeviceConnectionLog.pageSize}
                currentPage={queryDeviceConnectionLog.page}
                onSearch={handleSearch}
                sortColumns="index"
                isDecrease={false}
                canWrite={canWrite}
              />
            </ScrollX>
          </TabPanel>

          <TabPanel value={'alert'}>
            {/* New Table for Analytics */}
            <ScrollX>
              <GeneralizedTableV2
                isLoading={loadingDeviceConnectionLog}
                columns={columnsAlerts}
                data={deviceConnectionLogs}
                onPageChange={handlePageChange}
                totalResults={totalDeviceConnectionLog}
                totalPages={totalPages}
                size={queryDeviceConnectionLog.pageSize}
                currentPage={queryDeviceConnectionLog.page}
                onSearch={handleSearch}
                sortColumns="index"
                isDecrease={false}
                canWrite={canWrite}
              />
            </ScrollX>
          </TabPanel>
        </Box>
      </TabContext>

      <ViewDialog
        title="device-info"
        open={openViewDialog}
        onClose={handleCloseView}
        data={record}
        config={deviceConnectionLogViewConfig}
      />
      {recordResolve && (
        <ConfirmationDialog
          open={open}
          variant="delete"
          titleKey="alert-resolve-device"
          showItemName={false}
          description="alert-resolve-device-desc"
          confirmLabel="confirm"
          confirmButtonColor="success"
          isLoading={loadingResolve}
          onClose={() => setOpen(false)}
          onConfirm={() => handleResolveStatus(true, recordResolve)}
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
    </MainCard>
  );
};

export default DeviceConnectionManagement;
