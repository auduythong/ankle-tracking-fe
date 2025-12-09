import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

//project-import
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper
} from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';

//third-party
import { Input, Select, SelectCheckbox } from 'components/molecules/form';
import { Form, FormikProvider, FormikValues, useFormik } from 'formik';
import useValidationSchemas from 'hooks/useValidation';
import Cookies from 'universal-cookie';

//utils
import axios from 'utils/axios';
import { API_PATH_ROLE } from 'utils/constant';
import { getOption } from 'utils/handleData';

//types
import { RootState, useSelector } from 'store';
import { EndUserData, NewUser, OptionList, SSIDData } from 'types';
// import { openSnackbar } from 'store/reducers/snackbar';
// import { enqueueSnackbar } from 'notistack';
import LoadingButton from 'components/@extended/LoadingButton';
import { useGeolocation } from 'hooks/useGeolocation';
import useHandleAds from 'hooks/useHandleAds';
import useHandleRegion from 'hooks/useHandleRegion';
import useHandleSite from 'hooks/useHandleSites';
import useHandleSSID from 'hooks/useHandleSSID';
import useHandleUser from 'hooks/useHandleUser';
import useHandleWLAN from 'hooks/useHandleWLAN';
import { PermissionCheckGroup } from '../PermissionCheckGroup';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  record: EndUserData | null;
  isReload: any;
  tab?: 1 | 2;
  onSubmitOk: () => void;
  // siteOptions: OptionList[];
  // ssidOptions: OptionList[];
}

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
    userGroupId: endUser?.user_group || [1],
    userGroupIdLv2: endUser?.user_group_lv2 || [],
    userGroupIdLv3:
      endUser?.user_group_lv3?.map((item: any) => ({
        id: item.id,
        isRead: item.isRead,
        isWrite: item.isWrite
      })) || [],
    userWlanAccessId: endUser?.wlans || [],
    userSiteAccessId: endUser?.sites || [],
    userSSIDAccessId: endUser?.ssids || [],
    userRegionAccessId: endUser?.regions || [],
    userAdAccessId: endUser?.ads || []
  };
};

const UserFormDialog: React.FC<UserFormProps> = ({ open, onClose, record, isReload, tab, onSubmitOk }) => {
  const [keywords, setKeywords] = useState({
    country: '',
    province: '',
    ward: ''
  });
  const [loadingRegion, setLoadingRegion] = useState(false);
  const [loadingSite, setLoadingSite] = useState(false);
  const [loadingWLAN, setLoadingWLAN] = useState(false);
  const [loadingSSID, setLoadingSSID] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);
  const intl = useIntl();
  const cookies = new Cookies();
  const accessToken = cookies.get('accessToken');
  const [activeStep, setActiveStep] = useState(0);
  const [dataRoleLv2, setDataRoleLv2] = useState<OptionList[]>([]);
  const [dataRoleLv3, setDataRoleLv3] = useState<OptionList[]>([]);
  const [ssidOptions, setSSIDOptions] = useState<
    {
      label: string | React.ReactNode;
      value: number | string;
    }[]
  >([]);

  const [regionOptions, setRegionOptions] = useState<OptionList[]>([]);
  const [siteOptions, setSiteOptions] = useState<OptionList[]>([]);
  const [adsOptions, setAdsOptions] = useState<OptionList[]>([]);
  const { EndUserSchema, RoleGroupSchema } = useValidationSchemas(record ? true : false);
  const steps = [intl.formatMessage({ id: 'user-info' }), intl.formatMessage({ id: 'permission-user' })];
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds ?? '');
  const [optionWLAN, setOptionWLAN] = useState<
    {
      label: string | React.ReactNode;
      value: number | string;
      id: number | string;
    }[]
  >([]);

  const { fetchDataWLAN } = useHandleWLAN();
  const { fetchDataSSID } = useHandleSSID();
  const { handleAction } = useHandleUser();
  const { fetchDataRegion } = useHandleRegion();
  const { fetchDataSites } = useHandleSite();
  const { fetchDataAds } = useHandleAds();

  const formik = useFormik({
    initialValues: getInitialValues({
      ...record,
      wlans: optionWLAN.filter((item) => record?.wlans.includes(item.id as number)).map((item) => item.value)
    }),
    validationSchema: activeStep === 0 ? EndUserSchema : RoleGroupSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setSubmitting(true);
      // ép role theo tab
      if (tab === 2) {
        values.userGroupId = [2]; // group user
      } else if (tab === 1 && !values.userGroupId) {
        values.userGroupId = [1]; // group admin
      }

      // map userWlanAccessId sang id thật
      let userWlanAccessId = values.userWlanAccessId;
      if (values.userWlanAccessId?.length > 0) {
        userWlanAccessId = values.userWlanAccessId.map((hwId: string | number) => {
          const found = optionWLAN.find((opt) => opt.value === hwId);
          return found ? found.id : hwId;
        });
      }

      // tạo payload riêng, không mutate values
      const payload = {
        ...values,
        userWlanAccessId
      };

      await handleActionUser(payload);
      setSubmitting(false);
    },
    enableReinitialize: true // bật để map các options khi record thay đổi
  });

  const { data: countryOptions = [], isLoading: loadingCountry } = useGeolocation({
    level: 1,
    name: keywords.country
  });

  const { data: provinceOptions = [], isLoading: loadingProvince } = useGeolocation({
    level: 2,
    countryCode: 'VN',
    parentId: formik.values.country,
    name: keywords.province
  });

  const selectedProvince = useMemo(() => {
    const find = provinceOptions.find((item) => item.name === formik.values.province);
    return find;
  }, [formik.values.province, provinceOptions]);

  const { data: wardOptions = [], isLoading: loadingWard } = useGeolocation(
    {
      level: 3,
      parentId: selectedProvince?.id,
      countryCode: 'VN',
      name: keywords.ward
    },
    !!selectedProvince // chỉ bật khi đã chọn province
  );

  useEffect(() => {
    formik.setFieldValue('ward', '');
  }, [formik.values.province]);

  useEffect(() => {
    formik.setFieldValue('district', '');
  }, [formik.values.province]);

  const getWLANOptions = async (params: { page: number; pageSize: number; siteDataInput: string }) => {
    try {
      setLoadingWLAN(true);
      const dataWLAN = await fetchDataWLAN({ ...params });
      const options =
        dataWLAN?.length > 0
          ? dataWLAN?.map((item) => ({
              label: (
                <div className="flex items-center gap-2">
                  <span>{item?.name}</span> - <span className="font-medium text-blue-600">{item?.site?.name}</span>
                </div>
              ),
              value: item.wlan_hardware_id,
              id: item.id
            }))
          : [];
      setOptionWLAN(options);
    } finally {
      setLoadingWLAN(false);
    }
  };

  useEffect(() => {
    if (formik.values.userSiteAccessId && formik.values.userSiteAccessId.length > 0) {
      getWLANOptions({ page: 1, pageSize: 50, siteDataInput: JSON.stringify(formik.values.userSiteAccessId) });
    } else {
      setOptionWLAN([]);
    }
    // eslint-disable-next-line
  }, [formik.values.userSiteAccessId.length, formik.values.userSiteAccessId.join(',')]); // Dùng join thay vì JSON.stringify

  const getOptionsAds = async (ssidList: string[], site: string) => {
    try {
      setLoadingAds(true);
      const dataAds = await fetchDataAds({
        page: 1,
        pageSize: 100,
        siteDataInput: JSON.stringify(ssidList),
        siteId: site,
        adDataInput: JSON.stringify(currentAds)
      });
      setAdsOptions(getOption(dataAds, 'template_name', 'id'));
    } finally {
      setLoadingAds(false);
    }
  };

  async function handleActionUser(payload: NewUser) {
    const type = record ? 'edit' : 'add';
    const data = await handleAction(type, { id: payload.id }, payload);
    if (data.code == 0) {
      onSubmitOk();
      onClose();
      isReload(true);
    }
  }

  const handleNext = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      setActiveStep((prev) => prev + 1);
    } else {
      formik.setTouched(Object.keys(formik.values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getRoleLv2 = async () => {
    try {
      const res = await axios.get(`${API_PATH_ROLE.dataRole}`, {
        headers: {
          Authorization: `${accessToken}`
        },
        params: {
          level: 2,
          pageSize: 100
        }
      });
      setDataRoleLv2(getOption(res.data.data, 'title', 'id'));
    } catch {}
  };

  const getRoleLv3 = async (parentId: number[]) => {
    try {
      if (parentId.length > 0) {
        const res = await axios.get(`${API_PATH_ROLE.dataRole}`, {
          headers: {
            Authorization: `${accessToken}`
          },
          params: {
            level: 3,
            pageSize: 100,
            parentId: `[${parentId}]`
          }
        });
        setDataRoleLv3(getOption(res.data.data, 'title', 'id'));
      }
    } catch {}
  };

  const getOptionSSID = async (wlanIds: string[], siteId: string[], currentSite: string) => {
    try {
      setLoadingSSID(true);
      const dataSSID = await fetchDataSSID({
        page: 1,
        pageSize: 100,
        siteDataInput: JSON.stringify(siteId),
        wlanDataInput: JSON.stringify(wlanIds)
      });
      const options =
        dataSSID?.length > 0
          ? dataSSID?.map((item: SSIDData) => ({
              label: (
                <div className="flex items-center gap-2">
                  <span>{item?.name}</span> - <span className="font-medium text-blue-600">{item?.wlan?.name}</span>
                </div>
              ),
              value: item.id
            }))
          : [];
      setSSIDOptions(options);
    } finally {
      setLoadingSSID(false);
    }
  };

  const getOptionRegion = async () => {
    try {
      setLoadingRegion(true);
      const dataRegion = await fetchDataRegion({ page: 1, pageSize: 100 });
      setRegionOptions(getOption(dataRegion, 'name', 'id'));
    } finally {
      setLoadingRegion(false);
    }
  };

  const getOptionSite = async (regionId: string[]) => {
    try {
      setLoadingSite(true);
      const dataSite = await fetchDataSites({ page: 1, pageSize: 100, regionDataInput: JSON.stringify(regionId) });
      setSiteOptions(getOption(dataSite, 'name', 'id'));
    } finally {
      setLoadingSite(false);
    }
  };

  // Track xem form đã được init chưa
  const [formInitialized, setFormInitialized] = useState(false);

  useEffect(() => {
    if (open && !formInitialized) {
      // Chỉ init form LẦN ĐẦU TIÊN khi dialog mở
      formik.resetForm({
        values: getInitialValues(record)
      });
      getRoleLv2();
      getOptionRegion();
      setActiveStep(0);
      setFormInitialized(true);
    } else if (!open && formInitialized) {
      // Reset flag khi dialog đóng
      setFormInitialized(false);
    }
    //eslint-disable-next-line
  }, [open]);

  useEffect(() => {
    if (formik.values.userRegionAccessId.length > 0) {
      getOptionSite(formik.values.userRegionAccessId);
    } else {
      setSiteOptions([]);
    }
    //eslint-disable-next-line
  }, [formik.values.userRegionAccessId]);

  useEffect(() => {
    if (formik.values.userGroupIdLv2.length > 0) {
      getRoleLv3(formik.values.userGroupIdLv2);
    } else {
      setDataRoleLv3([]);
    }
    //eslint-disable-next-line
  }, [formik.values.userGroupIdLv2]);

  useEffect(() => {
    if (formik.values.userSiteAccessId.length > 0 && formik.values.userWlanAccessId.length > 0) {
      getOptionSSID(formik.values.userWlanAccessId, formik.values.userSiteAccessId, currentSite);
    } else {
      setSSIDOptions([]);
    }
    //eslint-disable-next-line
  }, [formik.values.userWlanAccessId, formik.values.userSiteAccessId, currentSite]);

  useEffect(() => {
    if (formik.values.userSSIDAccessId.length > 0) {
      getOptionsAds(formik.values.userAdAccessId, currentSite);
    } else {
      setAdsOptions([]);
    }
    //eslint-disable-next-line
  }, [formik.values.userSSIDAccessId, currentSite]);

  return (
    <FormikProvider value={formik}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>
          {record ? (
            tab === 2 ? (
              <FormattedMessage id="edit-user" />
            ) : (
              <FormattedMessage id="edit-admin" />
            )
          ) : tab === 2 ? (
            <FormattedMessage id="add-user" />
          ) : (
            <FormattedMessage id="add-admin" />
          )}
        </DialogTitle>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Form autoComplete="off" noValidate>
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3} className="max-h-[65vh] overflow-y-auto">
              <Grid item xs={1}></Grid>
              <Grid item xs={10}>
                <Grid container spacing={3}>
                  {activeStep === 0 && (
                    <>
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
                      <Grid item xs={12}>
                        {/* Radio chọn vai trò */}
                        {tab === 1 ? (
                          <FormControl component="fieldset">
                            <FormLabel component="legend">{intl.formatMessage({ id: 'role' })}</FormLabel>
                            <RadioGroup row name="userGroupId" value={formik.values.userGroupId} onChange={formik.handleChange}>
                              <FormControlLabel value={1} control={<Radio />} label={intl.formatMessage({ id: 'admin' })} />
                              <FormControlLabel value={2} control={<Radio />} label={intl.formatMessage({ id: 'user' })} />
                            </RadioGroup>
                          </FormControl>
                        ) : (
                          <FormControl component="fieldset">
                            <FormLabel component="legend">{intl.formatMessage({ id: 'role' })}</FormLabel>
                            <RadioGroup row value={2}>
                              <FormControlLabel value={2} control={<Radio checked />} label={intl.formatMessage({ id: 'user' })} disabled />
                            </RadioGroup>
                          </FormControl>
                        )}
                      </Grid>
                      <Input
                        md={6}
                        name="citizen-id"
                        inputLabel={intl.formatMessage({ id: 'citizen-id' })}
                        field="citizenId"
                        placeholder={intl.formatMessage({ id: 'enter-citizen-id' })}
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
                      {/* Country select */}
                      <Select
                        onSearch={(value) => {
                          setKeywords({ ...keywords, country: value });
                        }}
                        md={6}
                        name="country"
                        field="country"
                        inputLabel={intl.formatMessage({ id: 'country' })}
                        formik={formik}
                        arrayOption={countryOptions.map((p) => ({ label: p.name, value: p.name }))}
                        required
                        placeholder={''}
                        loading={loadingCountry}
                        enableSearch
                      />

                      {formik.values.country === 'Việt Nam' ? (
                        <>
                          {/* Province select */}
                          <Select
                            onSearch={(value) => setKeywords({ ...keywords, province: value })}
                            md={6}
                            name="province"
                            field="province"
                            inputLabel={intl.formatMessage({ id: 'province' })}
                            formik={formik}
                            arrayOption={provinceOptions.map((p) => ({ label: p.name, value: p.name }))}
                            required
                            loading={loadingProvince}
                            placeholder={''}
                            enableSearch
                          />
                          {/* Ward select */}
                          <Select
                            onSearch={(value) => setKeywords({ ...keywords, ward: value })}
                            md={6}
                            name="ward"
                            field="ward"
                            inputLabel={intl.formatMessage({ id: 'ward' })}
                            formik={formik}
                            arrayOption={wardOptions.map((w) => ({ label: w.name, value: w.name }))}
                            required
                            loading={loadingWard}
                            placeholder={''}
                            isDisabled={!formik.values.province}
                            enableSearch
                          />
                        </>
                      ) : (
                        <>
                          {/* Province input cho quốc gia khác */}
                          <Input
                            md={6}
                            name="province"
                            inputLabel={intl.formatMessage({ id: 'province' })}
                            field="province"
                            placeholder={intl.formatMessage({ id: 'enter-province' })}
                            formik={formik}
                          />
                          {/* Ward input cho quốc gia khác */}
                          <Input
                            md={6}
                            name="ward"
                            inputLabel={intl.formatMessage({ id: 'ward' })}
                            field="ward"
                            placeholder={intl.formatMessage({ id: 'enter-ward' })}
                            formik={formik}
                          />
                        </>
                      )}

                      <Input
                        md={6}
                        name="address"
                        inputLabel={intl.formatMessage({ id: 'address' })}
                        required={true}
                        field="address"
                        placeholder={intl.formatMessage({ id: 'enter-address' })}
                        formik={formik}
                      />

                      {/* <Input
                        md={6}
                        name="ward"
                        inputLabel={intl.formatMessage({ id: 'ward' })}
                        required={true}
                        field="ward"
                        placeholder={intl.formatMessage({ id: 'enter-ward' })}
                        formik={formik}
                      /> */}
                      {/* <Input
                        md={6}
                        name="district"
                        inputLabel={intl.formatMessage({ id: 'district' })}
                        required={true}
                        field="district"
                        placeholder={intl.formatMessage({ id: 'enter-district' })}
                        formik={formik}
                      /> */}

                      {/* <Input
                        md={6}
                        name="province"
                        inputLabel={intl.formatMessage({ id: 'province' })}
                        required={true}
                        field="province"
                        placeholder={intl.formatMessage({ id: 'enter-province' })}
                        formik={formik}
                      /> */}
                      {/* <Input
                        md={6}
                        name="country"
                        inputLabel={intl.formatMessage({ id: 'country' })}
                        required={true}
                        field="country"
                        placeholder={intl.formatMessage({ id: 'enter-country' })}
                        formik={formik}
                      /> */}

                      <SelectCheckbox
                        md={12}
                        name="userRegionAccessId"
                        inputLabel={intl.formatMessage({ id: 'region-access' })}
                        field="userRegionAccessId"
                        formik={formik}
                        arrayOption={regionOptions}
                        required
                        loading={loadingRegion}
                      />
                      <SelectCheckbox
                        md={12}
                        name="userSiteAccessId"
                        inputLabel={intl.formatMessage({ id: 'sites-access' })}
                        field="userSiteAccessId"
                        formik={formik}
                        arrayOption={siteOptions}
                        required
                        loading={loadingSite}
                      />
                      <SelectCheckbox
                        md={6}
                        name="userWlanAccessId"
                        inputLabel={intl.formatMessage({ id: 'wlan-access' })}
                        field="userWlanAccessId"
                        formik={formik}
                        arrayOption={optionWLAN}
                        required
                        loading={loadingWLAN}
                      />
                      <SelectCheckbox
                        md={6}
                        name="userSSIDAccessId"
                        inputLabel={intl.formatMessage({ id: 'ssid-access' })}
                        field="userSSIDAccessId"
                        formik={formik}
                        arrayOption={ssidOptions}
                        required
                        loading={loadingSSID}
                      />
                      <SelectCheckbox
                        md={12}
                        name="userAdAccessId"
                        inputLabel={intl.formatMessage({ id: 'ads-access' })}
                        field="userAdAccessId"
                        formik={formik}
                        arrayOption={adsOptions}
                        loading={loadingAds}
                      />
                      {!record && (
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
                    </>
                  )}
                  {activeStep === 1 && (
                    <>
                      <SelectCheckbox
                        key="group-role-lv2"
                        field="userGroupIdLv2"
                        formik={formik}
                        inputLabel={intl.formatMessage({ id: 'group-role-lv2' })}
                        name="group-role-lv2"
                        arrayOption={dataRoleLv2}
                      />
                      <PermissionCheckGroup
                        key="permissions"
                        field="userGroupIdLv3" // tên field trong Formik
                        formik={formik} // object formik hiện tại
                        inputLabel={intl.formatMessage({ id: 'group-role-lv3' })}
                        arrayOption={dataRoleLv3}
                      />
                    </>
                  )}
                </Grid>
              </Grid>
              <Grid item xs={1}></Grid>
            </Grid>
          </DialogContent>
          <DialogActions className="pb-4">
            <Grid container justifyContent="flex-end" alignItems="center">
              <Grid item>
                <Stack direction="row" spacing={2} alignItems="flex-end">
                  <Button color="error" onClick={onClose}>
                    <FormattedMessage id="cancel" />
                  </Button>
                  {activeStep > 0 && (
                    <Button onClick={handleBack} aria-hidden={false}>
                      <FormattedMessage id="back" />
                    </Button>
                  )}
                  {activeStep < steps.length - 1 && (
                    <Button
                      type="button"
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn chặn event tới các phần tử khác
                        handleNext();
                      }}
                      disabled={!formik.isValid}
                      aria-hidden={false}
                    >
                      <FormattedMessage id="next" />
                    </Button>
                  )}
                  {activeStep === steps.length - 1 && (
                    <LoadingButton
                      loading={formik.isSubmitting}
                      type="submit"
                      variant="contained"
                      disabled={!formik.isValid}
                      aria-hidden={false}
                    >
                      {record ? <FormattedMessage id="edit" /> : <FormattedMessage id="confirm" />}
                    </LoadingButton>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </Dialog>
    </FormikProvider>
  );
};

export default UserFormDialog;
