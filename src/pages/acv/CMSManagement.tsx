import { Button, Card, CardActions, CardContent, CardMedia, Dialog, Grid, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';
import useHandleCMS from 'hooks/acv/useHandleCMS';
import useConfig from 'hooks/useConfig';
import { useEffect, useRef, useState } from 'react';
import { TablePagination } from 'components/third-party/ReactTable';
import { DataCMS, OptionList } from 'types';
import { Add } from 'iconsax-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import Form from 'components/template/Form';
import { PopupTransition } from 'components/@extended/Transitions';
import { cmsFields } from 'components/ul-config/form-config';
import { getOption } from 'utils/handleData';
import useHandleAirport from 'hooks/acv/useHandleAirport';
import useHandleFacilities from 'hooks/acv/useHandleFacilities';
import useValidationSchemas from 'hooks/useValidation';
import { useFormik } from 'formik';
import { usePermissionChecker } from 'hooks/usePermissionChecker';

const CMSManagement = () => {
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [add, setAdd] = useState(false);
  const [optionAirport, setOptionAirport] = useState<OptionList[]>([]);
  const [optionFacilities, setOptionFacilities] = useState<OptionList[]>([]);

  const [dataCMS, setData] = useState<DataCMS[]>([]);
  const mountedRef = useRef(true);
  const [isReload, setIsReload] = useState(false);
  const { i18n } = useConfig();
  const { fetchDataCMS, totalPages, handleAddCMS } = useHandleCMS();
  // const theme = useTheme();
  const intl = useIntl();
  const { CMSSchema } = useValidationSchemas();

  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('cms-management');

  // const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const { fetchDataAirport } = useHandleAirport();
  const { fetchDataFacilities } = useHandleFacilities();

  const handleAdd = () => {
    setAdd(!add);
    // if (record && !add) setRecord(null);
  };

  const handlePageChange = (newPageIndex: number, newPageSize?: number) => {
    setPageIndex(newPageIndex);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPageIndex(1);
    }
  };

  const getDataCMS = async (pageSize: number, pageIndex: number, searchValue?: string) => {
    const [dataCMS] = await Promise.all([
      fetchDataCMS({ page: pageIndex, pageSize, filters: searchValue })
      // fetchDataSites({ page: 1, pageSize: 20 })
    ]);

    setData(dataCMS);
    // setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  const getOptions = async () => {
    const [dataAirport, dataFacilities] = await Promise.all([
      fetchDataAirport({ page: 1, pageSize: 100 }),
      fetchDataFacilities({ page: 1, pageSize: 100 })
    ]);

    setOptionAirport(getOption(dataAirport, 'name', 'id'));
    setOptionFacilities(getOption(dataFacilities, 'name', 'id'));
  };

  const fieldsWithOptions = cmsFields.map((field) => {
    if (field.name === 'airportId') {
      return { ...field, options: optionAirport };
    }
    if (field.name === 'facilityId') {
      return { ...field, options: optionFacilities };
    }
    return field;
  });

  const formik = useFormik({
    initialValues: {
      id: 0,
      title: '',
      description: '',
      expiredAt: '',
      mediaUrl: '',
      type: '',
      facilityId: null,
      airportId: 0,
      statusId: 0,
      priority: 0
    },
    validationSchema: CMSSchema,
    onSubmit: async (values) => {
      const res = await handleAddCMS(values);
      if (res.code === 0) {
        handleAdd();
        setIsReload(true);
      }
    },
    enableReinitialize: true
  });

  useEffect(() => {
    if (mountedRef.current) {
      getDataCMS(pageSize, pageIndex, search);
      getOptions();
      mountedRef.current = false;
    } else if (isReload) {
      getDataCMS(pageSize, pageIndex, search);
      setIsReload(false);
    } else {
      getDataCMS(pageSize, pageIndex, search);
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, i18n, search, isReload]);

  return (
    <>
      <MainCard
        content={false}
        sx={{
          marginBottom: '16px',
          paddingBottom: '18px'
        }}
      >
        <Stack direction="row" justifyContent="center" alignItems="center" sx={{ p: 3, pb: 0, width: '100%', display: 'flex' }}>
          <GlobalFilter searchFilter={setSearch} sx={{ width: 'auto', flexGrow: 1, mr: 2 }} />
          <Button disabled={!canWrite} variant="contained" startIcon={<Add />} onClick={handleAdd} size="small" sx={{ minWidth: '140px' }}>
            <FormattedMessage id="add-cms" />
          </Button>
        </Stack>
      </MainCard>

      <MainCard>
        <Grid container spacing={2} sx={{ padding: 2 }}>
          {dataCMS.map((cms) => (
            <Grid item xs={12} sm={6} md={4} key={cms.id}>
              <Card sx={{ maxWidth: 345, m: 2 }}>
                <CardMedia component="img" height="140" image={cms.media_url} alt={cms.title} />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {cms.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cms.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">
                    <FormattedMessage id="view-more" />
                  </Button>
                  {/* <Button size="small">Edit</Button> */}
                </CardActions>
              </Card>
            </Grid>
          ))}
          <Grid item xs={12}>
            <TablePagination
              gotoPage={handlePageChange}
              onRowsPerPage={handlePageChange}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              pageIndex={pageIndex}
              totalPages={totalPages}
            />
          </Grid>
        </Grid>

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
            title={intl.formatMessage({ id: 'add-cms' })}
            onCancel={handleAdd}
            fieldConfig={fieldsWithOptions}
            // isEditMode={!!record}
            formik={formik}
          />
          {/* <ViewDialog title="airport-info" open={openDialog} onClose={handleCloseView} data={record} config={deviceViewConfig} /> */}
        </Dialog>
      </MainCard>
    </>
  );
};

export default CMSManagement;
