import useConfig from 'hooks/useConfig';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
// import useValidationSchemas from 'hooks/useValidation';
import useHandleSite from 'hooks/useHandleSites';
import useHandleWLAN from 'hooks/useHandleWLAN';

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
import { wlanFields } from 'components/ul-config/form-config';
import { columnsWLAN } from 'components/ul-config/table-config';
import { wlanViewConfig } from 'components/ul-config/view-dialog-config';

//third-party
import { FormikValues, useFormik } from 'formik';

//types
import { Spin } from 'antd';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import { useConfirmNavigation } from 'hooks/useConfirmNavigation';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { RootState, useSelector } from 'store';
import { NewWLAN, OptionList, WLANData } from 'types';
// import dayjs from 'dayjs';

const WLANManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<WLANData | null>(null);
  const [recordDelete, setRecordDelete] = useState<WLANData | null>(null);
  const [data, setData] = useState<WLANData[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const intl = useIntl();
  const mountedRef = useRef(true);
  // const { DeviceSchema } = useValidationSchemas();
  const { i18n } = useConfig();
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('wlan-management');

  const { fetchDataSites } = useHandleSite();
  const {
    fetchDataWLAN,
    handleAddWLAN,
    handleDeleteWLAN,
    handleEditWLAN,
    handleRefreshWLAN,
    isLoading,
    isRefresh,
    totalPages,
    totalResults
  } = useHandleWLAN();

  const getData = async (pageSize: number, pageIndex: number, currentSite: string, searchValue?: string) => {
    const [WLANData, dataSite] = await Promise.all([
      fetchDataWLAN({ page: pageIndex, pageSize, filters: searchValue, siteId: currentSite }),
      fetchDataSites({ page: 1, pageSize: 100, regionDataInput: JSON.stringify(regionIdAccess) })
    ]);

    setData(WLANData);
    setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      handleRefresh();
      getData(pageSize, page, currentSite, search);
      mountedRef.current = false;
    } else if (isReload) {
      getData(pageSize, page, currentSite, search);
      setIsReload(false);
    } else {
      getData(pageSize, page, currentSite, search);
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

  const handleRowClick = (row: WLANData) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteWLAN({ id: recordDelete?.id }, isDelete);
    setIsReload(true);
  };

  const handleRefresh = async () => {
    await handleRefreshWLAN(true);
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsWLAN({
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
      const handleAction = record ? handleEditWLAN : handleAddWLAN;
      const res = await handleAction(values);
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
    },
    enableReinitialize: true
  });

  const fieldsWithOptions = wlanFields.map((field) => {
    if (field.name === 'siteId') {
      return { ...field, options: optionSite };
    }
    return field;
  });

  // const handleDateChange = (dates: any, dateStrings: [string, string]) => {
  //   if (!dates) {
  //     setDateFilters((prev) => ({
  //       ...prev,
  //       start_date: null,
  //       end_date: null
  //     }));
  //   } else {
  //     setDateFilters((prev) => ({
  //       ...prev,
  //       start_date: dates[0] ? dates[0].format('YYYY/MM/DD') : null,
  //       end_date: dates[1] ? dates[1].format('YYYY/MM/DD') : null
  //     }));
  //   }
  // };

  const { ConfirmDialog } = useConfirmNavigation({
    when: isRefresh
  });

  return (
    <MainCard content={false}>
      <ScrollX>
        <Spin spinning={isRefresh} tip={intl.formatMessage({ id: 'refreshing' })}>
          <GeneralizedTableV2
            isLoading={isLoading}
            isLoadingRefresh={isRefresh}
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
            onSearch={setSearch}
            sortColumns="index"
            isDecrease={false}
            addButtonLabel={intl.formatMessage({ id: 'add-wlan' })}
            buttonRefresh={intl.formatMessage({ id: 'refresh' })}
            // handleDateFilter={handleDateChange}
            canWrite={canWrite}
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
          title={record ? intl.formatMessage({ id: 'edit-info-wlan' }) : intl.formatMessage({ id: 'add-wlan' })}
          onCancel={handleAdd}
          fieldConfig={fieldsWithOptions}
          isEditMode={!!record}
          formik={formik}
        />
        <ViewDialog title="wlan-info" open={openDialog} onClose={handleCloseView} data={record} config={wlanViewConfig} />
        {recordDelete && (
          <Alert
            alertDelete={'alert-delete-wlan'}
            nameRecord={recordDelete.name}
            open={open}
            handleClose={handleClose}
            handleDelete={handleDelete}
          />
        )}
      </Dialog>
      {ConfirmDialog}
    </MainCard>
  );
};

export default WLANManagement;

const getInitialValues = (wlan: FormikValues | null) => {
  return {
    id: wlan?.id || 0,
    name: wlan?.name || '',
    siteId: wlan?.site_id || ''
  };
};
