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
import { columnsPartner } from 'components/ul-config/table-config';
import { partnerViewConfig } from 'components/ul-config/view-dialog-config';

//third-party
import { FormikValues, useFormik } from 'formik';

//types
import { SelectCheckbox } from 'components/molecules/form';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import { partnerFields } from 'components/ul-config/form-config';
import useHandleAds from 'hooks/useHandleAds';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { RootState, useSelector } from 'store';
import { NewPartner, OptionList, PartnerData } from 'types';
import { formatDateToSV, getOption } from 'utils/handleData';

const AdvertisingPartner = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds ?? '');

  const [record, setRecord] = useState<PartnerData | null>(null);
  const [recordDelete, setRecordDelete] = useState<PartnerData | null>(null);
  const [data, setData] = useState<PartnerData[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [adsOptions, setAdsOptions] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadingAds, setLoadingAds] = useState(false);

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('ads-partner');

  const intl = useIntl();
  const mountedRef = useRef(true);
  const { PartnerSchema } = useValidationSchemas();
  const { i18n } = useConfig();
  const user = useSelector((state: RootState) => state.authSlice.user);
  // const siteIdAccess = user?.sites?.map((item) => item.site_id);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const { fetchDataPartner, isLoading, totalPages, totalResults, handleDeletePartner, handleAddPartner, handleEditPartner } =
    useHandlePartner();
  const { fetchDataSites } = useHandleSite();
  const { fetchDataAds } = useHandleAds();

  const getDataPartner = async (pageSize: number, pageIndex: number, currentSite: string, searchValue?: string) => {
    const dataPartner = await fetchDataPartner({
      page: pageIndex,
      pageSize,
      filters: searchValue,
      type: 'ads',
      siteId: currentSite,
      adDataInput: JSON.stringify(currentAds)
    });
    const dataSite = await fetchDataSites({ page: 1, pageSize: 20, regionDataInput: JSON.stringify(regionIdAccess) });
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
    await handleDeletePartner({ id: recordDelete?.id, type: 'ads' }, isDelete);
    setIsReload(true);
  };

  const getOptionsAds = async () => {
    try {
      setLoadingAds(true);
      const dataAds = await fetchDataAds({
        page: 1,
        pageSize: 100,
        // siteDataInput: siteIdAccess ? JSON.stringify(siteIdAccess) : JSON.stringify([]),
        siteId: currentSite,
        adDataInput: JSON.stringify(currentAds)
      });
      setAdsOptions(getOption(dataAds, 'template_name', 'id'));
    } finally {
      setLoadingAds(false);
    }
  };

  const columns = useMemo(() => {
    return columnsPartner(page, pageSize, handleAdd, handleClose, setRecord, setRecordDelete, canWrite);
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: PartnerSchema,
    onSubmit: async (values: NewPartner) => {
      const handleAction = record ? handleEditPartner : handleAddPartner;
      const res = await handleAction({ id: values.id, type: 'ads' }, values);
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
    },
    enableReinitialize: true
  });

  useEffect(() => {
    // if (formik.values.partnerAdAccessId.length > 0) {
    getOptionsAds();
    // } else {
    //   setAdsOptions([]);
    // }
    //eslint-disable-next-line
  }, [currentAds, currentSite]);

  const fieldsWithOptions = partnerFields.map((field) => {
    if (field.name === 'siteId') {
      return { ...field, options: optionSite };
    }

    if (field.name === 'partnerAdAccessId') {
      return {
        ...field,
        options: adsOptions,
        customRender: (formik: any) => (
          <SelectCheckbox
            key={field.name}
            name="partnerAdAccessId"
            field="partnerAdAccessId"
            formik={formik}
            inputLabel={intl.formatMessage({ id: field.label })}
            arrayOption={adsOptions}
            required={field.required}
            md={field.md}
            loading={loadingAds}
          />
        )
      };
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
          totalResults={totalResults}
          totalPages={totalPages}
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
        <ViewDialog title="partner-info" open={openDialog} onClose={handleCloseView} data={record} config={partnerViewConfig} />
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

export default AdvertisingPartner;

const getInitialValues = (partner: FormikValues | null) => {
  const fromDateToSV = formatDateToSV(partner?.from_date);
  const expireDateToSV = formatDateToSV(partner?.expired_date);

  return {
    id: partner?.id || '',
    name: partner?.name || '',
    description: partner?.description || '',
    address: partner?.address || '',
    country: partner?.country || '',
    phoneNumber: partner?.phone_number || '',
    type: partner?.type || 'ads' || '',
    fromDate: fromDateToSV || '',
    expiredDate: expireDateToSV || '',
    siteId: partner?.site_id || '',
    partnerAdAccessId: partner?.partner_ad_access.map((item: any) => item.ad_id) || ''
  };
};
