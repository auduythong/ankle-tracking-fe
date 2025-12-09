import { Dialog } from '@mui/material';
import { passpointApi } from 'api/passpoint.api';
import { PopupTransition } from 'components/@extended/Transitions';
import Form from 'components/template/Form';
import { passpointFields } from 'components/ul-config/form-config';
import { useFormik } from 'formik';
import useHandleSSID from 'hooks/useHandleSSID';
import useValidationSchemas from 'hooks/useValidation';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { DialogStatus } from 'types/dialog';
import { Passpoint } from 'types/passpoint';

export type PasspointFormValues = {
  ssidId: string | number;
  fullname: string;
  phoneNumber: string;
  email: string;
};

type PasspointDialogProps = {
  onSubmitOk: () => void;
};

export type PasspointDialogRef = {
  openCreate: () => void;
  openUpdate: (data: Passpoint) => void;
};

const defaultValues: PasspointFormValues = {
  ssidId: '',
  fullname: '',
  phoneNumber: '',
  email: ''
};

const PasspointDialog = forwardRef<PasspointDialogRef, PasspointDialogProps>(({ onSubmitOk }, ref) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PasspointFormValues>(defaultValues);
  const [status, setStatus] = useState<DialogStatus>('create');
  const [ssidOptions, setSsidOptions] = useState<{ label: string; value: number }[]>([]);
  const user = useSelector((state: RootState) => state.authSlice.user);
  const siteIdAccess = user?.sites?.map((item) => item.site_id);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const [selectedPasspoint, setSelectedPasspoint] = useState<Passpoint>();

  const intl = useIntl();

  const { fetchDataSSID } = useHandleSSID();
  const { PassPointSchema } = useValidationSchemas();

  useImperativeHandle(ref, () => ({
    openCreate: () => {
      setFormData(defaultValues);
      setStatus('create');
      setOpen(true);
    },
    openUpdate: (data: Passpoint) => {
      setSelectedPasspoint(data);
      setFormData({ ...data, ssidId: data.ssid.id, phoneNumber: data.phone_number });
      setStatus('update');
      setOpen(true);
    }
  }));

  const getOptionsSSID = async () => {
    const results = await fetchDataSSID({ page: 1, pageSize: 100, siteDataInput: JSON.stringify(siteIdAccess), siteId: currentSite });

    setSsidOptions(
      results.map((item: any) => {
        return {
          label: item.name,
          value: item.id
        };
      })
    );
  };

  useEffect(() => {
    getOptionsSSID();
  }, []);

  const handleSubmitForm = async (values: PasspointFormValues) => {
    try {
      if (status == 'create') {
        await passpointApi.create({ ...values });
        enqueueSnackbar(intl.formatMessage({ id: 'add-passpoint-successfully' }), {
          variant: 'success'
        });
      } else {
        await passpointApi.update({ id: selectedPasspoint?.id }, { ...values });
        enqueueSnackbar(intl.formatMessage({ id: 'edit-passpoint-successfully' }), {
          variant: 'success'
        });
      }
      setOpen(false);
      onSubmitOk();
    } catch (error) { }
  };

  const formik = useFormik({
    initialValues: formData,
    validationSchema: PassPointSchema,
    onSubmit: handleSubmitForm,
    enableReinitialize: true
  });

  const handleClose = useCallback(() => setOpen(false), []);

  const passpointFieldsOption = useMemo(() => {
    return passpointFields.map((field) => {
      if (field.name == 'ssidId') {
        return { ...field, options: ssidOptions };
      }
      return field;
    });
  }, [ssidOptions]);

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      TransitionComponent={PopupTransition}
      keepMounted
      fullWidth
      onClose={handleClose}
      sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
      aria-describedby="alert-dialog-slide-description"
    >
      <Form
        title={status == 'update' ? intl.formatMessage({ id: 'passpoint-update' }) : intl.formatMessage({ id: 'passpoint-create' })}
        onCancel={handleClose}
        formik={formik}
        fieldConfig={passpointFieldsOption}
        isEditMode={status == 'update'}
      />
    </Dialog>
  );
});

export default PasspointDialog;
