import useHandleSite, { ParamsGetScenario, ParamsGetSites } from 'hooks/useHandleSites';
import { useCallback, useEffect, useMemo, useState } from 'react';

//project-import
import { Dialog } from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import ViewDialog from 'components/template/ViewDialog';

//config
import { columnsSite } from 'components/ul-config/table-config';
import { siteViewConfig } from 'components/ul-config/view-dialog-config';

//types
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import Form from 'components/template/Form';
import { siteFields } from 'components/ul-config/form-config';
import { useFormik } from 'formik';
import { useConfirmNavigation } from 'hooks/useConfirmNavigation';
import useHandleRegion from 'hooks/useHandleRegion';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import useValidationSchemas from 'hooks/useValidation';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { DataSites, NewSites, OptionList } from 'types';
import { SYSTEM_REGION_ID } from 'utils/constant';
import { getOption } from 'utils/handleData';
import { Spin } from 'antd';

const SitesManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [loadingOption, setLoadingOption] = useState(false);

  const [record, setRecord] = useState<DataSites | null>(null);
  const [recordDelete, setRecordDelete] = useState<DataSites | null>(null);
  const [data, setData] = useState<DataSites[]>([]);
  const [optionScenario, setOptionScenario] = useState<OptionList[]>([]);
  const [optionRegion, setOptionRegion] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const intl = useIntl();
  const { SiteSchema } = useValidationSchemas();
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('site-list');
  const currentRegion = useSelector((state: RootState) => state.authSlice.user?.currentRegion ?? null);

  const {
    fetchDataSites,
    fetchDataScenario,
    handleRefreshSite,
    handleDeleteSite,
    handleAddSite,
    handleEditSite,
    isLoading,
    isRefresh,
    totalPages,
    totalResults
  } = useHandleSite();
  const { fetchDataRegion } = useHandleRegion();

  const { ConfirmDialog } = useConfirmNavigation({
    when: isRefresh
  });

  const getDataSite = useCallback(
    async ({ page, pageSize, filters, regionId, regionDataInput }: ParamsGetSites) => {
      const dataSite = await fetchDataSites({
        page,
        pageSize,
        filters,
        regionId: regionId === SYSTEM_REGION_ID ? null : regionId,
        regionDataInput
      });
      setData(dataSite);
    },
    [fetchDataSites]
  );

  const refreshSites = useCallback(() => {
    return getDataSite({
      pageSize,
      page,
      filters: search,
      regionId: currentRegion,
      regionDataInput: JSON.stringify(regionIdAccess)
    });
  }, [pageSize, page, search, currentRegion, regionIdAccess]);

  const getOptionScenario = async (params: ParamsGetScenario) => {
    try {
      setLoadingOption(true);
      const dataScenarios = await fetchDataScenario({ ...params });
      const mapOption = dataScenarios.map((dataScenario: string) => {
        return {
          label: dataScenario,
          value: dataScenario
        };
      });
      setOptionScenario(mapOption);
    } catch (error) {
    } finally {
      setLoadingOption(false);
    }
  };

  const getOptionRegion = async () => {
    try {
      setLoadingOption(true);
      const dataRegion = await fetchDataRegion({ pageSize: 100 });
      setOptionRegion(getOption(dataRegion, 'name', 'id'));
    } catch (error) {
    } finally {
      setLoadingOption(false);
    }
  };

  useEffect(() => {
    getDataSite({ pageSize, page, filters: search, regionId: currentRegion, regionDataInput: JSON.stringify(regionIdAccess) });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, search, currentRegion]);

  useEffect(() => {
    if (currentRegion) {
      getOptionScenario({ regionId: currentRegion });
    }
  }, [currentRegion]);

  useEffect(() => {
    getOptionRegion();
  }, []);

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

  const handleRowClick = (row: DataSites) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteSite({ id: recordDelete?.id }, isDelete);
    await refreshSites();
  };

  const columns = useMemo(() => {
    return columnsSite(page, pageSize, handleAdd, handleClose, setRecord, setRecordDelete, undefined, canWrite);
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: SiteSchema,
    onSubmit: async (values: NewSites) => {
      const { location, ...rest } = values;
      const payload = { ...rest, latLocation: location?.[0].toString() || '', longLocation: location?.[1].toString() || '' };
      const handleAction = record ? handleEditSite : handleAddSite;
      const res = await handleAction(payload);
      if (res.code === 0) {
        handleAdd();
        await refreshSites();
      }
    },
    enableReinitialize: true
  });

  const fieldsWithOptions = useMemo(() => {
    return siteFields.map((field) => {
      if (field.name === 'scenario') return { ...field, options: optionScenario };
      if (field.name === 'regionId') return { ...field, options: optionRegion };
      return field;
    });
  }, [optionScenario, optionRegion]);

  const handleRefreshAllSites = async () => {
    if (currentRegion === SYSTEM_REGION_ID) {
      // Refresh tất cả region trừ SYSTEM_REGION_ID
      const regionIds = optionRegion.filter((region) => region.value !== SYSTEM_REGION_ID).map((item) => item.value as string);
      await Promise.all(regionIds.map((regionId) => handleRefreshSite(regionId)));
      getDataSite({ pageSize, page, filters: search, regionId: currentRegion, regionDataInput: JSON.stringify(regionIdAccess) });
    } else if (currentRegion) {
      // Refresh chỉ region hiện tại
      await handleRefreshSite(currentRegion);
    }
  };

  return (
    <MainCard content={false}>
      <ScrollX>
        <Spin spinning={isRefresh} tip={intl.formatMessage({ id: 'refreshing' })}>
          <GeneralizedTableV2
            isLoading={isLoading}
            isLoadingRefresh={isRefresh || loadingOption}
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
            addButtonLabel={intl.formatMessage({ id: 'add-site' })}
            buttonRefresh={intl.formatMessage({ id: 'refresh' })}
            onRefresh={handleRefreshAllSites}
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
          title={record ? intl.formatMessage({ id: 'edit-info-site' }) : intl.formatMessage({ id: 'add-site' })}
          onCancel={handleAdd}
          fieldConfig={fieldsWithOptions}
          isEditMode={!!record}
          formik={formik}
        />
        <ViewDialog title="site-info" open={openDialog} onClose={handleCloseView} data={record} config={siteViewConfig} />
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-site"
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

export default SitesManagement;

const getInitialValues = (site: DataSites | null) => {
  return {
    id: site?.id || '',
    name: site?.name || '',
    address: site?.address || '',
    country: site?.country || '',
    latLocation: site?.lat_location || '',
    longLocation: site?.long_location || '',
    location: site?.lat_location && site?.long_location ? [Number(site.lat_location), Number(site.long_location)] : null,
    timeZone: site?.time_zone || 'Asia/Bangkok',
    scenario: site?.scenario || '',
    regionId: site?.region.id
  };
};
