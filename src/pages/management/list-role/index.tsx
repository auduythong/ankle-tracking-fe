import { useEffect, useState, useMemo } from 'react';
import useConfig from 'hooks/useConfig';
import { getOption, useLangUpdate } from 'utils/handleData';
import { FormattedMessage, useIntl } from 'react-intl';
import useMapCode from 'hooks/useMapCode';
//third-party
import { enqueueSnackbar } from 'notistack';
// import { Row } from 'react-table';

// project-imports
import { Dialog } from '@mui/material';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { PopupTransition } from 'components/@extended/Transitions';
// import RoleView from './RoleView';
import AddRole from './AddRole';
import GeneralizedTable from 'components/organisms/GeneralizedTable';
import { columnsRole } from 'components/ul-config/table-config/user';
import Alert from 'components/template/Alert';

//model
import { postAddRole, postDeleteRole, postEditRole } from './model';

//types
import { RoleData, NewRole } from 'types/end-user';

//redux
import { dispatch } from 'store';
import { openSnackbar } from 'store/reducers/snackbar';
import { OptionList } from 'types/general';
import useHandlePermission from 'hooks/useHandlePermission';

const ListRolePage = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [add, setAdd] = useState<boolean>(false);
  const [isReload, setIsReload] = useState<boolean>(false);

  const [record, setRecord] = useState<RoleData | null>(null);
  const [recordDelete, setRecordDelete] = useState<RoleData | null>(null);
  const [data, setData] = useState<RoleData[]>([]);
  const [permissionLevel2, setPermissionLevel2] = useState<OptionList[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { getStatusMessage } = useMapCode();

  const intl = useIntl();
  const { i18n } = useConfig();
  const { isLoading, fetchDataPermission, totalPages } = useHandlePermission();
  useLangUpdate(i18n);

  const getData = async (pageIndex: number, pageSize: number, searchValue?: string) => {
    const dataRoleLv1 = await fetchDataPermission({ page: pageIndex, pageSize, level: 1, filters: searchValue });
    const dataRoleLv2 = await fetchDataPermission({ page: pageIndex, pageSize: 100, level: 2 });
    setData(dataRoleLv1);
    setPermissionLevel2(getOption(dataRoleLv2, 'title', 'id'));
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
      setSearchValue('');
    }
    //eslint-disable-next-line
  }, [isReload]);

  async function handleAddRecord(newRecord: NewRole) {
    try {
      const res = await postAddRole(newRecord);
      setIsReload(true);
      return res;
    } catch (err) {
      return -1;
    }
  }

  async function handleDelete(status: boolean) {
    if (status && recordDelete) {
      try {
        const res = await postDeleteRole(recordDelete.id);
        if (res && res.code === 0) {
          dispatch(
            openSnackbar({
              open: true,
              message: intl.formatMessage({ id: 'delete-role-successfully' }),
              variant: 'alert',
              alert: {
                color: 'success'
              },
              close: false
            })
          );
          setIsReload(true);
        } else {
          enqueueSnackbar(getStatusMessage('general', res.code), {
            variant: 'error'
          });
        }
      } catch (err) {
        enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
          variant: 'error'
        });
      }
    }
  }

  async function handleEdit(editedRecord: NewRole) {
    try {
      const res = await postEditRole(editedRecord.id, editedRecord);
      setIsReload(true);
      return res;
    } catch (err) {
      return -1;
    }
  }

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const columns = useMemo(() => {
    return columnsRole(pageIndex, pageSize, handleAdd, handleClose, setRecord, setRecordDelete);
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
          csvFilename="role-list.csv"
          addButtonLabel={<FormattedMessage id="add-role" />}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          sortColumns="index"
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
        <AddRole
          open={add}
          record={record}
          onCancel={handleAdd}
          handleAdd={handleAddRecord}
          handleEdit={handleEdit}
          permissionLevel2={permissionLevel2}
        />
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-role"
            nameRecord={recordDelete.title}
            open={open}
            handleClose={handleClose}
            handleDelete={handleDelete}
          />
        )}
      </Dialog>
    </MainCard>
  );
};

export default ListRolePage;
