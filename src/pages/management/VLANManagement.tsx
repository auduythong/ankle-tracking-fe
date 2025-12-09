import useConfig from 'hooks/useConfig';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
// import useValidationSchemas from 'hooks/useValidation';
import useHandleSite from 'hooks/useHandleSites';
import useHandleVLAN from 'hooks/useHandleVLAN';

//project-import
import { Dialog } from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import Form from 'components/template/Form';
import ViewDialog from 'components/template/ViewDialog';
import { getOption } from 'utils/handleData';

//config
import { vlanFields } from 'components/ul-config/form-config';
import { vlanViewConfig } from 'components/ul-config/view-dialog-config';

//third-party
import { FormikValues, useFormik } from 'formik';

//types
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import { columnsVLAN } from 'components/ul-config/table-config/vlan';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { RootState, useSelector } from 'store';
import { NewWLAN, OptionList } from 'types';
import { VLANData } from 'types/vlan';
import { Spin } from 'antd';
// import dayjs from 'dayjs';

const VLANManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<VLANData | null>(null);
  const [recordDelete, setRecordDelete] = useState<VLANData | null>(null);
  const [data, setData] = useState<VLANData[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const siteIdAccess = user?.sites?.map((item) => item.site_id);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const [dateFilter, setDateFilters] = useState<Record<string, any>>({
    // start_date: dayjs().subtract(15, 'day').startOf('day').toISOString(),
    // end_date: dayjs().endOf('day').toISOString()
    start_date: null,
    end_date: null
  });

  const intl = useIntl();
  const mountedRef = useRef(true);
  // const { DeviceSchema } = useValidationSchemas();
  const { i18n } = useConfig();
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('vlan-management');

  const { fetchDataSites } = useHandleSite();
  const {
    fetchDataVLAN,
    handleAddVLAN,
    handleDeleteVLAN,
    handleEditVLAN,
    handleRefreshVLAN,
    isLoading,
    isRefresh,
    totalPages,
    totalResults
  } = useHandleVLAN();

  const getData = async (
    pageSize: number,
    pageIndex: number,
    currentSite: string,
    startDate: string,
    endDate: string,
    searchValue?: string
  ) => {
    const [VLANData, dataSite] = await Promise.all([
      fetchDataVLAN({
        page: pageIndex,
        pageSize,
        filters: searchValue,
        siteDataInput: JSON.stringify(siteIdAccess),
        siteId: currentSite,
        startDate,
        endDate
      }),
      fetchDataSites({ page: 1, pageSize: 100, regionDataInput: JSON.stringify(regionIdAccess) })
    ]);

    setData(VLANData);
    setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      handleRefresh();
      getData(pageSize, page, currentSite, dateFilter.start_date, dateFilter.end_date, search);
      mountedRef.current = false;
    } else if (isReload) {
      getData(pageSize, page, currentSite, dateFilter.start_date, dateFilter.end_date, search);
      setIsReload(false);
    } else {
      getData(pageSize, page, currentSite, dateFilter.start_date, dateFilter.end_date, search);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, i18n, currentSite, dateFilter.start_date, dateFilter.end_date, search, isReload]);

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

  const handleRowClick = (row: VLANData) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteVLAN({ id: recordDelete?.id }, isDelete);
    setIsReload(true);
  };

  const handleRefresh = async () => {
    await handleRefreshVLAN(true);
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsVLAN({
      currentPage: page,
      pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      isHiddenView: true,
      canWrite
    });
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    // validationSchema: DeviceSchema,
    onSubmit: async (values: NewWLAN) => {
      const handleAction = record ? handleEditVLAN : handleAddVLAN;
      const res = await handleAction(values);
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
    },
    enableReinitialize: true
  });

  const fieldsWithOptions = vlanFields.map((field) => {
    if (field.name === 'siteId') {
      return { ...field, options: optionSite };
    }
    return field;
  });

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
        <Spin spinning={isRefresh} tip={intl.formatMessage({ id: 'refreshing' })}>
          <GeneralizedTableV2
            isLoading={isLoading}
            isLoadingRefresh={isRefresh}
            columns={columns}
            data={data}
            totalResults={totalResults}
            size={pageSize}
            currentPage={page}
            onAddNew={handleAdd}
            onPageChange={handlePageChange}
            onRefresh={handleRefresh}
            totalPages={totalPages}
            onRowClick={handleRowClick}
            onSearch={setSearch}
            sortColumns="index"
            isDecrease={false}
            // addButtonLabel={intl.formatMessage({ id: 'add-wlan' })}
            buttonRefresh={intl.formatMessage({ id: 'refresh' })}
            onDateChange={handleDateChange}
            canWrite={canWrite}
            // dateFilter={dateFilter}
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
          title={record ? intl.formatMessage({ id: 'edit-info-vlan' }) : intl.formatMessage({ id: 'add-vlan' })}
          onCancel={handleAdd}
          fieldConfig={fieldsWithOptions}
          isEditMode={!!record}
          formik={formik}
        />
        <ViewDialog title="vlan-info" open={openDialog} onClose={handleCloseView} data={record} config={vlanViewConfig} />
        {recordDelete && (
          <Alert
            alertDelete={'alert-delete-vlan'}
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

export default VLANManagement;

const getInitialValues = (wlan: FormikValues | null) => {
  return {
    id: wlan?.id || 0,
    name: wlan?.name || '',
    siteId: wlan?.site_id || ''
  };
};
