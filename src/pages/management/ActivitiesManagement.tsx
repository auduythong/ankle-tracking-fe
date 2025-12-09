import { useEffect, useMemo, useState } from 'react';

//project-import
import { DatePicker } from 'antd';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

//config
import { columnsActivitiesWiFi } from 'components/ul-config/table-config';

//types
import { Autocomplete, TextField, useMediaQuery } from '@mui/material';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import useHandleAds from 'hooks/useHandleAds';
import useHandleDataLogin, { ParamsDataLogin } from 'hooks/useHandleDataLogin';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { ActivitiesWiFi, DataAds } from 'types';
import { GlobalFilter } from 'utils/react-table';
import { getDatePresets } from 'utils/datePresets';

interface FilterValue {
  start_date: string | Date | null;
  end_date: string | Date | null;
  adId?: number;
}

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;

const ActivitiesManagement = () => {
  const [add, setAdd] = useState(false);
  const [open, setOpen] = useState(false);

  const [record, setRecord] = useState<ActivitiesWiFi | null>(null);
  const [data, setData] = useState<ActivitiesWiFi[]>([]);
  const [search, setSearch] = useState('');
  const [filterValue, setFilterValue] = useState<FilterValue>({
    start_date: dayjs().subtract(15, 'day').startOf('day').toISOString(),
    end_date: dayjs().endOf('day').toISOString()
  });
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds ?? '');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [optionsAds, setOptionsAds] = useState<{ label: string; value: number }[]>([]);

  const intl = useIntl();

  const { isLoading, fetchDataActivities, totalPages, totalResults } = useHandleDataLogin();

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

  const getDataActivities = async (params: ParamsDataLogin) => {
    const dataActivities = await fetchDataActivities({
      ...params
    });

    setData(dataActivities);
  };

  const params = useMemo(() => {
    return {
      pageSize,
      page,
      siteId: currentSite,
      filters: search,
      startDate: filterValue.start_date,
      endDate: filterValue.end_date,
      adId: filterValue.adId,
      adDataInput: JSON.stringify(currentAds)
    };
  }, [pageSize, page, currentSite, search, filterValue, currentAds]);

  useEffect(() => {
    getDataActivities(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

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

  const handleRowClick = (row: ActivitiesWiFi) => {
    setRecord(row);
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
    return columnsActivitiesWiFi(page, pageSize, handleAdd, handleClose);
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // reset về trang 1 khi search
  };

  return (
    <>
      <MainCard content={false}>
        <div className="flex flex-col p-5 gap-3 md:flex-row md:items-center justify-between">
          <div className="flex md:flex-row flex-col gap-3 items-center">
            <div className="w-full md:max-w-max">
              <GlobalFilter searchFilter={handleSearchChange} />
            </div>
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
              <div>
                <RangePicker
                  format="DD/MM/YYYY"
                  onChange={handleDateChange}
                  style={{ minWidth: '100px', maxWidth: '320px', height: '40px' }}
                  value={
                    filterValue.start_date && filterValue.end_date
                      ? [dayjs(filterValue.start_date), dayjs(filterValue.end_date)]
                      : undefined
                  }
                  placeholder={[intl.formatMessage({ id: 'start-date' }), intl.formatMessage({ id: 'end-date' })]}
                  presets={isMobile ? undefined : getDatePresets(intl)}
                />
              </div>
            )}
            <Autocomplete
              options={optionsAds}
              sx={{
                minWidth: '200px',
                height: 40
              }}
              className="w-full md:w-auto"
              getOptionLabel={(option) => option.label}
              renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'select-ad' })} variant="outlined" />}
              onChange={(event, value) => setFilterValue((prev) => ({ ...prev, adId: value?.value }))}
              isOptionEqualToValue={(option, value) => option.value === value.value}
            />
          </div>
          {/* <div className="my-2 xl:my-0">
              {totalResults && <div>{intl.formatMessage({ id: 'total-results' }) + ' ' + totalResults}</div>}
            </div> */}
        </div>
        <ScrollX>
          <GeneralizedTableV2
            hiddenFilter
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
            sortColumns="index"
            isDecrease={false}
          />
        </ScrollX>
        {/* <ViewDialog title="logs-info" open={openDialog} onClose={handleCloseView} data={record} config={logsViewConfig} /> */}
      </MainCard>
    </>
  );
};

export default ActivitiesManagement;
