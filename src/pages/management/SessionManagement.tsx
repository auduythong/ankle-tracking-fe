import useConfig from 'hooks/useConfig';
import { useEffect, useMemo, useState } from 'react';

//project-import
import { Dialog, Grid, useMediaQuery } from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import ViewDialog from 'components/template/ViewDialog';

//config
import { DatePicker } from 'antd';
import { sessionViewConfig } from 'components/ul-config/view-dialog-config';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
//types
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import { columnsSession } from 'components/ul-config/table-config';
import useHandleSession from 'hooks/useHandleSession';
import { useIntl } from 'react-intl';
import { EndUserData } from 'types';
import { GlobalFilter } from 'utils/react-table';
import { getDatePresets } from 'utils/datePresets';

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;

interface FilterValue {
  start_date: string | Date | null;
  end_date: string | Date | null;
}

const SessionManagement = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [add, setAdd] = useState<boolean>(false);
  const [isInitial, setIsInitial] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<EndUserData | null>(null);
  const [recordDelete, setRecordDelete] = useState<EndUserData | null>(null);
  const [data, setData] = useState<EndUserData[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filterValue, setFilterValue] = useState<FilterValue>({
    start_date: dayjs().subtract(15, 'day').startOf('day').toISOString(),
    end_date: dayjs().endOf('day').toISOString()
  });

  const { i18n } = useConfig();

  const intl = useIntl();

  const { fetchDataSession, isLoading, totalPage, totalResults } = useHandleSession();

  const handleDateChange = (dates: any) => {
    if (dates) {
      const start_date = dates[0]?.format('YYYY/MM/DD');
      const end_date = dates[1]?.format('YYYY/MM/DD');

      setFilterValue({ start_date, end_date });
    }
  };

  const getDataUser = async (
    pageSize: number,
    pageIndex: number,
    searchValue?: string,
    startDate?: string | Date | null,
    endDate?: string | Date | null
  ) => {
    const dataUser = await fetchDataSession({ page: pageIndex, pageSize, filters: searchValue, startDate: startDate, endDate: endDate });
    setData(dataUser);
  };

  async function handleDelete(status: boolean) {
    if (status && recordDelete) {
      // await handleAction('delete', { id: recordDelete.id });
    }
  }

  useEffect(() => {
    getDataUser(pageSize, page, search, filterValue.start_date, filterValue.end_date);

    if (isInitial) {
      setIsInitial(false);
    }

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, isInitial, i18n, search, filterValue.start_date, filterValue.end_date]);

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

  const handleRowClick = (row: EndUserData) => {
    setRecord(row);
    setOpenDialog(true);
  };

  const handleCloseView = () => {
    setOpenDialog(false);
    setRecord(null);
  };
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleStartDateChange = (date: any) => {
    setFilterValue((prev) => ({
      ...prev,
      start_date: date?.format('YYYY-MM-DD') || prev.start_date
    }));
  };

  const handleEndDateChange = (date: any) => {
    setFilterValue((prev) => ({
      ...prev,
      end_date: date?.format('YYYY-MM-DD') || prev.end_date
    }));
  };
  const columns = useMemo(() => {
    return columnsSession(page, pageSize, handleAdd, handleClose, setRecord, setRecordDelete, true);
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  return (
    <>
      <MainCard content={false}>
        <div className="flex md:flex-row p-5 flex-col gap-3 items-center">
          <GlobalFilter searchFilter={setSearch} />

          {isMobile ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DatePicker
                  format="DD/MM/YYYY"
                  onChange={handleStartDateChange}
                  style={{ width: '100%', height: '40px' }}
                  value={filterValue.start_date ? dayjs(filterValue.start_date) : undefined}
                  placeholder={intl.formatMessage({ id: 'start-date' })}
                />
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  format="DD/MM/YYYY"
                  onChange={handleEndDateChange}
                  style={{ width: '100%', height: '40px' }}
                  value={filterValue.end_date ? dayjs(filterValue.end_date) : undefined}
                  placeholder={intl.formatMessage({ id: 'end-date' })}
                />
              </Grid>
            </Grid>
          ) : (
            <RangePicker
              format="DD/MM/YYYY"
              onChange={handleDateChange}
              style={{ minWidth: '100px', maxWidth: '320px', height: '40px' }}
              value={
                filterValue.start_date && filterValue.end_date ? [dayjs(filterValue.start_date), dayjs(filterValue.end_date)] : undefined
              }
              placeholder={[intl.formatMessage({ id: 'start-date' }), intl.formatMessage({ id: 'end-date' })]}
              presets={isMobile ? undefined : getDatePresets(intl)}
            />
          )}
        </div>

        <ScrollX>
          <GeneralizedTableV2
            hiddenFilter
            isLoading={isLoading}
            // isReload={isReload}
            columns={columns}
            data={data}
            onAddNew={handleAdd}
            onPageChange={handlePageChange}
            totalPages={totalPage}
            size={pageSize}
            currentPage={page}
            totalResults={totalResults}
            onRowClick={handleRowClick}
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
          {recordDelete && (
            <Alert
              alertDelete="alert-delete-customer"
              nameRecord={recordDelete.username}
              open={open}
              handleClose={handleClose}
              handleDelete={handleDelete}
            />
          )}
          <ViewDialog title="session-info" open={openDialog} onClose={handleCloseView} data={record} config={sessionViewConfig} />
        </Dialog>
      </MainCard>
    </>
  );
};

export default SessionManagement;
