import { IconButton, Tooltip } from '@mui/material';
import { Theme } from '@mui/system';
import ChipStatus from 'components/atoms/ChipStatus';
import { DocumentDownload } from 'iconsax-react';
import { MouseEvent } from 'react';
import { FormattedMessage } from 'react-intl';
import { Row } from 'react-table';
import { ThemeMode } from 'types';
import { Passpoint } from 'types/passpoint';
import ColumnActions from './column-action-status/column-action';

interface PasspointCols {
  currentPage: number;
  pageSize: number;
  handleAdd: (record: Passpoint) => void;
  handleDownload: (record: Passpoint) => void;
  handleClose: () => void;
  setRecord: (record: Passpoint) => void;
  setRecordDelete: (record: Passpoint) => void;
  setViewRecord: (record: Passpoint) => void;
  canWrite?: boolean;
}

export const columnsPasspoint = (params: PasspointCols, theme: Theme, mode: 'light' | 'dark') => {
  return [
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
      disableSortBy: true,
      Header: <FormattedMessage id="email" />,
      accessor: 'email'
    },
    {
      disableSortBy: true,
      Header: <FormattedMessage id="fullname" />,
      accessor: 'fullname'
    },
    {
      disableSortBy: true,
      Header: <FormattedMessage id="phone-number" />,
      accessor: 'phone_number'
    },
    {
      disableSortBy: true,
      Header: <FormattedMessage id="ssid" />,
      accessor: 'ssid.name'
    },
    {
      align: 'center',
      disableSortBy: true,
      Header: <FormattedMessage id="status" />,
      accessor: 'status_id',
      Cell: ({ value }: { value: number }) => <ChipStatus id={value} successLabel="active" errorLabel="inactive" />
    },
    {
      disableSortBy: true,
      Header: <FormattedMessage id="token" />,
      accessor: 'token'
    },

    {
      width: 100,
      sticky: 'right',
      align: 'center',
      Header: ' ',
      className: 'cell-center',
      disableSortBy: true,
      Cell: ({ row }: { row: Row<Passpoint> }) => (
        <ColumnActions
          canWrite={params.canWrite}
          isHiddenView
          isHiddenDelete={row.original.status_id == 2}
          isHiddenEdit={row.original.status_id == 2}
          row={row}
          handleClose={params.handleClose}
          setRecord={params.setRecord}
          setRecordDelete={params.setRecordDelete}
          setViewRecord={params.setViewRecord}
          handleAdd={params.handleAdd}
          children={
            row.original.status_id == 2 ? null : (
              <Tooltip
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: mode === ThemeMode.DARK ? theme.palette.grey[50] : theme.palette.grey[700],
                      opacity: 0.9
                    }
                  }
                }}
                title={<FormattedMessage id="xml-download" />}
              >
                <span
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                  }}
                >
                  <IconButton
                    disabled={!params.canWrite}
                    color="success"
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      params.handleDownload(row.original);
                    }}
                  >
                    {<DocumentDownload />}
                  </IconButton>
                </span>
              </Tooltip>
            )
          }
        />
      )
    }
  ];
};
