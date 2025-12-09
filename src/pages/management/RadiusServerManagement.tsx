import useConfig from 'hooks/useConfig';
import useHandleRadius from 'hooks/useHandleRadius';
import useValidationSchemas from 'hooks/useValidation';
import { useEffect, useMemo, useRef, useState } from 'react';

//project-import
import { Dialog } from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import ViewDialog from 'components/template/ViewDialog';

//config
import { columnsRadius } from 'components/ul-config/table-config/radius';
import { radiusViewConfig } from 'components/ul-config/view-dialog-config';

//types
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import Form from 'components/template/Form';
import { radiusFields, radiusFullFields } from 'components/ul-config/form-config';
import { useFormik } from 'formik';
import useHandleSite from 'hooks/useHandleSites';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { DataRadius, NewRadius, OptionList } from 'types';
import { getOption } from 'utils/handleData';
import { Spin } from 'antd';
import { useConfirmNavigation } from 'hooks/useConfirmNavigation';

const RadiusManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isReload, setIsReload] = useState(false);

  const [record, setRecord] = useState<DataRadius | null>(null);
  const [recordDelete, setRecordDelete] = useState<DataRadius | null>(null);
  const [data, setData] = useState<DataRadius[]>([]);
  const [optionSites, setOptionSites] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const user = useSelector((state: RootState) => state.authSlice.user);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const regionIdAccess = user?.regions?.map((item) => item.region_id);

  const intl = useIntl();
  const mountedRef = useRef(true);
  const { RadiusSchema, RadiusFullFieldsSchema } = useValidationSchemas();
  const { i18n } = useConfig();
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('radius-management');

  const {
    fetchDataRadius,
    handleRefreshRadius,
    handleDeleteRadius,
    handleAddRadius,
    handleEditRadius,
    isLoading,
    isRefresh,
    totalPages,
    totalResults
  } = useHandleRadius();
  const { fetchDataSites } = useHandleSite();

  const { ConfirmDialog } = useConfirmNavigation({
    when: isRefresh
  });

  const getDataRadiusServer = async (pageSize: number, pageIndex: number, currentSite: string, searchValue?: string) => {
    const dataRadius = await fetchDataRadius({ page: pageIndex, pageSize, filters: searchValue, siteId: currentSite });
    setData(dataRadius);
    // setData([]);
  };

  const getDataSite = async () => {
    const dataSites = await fetchDataSites({ pageSize: 100, page: 1, regionDataInput: JSON.stringify(regionIdAccess) });
    setOptionSites(getOption(dataSites, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      handleRefresh();
      getDataRadiusServer(pageSize, page, currentSite, search);
      getDataSite();
      mountedRef.current = false; // Đánh dấu đã gọi API lần đầu, không gọi lại nữa
    } else if (isReload) {
      getDataRadiusServer(pageSize, page, currentSite, search);
      setIsReload(false); // Reset trạng thái reload sau khi đã tải lại dữ liệu
    } else {
      getDataRadiusServer(pageSize, page, currentSite, search);
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

  const handleRowClick = (row: DataRadius) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteRadius({ id: recordDelete?.id }, isDelete);
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsRadius({ currentPage: page, pageSize, handleAdd, handleClose, setRecord, setRecordDelete, canWrite });
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: RadiusSchema,
    onSubmit: async (values: NewRadius) => {
      const handleAction = record ? handleEditRadius : handleAddRadius;
      const res = await handleAction(values);
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
    },
    enableReinitialize: true
  });

  const radiusFormField = formik.values.isAcct === 'false' ? radiusFields : radiusFullFields;

  const fieldsWithOptions = radiusFormField.map((field) => {
    if (field.name === 'siteId') {
      return { ...field, options: optionSites };
    }
    return field;
  });

  useEffect(() => {
    const newSchema = formik.values.isAcct === 'false' ? RadiusSchema : RadiusFullFieldsSchema;
    formik.setFormikState((state: any) => ({
      ...state,
      validationSchema: newSchema
    }));
    //eslint-disable-next-line
  }, [formik.values.isAcct]);

  const handleRefresh = async () => {
    await handleRefreshRadius(true);
    setIsReload(true);
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
            addButtonLabel={intl.formatMessage({ id: 'add-radius-server' })}
            buttonRefresh={intl.formatMessage({ id: 'refresh' })}
            onRefresh={handleRefresh}
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
          title={record ? intl.formatMessage({ id: 'edit-info-radius' }) : intl.formatMessage({ id: 'add-radius' })}
          onCancel={handleAdd}
          fieldConfig={fieldsWithOptions}
          isEditMode={!!record}
          formik={formik}
        />
        <ViewDialog title="radius-info" open={openDialog} onClose={handleCloseView} data={record} config={radiusViewConfig} />
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-radius"
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

export default RadiusManagement;

const getInitialValues = (radius: DataRadius | null) => {
  return {
    id: radius?.id || 0,
    name: radius?.name || '',
    ipAuth: radius?.ip_auth || '',
    portAuth: radius?.port_auth || 0,
    pwdAuth: radius?.pwd_auth || '',
    isAcct: radius?.is_acct || 'false',
    isUpdate: radius?.is_update || 'false',
    updateIntervalPeriod: radius?.update_interval_period || 0,
    ipAcct: radius?.ip_acct || '',
    portAcct: radius?.port_acct || 0,
    pwdAcct: radius?.pwd_acct || '',
    isVlanAssign: radius?.is_vlan_assign || 'false',
    siteId: radius?.site_id || ''
  };
};
