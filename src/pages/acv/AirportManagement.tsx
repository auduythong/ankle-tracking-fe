import useHandleAirport from 'hooks/acv/useHandleAirport';
import useConfig from 'hooks/useConfig';
import useValidationSchemas from 'hooks/useValidation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

//project-import
import { Dialog } from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import Form from 'components/template/Form';

//config
import { columnsAirport } from 'components/ul-config/table-config/airport';

//third-party
import { FormikValues, useFormik } from 'formik';

//types
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import { airportFields } from 'components/ul-config/form-config';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { DataAirport, NewAirport } from 'types';

const AirportManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  // const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<DataAirport | null>(null);
  const [recordDelete, setRecordDelete] = useState<DataAirport | null>(null);
  const [data, setData] = useState<DataAirport[]>([]);
  // const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const intl = useIntl();
  const mountedRef = useRef(true);
  const { AirportSchema } = useValidationSchemas();
  const { i18n } = useConfig();
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('airport-management');

  const { fetchDataAirport, handleAddAirport, handleEditAirport, handleDeleteAirport, isLoading, totalPages, totalResults } =
    useHandleAirport();

  const getDataAirport = async (pageSize: number, pageIndex: number, searchValue?: string) => {
    const [dataAirport] = await Promise.all([
      fetchDataAirport({ page: pageIndex, pageSize, filters: searchValue })
      // fetchDataSites({ page: 1, pageSize: 20 })
    ]);

    setData(dataAirport);
    // setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      getDataAirport(pageSize, page, search);
      mountedRef.current = false;
    } else if (isReload) {
      getDataAirport(pageSize, page, search);
      setIsReload(false);
    } else {
      getDataAirport(pageSize, page, search);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, i18n, search, isReload]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };
  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleRowClick = (row: DataAirport) => {
    setRecord(row);
    // setOpenDialog(true);
  };

  // const handleCloseView = () => {
  //   setOpenDialog(false);
  //   setRecord(null);
  // };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteAirport({ id: recordDelete?.id }, isDelete);
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsAirport({
      currentPage: page,
      pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      isHiddenView: true,
      canWrite
    });
    //eslint-disable-next-line
  }, [setRecord, page, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: AirportSchema,
    onSubmit: async (values: NewAirport) => {
      const handleAction = record ? handleEditAirport : handleAddAirport;
      const res = await handleAction(values);
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
    },
    enableReinitialize: true
  });

  // const fieldsWithOptions = deviceFields.map((field) => {
  //   if (field.name === 'siteId') {
  //     return { ...field, options: optionSite };
  //   }
  //   return field;
  // });

  return (
    <MainCard content={false}>
      <ScrollX>
        <GeneralizedTableV2
          isLoading={isLoading}
          columns={columns}
          data={data}
          onAddNew={handleAdd}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalResults={totalResults}
          size={pageSize}
          currentPage={page}
          onRowClick={handleRowClick}
          onSearch={setSearch}
          sortColumns="index"
          isDecrease={false}
          addButtonLabel={intl.formatMessage({ id: 'add-airport' })}
          canWrite={canWrite}
        />
      </ScrollX>
      <Dialog
        maxWidth="sm"
        TransitionComponent={PopupTransition}
        keepMounted
        fullWidth
        onClose={handleAdd}
        open={add}
        sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
        aria-describedby="alert-dialog-slide-description"
      >
        <Form
          title={record ? intl.formatMessage({ id: 'edit-info-airport' }) : intl.formatMessage({ id: 'add-airport' })}
          onCancel={handleAdd}
          fieldConfig={airportFields}
          isEditMode={!!record}
          formik={formik}
        />
        {/* <ViewDialog title="airport-info" open={openDialog} onClose={handleCloseView} data={record} config={deviceViewConfig} /> */}
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-airport"
            nameRecord={recordDelete.name}
            open={open}
            handleClose={handleClose}
            handleDelete={handleDelete}
          />
        )}
      </Dialog>
    </MainCard>
  );
};

export default AirportManagement;

const getInitialValues = (airport: FormikValues | null) => {
  return {
    id: airport?.id || 0,
    name: airport?.name || '',
    code: airport?.code || '',
    latLocation: airport?.lat_location || '',
    longLocation: airport?.long_location || ''
  };
};
