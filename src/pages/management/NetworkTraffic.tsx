import useConfig from 'hooks/useConfig';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

//project-import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
// import ViewDialog from 'components/template/ViewDialog';

//config
import { columnsNetworkTraffic } from 'components/ul-config/table-config';
// import { logsViewConfig } from 'components/ul-config/view-dialog-config';

//utils
import axios from 'utils/axios';
import { API_PATH_MANAGEMENT } from 'utils/constant';

//third-party
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { enqueueSnackbar } from 'notistack';
import Cookies from 'universal-cookie';
//types
import { Autocomplete, Grid, TextField, useMediaQuery } from '@mui/material';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import useHandleAds from 'hooks/useHandleAds';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { DataAds, PartnerData } from 'types';
import { formatDate } from 'utils/handleData';
import { GlobalFilter } from 'utils/react-table';
import { getDatePresets } from 'utils/datePresets';

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;

interface FilterValue {
  start_date: string | Date | null;
  end_date: string | Date | null;
  adId?: number;
}

type GetDataNetworkTrafficParams = {
  pageSize: number;
  page: number;
  filters?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  adDataInput?: string;
  adId?: number;
};

const NetworkTrafficPage = () => {
  const [add, setAdd] = useState<boolean>(false);
  const [isReload, setIsReload] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitial, setIsInitial] = useState<boolean>(true);
  // const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<PartnerData | null>(null);
  const [data, setData] = useState<PartnerData[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filterValue, setFilterValue] = useState<FilterValue>({
    start_date: dayjs().subtract(15, 'day').startOf('day').toISOString(),
    end_date: dayjs().endOf('day').toISOString()
  });
  const cookies = new Cookies();
  const intl = useIntl();
  const accessToken = cookies.get('accessToken');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds);
  const [optionsAds, setOptionsAds] = useState<{ label: string; value: number }[]>([]);
  const { i18n } = useConfig();

  const { fetchDataAds } = useHandleAds();

  const handleGetOptionsAds = async () => {
    try {
      const dataAds: DataAds[] = await fetchDataAds({ page: 1, pageSize: 50, adDataInput: JSON.stringify(currentAds) });
      setOptionsAds(
        dataAds.map((item) => {
          return {
            label: item.template_name,
            value: item.id
          };
        })
      );
    } catch (error) {}
  };

  useEffect(() => {
    handleGetOptionsAds();
    return () => {};
    //eslint-disable-next-line
  }, []);

  const handleDateChange = (dates: any) => {
    if (dates) {
      const start_date = dates[0]?.format('YYYY/MM/DD');
      const end_date = dates[1]?.format('YYYY/MM/DD');

      setFilterValue((prev) => ({ ...prev, start_date, end_date }));
    } else {
      setFilterValue((prev) => ({
        ...prev,
        start_date: dayjs().subtract(15, 'day').startOf('day').format('YYYY/MM/DD'),
        end_date: dayjs().endOf('day').format('YYYY/MM/DD')
      }));
    }
  };

  const getDataNetworkTraffic = async (params: GetDataNetworkTrafficParams) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_PATH_MANAGEMENT.dataLogin}`, {
        headers: { Authorization: `${accessToken}` },
        params: { ...params }
      });

      const formattedDate = formatDate(res.data.data, ['date']);
      setData(formattedDate);
      setTotalPages(res.data.totalPages);
      setTotalResults(res.data.total);
    } catch (error) {
      setData([]);
      enqueueSnackbar(intl.formatMessage({ id: 'process-error' }), { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   if (isInitial) {
  //     getDataNetworkTraffic(pageSize, pageIndex, search);
  //     setIsInitial(false);
  //   }
  //   //eslint-disable-next-line
  // }, []);

  // useEffect(() => {
  //   if (isReload) {
  //     getDataNetworkTraffic(pageSize, pageIndex, search);
  //     setIsReload(false);
  //   }
  //   //eslint-disable-next-line
  // }, [isReload]);

  // useEffect(() => {
  //   if (!isInitial) {
  //     getDataNetworkTraffic(pageSize, pageIndex, search);
  //   }
  //   //eslint-disable-next-line
  // }, [pageIndex, search, pageSize, i18n, filterValue.start_date, filterValue.end_date]);

  useEffect(() => {
    const params = {
      pageSize,
      page,
      filters: search,
      startDate: filterValue.start_date,
      endDate: filterValue.end_date,
      adDataInput: JSON.stringify(currentAds),
      adId: filterValue?.adId
    };

    if (isInitial) {
      getDataNetworkTraffic(params);
      setIsInitial(false);
      return;
    }

    if (isReload) {
      getDataNetworkTraffic(params);
      setIsReload(false);
      return;
    }

    // Gọi khi filter, phân trang, search thay đổi (sau lần initial)
    if (!isInitial) {
      getDataNetworkTraffic(params);
    }
    // eslint-disable-next-line
  }, [isInitial, isReload, page, pageSize, search, filterValue.start_date, filterValue.end_date, i18n, filterValue?.adId, currentAds]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleRowClick = (row: PartnerData) => {
    setRecord(row);
  };

  const columns = useMemo(() => {
    return columnsNetworkTraffic(page, pageSize);
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);
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

  return (
    <>
      <Grid item xs={12}>
        <MainCard content={false}>
          <div className="flex p-5 md:flex-row flex-col gap-3 items-center">
            <GlobalFilter searchFilter={setSearch} />

            {isMobile ? (
              <>
                <DatePicker
                  format="DD/MM/YYYY"
                  onChange={handleStartDateChange}
                  style={{ width: '100%', height: '40px' }}
                  value={filterValue.start_date ? dayjs(filterValue.start_date) : undefined}
                  placeholder={intl.formatMessage({ id: 'start-date' })}
                />
                <DatePicker
                  format="DD/MM/YYYY"
                  onChange={handleEndDateChange}
                  style={{ width: '100%', height: '40px' }}
                  value={filterValue.end_date ? dayjs(filterValue.end_date) : undefined}
                  placeholder={intl.formatMessage({ id: 'end-date' })}
                />
              </>
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
            <Autocomplete
              options={optionsAds}
              sx={{
                minWidth: '200px'
              }}
              className="w-full md:w-auto"
              getOptionLabel={(option) => option.label}
              renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'select-ad' })} variant="outlined" />}
              onChange={(event, value) => setFilterValue((prev) => ({ ...prev, adId: value?.value }))}
              isOptionEqualToValue={(option, value) => option.value === value.value}
            />
          </div>

          <ScrollX>
            <GeneralizedTableV2
              hiddenFilter
              isLoading={isLoading}
              isReload={isReload}
              columns={columns}
              data={data}
              onAddNew={handleAdd}
              onPageChange={handlePageChange}
              totalPages={totalPages}
              totalResults={totalResults}
              size={pageSize}
              currentPage={page}
              onRowClick={handleRowClick}
              sortColumns="index"
              isDecrease={false}
            />
          </ScrollX>
        </MainCard>
      </Grid>
    </>
  );
};

export default NetworkTrafficPage;
