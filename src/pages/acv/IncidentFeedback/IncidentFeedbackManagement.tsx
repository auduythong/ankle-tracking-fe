import { useEffect, useMemo, useState } from 'react';

//project-import
import MainCard from 'components/MainCard';
import GeneralizedTable from 'components/organisms/GeneralizedTable';
import ScrollX from 'components/ScrollX';
// import ViewDialog from 'components/template/ViewDialog';

//types
import { PartnerData } from 'types';

//hooks
import { useHandleIncidentFeedback } from 'hooks/useHandleIncidentFeedback';

//Components
import { Box, Tab, Tabs } from '@mui/material';
import { styled } from '@mui/system';
import IncidentFeedbackDashboard from './components/IncidentFeedbackDashboard';

//config
import { columnsIncidentFeedback } from 'components/ul-config/table-config/incidentFeedback';
import { useIntl } from 'react-intl';

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '1rem',
  minWidth: 100,
  '&.Mui-selected': {
    color: theme.palette.primary.main
  }
}));

const IncidentFeedbackManagement = () => {
  const [add, setAdd] = useState<boolean>(false);
  // const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<PartnerData | null>(null);

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  const intl = useIntl();

  const { fetchIncidentFeedback, incidentFeedbacks, totalPages } = useHandleIncidentFeedback({
    initQuery: {
      page: 1,
      pageSize: 50,
      search
    }
  });

  useEffect(() => {
    fetchIncidentFeedback();

    return () => {};
  }, []);

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex + 1);
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

  const columns = useMemo(() => {
    return columnsIncidentFeedback(pageIndex, pageSize);
    //eslint-disable-next-line
  }, [setRecord, pageIndex, pageSize]);

  const statusOptions = [
    { label: intl.formatMessage({ id: 'resolved' }), value: 1 },
    { label: intl.formatMessage({ id: 'unresolved' }), value: 2 }
  ];

  const handleStatusFilterChange = (statusId: number | null) => {
    // setSelectedStatusId(statusId);
    setPageIndex(1);
  };

  return (
    <MainCard content={false}>
      <Box sx={{ bgcolor: 'grey.50', p: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ bgcolor: 'white', borderRadius: 1 }}>
          <StyledTab
            value={'dashboard'}
            label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{intl.formatMessage({ id: 'general' })}</Box>}
          />
          <StyledTab value={'list'} label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Danh sách</Box>} />
        </Tabs>

        {/* Content */}
        {activeTab === 'dashboard' ? (
          <IncidentFeedbackDashboard />
        ) : (
          <ScrollX>
            <GeneralizedTable
              isLoading={false}
              columns={columns}
              data={incidentFeedbacks}
              handleAdd={handleAdd}
              onPageChange={handlePageChange}
              totalPages={totalPages}
              onRowClick={handleRowClick}
              searchFilter={setSearch}
              sortColumns="index"
              isDecrease={false}
              statusOptions={statusOptions}
              onStatusFilterChange={handleStatusFilterChange}
            />
          </ScrollX>
        )}
      </Box>

      {/* <ViewDialog title="logs-info" open={openDialog} onClose={handleCloseView} data={record} config={logsViewConfig} /> */}
    </MainCard>
  );
};

export default IncidentFeedbackManagement;
