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
import { columnsProduct } from 'components/ul-config/table-config/product';

//third-party
import { FormikValues, useFormik } from 'formik';

//types
import { DataProduct, NewProduct } from 'types';
import { productFields } from 'components/ul-config/form-config';
import useHandleProduct from 'hooks/acv/useHandleProduct';
import { usePermissionChecker } from 'hooks/usePermissionChecker';

const ProductServiceManagement = () => {
  const [open, setOpen] = useState(false);
  const [add, setAdd] = useState(false);
  const [isReload, setIsReload] = useState(false);
  // const [openDialog, setOpenDialog] = useState(false);

  const [record, setRecord] = useState<DataProduct | null>(null);
  const [recordDelete, setRecordDelete] = useState<DataProduct | null>(null);
  const [data, setData] = useState<DataProduct[]>([]);
  // const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [search, setSearch] = useState('');

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const intl = useIntl();
  const mountedRef = useRef(true);
  const { ProductSchema } = useValidationSchemas();
  const { i18n } = useConfig();

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('product-service-management');

  const { fetchDataProduct, handleAddProduct, handleEditProduce, handleDeleteProduct, isLoading, totalPages } = useHandleProduct();

  const getDataProduct = async (pageSize: number, pageIndex: number, searchValue?: string) => {
    const [dataProduct] = await Promise.all([
      fetchDataProduct({ page: pageIndex, pageSize, filters: searchValue })
      // fetchDataSites({ page: 1, pageSize: 20 })
    ]);

    setData(dataProduct);
    // setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (mountedRef.current) {
      getDataProduct(pageSize, pageIndex, search);
      mountedRef.current = false;
    } else if (isReload) {
      getDataProduct(pageSize, pageIndex, search);
      setIsReload(false);
    } else {
      getDataProduct(pageSize, pageIndex, search);
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

  const handleRowClick = (row: DataProduct) => {
    setRecord(row);
    // setOpenDialog(true);
  };

  // const handleCloseView = () => {
  //   setOpenDialog(false);
  //   setRecord(null);
  // };

  const handleDelete = async (isDelete: boolean) => {
    await handleDeleteProduct({ id: recordDelete?.id }, isDelete);
    setIsReload(true);
  };

  const columns = useMemo(() => {
    return columnsProduct({
      currentPage: pageIndex,
      pageSize,
      handleAdd,
      handleClose,
      setRecord,
      setRecordDelete,
      hiddenView: true,
      canWrite
    });
    //eslint-disable-next-line
  }, [setRecord, pageIndex, pageSize]);

  const initialValues = useMemo(() => getInitialValues(record), [record]);

  const formik = useFormik({
    initialValues,
    validationSchema: ProductSchema,
    onSubmit: async (values: NewProduct) => {
      const handleAction = record ? handleEditProduce : handleAddProduct;
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
          addButtonLabel={intl.formatMessage({ id: 'add-product' })}
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
          title={record ? intl.formatMessage({ id: 'edit-info-product' }) : intl.formatMessage({ id: 'add-product' })}
          onCancel={handleAdd}
          fieldConfig={productFields}
          isEditMode={!!record}
          formik={formik}
        />
        {/* <ViewDialog title="product-info" open={openDialog} onClose={handleCloseView} data={record} config={deviceViewConfig} /> */}
        {recordDelete && (
          <Alert
            alertDelete="alert-delete-product"
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

export default ProductServiceManagement;

const getInitialValues = (product: FormikValues | null) => {
  return {
    id: product?.id || 0,
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0
  };
};
