import { useEffect, useState, useMemo } from 'react';
import useConfig from 'hooks/useConfig';

//third-party
import { enqueueSnackbar } from 'notistack';

// material-ui
import { Dialog } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';

// project-imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { PopupTransition } from 'components/@extended/Transitions';
import AddUser from './AddUser';
// import AddUserByStep from 'pages/apps/common-components/form/wizard/basic-wizard';
import AlertCustomerDelete from 'components/template/Alert';
import GeneralizedTable from 'components/organisms/GeneralizedTable';
import { columnsEndUser } from 'components/ul-config/table-config/user';

//model & utils
import { getEndUser, postAddUser, postDeleteUser, postEditEndUser } from './model';
import { useLangUpdate } from 'utils/handleData';

//redux
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';

//types
import { EndUserData, NewUser, EditUser } from 'types/end-user';
import { useNavigate } from 'react-router';
import ViewDialog from 'components/template/ViewDialog';
import { userViewConfig } from 'components/ul-config/view-dialog-config';

const ListEndUserPage = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [add, setAdd] = useState<boolean>(false);
  const [isReload, setIsReload] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchValue, setSearchValue] = useState<string>('');

  const [record, setRecord] = useState<EndUserData | null>(null);
  const [recordDelete, setRecordDelete] = useState<EndUserData | null>(null);
  const [data, setData] = useState<EndUserData[]>([]);

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const intl = useIntl();
  const { i18n } = useConfig();
  const navigate = useNavigate();
  useLangUpdate(i18n);

  const getData = async (pageIndex: number, pageSize: number, searchValue?: string) => {
    try {
      const res = await getEndUser(pageIndex, pageSize, searchValue);
      if (res.code === 0) {
        setTotalPages(res.totalPages);
        setData(res.data);
      } else {
        setTotalPages(0);
        setData([]);
      }
    } catch (err) {
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
        variant: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex + 1);
    setPageSize(newPageSize);
  };

  useEffect(() => {
    getData(pageIndex, pageSize, searchValue);
    //eslint-disable-next-line
  }, [pageIndex, pageSize, i18n, searchValue]);

  useEffect(() => {
    if (isReload) {
      getData(pageIndex, pageSize);
      setIsReload(false);
    }
    //eslint-disable-next-line
  }, [isReload]);

  async function handleAddRecord(newRecord: NewUser) {
    try {
      const res = await postAddUser(newRecord);
      setIsReload(true);
      return res;
    } catch (err) {
      return -1;
    }
  }

  async function handleDelete(status: boolean) {
    if (status && recordDelete) {
      try {
        const res = await postDeleteUser(recordDelete.id);

        if (res && res.code === 0) {
          dispatch(
            openSnackbar({
              open: true,
              message: intl.formatMessage({ id: 'delete-user-successfully' }),
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          );
          setIsReload(true);
        } else {
          enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
            variant: 'error'
          });
        }
      } catch (err) {
        enqueueSnackbar(intl.formatMessage({ id: 'delete-fail' }), {
          variant: 'error'
        });
      }
    }
  }

  const handleEdit = async (editedRecord: EditUser) => {
    try {
      const res = await postEditEndUser(editedRecord.id, editedRecord);
      setIsReload(true);
      return res;
    } catch (err) {
      return -1;
    }
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const onViewClick = (row: EndUserData) => {
    navigate(`/account/basic/${row.id}`);
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

  return (
    <MainCard content={false}>
      <ScrollX>
        <GeneralizedTable
          isLoading={isLoading}
          isReload={isReload}
          columns={columns}
          data={data}
          handleAdd={handleAdd}
          csvFilename="end-user-list.csv"
          addButtonLabel={<FormattedMessage id="add-end-user" />}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          sortColumns="index"
          onRowClick={handleRowClick}
          searchFilter={setSearchValue}
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
        {/* <AddUserByStep
          open={add}
          handleAdd={handleAddRecord}
          endUser={record}
          onCancel={handleAdd}
          handleEdit={handleEdit}
          roleOptions={roleOptions}
        /> */}
        <AddUser open={add} handleAdd={handleAddRecord} endUser={record} onCancel={handleAdd} handleEdit={handleEdit} />
        {recordDelete && (
          <AlertCustomerDelete
            alertDelete="alert-delete-user"
            nameRecord={recordDelete.username}
            open={open}
            handleClose={handleClose}
            handleDelete={handleDelete}
          />
        )}
        <ViewDialog title="user-info" config={userViewConfig} open={openDialog} onClose={handleCloseView} data={record} />
      </Dialog>
    </MainCard>
  );
};

export default ListEndUserPage;
