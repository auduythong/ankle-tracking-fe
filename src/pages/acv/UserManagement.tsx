import { useState, useEffect, useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
// import { useNavigate } from 'react-router';
import useConfig from 'hooks/useConfig';

//project-import
import { PopupTransition } from 'components/@extended/Transitions';
import { Dialog } from '@mui/material';
import MainCard from 'components/MainCard';
import GeneralizedTable from 'components/organisms/GeneralizedTable';
import ScrollX from 'components/ScrollX';
import Form from 'components/template/Form';
import ViewDialog from 'components/template/ViewDialog';
import Alert from 'components/template/Alert';

//config
import { columnsEndUser } from 'components/ul-config/table-config';
import { endUserFields } from 'components/ul-config/form-config';
import { userViewConfig } from 'components/ul-config/view-dialog-config';

//third-party
import { enqueueSnackbar } from 'notistack';

//redux
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

//types
import { EndUserData, NewUser } from 'types';
import { useFormik } from 'formik';
import useValidationSchemas from 'hooks/useValidation';
import useHandleUser from 'hooks/acv/useHandleUser';

const UserManagement = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [add, setAdd] = useState<boolean>(false);
  const [isReload, setIsReload] = useState<boolean>(false);
  const [isInitial, setIsInitial] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<EndUserData | null>(null);
  const [recordDelete, setRecordDelete] = useState<EndUserData | null>(null);
  const [data, setData] = useState<EndUserData[]>([]);
  const [search, setSearch] = useState('');

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const intl = useIntl();
  //   const navigate = useNavigate();
  const { UserSchema } = useValidationSchemas();
  const { i18n } = useConfig();

  const { fetchData, handleAction, isLoading, totalPage } = useHandleUser();

  const getDataUser = async (pageSize: number, pageIndex: number, searchValue?: string) => {
    const dataUser = await fetchData(pageSize, pageIndex, 2, { filters: searchValue });
    setData(dataUser);
  };

  async function handleActionUser(data: NewUser) {
    const type = record ? 'edit' : 'add';
    try {
      const res = await handleAction(type, { id: data.id }, data);
      if (res.code === 0) {
        dispatch(
          openSnackbar({
            open: true,
            message: intl.formatMessage({ id: `${type}-admin-successfully` }),
            variant: 'alert',
            alert: {
              color: 'success'
            },
            close: false
          })
        );
        setIsReload(true);
      } else {
        if (res.data.code === -1 && res.data.message === 'Người dùng này đã tồn tại') {
          formik.setFieldError('username', intl.formatMessage({ id: 'duplicate-user' }));
        }
        enqueueSnackbar(record ? intl.formatMessage({ id: 'update-failed' }) : intl.formatMessage({ id: 'add-failed' }), {
          variant: 'error'
        });
        formik.setSubmitting(false);
      }
    } catch {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  }

  async function handleDelete(status: boolean) {
    try {
      if (status && recordDelete) {
        const res = await handleAction('delete', { id: recordDelete.id });
        return res.code;
      }
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    }
  }

  useEffect(() => {
    getDataUser(pageSize, pageIndex, search);

    if (isInitial) {
      setIsInitial(false);
    }

    if (isReload) {
      setIsReload(false);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, isReload, isInitial, i18n, search]);

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex + 1);
    setPageSize(newPageSize);
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const onViewClick = (row: EndUserData) => {
    // navigate(`/device/profile/${row.id}`);
  };

  const handleRowClick = (row: EndUserData) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const columns = useMemo(() => {
    return columnsEndUser(pageIndex, pageSize, handleAdd, handleClose, setRecord, setRecordDelete, onViewClick);
    //eslint-disable-next-line
  }, [setRecord, pageIndex, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: UserSchema,
    onSubmit: handleActionUser,
    enableReinitialize: true
  });

  return (
    <MainCard content={false}>
      <ScrollX>
        <GeneralizedTable
          isLoading={isLoading}
          isReload={isReload}
          columns={columns}
          data={data}
          handleAdd={handleAdd}
          csvFilename="admin-list.csv"
          addButtonLabel={<FormattedMessage id="add-user" />}
          onPageChange={handlePageChange}
          totalPages={totalPage}
          onRowClick={handleRowClick}
          searchFilter={setSearch}
          sortColumns="index"
          isDecrease={false}
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
          title={record ? intl.formatMessage({ id: 'edit-info-user' }) : intl.formatMessage({ id: 'add-user' })}
          onCancel={handleAdd}
          formik={formik}
          fieldConfig={endUserFields}
          isEditMode={!!record}
        />
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-user"
            nameRecord={recordDelete.username}
            open={open}
            handleClose={handleClose}
            handleDelete={handleDelete}
          />
        )}
        <ViewDialog title="user-info" open={openDialog} onClose={handleCloseView} data={record} config={userViewConfig} />
      </Dialog>
    </MainCard>
  );
};

export default UserManagement;

const getInitialValues = (endUser: EndUserData | null) => {
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
    userGroupIdLv3: endUser?.user_group_lv3 || []
  };
};
