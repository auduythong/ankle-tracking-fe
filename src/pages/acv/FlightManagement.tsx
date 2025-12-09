import { useIntl } from 'react-intl';
import { useState, useEffect, useMemo, useRef } from 'react';
import useConfig from 'hooks/useConfig';
import useValidationSchemas from 'hooks/useValidation';

//project-import
import { PopupTransition } from 'components/@extended/Transitions';
import { Dialog } from '@mui/material';
import MainCard from 'components/MainCard';
import GeneralizedTable from 'components/organisms/GeneralizedTable';
import ScrollX from 'components/ScrollX';
import Alert from 'components/template/Alert';
import Form from 'components/template/Form';

//config
import { columnsRestrictionDomain } from 'components/ul-config/table-config';

//third-party
import { FormikValues, useFormik } from 'formik';

//types
import { BlackListDomainData, NewBlackListDomain } from 'types';
import { restrictionDomainFields } from 'components/ul-config/form-config';
import useHandleRestriction from 'hooks/useHandleRestriction';
import { RootState, useSelector } from 'store';

const FlightManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  // const [openDialog, setOpenDialog] = useState(false);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');

  const [record, setRecord] = useState<BlackListDomainData | null>(null);
  const [recordDelete, setRecordDelete] = useState<BlackListDomainData | null>(null);
  const [data, setData] = useState<BlackListDomainData[]>([]);
  // const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const intl = useIntl();
  const mountedRef = useRef(true);
  const { RestrictionDomainSchema } = useValidationSchemas();
  const { i18n } = useConfig();

  const { fetchDataRestriction, handleAddRestriction, handleEditRestriction, handleDeleteRestriction, isLoading, totalPages } =
    useHandleRestriction();

  const getDataRestrictionDomain = async (pageSize: number, pageIndex: number, currentSite: string, searchValue?: string) => {
    const [dataRestrictionDomain] = await Promise.all([
      fetchDataRestriction({ page: pageIndex, pageSize, filters: searchValue, siteId: currentSite }, 'domain')
      // fetchDataSites({ page: 1, pageSize: 20 })
    ]);

    setData(dataRestrictionDomain);
    // setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      getDataRestrictionDomain(pageSize, pageIndex, currentSite, search);
      mountedRef.current = false;
    } else if (isReload) {
      getDataRestrictionDomain(pageSize, pageIndex, currentSite, search);
      setIsReload(false);
    } else {
      getDataRestrictionDomain(pageSize, pageIndex, currentSite, search);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, i18n, currentSite, search, isReload]);

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

  const handleRowClick = (row: BlackListDomainData) => {
    setRecord(row);
    // setOpenDialog(true);
  };

  // const handleCloseView = () => {
  //   setOpenDialog(false);
  //   setRecord(null);
  // };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteRestriction({ id: recordDelete?.id }, isDelete, 'domain');
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsRestrictionDomain({
      currentPage: pageIndex,
      pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      isHiddenView: true
    });
    //eslint-disable-next-line
  }, [setRecord, pageIndex, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: RestrictionDomainSchema,
    onSubmit: async (values: NewBlackListDomain) => {
      const handleAction = record ? handleEditRestriction : handleAddRestriction;
      const res = await handleAction(values, 'domain');
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
          addButtonLabel={intl.formatMessage({ id: 'add-restriction-domain' })}
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
          title={record ? intl.formatMessage({ id: 'edit-info-restriction-domain' }) : intl.formatMessage({ id: 'add-restriction-domain' })}
          onCancel={handleAdd}
          fieldConfig={restrictionDomainFields}
          isEditMode={!!record}
          formik={formik}
        />
        {/* <ViewDialog title="restriction-domain-info" open={openDialog} onClose={handleCloseView} data={record} config={deviceViewConfig} /> */}
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-restriction-domain"
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

export default FlightManagement;

const getInitialValues = (blockDomain: FormikValues | null) => {
  return {
    id: blockDomain?.id || 0,
    name: blockDomain?.name || '',
    url: blockDomain?.url || '',
    ipAddress: blockDomain?.ip_address || '',
    ipv6Address: blockDomain?.ipv6_address || '',
    dnsAddress: blockDomain?.dns_address || '',
    reason: blockDomain?.reason || '',
    categoryId: blockDomain?.categoryId || 0
  };
};
