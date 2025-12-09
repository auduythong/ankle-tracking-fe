import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';
import { DataAirline } from 'types';
import ColumnActions from './column-action-status/column-action';

interface AirlineCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecord: (record: DataAirline) => void;
  setRecordDelete: (record: DataAirline) => void;
  isHiddenView?: boolean;
  isHiddenEdit?: boolean;
  isHiddenDelete?: boolean;
  canWrite?: boolean;
}

export const columnsAirline = (params: AirlineCols) => {
  return [
    {
      Header: <FormattedMessage id="no." />,
      disableSortBy: true,
      accessor: 'index',
      className: 'cell-center',
      Cell: ({ row }: { row: Row }) => {
        const rowNumber = (params.currentPage - 1) * params.pageSize + row.index + 1;
        return <div>{rowNumber}</div>;
      }
    },
    {
      Header: <FormattedMessage id="airline-name" />,
      disableSortBy: true,
      accessor: 'name',
      className: 'min-w-28'
    },
    {
      Header: <FormattedMessage id="code" />,
      disableSortBy: true,
      accessor: 'code',
      className: 'min-w-28'
    },
    {
      Header: <FormattedMessage id="origin" />,
      disableSortBy: true,
      accessor: 'origin',
      className: 'min-w-28'
    },
    {
      Header: <FormattedMessage id="email" />,
      disableSortBy: true,
      accessor: 'phone',
      className: 'min-w-28'
    },
    {
      Header: <FormattedMessage id="counter-location" />,
      disableSortBy: true,
      accessor: 'counter_location',
      className: 'min-w-28'
    },
    {
      Header: <FormattedMessage id="description" />,
      disableSortBy: true,
      accessor: 'description',
      className: 'min-w-40'
    },
    {
      Header: ' ',
      disableSortBy: true,
      className: 'cell-center',
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
          canWrite={params.canWrite}
          row={row}
          handleAdd={params.handleAdd}
          handleClose={params.handleClose}
          setRecord={params.setRecord}
          setRecordDelete={params.setRecordDelete}
          isHiddenView={params.isHiddenView}
          isHiddenEdit={params.isHiddenEdit}
          isHiddenDelete={params.isHiddenDelete}
        />
      )
    }
  ];
};
