import { FormattedMessage } from 'react-intl';

//third-party
import { Row } from 'react-table';

//project-import
import ColumnActions from './column-action-status/column-action';

//utils
import ChipStatus from 'components/atoms/ChipStatus';

//types
// import { ColsTableProps } from 'types';
import { Chip } from '@mui/material';
import { NewVoucherGroup, Voucher } from 'types/voucher';
import { formatDateTime } from 'utils/dateFormat';

const booleanToChip = (value: string) => (
  <Chip
    label={<FormattedMessage id={value === 'true' ? 'yes' : 'no'} />}
    color={value === 'true' ? 'success' : 'default'}
    size="small"
    variant="outlined"
  />
);

interface VoucherCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecord: (record: NewVoucherGroup) => void;
  setRecordDelete: (record: NewVoucherGroup) => void;
  setViewRecord: (record: Voucher) => void;
  canWrite?: boolean;
}

// const codeFromText = (val: number) =>
//   val === 0 ? <FormattedMessage id="code-from.numbers" /> : <FormattedMessage id="code-from.letters" />;

// const limitTypeText = (val: number) => {
//   switch (val) {
//     case 0:
//       return <FormattedMessage id="limit.usage-counts" />;
//     case 1:
//       return <FormattedMessage id="limit.online-users" />;
//     case 2:
//       return <FormattedMessage id="limit.unlimited" />;
//     default:
//       return <FormattedMessage id="unknown" />;
//   }
// };

// const durationTypeText = (val: number) =>
//   val === 0 ? <FormattedMessage id="duration.client" /> : <FormattedMessage id="duration.voucher" />;

// const timingTypeText = (val: number) => (val === 0 ? <FormattedMessage id="timing.time" /> : <FormattedMessage id="timing.usage" />);

// const rateLimitModeText = (val: number) =>
//   val === 0 ? <FormattedMessage id="rate-limit.custom" /> : <FormattedMessage id="rate-limit.profile" />;

const validityTypeText = (val: number) => {
  switch (val) {
    case 0:
      return <FormattedMessage id="validity.anytime" />;
    case 1:
      return <FormattedMessage id="validity.effective-expiration" />;
    case 2:
      return <FormattedMessage id="validity.specific" />;
    default:
      return <FormattedMessage id="unknown" />;
  }
};

export const columnsVoucher = (params: VoucherCols) => [
  {
    Header: <FormattedMessage id="no." />,
    accessor: 'index',
    disableSortBy: true,
    className: 'cell-center',
    Cell: ({ row }: { row: Row<any> }) => <div>{(params.currentPage - 1) * params.pageSize + row.index + 1}</div>
  },
  {
    Header: <FormattedMessage id="code" />,
    accessor: 'code',
    disableSortBy: true,
    Cell: ({ value }: { value: number }) => <div className="min-w-[100px]">{value}</div>
  },
  {
    Header: <FormattedMessage id="traffic-used" />,
    accessor: 'traffic_used',
    disableSortBy: true
  },
  {
    Header: <FormattedMessage id="traffic-unused" />,
    accessor: 'traffic_unused',
    disableSortBy: true
  },
  {
    Header: <FormattedMessage id="traffic-limit" />,
    accessor: 'traffic_limit',
    disableSortBy: true
  },
  {
    Header: <FormattedMessage id="down-limit" />,
    accessor: 'down_limit',
    disableSortBy: true
  },
  {
    Header: <FormattedMessage id="up-limit" />,
    accessor: 'up_limit',
    disableSortBy: true
  },
  {
    Header: <FormattedMessage id="start-time" />,
    accessor: 'start_time',
    disableSortBy: true,
    Cell: ({ value }: { value: string | null }) => (value ? new Date(value).toLocaleString() : '-')
  },
  {
    Header: <FormattedMessage id="time-used" />,
    accessor: 'time_used_sec',
    disableSortBy: true,
    Cell: ({ value }: { value: number }) => `${Math.floor(value / 60)} min`
  },
  {
    Header: <FormattedMessage id="time-left" />,
    accessor: 'time_left_sec',
    disableSortBy: true,
    Cell: ({ value }: { value: number }) => `${Math.floor(value / 60)} min`
  },
  {
    Header: <FormattedMessage id="timing-by-client-usage" />,
    accessor: 'timing_by_client_usage',
    disableSortBy: true,
    Cell: ({ value }: { value: string }) => (value === 'true' ? 'Yes' : 'No')
  },
  {
    Header: <FormattedMessage id="status" />,
    accessor: 'status_id',
    className: 'cell-center',
    disableSortBy: true,
    Cell: ({ value }: { value: number }) => (
      <ChipStatus
        id={value}
        successLabel="active"
        errorLabel="inactive"
        warningLabel="pending"
        dangerLabel="hearbeat_missed"
        isolatedLabel="isolated"
      />
    )
  }
  // {
  //   Header: ' ',
  //   className: 'cell-center',
  //   disableSortBy: true,
  //   Cell: ({ row }: { row: Row<any> }) => (
  //     <ColumnActions
  //       row={row}
  //       handleAdd={params.handleAdd}
  //       handleClose={params.handleClose}
  //       setRecord={params.setRecord}
  //       setRecordDelete={params.setRecordDelete}
  //       setViewRecord={params.setViewRecord}
  //     />
  //   )
  // }
];

export const columnsVoucherGroup = (params: VoucherCols) => [
  {
    width: 70,
    sticky: 'left',
    align: 'center',
    Header: <FormattedMessage id="no." />,
    disableSortBy: true,
    accessor: 'index',
    className: 'cell-center',
    Cell: ({ row }: { row: Row }) => {
      const rowNumber = (params.currentPage - 1) * params.pageSize + row.index + 1;
      return <div className="font-semibold">#{rowNumber}</div>;
    }
  },
  {
    Header: <FormattedMessage id="voucher-group.name" />,
    accessor: 'name',
    disableSortBy: true
  },
  {
    Header: <FormattedMessage id="site" />,
    accessor: 'site.name',
    disableSortBy: true
  },
  // {
  //   Header: <FormattedMessage id="voucher-group.code-from" />,
  //   accessor: 'code_from',
  //   disableSortBy: true,
  //   ClassName: 'hidden',
  //   Cell: ({ value }: { value: number }) => codeFromText(value)
  // },
  // {
  //   Header: <FormattedMessage id="voucher-group.limit-type" />,
  //   accessor: 'limit_type',
  //   disableSortBy: true,
  //   Cell: ({ value }: { value: number }) => limitTypeText(value)
  // },
  // {
  //   Header: <FormattedMessage id="voucher-group.limit-num" />,
  //   accessor: 'limit_num',
  //   disableSortBy: true
  // },
  // {
  //   Header: <FormattedMessage id="voucher-group.duration" />,
  //   accessor: 'duration',
  //   disableSortBy: true
  // },
  // {
  //   Header: <FormattedMessage id="voucher-group.duration-type" />,
  //   accessor: 'duration_type',
  //   disableSortBy: true,
  //   Cell: ({ value }: { value: number }) => durationTypeText(value)
  // },
  // {
  //   Header: <FormattedMessage id="voucher-group.timing-type" />,
  //   accessor: 'timing_type',
  //   disableSortBy: true,
  //   Cell: ({ value }: { value: number }) => timingTypeText(value)
  // },
  // {
  //   Header: <FormattedMessage id="voucher-group.rate-limit-mode" />,
  //   accessor: 'rate_limit_mode',
  //   disableSortBy: true,
  //   Cell: ({ value }: { value: number }) => rateLimitModeText(value)
  // },
  {
    Header: <FormattedMessage id="voucher-group.traffic-enable" />,
    accessor: 'traffic_limit_enable',
    disableSortBy: true,
    Cell: ({ value }: { value: string }) => booleanToChip(value)
  },
  {
    Header: <FormattedMessage id="voucher-group.validity-type" />,
    accessor: 'validity_type',
    disableSortBy: true,
    Cell: ({ value }: { value: number }) => validityTypeText(value)
  },
  {
    Header: <FormattedMessage id="voucher-group.effective-time" />,
    accessor: 'effective_time',
    disableSortBy: true,
    Cell: ({ row }: { row: Row<Voucher> }) =>
      row.original.effective_time ? <div>{formatDateTime(+row.original.effective_time)}</div> : <FormattedMessage id="unknown" />
  },
  {
    Header: <FormattedMessage id="voucher-group.expiration-time" />,
    accessor: 'expiration_time',
    disableSortBy: true,
    Cell: ({ row }: { row: Row<Voucher> }) =>
      row.original.expiration_time ? <div>{formatDateTime(+row.original.expiration_time)}</div> : <FormattedMessage id="unknown" />
  },
  {
    Header: <FormattedMessage id="status" />,
    accessor: 'status_id',
    disableSortBy: true,
    Cell: ({ value }: { value: number }) => (
      <ChipStatus
        id={value}
        successLabel="active"
        errorLabel="inactive"
        warningLabel="pending"
        dangerLabel="hearbeat_missed"
        isolatedLabel="isolated"
      />
    )
  },
  {
    width: 100,
    sticky: 'right',
    align: 'center',
    Header: ' ',
    className: 'cell-center',
    disableSortBy: true,
    Cell: ({ row }: { row: Row }) => (
      <ColumnActions
        canWrite={params.canWrite}
        row={row}
        handleAdd={params.handleAdd}
        handleClose={params.handleClose}
        setRecord={params.setRecord}
        setRecordDelete={params.setRecordDelete}
        setViewRecord={params.setViewRecord}
      />
    )
  }
];
