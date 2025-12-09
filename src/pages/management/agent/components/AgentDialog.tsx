import { Dialog } from '@mui/material';
import { agentApi } from 'api/agent.api';
import { PopupTransition } from 'components/@extended/Transitions';
import Form from 'components/template/Form';
import { agencyFields } from 'components/ul-config/form-config';
import { useFormik } from 'formik';
import useHandleUser from 'hooks/useHandleUser';
import useValidationSchemas from 'hooks/useValidation';
import { enqueueSnackbar } from 'notistack';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { Agent } from 'types/agent';
import { DialogStatus } from 'types/dialog';
import { getOption } from 'utils/handleData';
// import { getOption } from 'utils/handleData';

const PAGE_SIZE = 50;
const PAGE_INDEX = 1;

type AgentDialogProps = {
  onSubmitOk: () => void;
};

export type AgentDialogRef = {
  openCreate: () => void;
  openUpdate: (data: Agent) => void;
};

const defaultValues: Partial<Agent> = {
  id: 0,
  agent_name: '',
  user_id: ''
};

const AgentDialog = forwardRef<AgentDialogRef, AgentDialogProps>(({ onSubmitOk }, ref) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Agent>>(defaultValues);
  const [status, setStatus] = useState<DialogStatus>('create');
  const [selectedAgency, setSelectedAgency] = useState<Agent>();
  const [userData, setUserData] = useState<any>([]);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const intl = useIntl();

  const { AgencySchema } = useValidationSchemas();

  const { fetchData } = useHandleUser();

  const getDataUser = async (pageSize: number, pageIndex: number, currentSite: string) => {
    const userData = await fetchData(pageSize, pageIndex, 1, { siteId: currentSite });
    setUserData(userData);
  };

  useEffect(() => {
    getDataUser(PAGE_SIZE, PAGE_INDEX, currentSite);
    //eslint-disable-next-line
  }, [currentSite]);

  useImperativeHandle(ref, () => ({
    openCreate: () => {
      setFormData(defaultValues);
      setStatus('create');
      setOpen(true);
    },
    openUpdate: (data: Agent) => {
      setSelectedAgency(data);
      setFormData({ ...data });
      setStatus('update');
      setOpen(true);
    }
  }));

  const handleSubmitForm = async (values: Partial<Agent>) => {
    try {
      if (status == 'create') {
        const res = await agentApi.create({ ...values });
        if (res?.data.code == 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'add-agent-successfully' }), {
            variant: 'success'
          });
          setOpen(false);
          onSubmitOk();
        } else {
          enqueueSnackbar(res?.data.message, {
            variant: 'error'
          });
        }
      } else {
        const res = await agentApi.update(selectedAgency?.id || 0, { ...values });
        if (res?.data.code == 0) {
          enqueueSnackbar(intl.formatMessage({ id: 'edit-agent-successfully' }), {
            variant: 'success'
          });
          setOpen(false);
          onSubmitOk();
        } else {
          enqueueSnackbar(res?.data.message, {
            variant: 'error'
          });
        }
      }
    } catch (error) {}
  };

  const formik = useFormik({
    initialValues: formData,
    validationSchema: AgencySchema,
    onSubmit: (values) => {
      handleSubmitForm(values);
    },
    enableReinitialize: true
  });

  const handleClose = useCallback(() => setOpen(false), []);

  const fieldsWithOptions = agencyFields.map((field) => {
    if (field.name === 'user_id') {
      return { ...field, options: getOption(userData, 'fullname', 'id') };
    }
    return field;
  });

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
        title={status == 'update' ? intl.formatMessage({ id: 'agent-update' }) : intl.formatMessage({ id: 'agent-create' })}
        onCancel={handleClose}
        formik={formik}
        fieldConfig={fieldsWithOptions}
        isEditMode={status == 'update'}
      />
    </Dialog>
  );
});

export default AgentDialog;
