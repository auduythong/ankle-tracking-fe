import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

// project-imports
import { SelectCheckbox, Checkbox, Input } from 'components/molecules/form';
import { Button, DialogActions, DialogContent, DialogTitle, Divider, Grid, Stack } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import { useFormik, Form, FormikProvider, FormikValues } from 'formik';
import { enqueueSnackbar } from 'notistack';

//redux
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

//validate Schema
import useValidationSchemas from 'hooks/useValidation';

//utils
import { modifyPermissions, getOption } from 'utils/handleData';

//types
import { RoleData, NewRole } from 'types/end-user';
import { OptionList } from 'types/general';
import useHandlePermission from 'hooks/useHandlePermission';

export interface Props {
  record: RoleData | null;
  onCancel: () => void;
  handleAdd: (values: NewRole) => void;
  handleEdit: (values: NewRole) => void;
  permissionLevel2: OptionList[];
  open: boolean;
}

const AddRole = ({ record, onCancel, handleAdd, handleEdit, open, permissionLevel2 }: Props) => {
  const { RoleUserSchema } = useValidationSchemas();
  const [dataRecordLv2, setDataRecordLv2] = useState([]);
  const [dataRecordLv3, setDataRecordLv3] = useState([]);
  const [dataRoleLv3, setDataRoleLv3] = useState<OptionList[]>([]);

  const intl = useIntl();
  const { fetchDataPermission } = useHandlePermission();

  function getArrId(arr: RoleData[]): number[] {
    return arr.map((role) => role.id);
  }

  const getDataRole = async (role: RoleData) => {
    const dataLv2 = await fetchDataPermission({ level: 2, parent_id: [role.id] });
    const dataLv3 = await fetchDataPermission({ level: 3, parent_id: [role.id] });
    setDataRecordLv2(dataLv2);
    setDataRecordLv3(dataLv3);
  };

  useEffect(() => {
    if (record) {
      getDataRole(record);
    }
    //eslint-disable-next-line
  }, [record]);

  const permissionOptions = [
    {
      value: 'get',
      label: intl.formatMessage({ id: 'read-only' })
    },
    {
      value: 'sync',
      label: intl.formatMessage({ id: 'sync' })
    }
  ];

  const getInitialValues = (record: FormikValues | null): NewRole => {
    const newRecord: NewRole = {
      id: 0,
      title: '',
      description: '',
      permission: [],
      permission_level2: [],
      permission_level3: []
    };

    if (record) {
      let permissionsArray;
      try {
        // Try parsing as JSON first
        permissionsArray = JSON.parse(record.permission);
      } catch {
        // If JSON parsing fails, split the string by commas
        permissionsArray = record.permission.split(',');
      }

      // Assume the permissions might still include the role prefix
      const permissionWithoutPrefix = permissionsArray.map((perm: string) => {
        return perm.replace(`${record.title.toLowerCase()}_`, '');
      });

      newRecord.id = record.id;
      newRecord.title = record.title;
      newRecord.description = record.description;
      newRecord.permission = permissionWithoutPrefix;
      newRecord.permission_level2 = getArrId(dataRecordLv2);
      newRecord.permission_level3 = getArrId(dataRecordLv3);

      return newRecord;
    }

    return newRecord;
  };

  const formik = useFormik({
    initialValues: getInitialValues(record),
    validationSchema: RoleUserSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const actions = record ? handleEdit : handleAdd;
        const modifyValues = modifyPermissions(values);

        const res: any = await actions(modifyValues);

        if (res && res.code === 0) {
          dispatch(
            openSnackbar({
              open: true,
              message: record
                ? intl.formatMessage({ id: 'role-update-successfully' })
                : intl.formatMessage({ id: 'role-add-successfully' }),
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          );
          setSubmitting(false);
          onCancel();
        } else {
          if (res.code === -1 && res.message === 'Vai trò này đã tồn tại') {
            setFieldError('title', intl.formatMessage({ id: 'duplicate-role' }));
          }

          enqueueSnackbar(record ? intl.formatMessage({ id: 'update-failed' }) : intl.formatMessage({ id: 'add-failed' }), {
            variant: 'error'
          });
          setSubmitting(false);
        }
      } catch (error) {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
      }
    }
  });

  const { isSubmitting, setValues, handleSubmit, resetForm } = formik;

  useEffect(() => {
    if (!record && open) {
      resetForm({
        touched: {},
        errors: {}
      });
    }

    setValues(getInitialValues(record));
    //eslint-disable-next-line
  }, [record, open]);

  useEffect(() => {
    const fetchPermissionLevel3 = async () => {
      if (formik.values.permission_level2.length > 0) {
        const dataRole = await fetchDataPermission({ level: 3, parent_id: formik.values.permission_level2 });
        const newOptions = getOption(dataRole, 'title', 'id');
        setDataRoleLv3(newOptions);
      } else {
        setDataRoleLv3([]);
        formik.setFieldValue('permission_level3', []);
      }
    };

    fetchPermissionLevel3();
    //eslint-disable-next-line
  }, [formik.values.permission_level2]);

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle className="text-base">
              {record ? <FormattedMessage id="edit-role" /> : <FormattedMessage id="new-role" />}
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                  <Grid container spacing={3}>
                    <Input
                      name="name-role"
                      inputLabel={intl.formatMessage({ id: 'name-role' })}
                      required={true}
                      readOnly={record ? true : false}
                      field="title"
                      placeholder={intl.formatMessage({ id: 'enter-name-role' })}
                      formik={formik}
                    />
                    <Checkbox
                      name="permission"
                      inputLabel={intl.formatMessage({ id: 'permission' })}
                      required={true}
                      field="permission"
                      arrayOption={permissionOptions}
                      formik={formik}
                    />
                    <SelectCheckbox
                      name="subsystem"
                      field="permission_level2"
                      arrayOption={permissionLevel2}
                      inputLabel={intl.formatMessage({ id: 'subsystem' })}
                      required
                      formik={formik}
                    />
                    <SelectCheckbox
                      name="subsystemLv3"
                      field="permission_level3"
                      arrayOption={dataRoleLv3}
                      inputLabel={intl.formatMessage({ id: 'service-access' })}
                      required
                      formik={formik}
                    />
                    <Input
                      name="desc"
                      inputLabel={intl.formatMessage({ id: 'desc' })}
                      required={true}
                      field="description"
                      placeholder={intl.formatMessage({ id: 'enter-desc' })}
                      formik={formik}
                      row={2}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={1}></Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Grid container justifyContent="flex-end" alignItems="center">
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="flex-end">
                    <Button color="error" onClick={onCancel}>
                      <FormattedMessage id="cancel" />
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {record ? <FormattedMessage id="edit" /> : <FormattedMessage id="confirm" />}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
    </>
  );
};

export default AddRole;
