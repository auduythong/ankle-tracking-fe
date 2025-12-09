// material-ui
import { Grid } from '@mui/material';
// import { PopupTransition } from 'components/@extended/Transitions';

// //Hook
// import { useEffect, useState, useMemo } from 'react';
// import { useParams } from 'react-router';
// import useConfig from 'hooks/useConfig';
// import { useIntl } from 'react-intl';

//third-party
// import { enqueueSnackbar } from 'notistack';

// project-imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
// import GeneralizedTable from 'components/organisms/GeneralizedTable';
// import FilterBar from 'pages/apps/profiles/common-components/FilterBar';
// import ViewDialog from 'components/template/ViewDialog';

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

const TabSession = () => {
  // // Activity Role User
  // const path = window.location.pathname;
  // const { activity } = useActivityCheck(path);
  // const [open, setOpen] = useState(false);
  // const [add, setAdd] = useState(false);
  // const [isReload, setIsReload] = useState<boolean>(false);
  // const [record, setRecord] = useState<any>();
  // const [openDialog, setOpenDialog] = useState(false);

  // const [dataDevice, setDataDevice] = useState<DeviceData[]>([]);
  // const [filters, setFilters] = useState();

  // const [pageIndex, setPageIndex] = useState(1);
  // const [pageSize, setPageSize] = useState(10);
  // const [totalPages, setTotalPages] = useState(0);
  // const [totalRecord, setTotalRecord] = useState(0);

  // const intl = useIntl();
  // const { tailNumber } = useParams();
  // const { i18n } = useConfig();
  // useLangUpdate(i18n);

  // async function getInstalledDevice(pageIndex: number, pageSize: number, tailNumber: string, filters: any) {
  //   try {
  //     const res = await getDevice(pageIndex, pageSize, tailNumber);
  //     if (res.code === 0) {
  //       setTotalPages(res.totalPages);
  //       setTotalRecord(res.total);
  //       const formattedDate = formatDate(res.data, ['activation_date', 'deactivation_date', 'manufacturer_date']);
  //       setDataDevice(formattedDate);
  //     } else {
  //       setDataDevice([]);
  //     }
  //   } catch (err) {
  //     enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), {
  //       variant: 'error'
  //     });
  //   }
  // }

  // const handlePageChange = (newPageIndex: number, newPageSize: number) => {
  //   setPageIndex(newPageIndex + 1);
  //   setPageSize(newPageSize);
  // };

  // const handleAdd = () => {
  //   setAdd(!add);
  //   if (record && !add) setRecord(null);
  // };

  // const handleClose = () => {
  //   setOpen(!open);
  // };

  // useEffect(() => {
  //   if (tailNumber) {
  //     getInstalledDevice(pageIndex, pageSize, tailNumber, filters);
  //   }
  //   if (isReload) {
  //     setIsReload(false);
  //   }
  //   //eslint-disable-next-line
  // }, [tailNumber, i18n, isReload, pageIndex, pageSize]);

  // const handleRowClick = (row: DeviceData) => {
  //   setRecord(row);
  //   setOpenDialog(true);
  // };

  // const handleCloseView = () => {
  //   setOpenDialog(false);
  //   setRecord(null);
  // };

  // const columns = useMemo(() => {
  //   const allColumns = columnsDevice(
  //     pageIndex,
  //     pageSize,
  //     activity,
  //     handleAdd,
  //     handleClose,
  //     undefined,
  //     undefined,
  //     undefined,
  //     handleRowClick,
  //     true
  //   );
  //   const excludeColumns = ['aircraft.tail_number', 'index', 'flight_phase'];
  //   return allColumns.filter((column) => !column.accessor || !excludeColumns.includes(column.accessor));
  //   //eslint-disable-next-line
  // }, [setRecord, activity]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {/* <FilterBar totalRecord={totalRecord} getFilterValues={setFilters} /> */}
      </Grid>
      <Grid item xs={12}>
        <MainCard content={false}>
          <ScrollX>
            {/* <GeneralizedTable
              activity={activity}
              isReload={isReload}
              columns={columns}
              data={dataDevice}
              handleAdd={handleAdd}
              onPageChange={handlePageChange}
              totalPages={totalPages}
              onRowClick={handleRowClick}
              sortColumns="index"
            /> */}
          </ScrollX>
          {/* <Dialog
            maxWidth="sm"
            TransitionComponent={PopupTransition}
            keepMounted
            fullWidth
            // onClose={handleAdd}
            // open={add}
            sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
            aria-describedby="alert-dialog-slide-description"
          >
            <ViewDialog title="device-info" config={deviceViewConfig} open={openDialog} onClose={handleCloseView} data={record} />
          </Dialog> */}
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default TabSession;
