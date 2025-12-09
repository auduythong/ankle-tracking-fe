// pages/ListEndUserPage.tsx
import { Box, Tab, Tabs } from '@mui/material';
import MainCard from 'components/MainCard';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import ViewDialog from 'components/template/ViewDialog';
import { columnsEndUser } from 'components/ul-config/table-config/user';
import { userViewConfig } from 'components/ul-config/view-dialog-config';
import useConfig from 'hooks/useConfig';
import useHandleUser from 'hooks/useHandleUser';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { EndUserData } from 'types/end-user';
import { useLangUpdate } from 'utils/handleData';
import ResetPasswordForm from './ResetPassword';
import FormByStep from './step-form';

const ListEndUserPage = () => {
  const [activeTab, setActiveTab] = useState<1 | 2>(1); //1 Admin, 2 User

  // ==== STATE CHUNG ====
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [resetUser, setResetUser] = useState<EndUserData | null>(null);

  const [record, setRecord] = useState<EndUserData | null>(null);
  const [recordDelete, setRecordDelete] = useState<EndUserData | null>(null);
  const [data, setData] = useState<EndUserData[]>([]);
  const [searchValue, setSearchValue] = useState('');

  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { i18n } = useConfig();
  const intl = useIntl();
  useLangUpdate(i18n);

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('admin-management');

  const { fetchData, handleAction, isLoading, totalPage, totalResults, handleResetPassword, handleChangeStatus, isReload, setIsReload } =
    useHandleUser();

  // ==== FETCH DATA ====
  const getDataUser = async (pageSize: number, pageIndex: number, currentSite: string, searchValue?: string) => {
    const dataUser = await fetchData(pageSize, pageIndex, activeTab, {
      filters: searchValue,
      siteId: currentSite
    });
    setData(dataUser);
  };

  useEffect(() => {
    getDataUser(pageSize, page, currentSite, searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, currentSite, searchValue, i18n, isReload, activeTab]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  async function handleDelete(status: boolean) {
    try {
      if (status && recordDelete) {
        const res = await handleAction('delete', { id: recordDelete.id });

        getDataUser(pageSize, page, currentSite, searchValue);
        return res.code;
      }
    } catch (err) {
      // enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
      //   variant: 'error'
      // });
    }
  }

  const handleAdd = () => {
    setAdd(!add);

    if (record && add) setRecord(null);
  };

  const handleClose = () => {
    setOpen(!open);
    setRecord(null);
  };

  const handleResetPasswordClick = (user: EndUserData) => {
    setResetUser(user);
    setOpenResetDialog(true);
  };

  const handleResetSubmit = async (data: any) => {
    await handleResetPassword(data);
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsEndUser(
      page,
      pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      undefined,
      true,
      handleResetPasswordClick,
      canWrite,
      handleChangeStatus
    );
    // eslint-disable-next-line
  }, [setRecord, page, pageSize, activeTab]);

  const handleRowClick = (row: EndUserData) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  return (
    <MainCard content={false}>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => {
            setActiveTab(val);
            setPage(1);
            setIsReload((prev) => !prev); // reload khi đổi tab
          }}
        >
          <Tab value={1} label={<FormattedMessage id="admin" />} />
          <Tab value={2} label={<FormattedMessage id="user" />} />
        </Tabs>
      </Box>

      <ScrollX>
        <GeneralizedTableV2
          scroll={{ y: 'calc(100dvh - 380px)' }}
          isLoading={isLoading}
          isReload={isReload}
          columns={columns}
          data={data}
          onAddNew={handleAdd}
          addButtonLabel={activeTab === 1 ? intl.formatMessage({ id: 'add-admin' }) : intl.formatMessage({ id: 'add-user' })}
          totalResults={totalResults}
          totalPages={totalPage}
          size={pageSize}
          currentPage={page}
          onPageChange={handlePageChange}
          sortColumns="index"
          onRowClick={handleRowClick}
          onSearch={setSearchValue}
          canWrite={canWrite}
        />
      </ScrollX>

      {/* Dialogs */}
      <FormByStep
        onSubmitOk={() => getDataUser(pageSize, page, currentSite, searchValue)}
        tab={activeTab}
        open={add}
        onClose={handleAdd}
        record={record}
        isReload={setIsReload}
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

      <ViewDialog title="user-info" config={userViewConfig} open={openDialog} onClose={handleCloseView} data={record} />

      {resetUser && (
        <ResetPasswordForm
          open={openResetDialog}
          onClose={() => setOpenResetDialog(false)}
          onSubmit={handleResetSubmit}
          username={resetUser.username}
          email={resetUser.email}
        />
      )}
    </MainCard>
  );
};

export default ListEndUserPage;
