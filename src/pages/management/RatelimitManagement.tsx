import { useIntl } from 'react-intl';
import { useState, useEffect, useMemo, useRef } from 'react';
import useConfig from 'hooks/useConfig';
import { PopupTransition } from 'components/@extended/Transitions';
import { Dialog } from '@mui/material';
import MainCard from 'components/MainCard';
import GeneralizedTable from 'components/organisms/GeneralizedTable';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import Form from 'components/template/Form';
import { FormikValues, useFormik } from 'formik';
import { OptionList } from 'types';
import { NewRatelimit, DataRatelimit } from 'types/ratelimit';
import { ratelimitFields } from 'components/ul-config/form-config';
import { getOption } from 'utils/handleData';
import useHandleSite from 'hooks/useHandleSites';
import { RootState, useSelector } from 'store';
import useHandleRatelimit from 'hooks/useHandleRatelimit';
import { columnsRatelimit } from 'components/ul-config/table-config/ratelimit';
import { usePermissionChecker } from 'hooks/usePermissionChecker';

const RatelimitManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);

  const [record, setRecord] = useState<DataRatelimit | null>(null);
  const [recordDelete, setRecordDelete] = useState<DataRatelimit | null>(null);
  const [data, setData] = useState<DataRatelimit[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const intl = useIntl();
  const mountedRef = useRef(true);
  const { i18n } = useConfig();
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('ratelimit-management');

  const { fetchDataSites } = useHandleSite();
  const {
    fetchDataRatelimit,
    handleAddRatelimit,
    handleDeleteRatelimit,
    handleEditRatelimit,
    handleRefreshRatelimit,
    isLoading,
    isRefresh,
    totalPages,
    totalResults
  } = useHandleRatelimit();

  const getData = async (pageSize: number, pageIndex: number, currentSite: string, searchValue?: string) => {
    const [dataRateLimit, dataSite] = await Promise.all([
      fetchDataRatelimit({ page: pageIndex, pageSize, filters: searchValue, siteId: currentSite }),
      fetchDataSites({ page: 1, pageSize: 100, regionDataInput: JSON.stringify(regionIdAccess) })
    ]);
    console.log(dataRateLimit);
    setData(dataRateLimit);
    setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      handleRefresh(true);
      getData(pageSize, pageIndex, currentSite, search);
      mountedRef.current = false;
    } else if (isReload) {
      getData(pageSize, pageIndex, currentSite, search);
      setIsReload(false);
    } else {
      getData(pageSize, pageIndex, currentSite, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, i18n, currentSite, search, isReload]);

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex + 1);
    setPageSize(newPageSize);
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleRowClick = (row: DataRatelimit) => {
    setRecord(row);
  };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteRatelimit({ id: recordDelete?.id }, isDelete);
    setIsReload(true);
  };

  const handleRefresh = async (isRefresh: boolean) => {
    await handleRefreshRatelimit(isRefresh);
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsRatelimit({
      currentPage: pageIndex,
      pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      canWrite
    });
    // eslint-disable-next-line
  }, [setRecord, pageIndex, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    onSubmit: async (values: NewRatelimit) => {
      const handleAction = record ? handleEditRatelimit : handleAddRatelimit;
      const res = await handleAction(values);
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
    },
    enableReinitialize: true
  });

  useEffect(() => {
    if (formik.values.downLimitEnable === 'false') {
      formik.setFieldValue('downLimit', 0);
    }
    if (formik.values.upLimitEnable === 'false') {
      formik.setFieldValue('upLimit', 0);
    }
    //eslint-disable-next-line
  }, [formik.values.downLimitEnable, formik.values.upLimitEnable]);

  const fieldsWithOptions = useMemo(() => {
    const { downLimitEnable, upLimitEnable } = formik.values;

    return ratelimitFields
      .filter((field) => {
        if (field.name === 'downLimit' && downLimitEnable !== 'true') return false; // Ẩn downLimit nếu downLimitEnable không phải 'true'
        if (field.name === 'upLimit' && upLimitEnable !== 'true') return false; // Ẩn upLimit nếu upLimitEnable không phải 'true'
        return true;
      })
      .map((field) => {
        if (field.name === 'siteId') {
          return { ...field, options: optionSite };
        }
        return field;
      });
    //eslint-disable-next-line
  }, [optionSite, formik.values.downLimitEnable, formik.values.upLimitEnable]);

  return (
    <MainCard content={false}>
      <ScrollX>
        <GeneralizedTable
          isLoading={isLoading}
          isLoadingRefresh={isRefresh}
          columns={columns}
          data={data}
          handleAdd={handleAdd}
          onPageChange={handlePageChange}
          handleRefresh={handleRefresh}
          totalPages={totalPages}
          totalResults={totalResults}
          onRowClick={handleRowClick}
          searchFilter={setSearch}
          sortColumns="index"
          isDecrease={false}
          addButtonLabel={intl.formatMessage({ id: 'add-ratelimit' })}
          buttonRefresh={intl.formatMessage({ id: 'refresh' })}
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
          title={record ? intl.formatMessage({ id: 'edit-info-ratelimit' }) : intl.formatMessage({ id: 'add-ratelimit' })}
          onCancel={handleAdd}
          fieldConfig={fieldsWithOptions}
          isEditMode={!!record}
          formik={formik}
        />
        {recordDelete && (
          <Alert
            alertDelete={'alert-delete-ratelimit'}
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

export default RatelimitManagement;

const getInitialValues = (ratelimitProfile: FormikValues | null) => {
  return {
    id: ratelimitProfile?.id || 0,
    name: ratelimitProfile?.name || '',
    downLimitEnable: ratelimitProfile?.down_limit_enable || 'false',
    downLimit: ratelimitProfile?.down_limit || 0,
    upLimitEnable: ratelimitProfile?.up_limit_enable || 'false',
    upLimit: ratelimitProfile?.up_limit || 0,
    siteId: ratelimitProfile?.site_id || ''
  };
};
