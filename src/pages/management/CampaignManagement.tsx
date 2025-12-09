import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { DatePicker } from 'antd';
import { campaignApi } from 'api/campaign.api';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import { Select as SelectCustom } from 'components/molecules/form';
import AdsDialog from 'components/organisms/adSample/AdsDialog';
import ChangeCampaignStatusDialog from 'components/organisms/dialog/ChangeCampaignStatusDialog';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import ScrollX from 'components/ScrollX';
import ConfirmationDialog from 'components/template/ConfirmationDialog';
import Form from 'components/template/Form';
import { campaignFields } from 'components/ul-config/form-config';
import { columnsCampaign } from 'components/ul-config/table-config/campaign';
import dayjs from 'dayjs';
import { FormikValues, useFormik } from 'formik';
import useConfig from 'hooks/useConfig';
import useHandleAds from 'hooks/useHandleAds';
import useHandleCampaign from 'hooks/useHandleCampaign';
import useHandleExcel from 'hooks/useHandleExcel';
import useHandlePartner from 'hooks/useHandlePartner';
import useHandleRegion from 'hooks/useHandleRegion';
import useHandleSite from 'hooks/useHandleSites';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import useValidationSchemas from 'hooks/useValidation';
import { ExportSquare, TickCircle } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { RootState, useSelector } from 'store';
import { DataAds, DataCampaign, NewCampaign, NewPartner, OptionList } from 'types';
import { getOption, normalizeDate } from 'utils/handleData';
import AdsPartnerDialog from './ads-partner/components/dialog/AdsPartnerDialog';

const CampaignManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  const { RangePicker } = DatePicker;

  const [record, setRecord] = useState<DataCampaign | null>(null);
  const [recordDelete, setRecordDelete] = useState<DataCampaign | null>(null);
  const [data, setData] = useState<DataCampaign[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [optionPartner, setOptionPartner] = useState<OptionList[]>([]);
  const [optionRegion, setOptionRegion] = useState<OptionList[]>([]);
  const [optionAd, setOptionAd] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectAdId, setSelectAdId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dateFilter, setDateFilters] = useState<Record<string, any>>({
    // start_date: dayjs().subtract(15, 'day').startOf('day').toISOString(),
    // end_date: dayjs().endOf('day').toISOString()
    start_date: null,
    end_date: null
  });

  const [openChangeStatusDialog, setOpenChangeStatusDialog] = useState(false);
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('ads-management');

  const [openAdsDialog, setOpenAdsDialog] = useState(false);
  const [openPartnerDialog, setOpenPartnerDialog] = useState(false);
  const intl = useIntl();
  const mountedRef = useRef(true);
  const { CampaignSchema } = useValidationSchemas();
  const { i18n } = useConfig();
  // const user = useSelector((state: RootState) => state.authSlice.user);
  // const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds);
  const navigate = useNavigate();
  const { fetchDataSites, isLoading: isLoadingSite } = useHandleSite();
  const { fetchDataRegion, isLoading: isLoadingRegion } = useHandleRegion();
  const { fetchDataPartner, handleAddPartner, isLoading: isLoadingPartner } = useHandlePartner();
  const { fetchDataAds, handleAddAds, isLoading: isLoadingAds } = useHandleAds();
  const { fetchExportExcel } = useHandleExcel();
  const { fetchDataCampaign, handleAddCampaign, handleDeleteCampaign, handleEditCampaign, isLoading, totalPages, totalResults } =
    useHandleCampaign();

  const [createdAd, setCreatedAd] = useState<DataAds>();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const getOptionRegion = async () => {
    const dataRegion = await fetchDataRegion({ page: 1, pageSize: 100 });
    setOptionRegion(getOption(dataRegion, 'name', 'id'));
  };

  const getSitesByRegion = async (regionId: string) => {
    const dataSite = await fetchDataSites({ page: 1, pageSize: 100, regionDataInput: JSON.stringify([regionId]) });
    setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  const getPartnersBySite = async (siteId: string) => {
    const dataPartner = await fetchDataPartner({ page: 1, pageSize: 100, type: 'ads', siteId, adDataInput: JSON.stringify(currentAds) });
    setOptionPartner(getOption(dataPartner, 'name', 'id'));
  };

  const getAdsBySite = async (siteId: string, keyword?: string) => {
    const dataAds = await fetchDataAds({
      filters: keyword,
      page: 1,
      pageSize: 100,
      siteId,
      adDataInput: JSON.stringify(currentAds)
      // statusId: 9
    });
    setOptionAd(getOption(dataAds, 'template_name', 'id'));
  };

  const getAdsForExport = async () => {
    const dataAds = await fetchDataAds({ page: 1, pageSize: 100, adDataInput: JSON.stringify(currentAds) });
    setOptionAd(getOption(dataAds, 'template_name', 'id'));
  };

  const getDataCampaign = async (
    pageSize: number,
    page: number,
    currentSite: string,
    startDate: string,
    endDate: string,
    searchValue?: string
  ) => {
    const dataCampaign = await fetchDataCampaign({
      page,
      pageSize,
      filters: searchValue,
      startDate,
      endDate,
      siteId: currentSite,
      adDataInput: JSON.stringify(currentAds)
    });
    setData(dataCampaign);
  };

  useEffect(() => {
    if (mountedRef.current) {
      getDataCampaign(pageSize, page, currentSite, dateFilter.start_date, dateFilter.end_date, search);
      getOptionRegion();
      // getInitialOptions(currentSite);
      mountedRef.current = false;
    } else if (isReload) {
      getDataCampaign(pageSize, page, currentSite, dateFilter.start_date, dateFilter.end_date, search);
      setIsReload(false);
    } else {
      getDataCampaign(pageSize, page, currentSite, dateFilter.start_date, dateFilter.end_date, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, i18n, currentSite, dateFilter.start_date, dateFilter.end_date, search, isReload, currentAds]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
    if (!add) {
      formik.resetForm();
    }
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleRowClick = (row: DataCampaign) => {
    setRecord(row);
  };

  const handleDelete = async (isDelete: boolean) => {
    try {
      setLoadingDelete(true);
      await handleDeleteCampaign({ id: recordDelete?.id }, isDelete);
      setIsReload(true);
      setOpen(false);
      setRecordDelete(null);
    } catch (error) {
    } finally {
      setLoadingDelete(false);
    }
  };

  const onViewClick = (record: DataCampaign) => {
    navigate(`/campaign/details/${record.id}`);
  };

  const handleChangeStatus = (record: DataCampaign) => {
    setRecord(record);
    setOpenChangeStatusDialog(true);
  };

  const columns = useMemo(() => {
    return columnsCampaign({
      currentPage: page,
      pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      setViewRecord: onViewClick,
      handleChangeStatus,
      canWrite
    });
    // eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: CampaignSchema,
    onSubmit: async (values: NewCampaign) => {
      const handleAction = record ? handleEditCampaign : handleAddCampaign;
      const res = await handleAction(values);
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
    },
    enableReinitialize: true
  });

  const handleConfirmNavigate = () => {
    if (createdAd) {
      const url = `/ad-handle/edit/ad-${createdAd.ad_type === '3rd_party' ? 'third-party' : createdAd.ad_type}/${createdAd.id}`;
      window.open(url, '_blank'); // mở tab mới
    }
    setOpenConfirm(false);
  };

  const handleSubmitAds = async (values: any, resetForm: () => void) => {
    const handleAction = handleAddAds;
    const res = await handleAction(values);
    if (res.code === 0) {
      getAdsBySite(formik.values.siteId);
      setOpenAdsDialog(false);
      resetForm();
      setCreatedAd(res.data); // lưu ad vừa tạo
      setOpenConfirm(true); // mở popup hỏi người dùng
    }
  };

  const handleSubmitPartner = async (values: NewPartner, resetForm: () => void) => {
    const handleAction = handleAddPartner;
    const res = await handleAction({ id: values.id, type: 'ads' }, values);
    if (res.code === 0) {
      resetForm();
      setOpenPartnerDialog(false);
      getPartnersBySite(formik.values.siteId);
    }
  };

  // Detect changes in form values and trigger filtering
  useEffect(() => {
    if (formik.values.regionId) {
      getSitesByRegion(formik.values.regionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.regionId]);

  useEffect(() => {
    if (formik.values.siteId) {
      getPartnersBySite(formik.values.siteId);
      getAdsBySite(formik.values.siteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.siteId]);

  useEffect(() => {
    getAdsForExport();
    //eslint-disable-next-line
  }, [openExportDialog]);

  const fieldsWithOptions = useMemo(() => {
    return campaignFields.map((field) => {
      if (field.name === 'regionId') {
        return { ...field, options: optionRegion, loading: isLoadingRegion };
      }
      if (field.name === 'siteId') {
        return { ...field, options: optionSite, loading: isLoadingSite };
      }
      if (field.name === 'adPartnerId') {
        return {
          ...field,
          options: optionPartner,
          customRender: (formik: any) => (
            <SelectCustom
              isDisabled={!formik.values.siteId}
              key={field.name}
              name="adPartnerId"
              field="adPartnerId"
              formik={formik}
              inputLabel={intl.formatMessage({ id: field.label })}
              arrayOption={optionPartner}
              placeholder={intl.formatMessage({ id: field.placeholder || '' })}
              required={field.required}
              md={field.md}
              onAddClick={() => setOpenPartnerDialog(true)}
              loading={isLoadingPartner}
            />
          )
        };
      }
      if (field.name === 'adId') {
        return {
          ...field,
          options: optionAd,
          customRender: (formik: any) => (
            <SelectCustom
              key={field.name}
              name="adId"
              field="adId"
              formik={formik}
              inputLabel={intl.formatMessage({ id: field.label })}
              arrayOption={optionAd}
              placeholder={intl.formatMessage({ id: field.placeholder || '' })}
              required={field.required}
              md={field.md}
              onAddClick={() => setOpenAdsDialog(true)}
              enableSearch
              onSearch={async (keyword) => {
                getAdsBySite(formik.values.siteId, keyword);
              }}
              loading={isLoadingAds}
            />
          )
        };
      }
      if (field.name === 'priority') {
        const priorityOptions = [
          { label: 'Cao', value: 0.75 },
          { label: 'Trung bình', value: 0.5 },
          { label: 'Thấp', value: 0.25 }
        ];
        return {
          ...field,
          options: priorityOptions,
          customRender: (formik: any) => (
            <SelectCustom
              key={field.name}
              name="priority"
              field="priority"
              formik={formik}
              inputLabel={intl.formatMessage({ id: field.label })}
              arrayOption={priorityOptions}
              placeholder={intl.formatMessage({ id: field.placeholder || '' })}
              required={field.required}
              md={field.md}
            />
          )
        };
      }
      return field;
    });
  }, [optionRegion, optionSite, optionPartner, optionAd, isLoadingAds, isLoadingPartner, isLoadingRegion, isLoadingSite]);

  const handleExportReport = async () => {
    if (!exportDateRange) {
      enqueueSnackbar('Please select a date range', { variant: 'warning' });
      return;
    }

    const startDate = exportDateRange[0].format('YYYY-MM-DD');
    const endDate = exportDateRange[1].format('YYYY-MM-DD');
    const adId = selectAdId;

    try {
      const excelData = await fetchExportExcel({
        type: 'campaign',
        startDate,
        endDate,
        adId,
        adDataInput: JSON.stringify(currentAds)
      });

      if (!excelData) {
        throw new Error('No data received from server');
      }

      if (!(excelData instanceof Blob)) {
        throw new Error('Invalid data type received for export');
      }
      const url = window.URL.createObjectURL(excelData);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao-cao-tuan_${startDate}_to_${endDate}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      setOpenExportDialog(false);
      setExportDateRange(null);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

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

  const handleConfirmChangeStatus = async (statusId: number) => {
    if (!record) return;
    try {
      await campaignApi.updateStatus({ id: record.id, statusId });
      enqueueSnackbar(intl.formatMessage({ id: 'update-status-success' }), {
        variant: 'success'
      });
      getDataCampaign(pageSize, page, currentSite, dateFilter.start_date, dateFilter.end_date, search);
    } catch (error) {}
  };

  return (
    <div>
      <MainCard content={false}>
        <ScrollX>
          <GeneralizedTableV2
            scroll={{ x: 1000 }}
            isLoading={isLoading}
            columns={columns}
            data={data}
            totalResults={totalResults}
            onAddNew={handleAdd}
            onPageChange={handlePageChange}
            totalPages={totalPages}
            onRowClick={handleRowClick}
            onSearch={setSearch}
            sortColumns="index"
            isDecrease={false}
            size={pageSize}
            currentPage={page}
            addButtonLabel={intl.formatMessage({ id: 'add-campaign' })}
            onDateChange={handleDateChange}
            canWrite={canWrite}
            // dateFilter={dateFilter}
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
            title={record ? intl.formatMessage({ id: 'edit-info-campaign' }) : intl.formatMessage({ id: 'add-campaign' })}
            onCancel={handleAdd}
            fieldConfig={fieldsWithOptions}
            isEditMode={!!record}
            formik={formik}
          />
          {recordDelete && (
            <ConfirmationDialog
              open={open}
              variant="delete"
              titleKey="alert-delete-campaign"
              description={intl.formatMessage({ id: 'confirm-delete-campaign' }, { name: recordDelete.name })}
              confirmLabel="confirm"
              confirmButtonColor="error"
              isLoading={loadingDelete}
              onClose={() => setOpen(false)}
              onConfirm={() => handleDelete(true)}
            />
          )}
        </Dialog>
      </MainCard>
      <button
        className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-green-700 transition z-50"
        onClick={() => setOpenExportDialog(true)}
      >
        <ExportSquare />
      </button>{' '}
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle> {intl.formatMessage({ id: 'select-date-range-weekly-report' })}</DialogTitle>
        <DialogContent>
          <RangePicker
            format="DD/MM/YYYY"
            onChange={(dates) => setExportDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            style={{ width: '100%', marginTop: '20px' }}
            popupStyle={{ zIndex: 99999 }}
            placeholder={[intl.formatMessage({ id: 'start-date' }), intl.formatMessage({ id: 'end-date' })]}
          />
        </DialogContent>
        <DialogTitle> {intl.formatMessage({ id: 'ad-name' })}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>{intl.formatMessage({ id: 'select-ad' })}</InputLabel>
            <Select
              value={selectAdId || ''}
              onChange={(e) => setSelectAdId(Number(e.target.value))}
              label={intl.formatMessage({ id: 'select-ad' })}
              required
            >
              {optionAd.map((ad) => (
                <MenuItem key={ad.value} value={ad.value}>
                  {ad.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>{intl.formatMessage({ id: 'cancel' })}</Button>
          <Button onClick={handleExportReport} variant="contained" disabled={!selectAdId}>
            {intl.formatMessage({ id: 'export' })}
          </Button>
        </DialogActions>
      </Dialog>
      <ChangeCampaignStatusDialog
        open={openChangeStatusDialog}
        onClose={() => setOpenChangeStatusDialog(false)}
        campaign={record}
        onChangeStatus={handleConfirmChangeStatus}
      />
      {openAdsDialog && (
        <AdsDialog
          open={openAdsDialog}
          onClose={() => {
            setRecord(null);
            setOpenAdsDialog(false);
          }}
          record={null}
          onSubmit={(values, resetForm) => handleSubmitAds(values, resetForm)}
          defaultSiteId={formik.values.siteId}
        />
      )}
      {/* Dialog xác nhận */}
      {openConfirm && (
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>{intl.formatMessage({ id: 'ad-created-success' })}</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              {/* Icon minh họa */}
              <TickCircle size="80" color="#4caf50" variant="Bold" />
              {/* Nội dung */}
              <Typography align="center">{intl.formatMessage({ id: 'ad-setup-now-question' })}</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>{intl.formatMessage({ id: 'cancel' })}</Button>
            <Button onClick={handleConfirmNavigate} variant="contained" color="primary">
              {intl.formatMessage({ id: 'agree' })}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {openPartnerDialog && (
        <AdsPartnerDialog
          open={openPartnerDialog}
          onClose={() => {
            setRecord(null);
            setOpenPartnerDialog(false);
          }}
          record={null}
          onSubmit={(values, resetForm) => handleSubmitPartner(values, resetForm)}
          defaultSiteId={formik.values.siteId}
        />
      )}
    </div>
  );
};

export default CampaignManagement;

const getInitialValues = (campaign: FormikValues | null) => {
  return {
    id: campaign?.id || 0,
    name: campaign?.name || '',
    adId: campaign?.ad_id || '',
    adPartnerId: campaign?.ad_partner_id || '',
    amount: campaign?.amount || 0,
    expiredDate: normalizeDate(campaign?.expired_date),
    startDate: campaign?.start_date ? normalizeDate(campaign?.start_date) : null,
    clickLimit: campaign?.click_limit || 0,
    impressionLimit: campaign?.impression_limit || 0,
    impressionDailyLimit: campaign?.impression_daily_limit || 0,
    siteId: campaign?.site_id || '',
    regionId: campaign?.region_id || '',
    dailyLimit: campaign?.daily_limit || 0,
    priority: campaign?.priority ?? 0.5
  };
};
