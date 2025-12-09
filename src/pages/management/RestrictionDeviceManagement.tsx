import useConfig from 'hooks/useConfig';
import useValidationSchemas from 'hooks/useValidation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

//project-import
import { Dialog } from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import Form from 'components/template/Form';
import ViewDialog from 'components/template/ViewDialog';

//config
import { columnsRestrictionDevices } from 'components/ul-config/table-config';
import { deviceViewConfig } from 'components/ul-config/view-dialog-config';

//third-party
import { FormikValues, useFormik } from 'formik';

//types
import { restrictionDevicesFields } from 'components/ul-config/form-config';
import { BlackListDeviceData, NewBlackListDevice, OptionList } from 'types';
// import { getOption } from 'utils/handleData';
// import useHandleSite from 'hooks/useHandleSites';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import useHandleRegion from 'hooks/useHandleRegion';
import useHandleRestriction from 'hooks/useHandleRestriction';
import useHandleSite from 'hooks/useHandleSites';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { RootState, useSelector } from 'store';
import { getOption } from 'utils/handleData';

const RestrictionDeviceManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<BlackListDeviceData | null>(null);
  const [recordDelete, setRecordDelete] = useState<BlackListDeviceData | null>(null);
  const [data, setData] = useState<BlackListDeviceData[]>([]);
  const [optionRegion, setOptionRegion] = useState<OptionList[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  // const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const intl = useIntl();
  const mountedRef = useRef(true);
  const { RestrictionDeviceSchema } = useValidationSchemas();
  const { i18n } = useConfig();

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('restriction-devices-management');

  // const { fetchDataSites } = useHandleSite();
  const {
    fetchDataRestriction,
    handleAddRestriction,
    handleEditRestriction,
    handleDeleteRestriction,
    isLoading,
    totalPages,
    totalResults
  } = useHandleRestriction();

  const { fetchDataRegion } = useHandleRegion();
  const { fetchDataSites } = useHandleSite();

  const getDataRestrictionDevice = async (pageSize: number, pageIndex: number, currentSite: string, searchValue?: string) => {
    const [dataRestrictionDevice] = await Promise.all([
      fetchDataRestriction({ page: pageIndex, pageSize, filters: searchValue, siteId: currentSite }, 'device')
      // fetchDataSites({ page: 1, pageSize: 20 })
    ]);

    setData(dataRestrictionDevice);
    // setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  const getOptionRegion = async () => {
    const dataRegion = await fetchDataRegion({ page: 1, pageSize: 100 });
    setOptionRegion(getOption(dataRegion, 'name', 'id'));
  };

  const getOptionSite = async (regionId: string) => {
    const dataSite = await fetchDataSites({ page: 1, pageSize: 100, regionId: regionId, regionDataInput: JSON.stringify(regionIdAccess) });
    setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      getDataRestrictionDevice(pageSize, page, currentSite, search);
      getOptionRegion();
      mountedRef.current = false;
    } else if (isReload) {
      getDataRestrictionDevice(pageSize, page, currentSite, search);
      setIsReload(false);
    } else {
      getDataRestrictionDevice(pageSize, page, currentSite, search);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, i18n, search, isReload, currentSite]);

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

  const handleRowClick = (row: BlackListDeviceData) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteRestriction({ id: recordDelete?.id }, isDelete, 'device');
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsRestrictionDevices({
      currentPage: page,
      pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      hiddenView: true,
      canWrite
    });
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: RestrictionDeviceSchema,
    onSubmit: async (values: NewBlackListDevice) => {
      const handleAction = record ? handleEditRestriction : handleAddRestriction;
      const res = await handleAction(values, 'device');
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
    },
    enableReinitialize: true
  });

  useEffect(() => {
    if (formik.values.regionId) {
      getOptionSite(formik.values.regionId);
    }
    //eslint-disable-next-line
  }, [formik.values.regionId]);

  const fieldsWithOptions = restrictionDevicesFields.map((field) => {
    if (field.name === 'regionId') {
      return { ...field, options: optionRegion };
    }
    if (field.name === 'siteId') {
      return { ...field, options: optionSite };
    }
    return field;
  });

  return (
    <MainCard content={false}>
      <ScrollX>
        <GeneralizedTableV2
          isLoading={isLoading}
          columns={columns}
          data={data}
          onAddNew={handleAdd}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalResults={totalResults}
          size={pageSize}
          currentPage={page}
          onRowClick={handleRowClick}
          onSearch={setSearch}
          sortColumns="index"
          isDecrease={false}
          addButtonLabel={intl.formatMessage({ id: 'add-restriction-device' })}
          canWrite={canWrite}
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
          title={record ? intl.formatMessage({ id: 'edit-info-restriction-device' }) : intl.formatMessage({ id: 'add-restriction-device' })}
          onCancel={handleAdd}
          fieldConfig={fieldsWithOptions}
          isEditMode={!!record}
          formik={formik}
        />
        <ViewDialog title="restriction-device-info" open={openDialog} onClose={handleCloseView} data={record} config={deviceViewConfig} />
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-restriction-device"
            nameRecord={recordDelete.device_name}
            open={open}
            handleClose={handleClose}
            handleDelete={handleDelete}
          />
        )}
      </Dialog>
    </MainCard>
  );
};

export default RestrictionDeviceManagement;

const getInitialValues = (blockDevice: FormikValues | null) => {
  return {
    id: blockDevice?.id || 0,
    name: blockDevice?.name || '',
    filterMode: blockDevice?.filter_mode || 1,
    type: blockDevice?.type || '',
    macAddresses: blockDevice?.mac_addresses || [],
    macGroupIds: blockDevice?.mac_group_ids || [],
    siteId: blockDevice?.site_id || '',
    regionId: blockDevice?.region_id || ''
  };
};
