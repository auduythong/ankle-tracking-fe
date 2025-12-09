import useHandleAirline from 'hooks/acv/useHandleAirline';
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
import { columnsAirline } from 'components/ul-config/table-config/airline';

//third-party
import { FormikValues, useFormik } from 'formik';

//types
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import { airlineFields } from 'components/ul-config/form-config';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { DataAirline, NewAirline } from 'types';

const AirlineManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  // const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<DataAirline | null>(null);
  const [recordDelete, setRecordDelete] = useState<DataAirline | null>(null);
  const [data, setData] = useState<DataAirline[]>([]);
  // const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const intl = useIntl();
  const mountedRef = useRef(true);
  const { AirlineSchema } = useValidationSchemas();
  const { i18n } = useConfig();
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('airline-management');

  const { fetchDataAirline, handleAddAirline, handleEditAirline, handleDeleteAirline, isLoading, totalPages } = useHandleAirline();

  const getDataAirline = async (pageSize: number, pageIndex: number, searchValue?: string) => {
    const [dataAirline] = await Promise.all([
      fetchDataAirline({ page: pageIndex, pageSize, filters: searchValue })
      // fetchDataSites({ page: 1, pageSize: 20 })
    ]);

    setData(dataAirline);
    // setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      getDataAirline(pageSize, page, search);
      mountedRef.current = false;
    } else if (isReload) {
      getDataAirline(pageSize, page, search);
      setIsReload(false);
    } else {
      getDataAirline(pageSize, page, search);
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

  const handleRowClick = (row: DataAirline) => {
    setRecord(row);
    // setOpenDialog(true);
  };

  // const handleCloseView = () => {
  //   setOpenDialog(false);
  //   setRecord(null);
  // };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteAirline({ id: recordDelete?.id }, isDelete);
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsAirline({
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
    validationSchema: AirlineSchema,
    onSubmit: async (values: NewAirline) => {
      const handleAction = record ? handleEditAirline : handleAddAirline;
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
          onRowClick={handleRowClick}
          onSearch={setSearch}
          sortColumns="index"
          isDecrease={false}
          size={pageSize}
          currentPage={page}
          addButtonLabel={intl.formatMessage({ id: 'add-airline' })}
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
          title={record ? intl.formatMessage({ id: 'edit-info-airline' }) : intl.formatMessage({ id: 'add-airline' })}
          onCancel={handleAdd}
          fieldConfig={airlineFields}
          isEditMode={!!record}
          formik={formik}
        />
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-airline"
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

export default AirlineManagement;

const getInitialValues = (airline: FormikValues | null) => {
  return {
    id: airline?.id || 0,
    name: airline?.name || '',
    description: airline?.description || '',
    code: airline?.code || '',
    origin: airline?.origin || '',
    phone: airline?.phone || '',
    email: airline?.email || '',
    imageLink: airline?.image_link || '',
    counterLocation: airline?.counter_location || ''
  };
};
