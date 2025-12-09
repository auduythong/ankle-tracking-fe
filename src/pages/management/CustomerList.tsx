import { useState, useEffect, useMemo } from 'react';
import useConfig from 'hooks/useConfig';

//project-import
import { PopupTransition } from 'components/@extended/Transitions';
import { Dialog } from '@mui/material';
import MainCard from 'components/MainCard';
import GeneralizedTable from 'components/organisms/GeneralizedTable';
import ScrollX from 'components/ScrollX';
import ViewDialog from 'components/template/ViewDialog';

//config
import { loginViewConfig } from 'components/ul-config/view-dialog-config';

//types
import { EndUserData } from 'types';
import { columnsAccessWifi } from 'components/ul-config/table-config';
import useHandleDataLogin from 'hooks/useHandleDataLogin';
import { RootState, useSelector } from 'store';

const CustomerList = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isInitial, setIsInitial] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds);

  const [record, setRecord] = useState<EndUserData | null>(null);
  // const [recordDelete, setRecordDelete] = useState<EndUserData | null>(null);
  const [data, setData] = useState<EndUserData[]>([]);
  const [search, setSearch] = useState('');

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { i18n } = useConfig();

  const { fetchDataLogin, isLoading, totalPages } = useHandleDataLogin();

  const getDataLogin = async (pageSize: number, pageIndex: number, currentSite: string, searchValue?: string) => {
    const dataLogin = await fetchDataLogin({
      page: pageIndex,
      pageSize,
      siteId: currentSite,
      filters: searchValue,
      adDataInput: JSON.stringify(currentAds)
    });
    setData(dataLogin);
  };

  useEffect(() => {
    getDataLogin(pageSize, pageIndex, currentSite, search);

    if (isInitial) {
      setIsInitial(false);
    }

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, isInitial, i18n, currentSite, search, currentAds]);

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

  const handleRowClick = (row: EndUserData) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  function setRecordDelete() {}

  const columns = useMemo(() => {
    return columnsAccessWifi(pageIndex, pageSize, handleAdd, handleClose, setRecord, setRecordDelete, true);
    //eslint-disable-next-line
  }, [setRecord, pageIndex, pageSize]);

  return (
    <MainCard content={false}>
      <ScrollX>
        <GeneralizedTable
          isLoading={isLoading}
          columns={columns}
          data={data}
          handleAdd={handleAdd}
          csvFilename="customer-list.csv"
          onPageChange={handlePageChange}
          totalPages={totalPages}
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
        <ViewDialog title="login-info" open={openDialog} onClose={handleCloseView} data={record} config={loginViewConfig} />
      </Dialog>
    </MainCard>
  );
};

export default CustomerList;
