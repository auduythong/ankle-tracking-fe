import { useIntl } from 'react-intl';
import { useState, useEffect, useMemo, useRef } from 'react';
import useConfig from 'hooks/useConfig';
import useValidationSchemas from 'hooks/useValidation';
import useHandleFacilities from 'hooks/acv/useHandleFacilities';

//project-import
import { PopupTransition } from 'components/@extended/Transitions';
import { Dialog } from '@mui/material';
import MainCard from 'components/MainCard';
import GeneralizedTable from 'components/organisms/GeneralizedTable';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import Form from 'components/template/Form';
import MapFacilities from 'components/organisms/MapFacilities';

//config
import { columnsFacilities } from 'components/ul-config/table-config/facilities';
import { facilitiesFields } from 'components/ul-config/form-config';

//third-party
import { FormikValues, useFormik } from 'formik';

//types
import { DataFacilities, NewFacilities, OptionList } from 'types';
import useHandleAirport from 'hooks/acv/useHandleAirport';
import { getOption } from 'utils/handleData';
import { usePermissionChecker } from 'hooks/usePermissionChecker';

const FacilitiesManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  const [popupVisibility, setPopupVisibility] = useState<Record<string, boolean>>({});
  const [selectedFacilities, setSelectedFacilities] = useState<DataFacilities | null>(null);

  const [record, setRecord] = useState<DataFacilities | null>(null);
  const [recordDelete, setRecordDelete] = useState<DataFacilities | null>(null);
  const [data, setData] = useState<DataFacilities[]>([]);
  const [optionAirport, setOptionAirport] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const intl = useIntl();
  const mountedRef = useRef(true);
  const { FacilitiesSchema } = useValidationSchemas();
  const { i18n } = useConfig();

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('facilities-management');

  const { fetchDataFacilities, handleAddFacilities, handleDeleteFacilities, handleEditFacilities, isLoading, totalPages } =
    useHandleFacilities();
  const { fetchDataAirport } = useHandleAirport();

  const getDataFacilities = async (pageSize: number, pageIndex: number, searchValue?: string) => {
    const [dataFacilities] = await Promise.all([
      fetchDataFacilities({ page: pageIndex, pageSize, filters: searchValue })
      // fetchDataSites({ page: 1, pageSize: 20 })
    ]);

    setData(dataFacilities);
    // setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  const getOptionAirport = async () => {
    const [dataAirport] = await Promise.all([
      fetchDataAirport({ page: 1, pageSize: 100 })
      // fetchDataSites({ page: 1, pageSize: 20 })
    ]);

    setOptionAirport(getOption(dataAirport, 'name', 'id'));
    // setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      getDataFacilities(pageSize, pageIndex, search);
      getOptionAirport();
      mountedRef.current = false;
    } else if (isReload) {
      getDataFacilities(pageSize, pageIndex, search);
      setIsReload(false);
    } else {
      getDataFacilities(pageSize, pageIndex, search);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, i18n, search, isReload]);

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex + 1);
    setPageSize(newPageSize);
  };

  const handleAdd = () => {
    setAdd(!add);
    if (record && !add) setRecord(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };

  const handleRowClick = (row: DataFacilities) => {
    setRecord(row);
    handleSelectFacilities(row);
    // setOpenDialog(true);
  };

  // const handleCloseView = () => {
  //   setOpenDialog(false);
  //   setRecord(null);
  // };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteFacilities({ id: recordDelete?.id }, isDelete);
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsFacilities({
      currentPage: pageIndex,
      pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      isHiddenView: true,
      canWrite
    });
    //eslint-disable-next-line
  }, [setRecord, pageIndex, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: FacilitiesSchema,
    onSubmit: async (values: NewFacilities) => {
      const handleAction = record ? handleEditFacilities : handleAddFacilities;
      const res = await handleAction(values);
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
    },
    enableReinitialize: true
  });

  const handleSelectFacilities = (facilities: DataFacilities) => {
    setSelectedFacilities(facilities);
    const currentVisibility = !!popupVisibility[facilities.id];
    setPopupVisibility({
      ...popupVisibility,
      [facilities.id]: !currentVisibility
    });
  };

  const fieldsWithOptions = facilitiesFields.map((field) => {
    if (field.name === 'airportId') {
      return { ...field, options: optionAirport };
    }
    return field;
  });

  return (
    <>
      <MainCard>
        <MapFacilities facilities={data} isShowTime={false} popupVisibility={popupVisibility} selectedFacilities={selectedFacilities} />
        <MainCard
          content={false}
          sx={{
            marginTop: '20px'
          }}
        >
          <ScrollX>
            <GeneralizedTable
              isLoading={isLoading}
              columns={columns}
              data={data}
              handleAdd={handleAdd}
              onPageChange={handlePageChange}
              totalPages={totalPages}
              onRowClick={handleRowClick}
              searchFilter={setSearch}
              sortColumns="index"
              isDecrease={false}
              addButtonLabel={intl.formatMessage({ id: 'add-facility' })}
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
              title={record ? intl.formatMessage({ id: 'edit-info-facility' }) : intl.formatMessage({ id: 'add-facility' })}
              onCancel={handleAdd}
              fieldConfig={fieldsWithOptions}
              isEditMode={!!record}
              formik={formik}
            />
            {recordDelete && (
              <Alert
                alertDelete="alert-delete-facility"
                nameRecord={recordDelete.name}
                open={open}
                handleClose={handleClose}
                handleDelete={handleDelete}
              />
            )}
          </Dialog>
        </MainCard>
      </MainCard>
    </>
  );
};

export default FacilitiesManagement;

const getInitialValues = (facilities: FormikValues | null) => {
  return {
    id: facilities?.id || 0,
    name: facilities?.name || '',
    description: facilities?.description || '',
    airportId: facilities?.airport_id || '',
    type: facilities?.type || '',
    imageLink: facilities?.image_link || '',
    latLocation: facilities?.lat_location || '',
    longLocation: facilities?.long_location || '',
    floor: facilities?.floor || ''
  };
};
