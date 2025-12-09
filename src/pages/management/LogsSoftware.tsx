import { useEffect, useMemo, useState } from 'react';

//project-import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
// import ViewDialog from 'components/template/ViewDialog';

//config
import { columnsLogSoftware } from 'components/ul-config/table-config';
// import { logsViewConfig } from 'components/ul-config/view-dialog-config';

//types
import { LogRowSub } from 'components/molecules/log/LogRowSub';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import dayjs from 'dayjs';
import useHandleLogs from 'hooks/useHandleLogs';
import { PartnerData } from 'types';

const LogsSoftware = () => {
  const [add, setAdd] = useState<boolean>(false);
  // const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<PartnerData | null>(null);
  const [data, setData] = useState<PartnerData[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [dateFilter, setDateFilters] = useState<Record<string, any>>({
    start_date: dayjs().subtract(15, 'day').startOf('day').toISOString(),
    end_date: dayjs().endOf('day').toISOString()
  });

  const { fetchDataLogs, isLoading, totalPages, totalResults } = useHandleLogs();

  const getDataLogsSoftware = async () => {
    const dataLogs = await fetchDataLogs({
      page,
      pageSize,
      search,
      startDate: dateFilter.start_date,
      endDate: dateFilter.end_date
    });
    setData(dataLogs);
  };

  useEffect(() => {
    getDataLogsSoftware();
    //eslint-disable-next-line
  }, [pageSize, page, search, dateFilter.start_date, dateFilter.end_date]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  // const handleCloseView = () => {
  //   // setOpenDialog(false);
  //   setRecord(null);
  // };

  const handleRowClick = (row: PartnerData) => {
    setRecord(row);
    // setOpenDialog(true);
  };

  const columns: any = useMemo(() => {
    return columnsLogSoftware(page, pageSize);
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    if (!dates) {
      setDateFilters((prev) => ({
        ...prev,
        start_date: null,
        end_date: null
      }));
    } else {
      setDateFilters((prev) => ({
        ...prev,
        start_date: dates[0] ? dates[0].format('YYYY/MM/DD') : null,
        end_date: dates[1] ? dates[1].format('YYYY/MM/DD') : null
      }));
    }
  };

  return (
    <MainCard content={false}>
      <ScrollX>
        <GeneralizedTableV2
          isLoading={isLoading}
          columns={columns}
          data={data}
          onAddNew={handleAdd}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalResults={totalResults}
          size={pageSize}
          currentPage={page}
          onRowClick={handleRowClick}
          onSearch={setSearch}
          sortColumns="index"
          isDecrease={false}
          onDateChange={handleDateChange}
          // datesFilter={dateFilter}
          renderRowSubComponent={LogRowSub}
        />
      </ScrollX>
      {/* <ViewDialog title="logs-info" open={openDialog} onClose={handleCloseView} data={record} config={logsViewConfig} /> */}
    </MainCard>
  );
};

export default LogsSoftware;
