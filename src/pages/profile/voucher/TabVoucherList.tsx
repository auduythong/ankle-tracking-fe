// material-ui
import { Grid } from '@mui/material';
// import { PopupTransition } from 'components/@extended/Transitions';

// //Hook
import useConfig from 'hooks/useConfig';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
// import { useIntl } from 'react-intl';

//third-party
// import { enqueueSnackbar } from 'notistack';

// project-imports
import MainCard from 'components/MainCard';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import ScrollX from 'components/ScrollX';
import ViewDialog from 'components/template/ViewDialog';
import { columnsVoucher } from 'components/ul-config/table-config';
import { deviceViewConfig } from 'components/ul-config/view-dialog-config';
import useHandleVouchersGroup from 'hooks/useHandleVouchers';
import { Voucher } from 'types/voucher';
// //config
// import { columnsDevice } from 'components/ul-config/table-config/devices';
// import { deviceViewConfig } from 'components/ul-config/view-dialog-config';

// //utils
// import { formatDate, useLangUpdate } from 'utils/handleData';

// //model
// import { getDevice } from './model';

// //types
// import { DeviceData } from 'types/device';
// import { useActivityCheck } from 'hooks/useActivityCheck';

const TabVoucherList = () => {
  // // Activity Role User

  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState<boolean>(false);
  const [record, setRecord] = useState<any>();
  const [openDialog, setOpenDialog] = useState(false);

  const [dataVouchers, setDataVouchers] = useState<any>([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // const [totalPages, setTotalPages] = useState(0);
  // const [totalRecord, setTotalRecord] = useState(0);

  // const intl = useIntl();
  const { id } = useParams();
  const { i18n } = useConfig();
  // useLangUpdate(i18n);

  const { fetchVoucherList, totalPages, totalResults, isLoading } = useHandleVouchersGroup({});

  const getVoucherList = async (id: number) => {
    const dataVouchers = await fetchVoucherList({ page, pageSize, voucherId: id });
    setDataVouchers(dataVouchers || []);
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  useEffect(() => {
    if (id) {
      getVoucherList(Number(id));
    }
    if (isReload) {
      setIsReload(false);
    }
    //eslint-disable-next-line
  }, [id, i18n, isReload, page, pageSize]);

  const handleRowClick = (row: Voucher) => {
    setRecord(row);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };

  const columns: any = useMemo(() => {
    return columnsVoucher({
      currentPage: page,
      pageSize,
      handleAdd,
      handleClose,
      setRecordDelete(record) {},
      setViewRecord(record) {},
      setRecord
    });
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard content={false}>
          <ScrollX>
            <GeneralizedTableV2
              isLoading={isLoading}
              isReload={isReload}
              columns={columns}
              data={dataVouchers}
              onAddNew={handleAdd}
              onPageChange={handlePageChange}
              totalPages={totalPages}
              totalResults={totalResults}
              size={pageSize}
              currentPage={page}
              onRowClick={handleRowClick}
              sortColumns="index"
            />
          </ScrollX>
        </MainCard>
      </Grid>
      <ViewDialog title="device-info" open={openDialog} onClose={handleCloseView} data={record} config={deviceViewConfig} />
    </Grid>
  );
};

export default TabVoucherList;
