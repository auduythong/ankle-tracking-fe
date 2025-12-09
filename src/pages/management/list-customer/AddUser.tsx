import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { FormattedMessage } from 'react-intl';

// project-import
import { Button, DialogActions, DialogContent, DialogTitle, Divider, Grid, Stack, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Input, SelectCheckbox } from 'components/molecules/form';

// third-party
import { useFormik, Form, FormikProvider, FormikValues } from 'formik';
import { enqueueSnackbar } from 'notistack';

// redux
import { dispatch, RootState, useSelector } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

// validate
import useValidation from 'hooks/useValidation';

//types
import { EditUser, NewUser, EndUserData } from 'types/end-user';
import useHandleSite from 'hooks/useHandleSites';
import { getOption } from 'utils/handleData';
import { OptionList } from 'types';

const getInitialValues = (endUser: FormikValues | null) => {
  return {
    id: endUser?.id || '',
    fullname: endUser?.fullname || '',
    email: endUser?.email || '',
    phoneNumber: endUser?.phone_number || '',
    citizenId: endUser?.citizen_id || '',
    gender: endUser?.gender || '',
    address: endUser?.address || '',
    ward: endUser?.ward || '',
    district: endUser?.district || '',
    province: endUser?.province || '',
    country: endUser?.country || '',
    postcode: endUser?.postcode || '',
    username: endUser?.username || '',
    password: endUser?.password || '',
    userSiteAccessId: endUser?.sites || [],
    userGroupId: endUser?.user_group || [1],
    userGroupIdLv2: endUser?.user_group_lv2 || [],
    userGroupIdLv3: endUser?.user_group_lv3 || []
  };
};

export interface Props {
  endUser: EndUserData | null;
  onCancel: () => void;
  handleEdit: (values: EditUser) => void;
  handleAdd: (values: NewUser) => void;
  open: boolean;
}

const AddEndUser = ({ endUser, onCancel, handleEdit, handleAdd, open }: Props) => {
  const intl = useIntl();
  const isEditMode: boolean = endUser ? true : false;
  const [optionSites, setOptionSites] = useState<OptionList[]>([]);
  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const { fetchDataSites } = useHandleSite();
  const getOptionSite = async () => {
    const dataSite = await fetchDataSites({ page: 1, pageSize: 20, regionDataInput: JSON.stringify(regionIdAccess) });
    setOptionSites(getOption(dataSite, 'name', 'id'));
  };
  const { UserSchema } = useValidation(isEditMode);
  // const [selected, setSelected] = useState<number[]>([2]);

  const formik = useFormik({
    initialValues: getInitialValues(endUser),
    validationSchema: UserSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const actions = endUser ? handleEdit : handleAdd;
        const res: any = await actions({ ...values });
        if (res && res.code === 0) {
          dispatch(
            openSnackbar({
              open: true,
              message: endUser ? intl.formatMessage({ id: 'edit-user-successfully' }) : intl.formatMessage({ id: 'add-user-successfully' }),
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
          if (res.code === -1 && res.message === 'User này đã tồn tại') {
            setFieldError('username', intl.formatMessage({ id: 'duplicate-username' }));
          }

          enqueueSnackbar(endUser ? intl.formatMessage({ id: 'update-failed' }) : intl.formatMessage({ id: 'add-failed' }), {
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
  const { handleSubmit, isSubmitting, setValues, resetForm } = formik;

  useEffect(() => {
    getOptionSite();
    resetForm({
      touched: {},
      errors: {}
    });
    setValues(getInitialValues(endUser));
    //eslint-disable-next-line
  }, [endUser, open]);

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle className="text-base">
              {endUser ? <FormattedMessage id="edit-end-user" /> : <FormattedMessage id="new-end-user" />}
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={1}></Grid>
                <Grid item xs={10}>
                  <Grid container spacing={3}>
                    <Input
                      name="name_user"
                      inputLabel={intl.formatMessage({ id: 'fullname' })}
                      required={true}
                      field="fullname"
                      placeholder={intl.formatMessage({ id: 'enter-full-name' })}
                      formik={formik}
                    />
                    <Input
                      md={6}
                      name="email"
                      inputLabel={intl.formatMessage({ id: 'email-address' })}
                      required={true}
                      field="email"
                      placeholder={intl.formatMessage({ id: 'enter-email' })}
                      formik={formik}
                    />
                    <Input
                      md={6}
                      name="phone-number"
                      inputLabel={intl.formatMessage({ id: 'phone-number' })}
                      required={true}
                      field="phoneNumber"
                      placeholder={intl.formatMessage({ id: 'enter-phone-number' })}
                      formik={formik}
                    />
                    <Input
                      name="citizen-id"
                      inputLabel={intl.formatMessage({ id: 'citizen-id' })}
                      field="citizenId"
                      placeholder={intl.formatMessage({ id: 'enter-citizen-id' })}
                      formik={formik}
                    />
                    <Input
                      name="address"
                      inputLabel={intl.formatMessage({ id: 'address' })}
                      required={true}
                      field="address"
                      placeholder={intl.formatMessage({ id: 'enter-address' })}
                      formik={formik}
                    />
                    <Input
                      md={6}
                      name="ward"
                      inputLabel={intl.formatMessage({ id: 'ward' })}
                      required={true}
                      field="ward"
                      placeholder={intl.formatMessage({ id: 'enter-ward' })}
                      formik={formik}
                    />
                    <Input
                      md={6}
                      name="district"
                      inputLabel={intl.formatMessage({ id: 'district' })}
                      required={true}
                      field="district"
                      placeholder={intl.formatMessage({ id: 'enter-district' })}
                      formik={formik}
                    />
                    <Input
                      name="province"
                      inputLabel={intl.formatMessage({ id: 'province' })}
                      required={true}
                      field="province"
                      placeholder={intl.formatMessage({ id: 'enter-province' })}
                      formik={formik}
                    />
                    <Input
                      md={6}
                      name="country"
                      inputLabel={intl.formatMessage({ id: 'country' })}
                      required={true}
                      field="country"
                      placeholder={intl.formatMessage({ id: 'enter-country' })}
                      formik={formik}
                    />
                    <Input
                      md={6}
                      name="postcode"
                      inputLabel={intl.formatMessage({ id: 'postcode' })}
                      field="postcode"
                      placeholder={intl.formatMessage({ id: 'enter-postcode' })}
                      formik={formik}
                    />
                    <SelectCheckbox
                      name="userSiteAccessId"
                      field="userSiteAccessId"
                      inputLabel={intl.formatMessage({ id: 'select-site' })}
                      formik={formik}
                      arrayOption={optionSites}
                    />

                    {!endUser && (
                      <>
                        <Input
                          name="username"
                          inputLabel={intl.formatMessage({ id: 'username' })}
                          required={true}
                          field="username"
                          placeholder={intl.formatMessage({ id: 'enter-username' })}
                          formik={formik}
                        />
                        <Input
                          name="password"
                          inputLabel={intl.formatMessage({ id: 'password' })}
                          required={true}
                          field="password"
                          placeholder={intl.formatMessage({ id: 'enter-password' })}
                          type="password"
                          formik={formik}
                        />
                      </>
                    )}
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
                      {isSubmitting ? (
                        <CircularProgress size={24} />
                      ) : endUser ? (
                        <FormattedMessage id="edit" />
                      ) : (
                        <FormattedMessage id="confirm" />
                      )}
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

export default AddEndUser;
