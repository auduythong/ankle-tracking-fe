import useConfig from 'hooks/useConfig';
import { useEffect, useMemo, useState } from 'react';

//project-import
import { DatePicker } from 'antd';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
//config
import { columnsSurvey } from 'components/ul-config/table-config';

//types
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useMediaQuery
} from '@mui/material';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import useHandleAds from 'hooks/useHandleAds';
import useHandleExcel from 'hooks/useHandleExcel';
import useHandleSurvey from 'hooks/useHandleSurvey';
import { ExportCurve } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { DataAds, PartnerData } from 'types';
import { GlobalFilter } from 'utils/react-table';
import { getDatePresets } from 'utils/datePresets';

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;

type GetDataSurveyParams = {
  pageSize: number;
  page: number;
  siteId: string;
  filters?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  adId?: number;
  adDataInput: string;
};

type QueryExportParams = {
  type: string;
  siteId?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  adId?: number;
  adDataInput?: string;
  orderBy?: 'asc' | 'desc';
  isOtp?: string;
};

const DataSurvey = () => {
  const [add, setAdd] = useState(false);
  const [open, setOpen] = useState(false);

  const [record, setRecord] = useState<PartnerData | null>(null);
  const [data, setData] = useState<PartnerData[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filterValue, setFilterValue] = useState<{ start_date: string | Date | null; end_date: string | Date | null; adId?: number }>({
    start_date: dayjs().subtract(15, 'day').startOf('day').toISOString(),
    end_date: dayjs().endOf('day').toISOString()
  });
  const [optionsAds, setOptionsAds] = useState<{ label: string; value: number }[]>([]);
  const [openExportDialog, setOpenExportDialog] = useState(false);

  const [queryExport, setQueryExport] = useState<QueryExportParams>({ type: '' });

  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds ?? '');

  const { i18n } = useConfig();
  const intl = useIntl();

  const { isLoading, fetchDataSurvey, totalPages, totalResults } = useHandleSurvey();

  const { fetchDataAds } = useHandleAds();
  const { fetchExportExcel } = useHandleExcel();

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

  const handleChangeQueryExport = (key: string, value: any) => {
    setQueryExport((prev) => ({
      ...prev,
      [key]: value ?? ''
    }));
  };

  const getDataSurvey = async (params: GetDataSurveyParams) => {
    const dataSurvey = await fetchDataSurvey({
      ...params
    });
    setData(dataSurvey);
  };

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

  useEffect(() => {
    const params = {
      pageSize,
      page: page,
      siteId: currentSite,
      filters: search,
      startDate: filterValue.start_date,
      endDate: filterValue.end_date,
      adId: filterValue?.adId,
      adDataInput: JSON.stringify(currentAds)
    };

    getDataSurvey(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, i18n, currentSite, search, filterValue.start_date, filterValue.end_date, filterValue?.adId, currentAds]);

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

  const handleRowClick = (row: PartnerData) => {
    setRecord(row);
    // setOpenDialog(true);
  };

  const columns = useMemo(() => {
    return columnsSurvey(page, pageSize, handleAdd, handleClose);
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

  const optionTypes = [{ label: intl.formatMessage({ id: 'data-collect-user' }), value: 'user_collector' }];

  const sortDateOptions = [
    { label: intl.formatMessage({ id: 'sort-newest' }), value: 'desc' },
    { label: intl.formatMessage({ id: 'sort-oldest' }), value: 'asc' }
  ];

  const otpSentOptions = [
    { label: intl.formatMessage({ id: 'yes' }), value: 'true' },
    { label: intl.formatMessage({ id: 'no' }), value: 'false' }
  ];

  const handleExportReport = async () => {
    const startDate = queryExport?.startDate ? dayjs(queryExport.startDate).format('YYYY-MM-DD') : undefined;
    const endDate = queryExport?.endDate ? dayjs(queryExport.endDate).format('YYYY-MM-DD') : undefined;

    if (!startDate && !endDate) {
      enqueueSnackbar('Please select a date range', { variant: 'warning' });
      return;
    }

    try {
      const excelData = await fetchExportExcel({
        ...queryExport,
        startDate,
        endDate,
        adDataInput: JSON.stringify(currentAds)
      });

      if (!excelData) {
        throw new Error('No data received from server');
      }

      if (!(excelData instanceof Blob)) {
        throw new Error('Invalid data type received for export');
      }
      const url = window.URL.createObjectURL(excelData);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bao-cao-tuan_${startDate}_to_${endDate}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      setOpenExportDialog(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <>
      <MainCard content={false}>
        <div className="flex flex-col p-5 gap-3">
          <div className="flex md:flex-row flex-col gap-3 md:items-center justify-between">
            <div className="flex md:flex-row flex-col gap-3 md:items-center">
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
                    filterValue.start_date && filterValue.end_date
                      ? [dayjs(filterValue.start_date), dayjs(filterValue.end_date)]
                      : undefined
                  }
                  placeholder={[intl.formatMessage({ id: 'start-date' }), intl.formatMessage({ id: 'end-date' })]}
                  presets={isMobile ? undefined : getDatePresets(intl)}
                />
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

            <div className="flex items-center gap-3 justify-between">
              {/* <div className="my-2 xl:my-0">
                {totalResults && <div>{intl.formatMessage({ id: 'total-results' }) + ' ' + totalResults}</div>}
              </div> */}
              <Button variant="contained" onClick={() => setOpenExportDialog(true)} className="h-10">
                <span className="flex items-center gap-2">
                  <ExportCurve />
                  {intl.formatMessage({ id: 'export' })}
                </span>
              </Button>
            </div>
          </div>
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
        <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)} maxWidth="xs">
          <DialogTitle> {intl.formatMessage({ id: 'select-date-range-weekly-report' })}</DialogTitle>
          <DialogContent>
            <RangePicker
              format="DD/MM/YYYY"
              onChange={(dates) => {
                handleChangeQueryExport('startDate', dates?.[0]?.toISOString() || '');
                handleChangeQueryExport('endDate', dates?.[1]?.toISOString() || '');
              }}
              style={{ width: '100%', marginTop: '20px', height: '40px' }}
              popupStyle={{ zIndex: 99999 }}
              value={
                queryExport?.startDate && queryExport?.endDate ? [dayjs(queryExport.startDate), dayjs(queryExport.endDate)] : undefined
              }
            />
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{intl.formatMessage({ id: 'select-type-report' })}</InputLabel>
              <Select
                sx={{ height: 40 }}
                value={queryExport.type || ''}
                onChange={(e) => handleChangeQueryExport('type', e.target.value)}
                label={intl.formatMessage({ id: 'select-type-report' })}
                required
              >
                {optionTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <Autocomplete
                options={optionsAds}
                sx={{
                  height: 40,
                  minWidth: '200px'
                }}
                getOptionLabel={(option) => option.label}
                renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'select-ad' })} variant="outlined" />}
                onChange={(event, value) => handleChangeQueryExport('adId', value?.value)}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="otp-filter-label">{intl.formatMessage({ id: 'send-otp' })}</InputLabel>
              <Select
                size="medium"
                labelId="otp-filter-label"
                value={queryExport?.isOtp ?? ''}
                label={intl.formatMessage({ id: 'send-otp' })}
                onChange={(e) => handleChangeQueryExport('isOtp', e.target.value)}
              >
                {otpSentOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="sort-date-label">{intl.formatMessage({ id: 'sort-by-date' })}</InputLabel>
              <Select
                size="medium"
                labelId="sort-date-label"
                label={intl.formatMessage({ id: 'sort-by-date' })}
                value={queryExport?.orderBy || ''}
                onChange={(e) => handleChangeQueryExport('orderBy', e.target.value)}
              >
                {sortDateOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenExportDialog(false)}>{intl.formatMessage({ id: 'cancel' })}</Button>

            <Button onClick={handleExportReport} variant="contained" disabled={!queryExport.startDate && !queryExport.endDate}>
              {intl.formatMessage({ id: 'export' })}
            </Button>
          </DialogActions>
        </Dialog>
      </MainCard>
    </>
  );
};

export default DataSurvey;
