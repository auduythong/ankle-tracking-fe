import useValidationSchemas from 'hooks/useValidation';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

//project-import
import { Dialog } from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import GeneralizedTable from 'components/organisms/GeneralizedTable';
import ScrollX from 'components/ScrollX';

//third-party
import { FormikValues, useFormik } from 'formik';

//types
import ConfirmationDialog from 'components/template/ConfirmationDialog';
import FormVoucher from 'components/template/FormVoucher';
import { voucherFields } from 'components/ul-config/form-config';
import { columnsVoucherGroup } from 'components/ul-config/table-config';
import dayjs from 'dayjs';
import useHandlePortal from 'hooks/useHandlePortal';
import useHandleRatelimit from 'hooks/useHandleRatelimit';
import useHandleSite from 'hooks/useHandleSites';
import useHandleSSID from 'hooks/useHandleSSID';
import useHandleVouchersGroup from 'hooks/useHandleVouchers';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { useNavigate } from 'react-router';
import { RootState, useSelector } from 'store';
import { OptionList } from 'types';
import { NewVoucherGroup, Voucher } from 'types/voucher';
import { getOption } from 'utils/handleData';

const OrderDigitalManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);

  const [record, setRecord] = useState<NewVoucherGroup | null>(null);
  const [recordDelete, setRecordDelete] = useState<NewVoucherGroup | null>(null);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [optionPortals, setOptionPortals] = useState<OptionList[]>([]);
  const [optionSSID, setOptionSSID] = useState<OptionList[]>([]);
  const [optionRateLimits, setOptionRateLimits] = useState<OptionList[]>([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dateFilter, setDateFilters] = useState<Record<string, any>>({
    start_date: dayjs().subtract(15, 'day').startOf('day').toISOString(),
    end_date: dayjs().endOf('day').toISOString()
  });

  const intl = useIntl();
  const { VoucherSchema } = useValidationSchemas();
  // const { i18n } = useConfig();
  const navigate = useNavigate();

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('voucher-management');

  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item: any) => item.region_id);
  // const siteIdAccess = user?.regions?.map((item: any) => item.site_id);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const { fetchDataSites } = useHandleSite();
  const {
    dataVoucherGroup,
    fetchVoucherGroup,
    addVoucherGroup,
    deleteVoucherGroup,
    refreshVoucherGroup,
    editVoucherGroup,
    isLoading,
    isLoadingDelete,
    isRefresh,
    totalPages,
    totalResults
  } = useHandleVouchersGroup({ initVoucherGroupQuery: { page: 1, pageSize: 50, siteId: currentSite } });
  const { fetchDataRatelimit } = useHandleRatelimit();
  const { fetchDataSSID } = useHandleSSID();
  const { fetchDataPortal } = useHandlePortal();

  const getOptionData = async (siteId: string) => {
    try {
      const [dataRatelimit, dataPortal, dataSSID, dataSite] = await Promise.all([
        fetchDataRatelimit({ siteId, page: 1, pageSize: 100 }),
        fetchDataPortal({ siteId, page: 1, pageSize: 100, authType: 11 }),
        fetchDataSSID({ siteId, page: 1, pageSize: 100, siteDataInput: JSON.stringify([siteId]) }),
        fetchDataSites({ page: 1, pageSize: 20, regionDataInput: JSON.stringify(regionIdAccess) })
      ]);

      setOptionRateLimits(getOption(dataRatelimit, "name", "profile_hardware_id"));
      setOptionPortals(getOption(dataPortal.data, "name", "id"));
      setOptionSSID(getOption(dataSSID, "name", "id"));
      setOptionSite(getOption(dataSite, 'name', 'id'));
    } catch (error) {

    }

  };

  // useEffect(() => {
  //   if (mountedRef.current) {
  //     getListVoucherGroup(pageSize, pageIndex, currentSite, dateFilter.start_date, dateFilter.end_date, search);
  //     getOptionData(currentSite);
  //     mountedRef.current = false;
  //   } else if (isReload) {
  //     getListVoucherGroup(pageSize, pageIndex, currentSite, dateFilter.start_date, dateFilter.end_date, search);
  //     setIsReload(false);
  //   } else {
  //     getListVoucherGroup(pageSize, pageIndex, currentSite, dateFilter.start_date, dateFilter.end_date, search);
  //   }
  //   //eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pageIndex, pageSize, i18n, currentSite, dateFilter.start_date, dateFilter.end_date, search, isReload]);


  useEffect(() => {
    fetchVoucherGroup()
    fetchDataSites({ page: 1, pageSize: 20, regionDataInput: JSON.stringify(regionIdAccess) })

    return () => { }
  }, [])


  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex + 1);
    setPageSize(newPageSize);
  };

  const handleRefresh = async () => {
    await refreshVoucherGroup();
    fetchVoucherGroup();
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleRowClick = (row: NewVoucherGroup) => {
    setRecord(row);
  };

  const onViewClick = (record: Voucher) => {
    console.log(record);
    navigate(`/voucher/details/${record.id}`);
  };

  const columns: any = useMemo(() => {
    return columnsVoucherGroup({
      currentPage: pageIndex,
      pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      setViewRecord: onViewClick,
      canWrite
    });
    //eslint-disable-next-line
  }, [setRecord, pageIndex, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);


  const handleSubmit = async (payload: NewVoucherGroup) => {
    try {
      let res;
      if (record) {
        res = await editVoucherGroup(record.id, payload)
      }
      else {
        res = addVoucherGroup(payload)
      }
      if (res.code === 0) {
        handleAdd(); //Đóng dialog
        fetchVoucherGroup()
      }
    } catch (error) {

    }
  }

  const formik = useFormik({
    initialValues,
    validationSchema: VoucherSchema,
    onSubmit: async (values: NewVoucherGroup) => {
      handleSubmit(values)
    },
    enableReinitialize: true
  });

  const handleDeleteVoucherGroup = async (id: string) => {
    try {
      await deleteVoucherGroup(id)
      fetchVoucherGroup()
    } catch (error) {

    }
  }

  useEffect(() => {
    if (formik.values.siteId) {
      getOptionData(formik.values.siteId);
    }
    //eslint-disable-next-line
  }, [currentSite, formik.values.siteId]);

  const fieldsWithOptions = useMemo(() => {
    return voucherFields.map((field) => {
      if (field.name === 'siteId') {
        return { ...field, options: optionSite };
      }
      if (field.name === 'ssidId') {
        return { ...field, options: optionSSID };
      }
      if (field.name === 'portals') {
        return { ...field, options: optionPortals };
      }
      if (field.name === 'rateLimitId') {
        return { ...field, options: optionRateLimits };
      }
      if (field.name === 'codeFrom') {
        return {
          ...field,
          options: [
            { label: intl.formatMessage({ id: 'numbers-only' }), value: 0 },
            { label: intl.formatMessage({ id: 'numbers-and-letters' }), value: 1 }
          ]
        };
      }
      if (field.name === 'limitType') {
        return {
          ...field,
          options: [
            { label: intl.formatMessage({ id: 'limited-usage-counts' }), value: 0 },
            { label: intl.formatMessage({ id: 'limited-online-users' }), value: 1 },
            { label: intl.formatMessage({ id: 'unlimited' }), value: 2 }
          ]
        };
      }
      if (field.name === 'durationType') {
        return {
          ...field,
          options: [
            { label: intl.formatMessage({ id: 'client-duration' }), value: 0 },
            { label: intl.formatMessage({ id: 'voucher-duration' }), value: 1 }
          ]
        };
      }
      if (field.name === 'timingType') {
        return {
          ...field,
          options: [
            { label: intl.formatMessage({ id: 'timing-by-time' }), value: 0 },
            { label: intl.formatMessage({ id: 'timing-by-usage' }), value: 1 }
          ]
        };
      }
      if (field.name === 'rateLimitMode') {
        return {
          ...field,
          options: [
            { label: intl.formatMessage({ id: 'custom-rate-limit' }), value: 0 },
            { label: intl.formatMessage({ id: 'rate-limit-profiled' }), value: 1 }
          ]
        };
      }
      if (field.name === 'trafficLimitFrequency') {
        return {
          ...field,
          options: [
            { label: intl.formatMessage({ id: 'traffic-limit-frequency-option-0' }), value: 0 },
            { label: intl.formatMessage({ id: 'traffic-limit-frequency-option-1' }), value: 1 }
          ]
        };
      }
      if (field.name === 'validityType') {
        return {
          ...field,
          options: [
            { label: intl.formatMessage({ id: 'any-time' }), value: 0 },
            { label: intl.formatMessage({ id: 'between-effective-and-expiration-time' }), value: 1 },
            { label: intl.formatMessage({ id: 'specific-time-period' }), value: 2 }
          ]
        };
      }
      return field;
    });
    //eslint-disable-next-line
  }, [optionSite, optionSSID, optionPortals, optionRateLimits]);

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    if (!dates) {
      setDateFilters((prev) => ({
        ...prev,
        start_date: null,
        end_date: null
      }));
    } else {
      setDateFilters((prev) => ({
        ...prev,
        start_date: dates[0] ? dates[0].format('YYYY/MM/DD') : null,
        end_date: dates[1] ? dates[1].format('YYYY/MM/DD') : null
      }));
    }
  };

  return (
    <MainCard content={false}>
      <ScrollX>
        <GeneralizedTable
          isLoading={isLoading}
          isLoadingRefresh={isRefresh}
          columns={columns}
          data={dataVoucherGroup}
          totalResults={totalResults}
          handleAdd={handleAdd}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          onRowClick={handleRowClick}
          // searchFilter={setSearch}
          sortColumns="index"
          isDecrease={false}
          addButtonLabel={intl.formatMessage({ id: 'add-voucher-group' })}
          handleDateFilter={handleDateChange}
          dateFilter={dateFilter}
          buttonRefresh={intl.formatMessage({ id: 'refresh' })}
          handleRefresh={handleRefresh}
          canWrite={canWrite}
        />
      </ScrollX>

      <Dialog
        maxWidth="md"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleAdd}
        open={add}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <FormVoucher
          title={record ? intl.formatMessage({ id: 'edit-info-voucher-group' }) : intl.formatMessage({ id: 'add-voucher-group' })}
          onCancel={handleAdd}
          ssidOptions={optionSSID}
          siteOptions={optionSite}
          fieldConfig={fieldsWithOptions}
          rateLimitOptions={optionRateLimits}
          isEditMode={!!record}
          formik={formik}
          portalOptions={optionPortals}
        />

        {recordDelete && (
          <ConfirmationDialog
            open={open}
            variant="delete"
            titleKey="alert-resolve-device"
            showItemName={false}
            description="alert-resolve-device-desc"
            confirmLabel="confirm"
            confirmButtonColor="success"
            isLoading={isLoadingDelete}
            onClose={() => setOpen(false)}
            onConfirm={() => handleDeleteVoucherGroup(recordDelete.id)}
          />
        )}
      </Dialog>
    </MainCard>
  );
};

export default OrderDigitalManagement;

const getInitialValues = (voucher: FormikValues | null) => {
  return {
    id: voucher?.id || '',
    name: voucher?.name || '',
    siteId: voucher?.site_id || '',
    amount: voucher?.amount || 10,
    codeLength: voucher?.code_length || 6,
    codeForm: voucher?.code_form || [],
    limitType: voucher?.limit_type || 0,
    limitNum: voucher?.limit_num || 1,
    durationType: voucher?.duratiobn_type || 0,
    duration: voucher?.duration || 60,
    timingType: voucher?.timing_type || 0,
    rateLimitMode: voucher?.rate_limit_mode || 0,
    rateLimitId: voucher?.rate_limit_id || 0,
    customRateLimitDownEnable: voucher?.custom_ratelimit_down_enable || 'false',
    customRateLimitDown: voucher?.custom_ratelimit_down || 0,
    customRateLimitUpEnable: voucher?.custom_ratelimit_up_enable || 'false',
    customRateLimitUp: voucher?.custom_ratelimit_up || 0,
    trafficLimitEnable: voucher?.traffic_limit_enable || 'false',
    trafficLimit: voucher?.traffic_limit || 0,
    trafficLimitFrequency: voucher?.traffic_limit_frequency || 0,
    unitPrice: voucher?.unit_price || 0,
    currency: voucher?.currency || 'VND',
    applyToAllPortals: voucher?.apply_to_all_portals || 'true',
    portals: voucher?.portals || [],
    expirationTime: voucher?.expiration_time || 0,
    effectiveTime: voucher?.effective_time || 0,
    logout: voucher?.logout || 'false',
    description: voucher?.description || '',
    validityType: voucher?.validity_type || 0,
    ssidId: voucher?.ssid_id || []
  };
};
