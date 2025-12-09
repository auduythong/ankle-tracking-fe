import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';
import { DataAirport } from 'types';
import ColumnActions from './column-action-status/column-action';

interface AirportCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecord: (record: DataAirport) => void;
  setRecordDelete: (record: DataAirport) => void;
  isHiddenView?: boolean;
  isHiddenEdit?: boolean;
  isHiddenDelete?: boolean;
  canWrite?: boolean;
}

export const columnsAirport = (params: AirportCols) => {
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
      Header: <FormattedMessage id="airport-name" />,
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
      Header: <FormattedMessage id="latitude" />,
      disableSortBy: true,
      accessor: 'lat_location',
      className: 'min-w-40'
    },
    {
      Header: <FormattedMessage id="longitude" />,
      disableSortBy: true,
      accessor: 'long_location',
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
