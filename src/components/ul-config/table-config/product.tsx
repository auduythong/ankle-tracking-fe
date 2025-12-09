//third-party
import { Row } from 'react-table';

//project component
import { FormattedMessage } from 'react-intl';
import ColumnActions from './column-action-status/column-action';

interface ProductCols {
  currentPage: number;
  pageSize: number;
  handleAdd: () => void;
  handleClose: () => void;
  setRecord: (record: any) => void;
  setRecordDelete: (record: any) => void;
  onViewClick?: (record: any) => void;
  hiddenView?: boolean;
  hiddenEdit?: boolean;
  hiddenDelete?: boolean;
  canWrite?: boolean;
}

export const columnsProduct = (params: ProductCols) => {
  return [
    {
      Header: '#',
      disableSortBy: true,
      accessor: 'id',
      className: 'hidden'
    },
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
      Header: <FormattedMessage id="name-product" />,
      disableSortBy: true,
      accessor: 'name'
    },
    {
      Header: <FormattedMessage id="price" />,
      disableSortBy: true,
      accessor: 'price',
      className: 'min-w-28',
      Cell: ({ value }: { value: number }) => {
        return <div>{value.toLocaleString('vi-vn')}</div>;
      }
    },
    {
      Header: <FormattedMessage id="desc" />,
      disableSortBy: true,
      accessor: 'description'
    },
    {
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<{}> }) => (
        <ColumnActions
          canWrite={params.canWrite}
          isHiddenView={params.hiddenView}
          row={row}
          handleAdd={params.handleAdd}
          handleClose={params.handleClose}
          setRecord={params.setRecord}
          setRecordDelete={params.setRecordDelete}
        />
      )
    }
  ];
};
