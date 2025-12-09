// pages/SSIDManagement.tsx
import { Dialog } from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import ViewDialog from 'components/template/ViewDialog';
import useHandlePartner from 'hooks/useHandlePartner';
import useValidationSchemas from 'hooks/useValidation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
// import Form from 'components/template/Form';
import { Button, DialogActions, DialogContent, DialogTitle, Divider, Stack, TextField } from '@mui/material';
import { wlanApi } from 'api/wlan.api';
import LoadingButton from 'components/@extended/LoadingButton';
import { FilterConfig } from 'components/organisms/DynamicFilterRenderer';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import CreateWirelessForm from 'components/template/WirelessForm';
import { ssidFields } from 'components/ul-config/form-config';
import { columnsSSID } from 'components/ul-config/table-config/SSID';
import { ssidViewConfig } from 'components/ul-config/view-dialog-config';
import { Form, Formik, FormikProps, useFormik } from 'formik';
import useHandleDevice from 'hooks/useHandleDevice';
import useHandleSite from 'hooks/useHandleSites';
import useHandleSSID, { ParamsGetSSID } from 'hooks/useHandleSSID';
import useHandleVLAN from 'hooks/useHandleVLAN';
import useHandleWLAN from 'hooks/useHandleWLAN';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { Add } from 'iconsax-react';
import pLimit from 'p-limit';
import { RootState, useSelector } from 'store';
import { NewSSID, OptionList, PMFMode, SSIDData, SSIDSecurityMode } from 'types';
import { getOption } from 'utils/handleData';
import { Spin } from 'antd';
import { useConfirmNavigation } from 'hooks/useConfirmNavigation';
// import dayjs from 'dayjs';

const SSIDManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<SSIDData | null>(null);
  const [recordDelete, setRecordDelete] = useState<SSIDData | null>(null);
  const [data, setData] = useState<SSIDData[]>([]);
  const [optionPartner, setOptionPartner] = useState<OptionList[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [optionDevice, setOptionDevice] = useState<OptionList[]>([]);
  const [optionWLAN, setOptionWLAN] = useState<
    {
      label: string | React.ReactNode;
      value: number | string;
    }[]
  >([]);
  const [optionVLAN, setOptionVLAN] = useState<OptionList[]>([]);

  const formikRef = useRef<FormikProps<any>>(null);
  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const siteIdAccess = user?.sites?.map((item) => item.site_id);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const [openNewGroup, setOpenNewGroup] = useState(false);
  const [selectedWLANId, setSelectedWLANId] = useState('');

  const [querySSID, setQuerySSID] = useState<ParamsGetSSID>({
    page: 1,
    pageSize: 50,
    startDate: null,
    endDate: null,
    filters: '',
    siteDataInput: JSON.stringify(siteIdAccess)
  });

  const intl = useIntl();
  const mountedRef = useRef(true);
  const { SSIDSchema } = useValidationSchemas();
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('ssid-list');

  const { fetchDataPartner } = useHandlePartner();
  const { fetchDataSites } = useHandleSite();
  const { fetchDataDevice } = useHandleDevice({});
  const {
    fetchDataSSID,
    handleAddSSID,
    handleDeleteSSID,
    handleEditSSID,
    handleRefreshSSID,
    isLoading,
    isRefresh,
    totalPages,
    totalResults
  } = useHandleSSID();
  const { fetchDataWLAN } = useHandleWLAN();
  const { fetchDataVLAN } = useHandleVLAN();

  const { ConfirmDialog } = useConfirmNavigation({
    when: isRefresh
  });

  const getDataSSID = async (params: ParamsGetSSID) => {
    try {
      const data = await fetchDataSSID({
        ...params
      });
      setData(data);
    } catch (error) {}
  };

  const getOptions = async (params: { page: number; pageSize: number; siteId: string }) => {
    const [dataPartner, dataDevice, dataSite, dataVLAN] = await Promise.all([
      fetchDataPartner({ ...params, type: 'devices' }),
      fetchDataDevice({ ...params }),
      fetchDataSites({ page: 1, pageSize: 20, regionDataInput: JSON.stringify(regionIdAccess) }),
      fetchDataVLAN({ ...params })
    ]);

    setOptionPartner(getOption(dataPartner, 'name', 'id'));
    setOptionDevice(getOption(dataDevice, 'name', 'id'));
    setOptionSite(getOption(dataSite, 'name', 'id'));
    setOptionVLAN(getOption(dataVLAN, 'name', 'vlan'));
  };

  const getWLANOptions = async (params: { page: number; pageSize: number }) => {
    const dataWLAN = await fetchDataWLAN({ ...params, siteDataInput: JSON.stringify(siteIdAccess) });
    const options =
      dataWLAN?.length > 0
        ? dataWLAN?.map((item) => {
            return {
              label: (
                <div className="flex items-center gap-2">
                  <span>{item?.name}</span>
                  {' - '}
                  <span className="font-medium text-blue-600">{item?.site?.name}</span>
                </div>
              ),
              value: item.wlan_hardware_id
            };
          })
        : [];
    setOptionWLAN(options);

    if (dataWLAN.length > 0) {
      const findDefaultWLAN = dataWLAN.find((item) => item.wlan_primary === 'true');
      if (findDefaultWLAN) {
        setSelectedWLANId(findDefaultWLAN.wlan_hardware_id);
      }
    }
  };

  useEffect(() => {
    if (selectedWLANId) {
      getDataSSID({ ...querySSID, wlanId: selectedWLANId });
    }

    if (mountedRef.current) {
      handleRefresh();
      mountedRef.current = false;
    }
    //eslint-disable-next-line
  }, [selectedWLANId, currentSite]);

  useEffect(() => {
    getWLANOptions({ page: 1, pageSize: 50 });
    getOptions({ page: 1, pageSize: 50, siteId: currentSite });
    return () => {};
  }, [currentSite]);

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setQuerySSID((prev) => ({ ...prev, page: newPageIndex + 1, pageSize: newPageSize }));
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleRowClick = (row: SSIDData) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteSSID({ id: recordDelete?.id }, isDelete);
    getDataSSID({ ...querySSID });
  };

  const handleRefresh = async () => {
    const fetchWlan = await fetchDataWLAN({
      page: 1,
      pageSize: 100,
      siteDataInput: JSON.stringify(siteIdAccess),
      siteId: currentSite
    });

    const limit = pLimit(5); // tối đa 5 task cùng lúc

    const tasks = fetchWlan.map((wlan) => limit(() => handleRefreshSSID(true, wlan.wlan_hardware_id)));

    await Promise.all(tasks);
    if (selectedWLANId) {
      getDataSSID({ ...querySSID, wlanId: selectedWLANId });
    }
  };

  const columns = useMemo(() => {
    return columnsSSID({
      currentPage: querySSID.page,
      pageSize: querySSID.pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      isHiddenView: true,
      canWrite
    });
    //eslint-disable-next-line
  }, [setRecord, querySSID.page, querySSID.pageSize]);

  console.log({ querySSID });

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: SSIDSchema,
    onSubmit: async (values: NewSSID) => {
      const handleAction = record ? handleEditSSID : handleAddSSID;
      const res = await handleAction({ ...values, id: values?.id });
      if (res.code === 0) {
        handleAdd();
        getDataSSID({ ...querySSID });
      }
    },
    enableReinitialize: true
  });

  const fieldsWithOptions = useMemo(() => {
    const { vlanEnable } = formik.values;

    return ssidFields
      .filter((field) => {
        if (field.name === 'vlanId' && vlanEnable !== 'true') return false;
        return true;
      })
      .map((field) => {
        if (field.name === 'partnerId') {
          return { ...field, options: optionPartner };
        }
        if (field.name === 'deviceId') {
          return { ...field, options: optionDevice };
        }
        if (field.name === 'siteId') {
          return { ...field, options: optionSite };
        }
        if (field.name === 'vlanId') {
          return { ...field, options: optionVLAN };
        }
        if (field.name === 'wlanId') {
          return { ...field, options: optionWLAN };
        }
        if (field.name === 'deviceType') {
          return {
            ...field,
            options: [
              { value: 0, label: intl.formatMessage({ id: 'none' }) },
              { value: 1, label: 'EAP' },
              { value: 3, label: 'EAP/Gateway' }
            ]
          };
        }
        if (field.name === 'security') {
          return {
            ...field,
            options: [
              { value: SSIDSecurityMode.None, label: intl.formatMessage({ id: 'security.none' }) },
              { value: SSIDSecurityMode.WPAEnterprise, label: intl.formatMessage({ id: 'security.wpa_enterprise' }) },
              { value: SSIDSecurityMode.WPAPersonal, label: intl.formatMessage({ id: 'security.wpa_personal' }) },
              { value: SSIDSecurityMode.PPSKWithoutRADIUS, label: intl.formatMessage({ id: 'security.ppsk_without_radius' }) },
              { value: SSIDSecurityMode.PPSKWithRADIUS, label: intl.formatMessage({ id: 'security.ppsk_with_radius' }) }
            ]
          };
        }
        if (field.name === 'pmfMode') {
          return {
            ...field,
            options: [
              { value: PMFMode.Mandatory, label: intl.formatMessage({ id: 'pmf_mode.mandatory' }) },
              { value: PMFMode.Capable, label: intl.formatMessage({ id: 'pmf_mode.capable' }) },
              { value: PMFMode.Disable, label: intl.formatMessage({ id: 'pmf_mode.disable' }) }
            ]
          };
        }
        return field;
      });
    //eslint-disable-next-line
  }, [optionSite, formik.values.vlanEnable]);

  console.log(fieldsWithOptions);

  const handleDateChange = (dates: any) => {
    if (!dates) {
      setQuerySSID((prev) => ({
        ...prev,
        startDate: null,
        endDate: null
      }));
    } else {
      setQuerySSID((prev) => ({
        ...prev,
        startDate: dates[0] ? dates[0].format('YYYY/MM/DD') : null,
        endDate: dates[1] ? dates[1].format('YYYY/MM/DD') : null
      }));
    }
  };

  const handleExternalSubmit = async () => {
    if (formikRef.current) {
      const values = formikRef.current.values;
      const handleAction = record ? handleEditSSID : handleAddSSID;
      const res = await handleAction({ ...values, wlanId: selectedWLANId, id: values?.id });
      if (res?.data?.code === 0) {
        handleAdd();
        getDataSSID({ ...querySSID });
      }
    }
  };

  const filterConfigs: FilterConfig[] = [
    {
      key: 'wlangroup',
      label: 'WLAN Group',
      type: 'select',
      value: selectedWLANId,
      onChange: (val: string | null) => {
        if (val === 'action') {
          setOpenNewGroup(true);
        } else {
          setSelectedWLANId(val ?? '');
        }
      },
      options: [
        ...optionWLAN.map((opt) => ({
          ...opt,
          value: String(opt.value)
        })),
        {
          value: 'action',
          label: (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#f0f9ff',
                color: '#0284c7',
                fontWeight: 500
              }}
            >
              <Add fontSize="small" style={{ marginRight: 6 }} />
              Create New Group
            </div>
          )
        }
      ]
      // action: {
      //   icon: <Add />,
      //   onClick: () => setOpenNewGroup(true),
      // },
    }
    // có thể thêm các filter khác ở đây
  ];

  const handleCloneWLAN = async (values: any) => {
    try {
      await wlanApi.create({ ...values, siteId: currentSite, clone: true });
      getWLANOptions({ page: 1, pageSize: 50 });
    } catch (error) {}
  };

  return (
    <MainCard content={false}>
      <ScrollX>
        <Spin spinning={isRefresh} tip={intl.formatMessage({ id: 'refreshing' })}>
          <GeneralizedTableV2
            scroll={{ y: 'calc(100dvh - 320px)' }}
            isLoading={isLoading}
            isLoadingRefresh={isRefresh}
            columns={columns}
            data={data}
            onAddNew={handleAdd}
            onPageChange={handlePageChange}
            currentPage={querySSID.page}
            totalResults={totalResults}
            totalPages={totalPages}
            onRowClick={handleRowClick}
            // searchFilter={setSearch}
            sortColumns="index"
            isDecrease={false}
            addButtonLabel={intl.formatMessage({ id: 'add-ssid' })}
            onRefresh={handleRefresh}
            buttonRefresh={intl.formatMessage({ id: 'refresh' })}
            onDateChange={handleDateChange}
            canWrite={canWrite}
            filterConfigs={filterConfigs}
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
        <DialogTitle className="text-base">
          {record ? intl.formatMessage({ id: 'edit-info-ssid' }) : intl.formatMessage({ id: 'add-ssid' })}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          <CreateWirelessForm formikRef={formikRef} ssid={record} />
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <Stack direction="row" spacing={2} alignItems="flex-end">
            <Button aria-hidden={false} color="error" onClick={handleAdd}>
              <FormattedMessage id="cancel" />
            </Button>

            <LoadingButton
              loading={formikRef.current?.isSubmitting}
              aria-hidden={false}
              type="submit"
              variant="contained"
              disabled={formikRef.current?.isSubmitting}
              onClick={handleExternalSubmit}
            >
              <FormattedMessage id={!!record ? 'edit' : 'confirm'} />
            </LoadingButton>
          </Stack>
        </DialogActions>
        {/* <Form
          title={record ? intl.formatMessage({ id: 'edit-info-ssid' }) : intl.formatMessage({ id: 'add-ssid' })}
          onCancel={handleAdd}
          fieldConfig={fieldsWithOptions}
          isEditMode={!!record}
          formik={formik}
        /> */}
        <ViewDialog title="ssid-info" open={openDialog} onClose={handleCloseView} data={record} config={ssidViewConfig} />
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-ssid"
            nameRecord={recordDelete.name}
            open={open}
            handleClose={handleClose}
            handleDelete={handleDelete}
          />
        )}
      </Dialog>

      {/* Dialog Form */}
      <Dialog open={openNewGroup} onClose={() => setOpenNewGroup(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New WLAN Group</DialogTitle>

        <Formik
          initialValues={{
            name: '',
            copyWLANs: true,
            clonedWlanId: ''
          }}
          onSubmit={(values, { resetForm }) => {
            console.log('New WLAN Group:', values);
            handleCloneWLAN(values);
            resetForm();
            setOpen(false);
          }}
        >
          {({ values, handleChange }) => (
            <Form>
              <DialogContent className="space-y-4">
                {/* NAME Input */}
                <TextField fullWidth label="Name" name="name" value={values.name} onChange={handleChange} />

                {/* Checkbox Copy WLANs
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.copyWLANs}
                      onChange={handleChange}
                      name="copyWLANs"
                    />
                  }
                  label="Copy All SSIDs from the WLAN Group"
                />

                {/* Select Group to Copy From */}
                {/* <FormControl fullWidth disabled={!values.copyWLANs}>
                  <InputLabel>Copy From</InputLabel>
                  <Select

                    name="clonedWlanId"
                    value={values.clonedWlanId}
                    label="Copy From"
                    onChange={handleChange}
                  >
                    {optionWLAN.map((group) => (
                      <MenuItem key={group.value} value={group.value}>
                        {group.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl> */}
              </DialogContent>

              {/* Buttons */}
              <DialogActions>
                <Button onClick={() => setOpenNewGroup(false)} color="secondary">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Save
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
      {ConfirmDialog}
    </MainCard>
  );
};

const getInitialValues = (ssid: SSIDData | null): NewSSID => {
  return {
    id: ssid?.id || 0,
    name: ssid?.name || '',
    type: ssid?.type || '',
    partnerId: ssid?.partner_id || 0,
    siteId: ssid?.site_id || '',
    deviceId: ssid?.device_id || '',
    deviceType: ssid?.device_type || 0,
    band: ssid?.band || 0,
    guestNetEnable: ssid?.guest_net_enable || 'false',
    security: ssid?.security || SSIDSecurityMode.None,
    broadcast: ssid?.broadcast || '',
    vlanEnable: ssid?.vlan_enable || 'false',
    vlanId: ssid?.vlan_id || undefined,
    mIoEnable: ssid?.mlo_enable || 'false',
    pmfMode: ssid?.pmf_mode || PMFMode.Disable,
    enable11r: ssid?.enable_11r || 'false',
    hidePwd: ssid?.hide_pwd || 'false',
    greEnable: ssid?.gre_enable || 'false',
    wlanId: ssid?.wlan_id || ''
  };
};

export default SSIDManagement;
