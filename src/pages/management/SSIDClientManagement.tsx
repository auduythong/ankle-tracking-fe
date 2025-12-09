import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { useTheme } from '@mui/system';
import { Spin } from 'antd';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import ScrollX from 'components/ScrollX';
import ConfirmationDialog from 'components/template/ConfirmationDialog';
import { columnsSSIDClient } from 'components/ul-config/table-config/SSIDClient';
import { GroupedFieldConfig, ssidClientViewConfig } from 'components/ul-config/view-dialog-config';
import dayjs, { Dayjs } from 'dayjs';
import { useConfirmNavigation } from 'hooks/useConfirmNavigation';
import useHandleSSIDClient from 'hooks/useHandleSSIDClient';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { SSIDClientData, SSIDClientStatus } from 'types';

const SSIDClientManagement = () => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [add, setAdd] = useState(false);

  const [record, setRecord] = useState<SSIDClientData | null>(null);
  const [recordDelete, setRecordDelete] = useState<SSIDClientData | null>(null);

  const user = useSelector((state: RootState) => state.authSlice.user);
  // const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const ssidIdAccess = user?.ssids?.map((item) => item.ssid_id);
  const siteIdAccess = user?.sites?.map((item) => item.site_id);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const intl = useIntl();
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('ssid-client-overview');

  const {
    refreshSSIDClient,
    dataSSIDClient,
    querySSIDClient,
    setQuerySSIDClient,
    isLoadingDelete,
    fetchDataSSIDClient,
    deleteClient,
    isLoading,
    totalPages,
    totalResults,
    isRefresh,
    blockClient,
    unBlockClient
  } = useHandleSSIDClient({
    initQuery: {
      page: 1,
      pageSize: 50,
      siteDataInput: JSON.stringify(siteIdAccess),
      ssidDataInput: JSON.stringify(ssidIdAccess),
      siteId: currentSite,
      startDate: null,
      endDate: null,
      statusId: SSIDClientStatus.ONLINE
    }
  });

  const { ConfirmDialog } = useConfirmNavigation({
    when: isRefresh
  });

  const handlePageChange = (newPage: number, newPageSize: number) => {
    querySSIDClient.page = newPage;
    querySSIDClient.pageSize = newPageSize;
    fetchDataSSIDClient();
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleClose = () => {
    setOpenDelete(!openDelete);
  };

  const handleRowClick = (row: SSIDClientData) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const handleDelete = async (id: number) => {
    await deleteClient(id);
    fetchDataSSIDClient();
    setOpenDelete(false);
  };

  const handleRefresh = async () => {
    await refreshSSIDClient();
    fetchDataSSIDClient();
  };

  const handleSearch = async (value: string) => {
    const newQuery = {
      ...querySSIDClient,
      page: 1,
      filters: value
    };
    setQuerySSIDClient(newQuery);
    await fetchDataSSIDClient(newQuery);
  };

  const handleDateChange = async (dates: [Dayjs | null, Dayjs | null] | null) => {
    let startDate = null;
    let endDate = null;

    if (dates) {
      startDate = dates[0] ? dates[0].format('YYYY/MM/DD') : null;
      endDate = dates[1] ? dates[1].format('YYYY/MM/DD') : null;
    }

    const newQuery = {
      ...querySSIDClient,
      startDate,
      endDate
    };

    setQuerySSIDClient(newQuery);
    await fetchDataSSIDClient(newQuery);
  };

  const handleToggleBlock = async (rowData: SSIDClientData) => {
    let res;
    if (rowData.status_id === 1) {
      res = await blockClient(rowData.id.toString());
    } else {
      res = await unBlockClient(rowData.id.toString());
    }
    if (res.code === 0) {
      fetchDataSSIDClient();
    }
    // reload lại data
  };

  useEffect(() => {
    const init = async () => {
      await handleRefresh(); // lần đầu có Spin
      setIsFirstLoad(false);
    };

    init();

    const intervalId = setInterval(() => {
      handleRefresh(); // chạy ngầm, không cần Spin
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [currentSite]);

  const columns = useMemo(() => {
    return columnsSSIDClient({
      currentPage: querySSIDClient.page,
      pageSize: querySSIDClient.pageSize,
      handleAdd,
      handleClose,
      handleEdit: setRecord,
      handleDelete: setRecordDelete,
      handleToggleBlock,
      isHiddenView: true,
      isHiddenEdit: true,
      canWrite
    });
    //eslint-disable-next-line
  }, [setRecord, querySSIDClient.page, querySSIDClient.pageSize]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    let statusId: number | null = null;
    switch (newValue) {
      case 0:
        statusId = SSIDClientStatus.ONLINE;
        break;
      case 1:
        statusId = SSIDClientStatus.BLOCKED;
        break;
      case 2:
        statusId = SSIDClientStatus.OFFLINE;
        break;
    }

    const newQuery = {
      ...querySSIDClient,
      statusId,
      page: 1
    };

    setQuerySSIDClient(newQuery);
    fetchDataSSIDClient(newQuery);
  };

  // Helper function to get nested object value
  const getNestedValue = (obj: Record<string, any>, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Helper function to format field values
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  };

  const renderFieldGroup = (group: GroupedFieldConfig) => {
    return (
      <Grid item xs={6} key={group.title}>
        <Card key={group.title} sx={{ height: '100%', boxShadow: 'none' }}>
          <CardContent sx={{ padding: '20px' }}>
            {/* Group Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {group.icon && (
                <Typography variant="h6" component="span">
                  {group.icon}
                </Typography>
              )}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 500,
                  color: theme.palette.primary.main,
                  mb: 2
                }}
              >
                <FormattedMessage id={group.title} defaultMessage={group.title} />
              </Typography>
            </Box>

            {/* Fields Grid */}
            <Grid container spacing={1}>
              {group.fields.map((field) => {
                const value = getNestedValue(record as Record<string, any>, field.key);
                const displayValue = field.transform ? field.transform(value) : formatValue(value);

                return (
                  <Grid item xs={12} key={field.key}>
                    <Stack flexDirection={'row'} justifyContent={'space-between'}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 500,
                          color: theme.palette.text.secondary
                          // textTransform: 'capitalize'
                        }}
                      >
                        <FormattedMessage id={field.label} defaultMessage={field.label} />:
                      </Typography>

                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 400,
                          color: theme.palette.text.primary,
                          width: 'fit-content',
                          wordBreak: 'break-word'
                        }}
                      >
                        {displayValue}
                      </Typography>
                    </Stack>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <MainCard content={false}>
      {/* Tabs filter by status */}
      <Spin spinning={isFirstLoad && isRefresh} tip={intl.formatMessage({ id: 'refreshing' })}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={tabIndex} onChange={handleTabChange}>
            <Tab label={<FormattedMessage id="online" defaultMessage="Trực tuyến" />} />
            <Tab label={<FormattedMessage id="blocked" defaultMessage="Block" />} />
            <Tab label={<FormattedMessage id="access-history" defaultMessage="Access history" />} />
          </Tabs>
        </Box>
        <ScrollX>
          <GeneralizedTableV2
            scroll={{ y: 'calc(100dvh - 365px)' }}
            isDecrease={false}
            isLoading={isLoading}
            columns={columns}
            data={dataSSIDClient}
            totalResults={totalResults}
            totalPages={totalPages}
            size={querySSIDClient.pageSize}
            currentPage={querySSIDClient.page}
            onPageChange={handlePageChange}
            onAddNew={handleAdd}
            onRefresh={handleRefresh}
            onRowClick={handleRowClick}
            onSearch={handleSearch}
            // onStatusFilterChange={handleStatusFilterChange}
            onDateChange={handleDateChange}
            sortColumns="index"
            // statusOptions={statusOptions}
            isLoadingRefresh={isRefresh}
            buttonRefresh={intl.formatMessage({ id: 'refresh' })}
            datesFilter={
              tabIndex === 0
                ? undefined
                : [
                    querySSIDClient.startDate ? dayjs(querySSIDClient.startDate) : null,
                    querySSIDClient.endDate ? dayjs(querySSIDClient.endDate) : null
                  ]
            }
          />
        </ScrollX>
      </Spin>

      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleCloseView}
        open={openDialog}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              <FormattedMessage id={'ssid-client-info'} defaultMessage="Client Details" />
            </Typography>
          </Box>
        </DialogTitle>

        {/* Dialog Content */}
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
            {ssidClientViewConfig.map(renderFieldGroup)}
          </Grid>
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions
          sx={{
            p: 3,
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Button
            onClick={handleCloseView}
            variant="outlined"
            size="medium"
            sx={{
              px: 4,
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            <FormattedMessage id="close" defaultMessage="Close" />
          </Button>
        </DialogActions>
      </Dialog>

      {recordDelete && (
        <ConfirmationDialog
          showItemName
          itemName={recordDelete.name}
          open={openDelete}
          variant="delete"
          titleKey="alert-delete-ssid-client"
          // description="alert-resolve-device-desc"
          confirmLabel="confirm"
          confirmButtonColor="error"
          isLoading={isLoadingDelete}
          onClose={() => setOpenDelete(false)}
          onConfirm={() => handleDelete(recordDelete.id)}
        />
      )}
      {ConfirmDialog}
    </MainCard>
  );
};

export default SSIDClientManagement;

// const getInitialValues = (ssid: FormikValues | null) => {
//   return {
//     id: ssid?.id || '',
//     name: ssid?.name || '',
//     authStatus: ssid?.auth_status || '',
//     apMac: ssid?.ap_mac || '',
//     siteId: ssid?.site_id || '',
//     deviceId: ssid?.device_id || '',
//     ipAddress: ssid?.ip_address || ''
//   };
// };
