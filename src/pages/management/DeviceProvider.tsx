import useConfig from 'hooks/useConfig';
import useHandlePartner from 'hooks/useHandlePartner';
import useHandleSite from 'hooks/useHandleSites';
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
import { columnsDeviceProvider } from 'components/ul-config/table-config';
import { partnerDeviceViewConfig } from 'components/ul-config/view-dialog-config';

//third-party
import { FormikValues, useFormik } from 'formik';

//types
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import { partnerFields } from 'components/ul-config/form-config';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { RootState, useSelector } from 'store';
import { NewPartner, OptionList, PartnerData } from 'types';
import { getOption } from 'utils/handleData';

const DevicesProvider = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<PartnerData | null>(null);
  const [recordDelete, setRecordDelete] = useState<PartnerData | null>(null);
  const [data, setData] = useState<PartnerData[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const user = useSelector((state: RootState) => state.authSlice.user);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const intl = useIntl();
  const mountedRef = useRef(true);
  const { PartnerSchema } = useValidationSchemas();
  const { i18n } = useConfig();
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('device-provider');

  const { fetchDataPartner, isLoading, totalPages, handleDeletePartner, handleAddPartner, handleEditPartner, totalResults } =
    useHandlePartner();
  const { fetchDataSites } = useHandleSite();

  const getDataPartner = async (pageSize: number, pageIndex: number, currentSite: string, searchValue?: string) => {
    const [dataPartner, dataSite] = await Promise.all([
      fetchDataPartner({ page: pageIndex, pageSize, filters: searchValue, type: 'devices', siteId: currentSite }),
      fetchDataSites({ page: 1, pageSize: 20, regionDataInput: JSON.stringify(regionIdAccess) })
    ]);

    setData(dataPartner);
    setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      getDataPartner(pageSize, page, currentSite, search);
      mountedRef.current = false;
    } else if (isReload) {
      getDataPartner(pageSize, page, currentSite, search);
      setIsReload(false);
    } else {
      getDataPartner(pageSize, page, currentSite, search);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, i18n, currentSite, search, isReload]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    console.log({ newPageSize });
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

  const handleRowClick = (row: PartnerData) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeletePartner({ id: recordDelete?.id, type: 'devices' }, isDelete);
    setIsReload(true);
  };

  const columns: any = useMemo(() => {
    return columnsDeviceProvider(page, pageSize, handleAdd, handleClose, setRecord, setRecordDelete, canWrite);
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: PartnerSchema,
    onSubmit: async (values: NewPartner) => {
      const handleAction = record ? handleEditPartner : handleAddPartner;
      const res = await handleAction({ id: values.id, type: 'devices' }, values);
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
    },
    enableReinitialize: true
  });

  const fieldsWithOptions = partnerFields.map((field) => {
    if (field.name === 'name') {
      return { ...field, readOnly: record?.name === 'Ruckus' };
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
          addButtonLabel={intl.formatMessage({ id: 'add-partner' })}
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
          title={record ? intl.formatMessage({ id: 'edit-info-partner' }) : intl.formatMessage({ id: 'add-partner' })}
          onCancel={handleAdd}
          fieldConfig={fieldsWithOptions}
          isEditMode={!!record}
          formik={formik}
        />
        <ViewDialog title="partner-info" open={openDialog} onClose={handleCloseView} data={record} config={partnerDeviceViewConfig} />
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-partner"
            nameRecord={recordDelete.name}
            open={open}
            handleClose={handleClose}
            handleDelete={handleDelete}
          />
        )}
      </Dialog>
    </MainCard>
  );
};

export default DevicesProvider;

const getInitialValues = (partner: FormikValues | null) => {
  return {
    id: partner?.id || '',
    name: partner?.name || '',
    description: partner?.description || '',
    address: partner?.address || '',
    country: partner?.country || '',
    phoneNumber: partner?.phone_number || '',
    type: partner?.type || 'devices' || '',
    siteId: partner?.site_id || '',
    partnerAdAccessId: partner?.partner_ad_access_id || ''
  };
};
