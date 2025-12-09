import useConfig from 'hooks/useConfig';
import useValidationSchemas from 'hooks/useValidation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

//project-import
import { Dialog, DialogContent, FormControl, MenuItem } from '@mui/material';
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
import { Button, DialogActions, DialogTitle, InputLabel, Select } from '@mui/material';
import { DatePicker, Spin } from 'antd';
// import { deviceFields } from 'components/ul-config/form-config';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import { columnsDevice } from 'components/ul-config/table-config';
import dayjs from 'dayjs';
import { useConfirmNavigation } from 'hooks/useConfirmNavigation';
import useHandleDevice from 'hooks/useHandleDevice';
import useHandleExcel from 'hooks/useHandleExcel';
import useHandleSite from 'hooks/useHandleSites';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { ExportSquare } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useSearchParams } from 'react-router-dom';
import { RootState, useSelector } from 'store';
import { DataDevice, NewDevice, OptionList } from 'types';
import { getOption } from 'utils/handleData';

const DeviceManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeOptional = searchParams.get('type-optional') || '';
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<DataDevice | null>(null);
  const [recordDelete, setRecordDelete] = useState<DataDevice | null>(null);
  const [recordReboot, setRecordReboot] = useState<DataDevice | null>(null);
  const [data, setData] = useState<DataDevice[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>(typeOptional);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const intl = useIntl();
  const mountedRef = useRef(true);
  const { DeviceSchema } = useValidationSchemas();
  const { i18n } = useConfig();
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const [exportDateRange, setExportDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [selectTypeReport, setSelectTypeReport] = useState<string>('');

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('device-list');

  const { fetchExportExcel } = useHandleExcel();
  const { fetchDataSites } = useHandleSite();
  const {
    fetchDataDevice,
    handleAddDevice,
    deleteDevice,
    // handleEditDevice,
    refreshDevice,
    rebootDevice,
    handleUpdateLocation,
    isLoadingDevices,
    isRefreshDevices,
    totalPages,
    totalResults
  } = useHandleDevice({});

  const { ConfirmDialog } = useConfirmNavigation({
    when: isRefreshDevices
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // reset về trang 1 khi search
  };

  const getData = async (pageSize: number, pageIndex: number, currentSite: string, searchValue?: string, statusId?: number) => {
    const [dataDevice, dataSite] = await Promise.all([
      fetchDataDevice({
        page: pageIndex,
        pageSize,
        filters: searchValue,
        type: 'ap',
        siteId: currentSite,
        statusId,
        floor: selectedFloor,
        typeOptional: selectedType
      }),
      fetchDataSites({ page: 1, pageSize: 100, regionDataInput: JSON.stringify(regionIdAccess) })
    ]);
    setData(dataDevice);
    setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      handleRefresh();
      getData(pageSize, page, currentSite, search, selectedStatusId ?? undefined);
      mountedRef.current = false;
    } else if (isReload) {
      getData(pageSize, page, currentSite, search, selectedStatusId ?? undefined);
      setIsReload(false);
    } else {
      getData(pageSize, page, currentSite, search, selectedStatusId ?? undefined);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, i18n, currentSite, search, isReload, selectedStatusId, selectedFloor, selectedType]);

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

  const handleDeleteDevice = async (id: string) => {
    await deleteDevice(id);
    fetchDataDevice();
  };

  const handleRefresh = async () => {
    await refreshDevice();
    setIsReload(true);
  };

  const handleReboot = async (isReboot: boolean) => {
    await rebootDevice({ siteId: recordReboot?.site_id || currentSite }, recordReboot?.mac_address, isReboot);
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsDevice({
      currentPage: page,
      pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      handleReboot: setRecordReboot,
      hiddenView: true,
      hiddenDelete: true,
      canWrite
      // hiddenEdit: true
    });
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: DeviceSchema,
    onSubmit: async (values: NewDevice, { resetForm }) => {
      const handleAction = record ? handleUpdateLocation : handleAddDevice;
      const res = await handleAction(values);
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
      resetForm();
    },
    enableReinitialize: true
  });

  const fieldsWithOptions = [
    // ...deviceFields,
    {
      name: 'lat',
      label: 'latitude',
      type: 'text' as const,
      placeholder: 'enter-latitude',
      required: false,
      md: 6
    },
    {
      name: 'lng',
      label: 'longitude',
      type: 'text' as const,
      placeholder: 'enter-longitude',
      required: false,
      md: 6
    }
  ].map((field) => {
    const isLatLng = field.name === 'lat' || field.name === 'lng';

    return {
      ...field,
      ...(field.name === 'siteId' ? { options: optionSite } : {}),
      ...(isLatLng ? {} : { readOnly: true })
    };
  });

  const handleStatusFilterChange = (statusId: number | null) => {
    setSelectedStatusId(statusId);
    setPage(1); // Reset to first page when filter changes
  };

  const handleFloorFilterChange = (floor: string | null) => {
    setSelectedFloor(floor || ''); // Handle null by setting an empty string
    setPage(1); // Reset to first page when filter changes
  };

  const handleTypeFilterChange = (type: string | null) => {
    const newParams = new URLSearchParams(searchParams);

    if (type) {
      newParams.set('type-optional', type);
    } else {
      newParams.delete('type-optional');
    }

    setSearchParams(newParams); // Cập nhật URL
    setSelectedType(type || ''); // Handle null by setting an empty string
    setPage(1); // Reset to first page when filter
    //
    // changes
  };

  const optionTypes = [{ label: intl.formatMessage({ id: 'device' }), value: 'devices' }];

  const statusOptions = [
    { label: intl.formatMessage({ id: 'online' }), value: 8 },
    { label: intl.formatMessage({ id: 'offline' }), value: 7 },
    { label: intl.formatMessage({ id: 'pending' }), value: 9 },
    { label: intl.formatMessage({ id: 'hearbeat_missed' }), value: 10 },
    { label: 'Isolated', value: 11 }
  ];

  const floorOptions = [
    { label: intl.formatMessage({ id: 'floor-1st' }), value: '1ST' },
    { label: intl.formatMessage({ id: 'floor-2nd' }), value: '2ND' },
    { label: intl.formatMessage({ id: 'floor-3rd' }), value: '3RD' },
    { label: intl.formatMessage({ id: 'floor-4th' }), value: '4TH' },
    { label: intl.formatMessage({ id: 'unknown' }), value: 'unknown' }
  ];

  const typeOptions = [
    { label: intl.formatMessage({ id: 'ap' }), value: 'ap' },
    { label: intl.formatMessage({ id: 'switch' }), value: 'switch' },
    { label: intl.formatMessage({ id: 'unknown' }), value: 'unknown' }
  ];

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

  return (
    <MainCard content={false}>
      <ScrollX>
        <Spin spinning={isRefreshDevices} tip={intl.formatMessage({ id: 'refreshing' })}>
          <GeneralizedTableV2
            // isLoadingRefresh={isRefresh}
            isLoading={isLoadingDevices}
            columns={columns}
            data={data}
            onAddNew={handleAdd}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
            totalPages={totalPages}
            totalResults={totalResults}
            size={pageSize}
            currentPage={page}
            onRowClick={handleRowClick}
            onSearch={handleSearchChange}
            sortColumns="index"
            isDecrease={false}
            typeOptions={typeOptions}
            defaultType={typeOptional}
            // addButtonLabel={intl.formatMessage({ id: 'add-device' })}
            floorOptions={floorOptions}
            statusOptions={statusOptions}
            buttonRefresh={intl.formatMessage({ id: 'refresh' })}
            onStatusFilterChange={handleStatusFilterChange}
            onFloorFilterChange={handleFloorFilterChange}
            onTypeFilterChange={(type) => handleTypeFilterChange(type as string)}
            exportExcelBtn={
              <Button className="!ml-0 h-10" variant="contained" onClick={() => setOpenExportDialog(true)}>
                <span className="flex items-center gap-2">
                  <ExportSquare />
                  {intl.formatMessage({ id: 'export' })}
                </span>
              </Button>
            }
          />
        </Spin>
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
        {(recordDelete || recordReboot) && (
          <Alert
            alertDelete={recordReboot ? 'alert-reboot-device' : recordDelete ? 'alert-delete-device' : ''}
            nameRecord={recordReboot ? recordReboot?.name : recordDelete ? recordDelete?.name : ''}
            open={open}
            handleClose={handleClose}
            handleDelete={(status) => (recordReboot ? handleReboot(status) : handleDeleteDevice(recordDelete?.id as string))}
            descDelete={recordReboot ? intl.formatMessage({ id: 'confirm-reboot-device' }) : undefined}
            labelDeleteButton={recordReboot ? intl.formatMessage({ id: 'reboot' }) : intl.formatMessage({ id: 'delete' })}
          />
        )}
      </Dialog>
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
    </MainCard>
  );
};

export default DeviceManagement;

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
    regionId: device?.region_id || '',
    lat: device?.device_lat,
    lng: device?.device_lng
  };
};
