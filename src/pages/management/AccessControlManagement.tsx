import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Pagination,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { Spin } from 'antd';
import { accessControlApi } from 'api/accessControl.api';
import LoadingButton from 'components/@extended/LoadingButton';

import MainCard from 'components/MainCard';
import IPInput from 'components/molecules/input/IPInput';
import MACInput from 'components/molecules/input/MACInput';

import GeneralizedTable from 'components/organisms/GeneralizedTable';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import { getColumnsAccess, getColumnsFree, renderAccessControlInfo } from 'components/ul-config/table-config/accessControl';
import { Field, FieldArray, Form, Formik } from 'formik';
import useHandleAccessControl from 'hooks/useHandleAccessControl';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { Add, CloseCircle, InfoCircle, Refresh, Trash } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { AccessControlData, AccessControlType, AccessPolicy } from 'types/access-control';
import { domainRegex, ipRegex } from 'utils/regex';
import * as Yup from 'yup';

export const AccessControlTypeLabels: Record<AccessControlType, string> = {
  [AccessControlType.IpRange]: 'IP Range',
  [AccessControlType.Url]: 'URL',
  [AccessControlType.ClientIp]: 'Client IP',
  [AccessControlType.ClientMac]: 'Client MAC'
};

export const AccessControlTypeOptions = {
  policy: [AccessControlType.IpRange, AccessControlType.Url],
  client: [AccessControlType.ClientIp, AccessControlType.ClientMac]
};

const AccessControlManagement = () => {
  const [preAuthEnabled, setPreAuthEnabled] = useState(false);
  const [authFreeEnabled, setAuthFreeEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'policy' | 'client'>('policy'); // Track modal type
  const [pageSize] = useState(10);

  const [isApplying, setIsApplying] = useState(false);

  const user = useSelector((state: RootState) => state.authSlice.user);
  const siteIdAccess = user?.sites?.map((item) => item.site_id);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const [localAccessControl, setLocalAccessControl] = useState<Partial<AccessControlData>>();
  const [recordDelete, setRecordDelete] = useState<AccessPolicy | null>(null);

  const [pagePolicy, setPagePolicy] = useState(1);
  const [pageClient, setPageClient] = useState(1);

  const intl = useIntl();

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('access-control-management');

  const { accessControl, refreshAccessControl, fetchAccessControl, loadingRefreshAccessControl, loadingAccessControl } =
    useHandleAccessControl({
      initQuery: {
        page: 1,
        pageSize: pageSize,
        siteDataInput: JSON.stringify(siteIdAccess),
        siteId: currentSite
      }
    });

  useEffect(() => {
    fetchAccessControl();
    refreshAccessControl();
  }, [currentSite]);

  useEffect(() => {
    if (accessControl) {
      setPreAuthEnabled(accessControl.pre_auth_access_enable === 'true');
      setAuthFreeEnabled(accessControl.pre_auth_client_enable === 'true');
      setLocalAccessControl(accessControl);
    }

    return () => {};
  }, [accessControl]);

  const handleAddEntry = (values: any, actions: any) => {
    debugger;
    try {
      // Prepare data for state update
      const newEntries = values.entries.map((entry: any) => ({
        id: Date.now() + Math.random(), // Generate unique ID
        access_control_id: localAccessControl?.id,
        id_int: Math.floor(Math.random() * 1000000000), // Generate random id_int
        type: entry.type,
        ip: entry.ip,
        subnet_mask: parseInt(entry.subnet_mask),
        url: entry.type == AccessControlType.Url ? entry.url : null,
        client_ip: entry.client_ip,
        client_mac: entry.client_mac
      }));

      // Update local state based on modal type
      if (modalType === 'policy') {
        // Update access_policies
        setLocalAccessControl((prev) => ({
          ...prev,
          access_policies: [...(prev?.access_policies || []), ...newEntries]
        }));
      } else {
        // Update access_clients
        setLocalAccessControl((prev) => ({
          ...prev,
          access_clients: [...(prev?.access_clients || []), ...newEntries]
        }));
      }

      actions.resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error adding entries:', error);
    } finally {
    }
  };

  const handleApply = async () => {
    setIsApplying(true);

    const preAuthAccessPolicies = (localAccessControl?.access_policies || []).map((item) => ({
      type: item.type,
      ...(item.type === AccessControlType.IpRange && { ip: item.ip, subnetMask: item.subnet_mask }),
      ...(item.type === AccessControlType.Url && { url: item.url })
    }));

    const freeAuthClientPolicies = (localAccessControl?.access_clients || []).map((item) => ({
      type: item.type,
      ...(item.type === AccessControlType.ClientIp && { clientIp: item.client_ip }),
      ...(item.type === AccessControlType.ClientMac && { clientMac: item.client_mac })
    }));

    try {
      // Prepare data for API submission
      const payload = {
        id: accessControl?.id,
        preAuthAccessEnable: preAuthEnabled.toString(),
        freeAuthClientEnable: authFreeEnabled.toString(),
        preAuthAccessPolicies: preAuthAccessPolicies?.length > 0 ? preAuthAccessPolicies : [],
        freeAuthClientPolicies: freeAuthClientPolicies.length > 0 ? freeAuthClientPolicies : []
      };

      // Submit to API
      await accessControlApi.update({ id: accessControl?.id }, payload);

      // Refresh data
      // await fetchAccessControl();
    } catch (error) {
      console.error('Error applying settings:', error);
    } finally {
      setIsApplying(false);
      enqueueSnackbar(intl.formatMessage({ id: 'apply-access-control-success' }), {
        variant: 'success'
      });
    }
  };

  const handleCancel = () => {
    // Reset to original values from API
    if (accessControl) {
      setPreAuthEnabled(accessControl.pre_auth_access_enable === 'true');
      setAuthFreeEnabled(accessControl.pre_auth_client_enable === 'true');
    }
  };

  const handleOpenModal = (type: 'policy' | 'client') => {
    setModalType(type);
    setShowModal(true);
  };

  const columnsAccess: any = useMemo(() => {
    return getColumnsAccess({
      currentPage: pagePolicy,
      pageSize,
      handleAdd: () => '',
      handleClose: () => '',
      setRecordDelete,
      canWrite
    });
  }, [pagePolicy, pageSize]);

  const columnsFree: any = useMemo(() => {
    return getColumnsFree({
      currentPage: pageClient,
      pageSize,
      handleAdd: () => '',
      handleClose: () => '',
      setRecordDelete,
      canWrite
    });
  }, [pageClient, pageSize]);

  const getModalTitle = () => {
    return modalType === 'policy'
      ? intl.formatMessage({ id: 'add-pre-authentication-entry' })
      : intl.formatMessage({ id: 'add-authentication-free-client-entry' });
  };

  const getValidationSchema = () => {
    return Yup.object({
      entries: Yup.array().of(
        Yup.object({
          type: Yup.string().required('Type is required'),
          ip: Yup.string().when('type', {
            is: (val: AccessControlType) => val == AccessControlType.IpRange,
            then: (schema) =>
              schema
                .required('IP address is required')
                .matches(ipRegex, 'Invalid IP address')
                .test('is-valid-ip', 'Each octet must be between 0 and 255', (value) => {
                  if (!value) return false;
                  return value.split('.').every((part) => {
                    const num = Number(part);
                    return num >= 0 && num <= 255;
                  });
                }),
            otherwise: (schema) => schema.notRequired()
          }),
          subnet_mask: Yup.number().when('type', {
            is: (val: AccessControlType) => val == AccessControlType.IpRange,
            then: (schema) =>
              schema.required('Subnet is required').min(0, 'Subnet must be between 0 and 32').max(32, 'Subnet must be between 0 and 32'),
            otherwise: (schema) => schema.notRequired()
          }),
          url: Yup.string().when('type', {
            is: (val: AccessControlType) => val == AccessControlType.Url,
            then: (schema) => schema.required('URL is required').matches(domainRegex, 'Invalid URL format'),
            otherwise: (schema) => schema.notRequired()
          })
        })
      )
    });
  };

  const handleDelete = (record: AccessPolicy) => {
    setLocalAccessControl((prev) => {
      if (!prev) return prev;

      if (record.type === AccessControlType.IpRange || record.type === AccessControlType.Url) {
        const newPolicies = prev.access_policies?.filter((item) => item.id !== record.id) || [];
        const newTotalPages = Math.ceil(newPolicies.length / pageSize);

        // Nếu đang ở trang vượt quá tổng số trang mới sau khi xóa → lùi lại 1 trang
        if (pagePolicy > newTotalPages && newTotalPages > 0) {
          setPagePolicy(newTotalPages);
        }

        return {
          ...prev,
          access_policies: newPolicies
        };
      } else {
        const newClients = prev.access_clients?.filter((item) => item.id !== record.id) || [];
        const newTotalPages = Math.ceil(newClients.length / pageSize);

        if (pageClient > newTotalPages && newTotalPages > 0) {
          setPageClient(newTotalPages);
        }

        return {
          ...prev,
          access_clients: newClients
        };
      }
    });
  };

  const policies = useMemo(() => localAccessControl?.access_policies || [], [localAccessControl?.access_policies]);
  const clients = useMemo(() => localAccessControl?.access_clients || [], [localAccessControl?.access_clients]);

  // Memo hóa phân trang access_policies
  const { paginatedPolicies, totalPagesPolicies } = useMemo(() => {
    const total = policies.length;
    const totalPages = Math.ceil(total / pageSize);
    const sliced = policies.slice((pagePolicy - 1) * pageSize, pagePolicy * pageSize);
    return {
      paginatedPolicies: sliced,
      totalPolicies: total,
      totalPagesPolicies: totalPages
    };
  }, [policies, pagePolicy]);

  // Memo hóa phân trang access_clients
  const { paginatedClients, totalPagesClients } = useMemo(() => {
    const total = clients.length;
    const totalPages = Math.ceil(total / pageSize);
    const sliced = clients.slice((pageClient - 1) * pageSize, pageClient * pageSize);
    return {
      paginatedClients: sliced,
      totalClients: total,
      totalPagesClients: totalPages
    };
  }, [clients, pageClient]);

  return (
    <Spin spinning={loadingAccessControl}>
      <MainCard content={false} className="p-5">
        {/* Pre-Authentication Access */}
        <Box className="flex items-center justify-between gap-2">
          <Box className="flex items-center gap-2">
            <FormControlLabel
              disabled={!canWrite}
              control={<Checkbox checked={preAuthEnabled} onChange={(e) => setPreAuthEnabled(e.target.checked)} />}
              label={intl.formatMessage({ id: 'enable-pre-authentication-access' })}
            />
            <Tooltip title={intl.formatMessage({ id: 'with-pre-authentication-access-enabled' })} placement="right">
              <InfoCircle size="18" style={{ marginLeft: 8 }} variant="Outline" color="#888" />
            </Tooltip>
          </Box>
          <Box className="flex justify-end">
            <LoadingButton
              loading={loadingRefreshAccessControl}
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refreshAccessControl}
              size="small"
              className="justify-end !py-[3px]"
            >
              {intl.formatMessage({ id: 'refresh' })}
            </LoadingButton>
          </Box>
        </Box>

        {/* Access List Table */}
        {preAuthEnabled && (
          <>
            <Box display="flex" justifyContent="space-between" mb={1} mt={2}>
              <Typography variant="h6">{intl.formatMessage({ id: 'pre-authentication-access-list' })}</Typography>
              <Button disabled={!canWrite} startIcon={<Add />} variant="contained" onClick={() => handleOpenModal('policy')}>
                {intl.formatMessage({ id: 'add' })}
              </Button>
            </Box>

            <ScrollX>
              <GeneralizedTableV2
                hiddenFilter
                columns={columnsAccess}
                data={paginatedPolicies}
                sortColumns="index"
                isDecrease={false}
                hiddenPagination
                currentPage={0}
              />
              <Pagination
                count={totalPagesPolicies}
                page={pagePolicy}
                onChange={(_, value) => setPagePolicy(value)}
                color="primary"
                variant="combined"
                showFirstButton
                showLastButton
                className="flex justify-end mt-3"
              />
            </ScrollX>
          </>
        )}

        {/* Authentication-Free */}
        <Box className="flex items-center gap-2">
          <FormControlLabel
            disabled={!canWrite}
            control={<Checkbox checked={authFreeEnabled} onChange={(e) => setAuthFreeEnabled(e.target.checked)} />}
            label={intl.formatMessage({ id: 'enable-authentication-free-client' })}
          />
          <Tooltip title={intl.formatMessage({ id: 'with-authentication-free-client-enabled' })} placement="right">
            <InfoCircle size="18" style={{ marginLeft: 8 }} variant="Outline" color="#888" />
          </Tooltip>
        </Box>

        {/* Auth List Table */}
        {authFreeEnabled && (
          <>
            <Box display="flex" justifyContent="space-between" mb={1} mt={2}>
              <Typography variant="h6">{intl.formatMessage({ id: 'authentication-free-client-list' })}</Typography>
              <Button disabled={!canWrite} startIcon={<Add />} variant="contained" onClick={() => handleOpenModal('client')}>
                {intl.formatMessage({ id: 'add' })}
              </Button>
            </Box>

            <ScrollX>
              <GeneralizedTable columns={columnsFree} data={paginatedClients} sortColumns="index" hiddenPagination />
              <Pagination
                count={totalPagesClients}
                page={pageClient}
                onChange={(_, value) => setPageClient(value)}
                color="primary"
                variant="combined"
                showFirstButton
                showLastButton
                className="flex justify-end mt-3"
              />
            </ScrollX>
          </>
        )}

        {/* Action Buttons */}
        <Box display="flex" gap={2} justifyContent={'start'} mt={3}>
          <Button variant="contained" onClick={handleApply} disabled={isApplying || !canWrite}>
            {isApplying ? intl.formatMessage({ id: 'applying' }) : intl.formatMessage({ id: 'apply' })}
          </Button>
          <Button variant="outlined" color="inherit" onClick={handleCancel} disabled={isApplying || !canWrite}>
            {intl.formatMessage({ id: 'cancel' })}
          </Button>
        </Box>

        {/* Modal */}
        <Dialog open={showModal} onClose={() => setShowModal(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            {getModalTitle()}
            <IconButton onClick={() => setShowModal(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
              <CloseCircle size="20" />
            </IconButton>
          </DialogTitle>

          <Formik
            initialValues={{
              entries: [
                {
                  type: modalType == 'policy' ? AccessControlType.IpRange : AccessControlType.ClientIp,
                  ip: '',
                  subnet_mask: '',
                  url: '',
                  client_ip: '',
                  client_mac: ''
                }
              ]
            }}
            validationSchema={getValidationSchema()}
            onSubmit={handleAddEntry}
          >
            {({ values, errors, touched, handleChange, isSubmitting }) => (
              <Form>
                <DialogContent dividers>
                  <FieldArray name="entries">
                    {({ push, remove }) => (
                      <Box display="flex" flexDirection="column" gap={2} mt={2}>
                        {values.entries.map((entry, index) => {
                          const entryTouched = touched.entries?.[index];
                          const entryError = errors.entries?.[index];
                          const isEntryErrorObject = typeof entryError === 'object' && entryError !== null;

                          return (
                            <div className="flex items-center gap-2">
                              <Grid container spacing={2} key={index} alignItems="start" className="flex-1">
                                <Grid item xs={12} sm={3}>
                                  <TextField
                                    select
                                    label="Type"
                                    name={`entries[${index}].type`}
                                    value={entry.type}
                                    onChange={handleChange}
                                    fullWidth
                                  >
                                    {AccessControlTypeOptions[modalType].map((type) => (
                                      <MenuItem key={type} value={type}>
                                        {AccessControlTypeLabels[type]}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>

                                {entry.type === AccessControlType.IpRange && (
                                  <Grid item xs={12} sm={9} className="flex flex-nowrap items-center gap-2">
                                    <Field name={`entries[${index}].ip`}>
                                      {({ field, form }: any) => (
                                        <div className="flex flex-col">
                                          <IPInput value={field.value} onChange={(val) => form.setFieldValue(field.name, val)} />
                                          {form.errors.entries?.[index]?.ip && form.touched.entries?.[index]?.ip && (
                                            <FormHelperText error>{form.errors.entries[index]?.ip}</FormHelperText>
                                          )}
                                        </div>
                                      )}
                                    </Field>
                                    <Typography variant="h6">/</Typography>
                                    <TextField
                                      label="Subnet"
                                      name={`entries[${index}].subnet_mask`}
                                      value={entry.subnet_mask}
                                      onChange={handleChange}
                                      error={entryTouched?.subnet_mask && isEntryErrorObject && Boolean(entryError?.subnet_mask)}
                                      helperText={entryTouched?.subnet_mask && isEntryErrorObject && entryError?.subnet_mask}
                                      fullWidth
                                    />
                                  </Grid>
                                )}

                                {entry.type === AccessControlType.ClientMac && (
                                  <Grid item xs={12} sm={9}>
                                    <Field name={`entries[${index}].client_mac`}>
                                      {({ field, form }: any) => (
                                        <div className="flex flex-col">
                                          <MACInput value={field.value} onChange={(val) => form.setFieldValue(field.name, val)} />
                                          {form.errors.entries?.[index]?.client_mac && form.touched.entries?.[index]?.client_mac && (
                                            <FormHelperText error>{form.errors.entries[index]?.client_mac}</FormHelperText>
                                          )}
                                        </div>
                                      )}
                                    </Field>
                                  </Grid>
                                )}
                                {entry.type === AccessControlType.ClientIp && (
                                  <Grid item xs={12} sm={9}>
                                    <Field name={`entries[${index}].client_ip`}>
                                      {({ field, form }: any) => (
                                        <div className="flex flex-col">
                                          <IPInput value={field.value} onChange={(val) => form.setFieldValue(field.name, val)} />
                                          {form.errors.entries?.[index]?.client_ip && form.touched.entries?.[index]?.client_ip && (
                                            <FormHelperText error>{form.errors.entries[index]?.client_ip}</FormHelperText>
                                          )}
                                        </div>
                                      )}
                                    </Field>
                                  </Grid>
                                )}

                                {entry.type === AccessControlType.Url && (
                                  <Grid item xs={12} sm={9}>
                                    <TextField
                                      InputProps={{ startAdornment: 'https://' }}
                                      label="URL"
                                      name={`entries[${index}].url`}
                                      value={entry.url}
                                      onChange={handleChange}
                                      error={entryTouched?.url && isEntryErrorObject && Boolean(entryError?.url)}
                                      helperText={entryTouched?.url && isEntryErrorObject && entryError?.url}
                                      fullWidth
                                    />
                                  </Grid>
                                )}
                              </Grid>

                              {values.entries.length > 1 && (
                                <div className="w-[50px]">
                                  <IconButton color="error" onClick={() => remove(index)}>
                                    <Trash />
                                  </IconButton>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <Button
                          onClick={() =>
                            push({
                              type: modalType == 'policy' ? AccessControlType.IpRange : AccessControlType.ClientIp,
                              ip: '',
                              subnet_mask: '',
                              url: '',
                              client_ip: '',
                              client_mac: ''
                            })
                          }
                          color="primary"
                          startIcon={<span>＋</span>}
                        >
                          {intl.formatMessage(
                            { id: 'add-new-entry' },
                            {
                              type: intl.formatMessage({
                                id: modalType === 'policy' ? 'pre-authentication-access' : 'authentication-free-client'
                              })
                            }
                          )}
                        </Button>
                      </Box>
                    )}
                  </FieldArray>
                </DialogContent>

                <DialogActions>
                  <Button onClick={() => setShowModal(false)} disabled={isSubmitting}>
                    {intl.formatMessage({ id: 'cancel' })}
                  </Button>
                  <Button type="submit" disabled={isSubmitting} variant="contained">
                    {isSubmitting ? 'Saving...' : intl.formatMessage({ id: 'save' })}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </Dialog>
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-access-control"
            nameRecord={renderAccessControlInfo(recordDelete)}
            open={true}
            handleClose={() => setRecordDelete(null)}
            handleDelete={() => handleDelete(recordDelete)}
          />
        )}
      </MainCard>
    </Spin>
  );
};

export default AccessControlManagement;
