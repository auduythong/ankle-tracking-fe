import { useEffect, useMemo, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { styled } from '@mui/system';
import { useSelector } from 'react-redux';

// Project imports
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import HardwareDashboardView from 'components/molecules/log/HardWareDashboardView';
import GeneralizedTable from 'components/organisms/GeneralizedTable';
import { Chart, TableDocument } from 'iconsax-react';

// Config & hooks
import { columnsLogHardware } from 'components/ul-config/table-config';
import useHandleLogsHardware from 'hooks/useHandleLogsHardware';

// Types
import { PartnerData } from 'types';
import { RootState } from 'store';

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '1rem',
  minWidth: 100,
  '&.Mui-selected': {
    color: theme.palette.primary.main
  }
}));

const LogsHardware = () => {
  const [activeTab, setActiveTab] = useState<'alert' | 'event'>('alert');
  const [viewMode, setViewMode] = useState<'dashboard' | 'list'>('dashboard');

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [record, setRecord] = useState<PartnerData | null>(null);

  const user = useSelector((state: RootState) => state.authSlice.user);
  const siteIdAccess = useMemo(() => user?.sites?.map((item) => item.site_id), [user?.sites]);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const { fetchLogsHardware, loadingLogsHardware, logsHardware, totalPages, queryLogsHardware } = useHandleLogsHardware({
    initQuery: {
      page: 1,
      pageSize: 50,
      type: activeTab,
      siteDataInput: JSON.stringify(siteIdAccess),
      siteId: currentSite || '5E750376-5396-4A89-82C6-6E7F645B20C7'
    }
  });

  console.log(record);

  useEffect(() => {
    fetchLogsHardware();
  }, []);

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex + 1);
    setPageSize(newPageSize);
  };

  const handleRowClick = (row: PartnerData) => setRecord(row);

  const columns = useMemo(() => columnsLogHardware(pageIndex, pageSize, activeTab), [pageIndex, pageSize, activeTab]);

  const handleChangeTab = (e: React.SyntheticEvent, newValue: 'alert' | 'event') => {
    setActiveTab(newValue);
    if (viewMode === 'list') {
      fetchLogsHardware({ ...queryLogsHardware, type: newValue, page: 1, pageSize: 50 });
    }
  };

  const handleChangeViewMode = (e: React.SyntheticEvent, newValue: 'dashboard' | 'list') => {
    setViewMode(newValue);
    if (newValue === 'list') {
      fetchLogsHardware({ ...queryLogsHardware, type: activeTab, page: 1, pageSize: 50 });
    }
  };

  return (
    <MainCard content={false}>
      <Box>
        <div className="flex items-center justify-between mb-2">
          <Tabs value={activeTab} onChange={handleChangeTab} sx={{ bgcolor: 'white', borderRadius: 1 }}>
            <StyledTab value="alert" label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Alerts</Box>} />
            <StyledTab value="event" label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Events</Box>} />
          </Tabs>
          <Tabs value={viewMode} onChange={handleChangeViewMode} sx={{ bgcolor: 'white', borderRadius: 1 }}>
            <StyledTab value="dashboard" label={<Chart />} />
            <StyledTab value="list" label={<TableDocument />} />
          </Tabs>
        </div>

        {viewMode === 'dashboard' ? (
          <HardwareDashboardView activeTab={activeTab} />
        ) : (
          <ScrollX>
            <GeneralizedTable
              isLoading={loadingLogsHardware}
              columns={columns}
              data={logsHardware}
              onPageChange={handlePageChange}
              totalPages={totalPages}
              onRowClick={handleRowClick}
              searchFilter={false}
              sortColumns="index"
              isDecrease={false}
            />
          </ScrollX>
        )}
      </Box>
    </MainCard>
  );
};

export default LogsHardware;
