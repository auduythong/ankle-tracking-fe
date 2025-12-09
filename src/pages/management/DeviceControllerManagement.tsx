import useConfig from 'hooks/useConfig';
import useValidationSchemas from 'hooks/useValidation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

//project-import
import { CircularProgress, Dialog, DialogActions } from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import Form from 'components/template/Form';
import ViewDialog from 'components/template/ViewDialog';

//config
import { deviceViewConfig } from 'components/ul-config/view-dialog-config';

//third-party
import { FormikValues, useFormik } from 'formik';

//types
import { Box, Button, DialogContent, DialogTitle, Typography } from '@mui/material';
import { controllerApi } from 'api/controller.api';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import { deviceFields } from 'components/ul-config/form-config';
import { columnsDeviceController } from 'components/ul-config/table-config';
import useHandleDevice from 'hooks/useHandleDevice';
import useHandleSite from 'hooks/useHandleSites';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { CloseCircle, TickCircle } from 'iconsax-react';
import { RootState, useSelector } from 'store';
import { DataDevice, NewDevice, OptionList } from 'types';
import { getOption } from 'utils/handleData';

export enum DeviceStatus {
  Disconnected = 7,
  Connected = 8,
  Pending = 9,
  HeartbeatMissed = 10,
  Isolated = 11
}

const ControllerList = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<DataDevice | null>(null);
  const [recordDelete, setRecordDelete] = useState<DataDevice | null>(null);
  const [data, setData] = useState<DataDevice[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const user = useSelector((state: RootState) => state.authSlice.user);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const intl = useIntl();
  const mountedRef = useRef(true);
  const { DeviceSchema } = useValidationSchemas();
  const { i18n } = useConfig();

  const { fetchDataSites } = useHandleSite();
  const { fetchDataDevice, handleAddDevice, deleteDevice, handleEditDevice, isLoadingDevices, totalPages, totalResults } = useHandleDevice(
    {}
  );
  const [openCheckModal, setOpenCheckModal] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState<DeviceStatus | null>(null);

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('controller-list');

  const getDataController = async (pageSize: number, pageIndex: number, currentSite: string, searchValue?: string) => {
    const [dataDevice, dataSite] = await Promise.all([
      fetchDataDevice({ page: pageIndex, pageSize, filters: searchValue, type: 'controller', siteId: currentSite }),
      fetchDataSites({ page: 1, pageSize: 20, regionDataInput: JSON.stringify(regionIdAccess) })
    ]);

    setData(dataDevice);
    setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      getDataController(pageSize, page, currentSite, search);
      mountedRef.current = false;
    } else if (isReload) {
      getDataController(pageSize, page, currentSite, search);
      setIsReload(false);
    } else {
      getDataController(pageSize, page, currentSite, search);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, i18n, currentSite, search, isReload]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleRowClick = (row: DataDevice) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const handleDelete = async (id: string) => {
    await deleteDevice(id);
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsDeviceController({
      currentPage: page,
      pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      hiddenView: true,
      hiddenReboot: true,
      handleCheckConnection(record) {
        handleCheckConnection(record);
      },
      canWrite
    });
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: DeviceSchema,
    onSubmit: async (values: NewDevice) => {
      let res;
      if (record) {
        res = await handleEditDevice(record.id, values);
      } else {
        res = await handleAddDevice(values);
      }
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
    },
    enableReinitialize: true
  });

  const fieldsWithOptions = deviceFields.map((field) => {
    if (field.name === 'siteId') {
      return { ...field, options: optionSite };
    }
    return field;
  });

  const handleCheckConnection = async (row: any) => {
    setCheckingStatus(DeviceStatus.Pending);
    setOpenCheckModal(true);

    try {
      const { data } = await controllerApi.checkConnection({ deviceId: row.id });

      setCheckingStatus(data?.data?.[0].device.status_id);
    } catch (error) {
      console.error('Lỗi kiểm tra kết nối:', error);
      setCheckingStatus(DeviceStatus.Disconnected);
    }
  };

  const handleCloseCheckModal = () => {
    setOpenCheckModal(false);
    setCheckingStatus(DeviceStatus.Pending);
  };

  console.log(checkingStatus);

  return (
    <MainCard content={false}>
      <ScrollX>
        <GeneralizedTableV2
          isLoading={isLoadingDevices}
          columns={columns}
          data={data}
          totalResults={totalResults}
          onAddNew={handleAdd}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          size={pageSize}
          currentPage={page}
          onRowClick={handleRowClick}
          onSearch={setSearch}
          sortColumns="index"
          isDecrease={false}
          // addButtonLabel={intl.formatMessage({ id: 'add-device' })}
        />
      </ScrollX>
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleAdd}
        open={add}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <Form
          title={record ? intl.formatMessage({ id: 'edit-info-device' }) : intl.formatMessage({ id: 'add-device' })}
          onCancel={handleAdd}
          fieldConfig={fieldsWithOptions}
          isEditMode={!!record}
          formik={formik}
        />
        <ViewDialog title="device-info" open={openDialog} onClose={handleCloseView} data={record} config={deviceViewConfig} />
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-device"
            nameRecord={recordDelete.name}
            open={open}
            handleClose={handleClose}
            handleDelete={(_) => handleDelete(recordDelete.id)}
          />
        )}
      </Dialog>
      <Dialog
        open={openCheckModal}
        onClose={handleCloseCheckModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            pb: 1,
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          <FormattedMessage id="check-connection" defaultMessage="Kiểm tra kết nối" />
        </DialogTitle>

        <DialogContent
          sx={{
            px: 4,
            py: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 120
          }}
        >
          {checkingStatus === DeviceStatus.Pending && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
              <CircularProgress size={40} thickness={4} sx={{ color: 'primary.main' }} />
              <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mt: 1 }}>
                <FormattedMessage id="checking-connection" defaultMessage="Đang kiểm tra kết nối..." />
              </Typography>
            </Box>
          )}

          {checkingStatus === DeviceStatus.Connected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
              <TickCircle size="64" color="#4caf50" variant="Bold" />
              <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 600, textAlign: 'center' }}>
                <FormattedMessage id="connection-success" defaultMessage="Kết nối thành công" />
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                <FormattedMessage id="system-ready" defaultMessage="Hệ thống đã sẵn sàng hoạt động" />
              </Typography>
            </Box>
          )}

          {checkingStatus === DeviceStatus.Disconnected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
              <CloseCircle size="64" color="#f44336" variant="Bold" />
              <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 600, textAlign: 'center' }}>
                <FormattedMessage id="connection-failed" defaultMessage="Kết nối thất bại" />
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                <FormattedMessage id="check-configuration" defaultMessage="Vui lòng kiểm tra lại cấu hình" />
              </Typography>
            </Box>
          )}

          {checkingStatus === DeviceStatus.HeartbeatMissed && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
              <CloseCircle size="64" color="#ff9800" variant="Bold" />
              <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 600, textAlign: 'center' }}>
                <FormattedMessage id="periodic-disconnection" defaultMessage="Mất kết nối định kỳ" />
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                <FormattedMessage id="no-heartbeat" defaultMessage="Thiết bị không phản hồi tín hiệu heartbeat" />
              </Typography>
            </Box>
          )}

          {checkingStatus === DeviceStatus.Isolated && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
              <CloseCircle size="64" color="#9e9e9e" variant="Bold" />
              <Typography variant="h6" sx={{ color: 'text.disabled', fontWeight: 600, textAlign: 'center' }}>
                <FormattedMessage id="device-isolated" defaultMessage="Thiết bị bị cách ly" />
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                <FormattedMessage id="device-disconnected-from-system" defaultMessage="Thiết bị đã bị cô lập khỏi hệ thống" />
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            justifyContent: 'center'
          }}
        >
          <Button
            onClick={handleCloseCheckModal}
            variant="contained"
            size="large"
            sx={{
              minWidth: 120,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5
            }}
          >
            <FormattedMessage id="close" defaultMessage="Đóng" />
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default ControllerList;

const getInitialValues = (device: FormikValues | null) => {
  return {
    id: device?.id || '',
    name: device?.name || '',
    description: device?.description || '',
    ipAddress: device?.ip_address || '',
    macAddress: device?.mac_address || '',
    firmware: device?.firmware || '',
    wifiStandard: device?.wifi_standard || '',
    model: device?.model || '',
    manufacturerDate: device?.manufacturer_date || '',
    siteId: device?.site_id || '',
    url: device?.url || '',
    username: device?.username || '',
    password: device?.password || '',
    clientId: device?.client_id || '',
    Id: device?.Id || '',
    clientSecret: device?.client_secret || '',
    partnerId: device?.partner_id || '',
    regionId: device?.region_id || ''
  };
};
