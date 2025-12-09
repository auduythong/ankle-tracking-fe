import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';
import { DataFacilities } from 'types';
import ColumnActions from './column-action-status/column-action';

interface FacilitiesCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecord: (record: DataFacilities) => void;
  setRecordDelete: (record: DataFacilities) => void;
  isHiddenView?: boolean;
  isHiddenEdit?: boolean;
  isHiddenDelete?: boolean;
  canWrite?: boolean;
}

export const columnsFacilities = (params: FacilitiesCols) => {
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
      Header: <FormattedMessage id="facility-name" />,
      accessor: 'name',
      className: 'min-w-28'
    },
    {
      Header: <FormattedMessage id="description" />,
      accessor: 'description',
      className: 'min-w-40'
    },
    // {
    //   Header: <FormattedMessage id="airport-id" />,
    //   accessor: 'airportId',
    //   className: 'min-w-20'
    // },
    {
      Header: <FormattedMessage id="facility-type" />,
      accessor: 'type',
      className: 'min-w-20'
    },
    {
      Header: <FormattedMessage id="image-link" />,
      accessor: 'imageLink',
      Cell: ({ value }: { value: string }) => (
        <a href={value} target="_blank" rel="noopener noreferrer">
          View Image
        </a>
      ),
      className: 'min-w-28'
    },
    {
      Header: <FormattedMessage id="latitude" />,
      accessor: 'latLocation',
      className: 'min-w-20'
    },
    {
      Header: <FormattedMessage id="longitude" />,
      accessor: 'longLocation',
      className: 'min-w-20'
    },
    {
      Header: <FormattedMessage id="floor" />,
      accessor: 'floor',
      className: 'min-w-20'
    },
    {
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
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
