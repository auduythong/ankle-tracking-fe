import { useEffect, useMemo, useState } from 'react';

//project-import
import MainCard from 'components/MainCard';
import GeneralizedTable from 'components/organisms/GeneralizedTable';
import ScrollX from 'components/ScrollX';

//types
import useHandlePasspoint from 'hooks/useHandlePasspoint';

import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { columnsAlertsMonitoring } from 'components/ul-config/table-config/alertsMonitoring';
import { AlertsMonitoring } from 'types/alerts-monitoring';
import { DeviceConnectionLog } from 'types/device-connection-log';

export const alertLogsDummyData: AlertsMonitoring[] = [
  {
    device_name: 'AP-01 Lầu 1',
    device_type: 'AP',
    ip_address: '192.168.1.101',
    location: 'Tầng 1 - Văn phòng chính',
    alert_type: 'disconnect',
    severity: 'high',
    message: 'Thiết bị không phản hồi trong 15 phút',
    detected_at: '2025-07-25 13:15:00',
    resolved_at: '',
    status: 'active'
  },
  {
    device_name: 'SW-05 Tầng 2',
    device_type: 'Switch',
    ip_address: '192.168.1.205',
    location: 'Tầng 2 - Phòng họp',
    alert_type: 'packet_loss',
    severity: 'medium',
    message: 'Mất gói dữ liệu vượt quá 25%',
    detected_at: '2025-07-25 12:45:00',
    resolved_at: '2025-07-25 13:10:00',
    status: 'resolved'
  },
  {
    device_name: 'AP-03 Sảnh',
    device_type: 'AP',
    ip_address: '192.168.1.103',
    location: 'Sảnh lễ tân',
    alert_type: 'snmp_timeout',
    severity: 'low',
    message: 'SNMP không phản hồi trong vòng 3 phút',
    detected_at: '2025-07-25 11:30:00',
    resolved_at: '',
    status: 'active'
  },
  {
    device_name: 'Router-01',
    device_type: 'Switch',
    ip_address: '192.168.1.1',
    location: 'Phòng server',
    alert_type: 'disconnect',
    severity: 'high',
    message: 'Mất kết nối hoàn toàn, không có tín hiệu ping',
    detected_at: '2025-07-25 09:00:00',
    resolved_at: '2025-07-25 09:20:00',
    status: 'resolved'
  },
  {
    device_name: 'AP-04 Khu A',
    device_type: 'AP',
    ip_address: '192.168.2.104',
    location: 'Khu A - Tầng 3',
    alert_type: 'packet_loss',
    severity: 'medium',
    message: 'Tỉ lệ mất gói không ổn định (dao động 20-30%)',
    detected_at: '2025-07-25 10:05:00',
    resolved_at: '',
    status: 'active'
  }
];

const DeviceAlertsMonitoring = () => {
  const [open, setOpen] = useState(false);

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // const intl = useIntl();

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('passpoint-management');

  const { fetchPasspoint, passpoints, totalPasspoint, totalPages, loadingPasspoint, queryPasspoint } = useHandlePasspoint({
    initQuery: {
      page: 1,
      pageSize: 100
    }
  });

  console.log({ passpoints });

  useEffect(() => {
    fetchPasspoint();
  }, []);

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex + 1);
    setPageSize(newPageSize);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleSearch = (value: string) => {
    fetchPasspoint({ ...queryPasspoint, page: 1, filters: value });
  };

  const columns: any = useMemo(() => {
    return columnsAlertsMonitoring({
      currentPage: pageIndex,
      pageSize,
      handleClose,
      canWrite,
      handleResolveStatus: (record: DeviceConnectionLog) => {
        console.log('Resolve status for record:', record);
        // Implement resolve status logic here
      }
    });
    //eslint-disable-next-line
  }, [pageIndex, pageSize]);

  return (
    <MainCard content={false}>
      <ScrollX>
        <GeneralizedTable
          isLoading={loadingPasspoint}
          columns={columns}
          data={alertLogsDummyData}
          totalResults={totalPasspoint}
          csvFilename="customer-list.csv"
          onPageChange={handlePageChange}
          totalPages={totalPages}
          searchFilter={handleSearch}
          sortColumns="index"
          isDecrease={false}
          canWrite={canWrite}
        />
      </ScrollX>
    </MainCard>
  );
};

export default DeviceAlertsMonitoring;
