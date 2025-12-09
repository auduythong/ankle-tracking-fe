import { useEffect, useMemo, useRef, useState } from 'react';

//project-import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

//types
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useTheme } from '@mui/system';
import { passpointApi } from 'api/passpoint.api';
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import Alert from 'components/template/Alert';
import ViewDialog from 'components/template/ViewDialog';
import { columnsPasspoint } from 'components/ul-config/table-config/passpoint';
import { passpointViewConfig } from 'components/ul-config/view-dialog-config';
import useHandlePasspoint from 'hooks/useHandlePasspoint';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { enqueueSnackbar } from 'notistack';
import { useIntl } from 'react-intl';
import { Passpoint } from 'types/passpoint';
import PasspointDialog, { PasspointDialogRef } from './components/Dialog/PasspointDialog';

type DeviceType = 'windows' | 'android' | 'ios';

const PasspointManagement = () => {
  const [open, setOpen] = useState(false);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const passPointDialogRef = useRef<PasspointDialogRef>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [record, setRecord] = useState<Passpoint | null>(null);
  const [recordDelete, setRecordDelete] = useState<Passpoint>();
  const [deviceType, setDeviceType] = useState<DeviceType>('windows');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const theme = useTheme();
  const mode = theme.palette.mode;

  const intl = useIntl();

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('passpoint-management');

  const { fetchPasspoint, passpoints, totalPasspoint, totalPages, loadingPasspoint, queryPasspoint } = useHandlePasspoint({
    initQuery: {
      page: 1,
      pageSize: 100
    }
  });

  useEffect(() => {
    fetchPasspoint();
  }, []);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleAdd = () => {
    passPointDialogRef.current?.openCreate();
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleRowClick = (row: Passpoint) => {
    setRecord(row);
    setOpenViewDialog(true);
  };

  const handleCloseView = () => {
    setOpenViewDialog(false);
    setRecord(null);
  };

  const handleDownload = (record: any) => {
    setRecord(record);
    setOpenDownloadDialog(true);
  };

  const handleConfirmDownload = () => {
    if (record) {
      downloadXML(record.id, deviceType);
    }
    setOpenDownloadDialog(false);
    setRecord(null);
  };

  const handleCancelDownload = () => {
    setOpenDownloadDialog(false);
    setRecord(null);
  };

  const downloadXML = async (id: string | number, deviceType: DeviceType) => {
    try {
      const response = await passpointApi.downloadXml({ id, deviceType });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/xml' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `file-${id}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url); // dọn dẹp URL
    } catch (error) {
      console.error('Error downloading XML:', error);
      // Thêm thông báo lỗi nếu cần
    }
  };

  const handleSearch = (value: string) => {
    fetchPasspoint({ ...queryPasspoint, page: 1, filters: value });
  };

  const handleDelete = async (isDelete: boolean) => {
    if (!isDelete && !recordDelete) {
      return;
    }
    try {
      await passpointApi.delete({ id: recordDelete?.id });
      enqueueSnackbar(intl.formatMessage({ id: 'delete-passpoint-successfully' }), {
        variant: 'success'
      });
      fetchPasspoint();
    } catch (error) {}
  };

  const columns: any = useMemo(() => {
    return columnsPasspoint(
      {
        currentPage: page,
        pageSize,
        handleAdd: (record) => passPointDialogRef.current?.openUpdate(record),
        handleClose,
        setRecord,
        setRecordDelete,
        setViewRecord: handleRowClick,
        handleDownload(record) {
          handleDownload(record.id);
        },
        canWrite
      },
      theme,
      mode
    );
    //eslint-disable-next-line
  }, [page, pageSize]);

  return (
    <MainCard content={false}>
      <ScrollX>
        <GeneralizedTableV2
          isLoading={loadingPasspoint}
          columns={columns}
          data={passpoints}
          onAddNew={handleAdd}
          totalResults={totalPasspoint}
          totalPages={totalPages}
          size={pageSize}
          currentPage={page}
          onPageChange={handlePageChange}
          onRowClick={handleRowClick}
          onSearch={handleSearch}
          sortColumns="index"
          isDecrease={false}
          addButtonLabel={'Thêm mới'}
          canWrite={canWrite}
        />
      </ScrollX>
      <PasspointDialog onSubmitOk={() => fetchPasspoint()} ref={passPointDialogRef} />

      <ViewDialog title="passpoint-info" open={openViewDialog} onClose={handleCloseView} data={record} config={passpointViewConfig} />
      {recordDelete && (
        <Alert
          alertDelete="alert-delete-passpoint"
          nameRecord={recordDelete.ssid.name}
          open={open}
          handleClose={handleClose}
          handleDelete={handleDelete}
        />
      )}

      {/* Modal chọn thiết bị */}
      <Dialog
        open={openDownloadDialog}
        onClose={handleCancelDownload}
        maxWidth="sm"
        PaperProps={{
          sx: { width: 300 }
        }}
      >
        <DialogTitle>Chọn loại thiết bị</DialogTitle>
        <DialogContent>
          <FormControl>
            <RadioGroup value={deviceType} onChange={(e) => setDeviceType(e.target.value as DeviceType)}>
              <FormControlLabel value="windows" control={<Radio />} label="Windows" />
              <FormControlLabel value="android" control={<Radio />} label="Android" />
              <FormControlLabel value="ios" control={<Radio />} label="iOS" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDownload}>Hủy</Button>
          <Button variant="contained" onClick={handleConfirmDownload}>
            Tải xuống
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default PasspointManagement;
