import { useEffect, useMemo, useRef, useState } from 'react';

//project-import
import MainCard from 'components/MainCard';
import GeneralizedTable from 'components/organisms/GeneralizedTable';
import ScrollX from 'components/ScrollX';

//types
import Alert from 'components/template/Alert';
import ViewDialog from 'components/template/ViewDialog';
import { columnsAgent } from 'components/ul-config/table-config/agent';
import { agentViewConfig } from 'components/ul-config/view-dialog-config';
import useHandleAgent from 'hooks/useHandleAgent';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { Agent } from 'types/agent';
import AgentDialog, { AgentDialogRef } from './components/AgentDialog';
import { agentApi } from 'api/agent.api';


const AgentManagement = () => {
  const [open, setOpen] = useState(false);
  const agentDialogRef = useRef<AgentDialogRef>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [record, setRecord] = useState<Agent | null>(null);
  const [recordDelete, setRecordDelete] = useState<Agent>();

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const intl = useIntl();

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('agent-management');

  const { fetchAgent, agents, loadingAgent, queryAgent, totalAgent, totalPages } = useHandleAgent({
    initQuery: {
      page: 1,
      pageSize: 100
    }
  });

  useEffect(() => {
    fetchAgent();
  }, []);

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex + 1);
    setPageSize(newPageSize);
  };

  const handleAdd = () => {
    agentDialogRef.current?.openCreate();
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleRowClick = (row: Agent) => {
    setRecord(row);
    setOpenViewDialog(true);
  };

  const handleCloseView = () => {
    setOpenViewDialog(false);
    setRecord(null);
  };

  const handleResetToken = async (record: any) => {
    try {
      await agentApi.resetToken(record.id)
      fetchAgent()
      enqueueSnackbar(intl.formatMessage({ id: 'reset-token-successfully' }), {
        variant: 'success'
      });
    } catch (error) {

    }
  };


  const handleSearch = (value: string) => {
    fetchAgent({ ...queryAgent, page: 1, filters: value });
  };

  const handleDelete = async (isDelete: boolean) => {
    if (!isDelete && !recordDelete) {
      return;
    }
    try {
      await agentApi.delete(recordDelete?.id as number);
      enqueueSnackbar(intl.formatMessage({ id: 'delete-agent-successfully' }), {
        variant: 'success'
      });
      fetchAgent();
    } catch (error) { }
  };

  const columns: any = useMemo(() => {
    return columnsAgent(
      {
        currentPage: pageIndex,
        pageSize,
        handleAdd: (record) => agentDialogRef.current?.openUpdate(record),
        handleClose,
        setRecord,
        setRecordDelete,
        setViewRecord: handleRowClick,
        handleResetToken(record) {
          handleResetToken(record);
        },
        canWrite
      },
    );
    //eslint-disable-next-line
  }, [pageIndex, pageSize]);

  return (
    <MainCard content={false}>
      <ScrollX>
        <GeneralizedTable
          isLoading={loadingAgent}
          columns={columns}
          data={agents}
          handleAdd={handleAdd}
          totalResults={totalAgent}
          csvFilename="customer-list.csv"
          onPageChange={handlePageChange}
          totalPages={totalPages}
          onRowClick={handleRowClick}
          searchFilter={handleSearch}
          sortColumns="index"
          isDecrease={false}
          addButtonLabel={'Thêm mới'}
          canWrite={canWrite}
        />
      </ScrollX>
      <AgentDialog onSubmitOk={() => fetchAgent()} ref={agentDialogRef} />

      <ViewDialog title="agent-info" open={openViewDialog} onClose={handleCloseView} data={record} config={agentViewConfig} />
      {recordDelete && (
        <Alert
          alertDelete="alert-delete-agent"
          nameRecord={recordDelete.agent_name}
          open={open}
          handleClose={handleClose}
          handleDelete={handleDelete}
        />
      )}

    </MainCard>
  );
};

export default AgentManagement;
