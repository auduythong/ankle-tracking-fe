import { Dialog } from '@mui/material';
import { Spin } from 'antd';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import FormPortal from 'components/template/FormPortal';
import ViewDialog from 'components/template/ViewDialog';
import { portalFields } from 'components/ul-config/form-config';
import { columnsPortal } from 'components/ul-config/table-config/portal';
import { portalDetailViewConfig } from 'components/ul-config/view-dialog-config';
import { useFormik } from 'formik';
import useConfig from 'hooks/useConfig';
import { useConfirmNavigation } from 'hooks/useConfirmNavigation';
import useHandlePortal from 'hooks/useHandlePortal';
import useHandleRadius from 'hooks/useHandleRadius';
import useHandleSite from 'hooks/useHandleSites';
import useHandleSSID from 'hooks/useHandleSSID';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import useValidationSchemas from 'hooks/useValidation';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { OptionList } from 'types';
import { DataPortal, NewPortal } from 'types/portal';
import { getOption } from 'utils/handleData';

const PortalManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [record, setRecord] = useState<DataPortal | null>(null);
  const [recordDelete, setRecordDelete] = useState<DataPortal | null>(null);
  const [data, setData] = useState<DataPortal[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [optionRadius, setOptionRadius] = useState<OptionList[]>([]);
  const [optionSSID, setOptionSSID] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const [selectedSite, setSelectedSite] = useState<string>(currentSite);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const intl = useIntl();
  const { PortalSchema } = useValidationSchemas();
  const { i18n } = useConfig();
  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('portal-management');
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const {
    fetchDataPortal,
    handleAddPortal,
    handleRefreshPortals,
    handleDeletePortal,
    handleEditPortal,
    isLoading,
    isRefresh,
    totalPages,
    totalResults
  } = useHandlePortal();
  const { fetchDataSites } = useHandleSite();
  const { fetchDataRadius } = useHandleRadius();
  const { fetchDataSSID } = useHandleSSID();

  const { ConfirmDialog } = useConfirmNavigation({
    when: isRefresh
  });

  const getDataPortal = async (pageSize: number, pageIndex: number, selectedSite: string, currentSite: string, searchValue?: string) => {
    const dataPortal = await fetchDataPortal({ page: pageIndex, pageSize, filters: searchValue, siteId: currentSite });
    const dataSite = await fetchDataSites({ page: 1, pageSize: 100, regionDataInput: JSON.stringify(regionIdAccess) });
    const dataRadius = await fetchDataRadius({ page: 1, pageSize: 100, siteId: selectedSite });
    const dataSSID = await fetchDataSSID({
      page: 1,
      pageSize: 100,
      siteId: selectedSite,
      siteDataInput: JSON.stringify([...currentSite]),
      isForPortal: 'true'
    });
    setData(dataPortal.data);
    setOptionSite(getOption(dataSite, 'name', 'id'));
    setOptionRadius(getOption(dataRadius, 'name', 'radius_profile_id'));
    setOptionSSID(getOption(dataSSID, 'name', 'ssid_hardware_id'));
  };

  useEffect(() => {
    const init = async () => {
      await handleRefresh(); // lần đầu có Spin
      setIsFirstLoad(false);
    };

    init();

    const intervalId = setInterval(() => {
      handleRefresh(); // chạy ngầm, không cần Spin
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [currentSite]);

  useEffect(() => {
    getDataPortal(pageSize, page, selectedSite, currentSite, search);
    //eslint-disable-next-line
  }, [page, pageSize, i18n, currentSite, selectedSite, search]);

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

  const handleRowClick = (row: DataPortal) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeletePortal({ id: recordDelete?.id }, isDelete);
    getDataPortal(pageSize, page, selectedSite, currentSite, search);
  };

  const handleRefresh = async () => {
    await handleRefreshPortals(true);
    getDataPortal(pageSize, page, selectedSite, currentSite, search);
  };

  const columns = useMemo(() => {
    return columnsPortal(page, pageSize, handleAdd, handleClose, setRecord, setRecordDelete, undefined, canWrite);
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: PortalSchema,
    onSubmit: async (values: NewPortal) => {
      const handleAction = record ? handleEditPortal : handleAddPortal;
      const res = await handleAction({ id: values.id }, values);
      if (res.code === 0) {
        handleAdd();
      }
    },
    enableReinitialize: true
  });

  useEffect(() => {
    if (typeof formik.values.siteId === 'string' && currentSite !== formik.values.siteId) {
      setSelectedSite(formik.values.siteId);
    }
    //eslint-disable-next-line
  }, [formik.values.siteId]);

  const fieldsWithOptions = useMemo(() => {
    return portalFields.map((field) => {
      if (field.name === 'siteId') {
        return { ...field, options: optionSite };
      }
      if (field.name === 'radiusProfileId') {
        return { ...field, options: optionRadius };
      }
      if (field.name === 'ssidList') {
        return { ...field, options: optionSSID };
      }
      if (field.name === 'authType') {
        return {
          ...field,
          options: [
            { label: intl.formatMessage({ id: 'no-auth' }), value: 0 },
            { label: intl.formatMessage({ id: 'simple-password' }), value: 1 },
            { label: intl.formatMessage({ id: 'external-radius-server' }), value: 2 },
            { label: intl.formatMessage({ id: 'external-portal-server' }), value: 4 },
            { label: intl.formatMessage({ id: 'hotspot' }), value: 11 }
          ]
        };
      }
      if (field.name === 'customTimeoutUnit') {
        return {
          ...field,
          options: [
            { label: intl.formatMessage({ id: 'minutes' }), value: 1 },
            { label: intl.formatMessage({ id: 'hour' }), value: 2 },
            { label: intl.formatMessage({ id: 'day' }), value: 3 }
          ]
        };
      }
      if (field.name === 'landingPage') {
        return {
          ...field,
          options: [
            { label: intl.formatMessage({ id: 'redirect-origin-url' }), value: 1 },
            { label: intl.formatMessage({ id: 'redirect-promotion-url' }), value: 2 }
          ]
        };
      }
      if (field.name === 'portalCustom') {
        return {
          ...field,
          options: [
            { label: intl.formatMessage({ id: 'local-web-portal' }), value: 1 },
            { label: intl.formatMessage({ id: 'external-web-portal' }), value: 2 }
          ]
        };
      }
      return field;
    });
    //eslint-disable-next-line
  }, [optionSite, optionRadius, optionSSID]);

  return (
    <MainCard content={false}>
      <ScrollX>
        <Spin spinning={isFirstLoad && isRefresh} tip={intl.formatMessage({ id: 'refreshing' })}>
          <GeneralizedTableV2
            isLoading={isLoading}
            columns={columns}
            data={data}
            onAddNew={handleAdd}
            onPageChange={handlePageChange}
            totalPages={totalPages}
            totalResults={totalResults}
            onRowClick={handleRowClick}
            size={pageSize}
            currentPage={page}
            onSearch={setSearch}
            sortColumns="index"
            isDecrease={false}
            addButtonLabel={intl.formatMessage({ id: 'add-portal' })}
            buttonRefresh={intl.formatMessage({ id: 'refresh' })}
            onRefresh={handleRefresh}
            isLoadingRefresh={isRefresh}
            canWrite={canWrite}
          />
        </Spin>
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
        <FormPortal
          title={record ? intl.formatMessage({ id: 'edit-portal' }) : intl.formatMessage({ id: 'add-portal' })}
          onCancel={handleAdd}
          ssidOptions={optionSSID}
          siteOptions={optionSite}
          radiusOptions={optionRadius}
          fieldConfig={fieldsWithOptions}
          isEditMode={!!record}
          formik={formik}
        />
        <ViewDialog title="portal-info" open={openDialog} onClose={handleCloseView} data={record} config={portalDetailViewConfig} />
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-portal"
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

const getInitialValues = (portal: DataPortal | null): NewPortal => {
  return {
    id: portal?.id || '',
    name: portal?.name || '',
    enable: portal?.enable || 'false',
    ssidList: portal?.ssid_list || [],
    networkList: portal?.network_list || [],
    authType: portal?.auth_type || 0,
    customTimeout: portal?.custom_timeout || 1,
    customTimeoutUnit: portal?.custom_timeout_unit || 2,
    httpsRedirectEnable: portal?.https_redirect_enable || 'false',
    dailyLimitEnable: portal?.no_auth_daily_limit_enable || 'false',
    landingPage: portal?.landing_page || 1,
    landingUrlScheme: portal?.landing_url_scheme || '',
    landingUrl: portal?.landing_url || '',
    enabledTypes: portal?.enabled_types || [],
    password: portal?.password || '',
    hostType: portal?.external_portal_host_type || 0,
    serverIp: portal?.external_portal_server_ip || [],
    serverPort: portal?.external_portal_server_port || undefined,
    serverUrlScheme: portal?.external_portal_server_url_scheme || '',
    serverUrl: portal?.external_portal_server_url || '',
    radiusProfileId: portal?.external_radius_radius_profile_id || '',
    externalRadiusAuthMode: portal?.external_radius_auth_mode || 1,
    nasId: portal?.external_radius_nas_id || 'TP Link',
    portalCustom: portal?.external_radius_portal_custom || 1,
    externalUrlScheme: portal?.external_radius_external_url_scheme || 'http',
    externalUrl: portal?.external_radius_external_url_scheme || '',
    disconnectReq: portal?.external_radius_disconnect_req || '',
    receiverPort: portal?.external_radius_receiver_port || 1,
    siteId: portal?.site_id || ''
  };
};

export default PortalManagement;
