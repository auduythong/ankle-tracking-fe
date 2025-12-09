import useConfig from 'hooks/useConfig';
import useHandleDevice from 'hooks/useHandleDevice';
import useHandleRegion from 'hooks/useHandleRegion';
import { useEffect, useMemo, useRef, useState } from 'react';

// project-import
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useTheme
} from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';

// config
import { deviceFields, regionFields } from 'components/ul-config/form-config';
import { columnsRegion } from 'components/ul-config/table-config/region';
import { regionViewConfig } from 'components/ul-config/view-dialog-config';

// types
import LoadingButton from 'components/@extended/LoadingButton';
import FieldGroupCard from 'components/organisms/FieldGroupCard';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import RegionForm from 'components/organisms/RegionForm';
import { useFormik } from 'formik';
import useHandlePartner from 'hooks/useHandlePartner';
import useValidationSchemas from 'hooks/useValidation';
import { CloseCircle } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { FormattedMessage, useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { DataRegion, NewDevice, NewRegion, OptionList } from 'types';
import { getOption } from 'utils/handleData';
import * as Yup from 'yup';

const sensitiveFields = [
  'device_configs.url',
  'device_configs.username',
  'device_configs.password',
  'device_configs.client_id',
  'device_configs.client_secret'
];

const RegionManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isReload, setIsReload] = useState(false);
  const theme = useTheme();

  const [record, setRecord] = useState<DataRegion | null>(null);
  const [recordDelete, setRecordDelete] = useState<DataRegion | null>(null);
  const [data, setData] = useState<DataRegion[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createdRegionId, setCreatedRegionId] = useState<string | null>(null);
  const [optionRegion, setOptionRegion] = useState<OptionList[]>([]);
  const [optionPartner, setOptionPartner] = useState<OptionList[]>([]);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const [activeStep, setActiveStep] = useState(0);

  const intl = useIntl();
  const mountedRef = useRef(true);
  const { RegionSchema, DeviceSchema } = useValidationSchemas();
  const { i18n } = useConfig();

  const { fetchDataRegion, handleAddRegion, handleEditRegion, handleDeleteRegion, isLoading, totalPages, totalResults } = useHandleRegion();
  const { handleAddDevice, handleEditDevice } = useHandleDevice({});
  const { fetchDataPartner } = useHandlePartner();
  const CombinedSchema = Yup.object({
    region: RegionSchema,
    device: DeviceSchema
  });

  const initialValues: FormValues = useMemo(() => {
    return {
      region: getInitialRegionValues(record),
      device: getInitialDeviceValues(record)
    };
  }, [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: CombinedSchema,
    onSubmit: async (values: FormValues) => {
      let regionId: string = values.region.id || ''; // nếu edit có sẵn id
      const { location, ...rest } = values.region;
      const regionPayload = { ...rest, latLocation: location?.[0].toString() || '', longLocation: location?.[1].toString() || '' };
      try {
        if (!regionId) {
          // ---- CASE CREATE ----
          const regionRes = await handleAddRegion(regionPayload);
          if (regionRes.code === 0 && regionRes.data?.id) {
            regionId = regionRes.data.id;
            setCreatedRegionId(regionId);

            const deviceData = { ...values.device, regionId };
            const deviceRes = await handleAddDevice(deviceData);

            if (deviceRes.code === 0) {
              handleAdd();
              setIsReload(true);
              setCreatedRegionId(null);
            } else {
              if (!!regionId) {
                await handleDeleteRegion({ id: regionId }, true);
              }
            }
          }
        } else {
          // ---- CASE EDIT ----
          const regionRes = await handleEditRegion(regionPayload);
          if (regionRes.code === 0) {
            const deviceData = { ...values.device, regionId };
            const deviceRes = await handleEditDevice(values.device.id, deviceData);

            if (deviceRes.code === 0) {
              handleAdd();
              setIsReload(true);
            }
          }
        }
      } catch (err) {
        console.error(err);
        if (!values.region.id && !!regionId) {
          // rollback chỉ cho case create
          await handleDeleteRegion({ id: regionId }, true);
        }
      }
    },
    enableReinitialize: true
  });

  const partnerName = optionPartner.find((p) => p.value === formik.values.device?.partnerId)?.label;

  const filterDeviceFields = useMemo(() => {
    let fields = deviceFields.filter((item) => item.name !== 'regionId');

    // Nếu partner là "Ruckus" → ẩn 3 field
    if (partnerName === 'Ruckus') {
      fields = fields.filter((f) => !['clientId', 'Id', 'clientSecret'].includes(f.name));
    }

    return fields.map((field) => ({
      ...field,
      name: `device.${field.name}`,
      options: field.name === 'regionId' ? optionRegion : field.name === 'partnerId' ? optionPartner : field.options
    }));
  }, [partnerName, optionPartner, optionPartner]);

  const steps = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: `${record ? 'update' : 'create'}-region` }),
        fields: regionFields.map((field) => ({
          ...field,
          name: `region.${field.name}`
        }))
      },
      {
        label: intl.formatMessage({ id: `${record ? 'update' : 'create'}-controller` }),
        fields: filterDeviceFields
      }
    ],
    [intl, optionRegion, optionPartner, record, filterDeviceFields]
  );

  const getDataRegion = async (pageSize: number, pageIndex: number, searchValue?: string) => {
    const dataRegion = await fetchDataRegion({ page: pageIndex, pageSize, filters: searchValue });
    setData(dataRegion);
  };

  useEffect(() => {
    if (partnerName === 'Ruckus') {
      formik.setFieldValue('device.clientId', '');
      formik.setFieldValue('device.clientSecret', '');
      formik.setFieldValue('device.Id', '');
    }
  }, [partnerName]);

  useEffect(() => {
    const fetchOptionPartner = async (currentSite: string) => {
      const dataPartner = await fetchDataPartner({ page: 1, pageSize: 100, type: 'devices', siteId: currentSite });
      setOptionPartner(getOption(dataPartner, 'name', 'id'));
    };
    fetchOptionPartner(currentSite);

    //eslint-disable-next-line
  }, [currentSite]);

  useEffect(() => {
    const fetchOptionSettings = async () => {
      const dataRegion = await fetchDataRegion({ page: 1, pageSize: 20 });

      setOptionRegion(getOption(dataRegion, 'name', 'id'));
    };
    fetchOptionSettings();
    //eslint-disable-next-line
  }, [createdRegionId]);

  useEffect(() => {
    if (mountedRef.current) {
      getDataRegion(pageSize, page, search);
      mountedRef.current = false;
    } else if (isReload) {
      getDataRegion(pageSize, page, search);
      setIsReload(false);
    } else {
      getDataRegion(pageSize, page, search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, i18n, search, isReload]);

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPage(newPageIndex + 1);
    setPageSize(newPageSize);
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleRowClick = (row: DataRegion) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteRegion({ id: recordDelete?.id }, isDelete);
    setIsReload(true);
  };

  const columns: any = useMemo(() => {
    return columnsRegion(page, pageSize, handleAdd, handleClose, setRecord, setRecordDelete);
    // eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const currentStepFields = useMemo(() => steps[activeStep].fields || [], [steps, activeStep, partnerName]);

  const handleSubmit = async () => {
    try {
      const errors = await formik.validateForm();

      const nestedKey = activeStep === 0 ? 'region' : 'device';
      const stepErrors = errors[nestedKey];

      if (stepErrors && Object.keys(stepErrors).length > 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'please-enter-required-fields' }), {
          variant: 'error'
        });
        // Mark tất cả fields có lỗi trong step hiện tại là touched
        const stepTouched = Object.keys(stepErrors).reduce(
          (acc, fieldName) => ({
            ...acc,
            [fieldName]: true
          }),
          {}
        );

        formik.setTouched({
          ...formik.touched,
          [nestedKey]: {
            ...formik.touched[nestedKey],
            ...stepTouched
          }
        });

        return;
      }

      // Submit hoặc next step
      if (activeStep === steps.length - 1) {
        formik.submitForm();
      } else {
        setActiveStep((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const handleCloseDialog = () => {
    setAdd(false);
    formik.resetForm();
    setActiveStep(0);
  };

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
          addButtonLabel={intl.formatMessage({ id: 'add-region' })}
        />
      </ScrollX>

      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={(_, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseDialog();
          }
        }}
        open={add}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle className="text-base" sx={{ m: 0, p: 2 }}>
          {record ? intl.formatMessage({ id: 'edit-info-region' }) : intl.formatMessage({ id: 'add-region-and-device' })}
          {/* Nút Close */}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500]
            }}
          >
            <CloseCircle />
          </IconButton>
        </DialogTitle>

        <Divider />

        <Stepper activeStep={activeStep} sx={{ px: 5, py: 2 }}>
          {steps!.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <DialogContent sx={{ px: 5 }}>
          <RegionForm formik={formik} fields={currentStepFields} />
        </DialogContent>

        <Divider />
        {/* Actions */}
        <DialogActions sx={{ p: 2.5 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              {steps && activeStep > 0 && (
                <Button onClick={handlePrevStep} color="primary">
                  <FormattedMessage id="back" />
                </Button>
              )}
            </Grid>
            <Grid item>
              <Stack direction="row" spacing={2} alignItems="flex-end">
                <Button aria-hidden={false} color="error" onClick={handleCloseDialog} disabled={formik.isSubmitting}>
                  <FormattedMessage id="cancel" />
                </Button>
                {steps && activeStep < steps.length - 1 ? (
                  <Button aria-hidden={false} onClick={handleSubmit} variant="contained" disabled={formik.isSubmitting}>
                    <FormattedMessage id="next" />
                  </Button>
                ) : (
                  <LoadingButton
                    loading={formik.isSubmitting}
                    aria-hidden={false}
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={formik.isSubmitting}
                  >
                    <FormattedMessage id={record ? 'edit' : 'confirm'} />
                  </LoadingButton>
                )}
              </Stack>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>

      {/* <ViewDialog title="region-info" open={openDialog} onClose={handleCloseView} data={record} config={regionViewConfig} /> */}

      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleCloseView}
        open={openDialog}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              <FormattedMessage id={'region-info'} defaultMessage="Client Details" />
            </Typography>
          </Box>
        </DialogTitle>

        {/* Dialog Content */}
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
            {regionViewConfig.map((group) => (
              <FieldGroupCard sensitiveFields={sensitiveFields} key={group.title} group={group} record={record} theme={theme} />
            ))}
          </Grid>
        </DialogContent>

        {/* Dialog Actions */}
        <DialogActions
          sx={{
            p: 3,
            backgroundColor: 'white',
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Button
            onClick={handleCloseView}
            variant="outlined"
            color="error"
            size="medium"
            sx={{
              px: 4,
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            <FormattedMessage id="close" defaultMessage="Close" />
          </Button>
        </DialogActions>
      </Dialog>

      {recordDelete && (
        <Alert
          alertDelete="alert-delete-region"
          nameRecord={recordDelete.name}
          open={open}
          handleClose={handleClose}
          handleDelete={handleDelete}
        />
      )}
    </MainCard>
  );
};

export default RegionManagement;

// Region
const getInitialRegionValues = (region: DataRegion | null): NewRegion => {
  return {
    id: region?.id || '',
    name: region?.name || '',
    address: region?.address || '',
    description: region?.description || '',
    location: region?.lat_location && region?.long_location ? [Number(region.lat_location), Number(region.long_location)] : null,
    latLocation: region?.lat_location || '',
    longLocation: region?.long_location || ''
  };
};

// Device
const getInitialDeviceValues = (region: DataRegion | null) => {
  const controller = region?.controller;
  const detail = controller?.detail;
  const config = region?.device_configs;

  return {
    id: controller?.id || '',
    name: controller?.name || '',
    description: controller?.description || '',
    ipAddress: detail?.ip_address || '',
    macAddress: detail?.mac_address || '',
    firmware: detail?.firmware || '',
    wifiStandard: detail?.wifi_standard || '',
    model: detail?.model || '',
    manufacturerDate: detail?.manufacturer_date || '',
    url: config?.url || '',
    username: config?.username ?? '', // Ensure string, not undefined or null
    password: config?.password ?? '', // Ensure string, not undefined or null
    clientId: config?.client_id ?? '', // Ensure string, not undefined or null
    clientSecret: config?.client_secret ?? '', // Ensure string, not undefined or null
    partnerId: region?.partner_id ?? 0,
    regionId: config?.region_id || '',
    Id: controller?.id || ''
  };
};
interface FormValues {
  region: NewRegion;
  device: NewDevice;
}
