import { Dialog } from '@mui/material';
import { PopupTransition } from 'components/@extended/Transitions';
import { SelectCheckbox } from 'components/molecules/form';
import Form from 'components/template/Form';
import { partnerFields } from 'components/ul-config/form-config';
import { FormikValues, useFormik } from 'formik';
import useHandleAds from 'hooks/useHandleAds';
import useHandleSite from 'hooks/useHandleSites';
import useValidationSchemas from 'hooks/useValidation';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'store';
import { DataCampaign, NewPartner, OptionList } from 'types';
import { formatDateToSV, getOption } from 'utils/handleData';

interface AdsPartnerDialogProps {
  open: boolean;
  onClose: () => void;
  record: DataCampaign | null;
  onSubmit: (values: NewPartner, resetForm: () => void) => Promise<void>;
  defaultSiteId?: string;
}

const getInitialValues = (partner: FormikValues | null) => {
  const fromDateToSV = formatDateToSV(partner?.from_date);
  const expireDateToSV = formatDateToSV(partner?.expired_date);

  return {
    id: partner?.id || '',
    name: partner?.name || '',
    description: partner?.description || '',
    address: partner?.address || '',
    country: partner?.country || '',
    phoneNumber: partner?.phone_number || '',
    type: partner?.type || 'ads' || '',
    fromDate: fromDateToSV || '',
    expiredDate: expireDateToSV || '',
    siteId: partner?.site_id || '',
    partnerAdAccessId: partner?.partner_ad_access_id || ''
  };
};
const AdsPartnerDialog = ({ open, onClose, record, onSubmit, defaultSiteId }: AdsPartnerDialogProps) => {
  const intl = useIntl();
  const { fetchDataSites } = useHandleSite();
  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const { PartnerSchema } = useValidationSchemas();
  const [adsOptions, setAdsOptions] = useState<OptionList[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const { fetchDataAds } = useHandleAds();
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds ?? '');

  const initialValues = useMemo(() => getInitialValues({ ...record, site_id: defaultSiteId }), [record, defaultSiteId]);

  const formik = useFormik({
    initialValues,
    validationSchema: PartnerSchema,
    onSubmit: async (values: NewPartner, { resetForm }) => {
      onSubmit(values, resetForm);
    },
    enableReinitialize: true
  });

  const getOptionsAds = async () => {
    try {
      setLoadingAds(true);
      const dataAds = await fetchDataAds({
        page: 1,
        pageSize: 100,
        // siteDataInput: siteIdAccess ? JSON.stringify(siteIdAccess) : JSON.stringify([]),
        siteId: currentSite,
        adDataInput: JSON.stringify(currentAds)
      });
      setAdsOptions(getOption(dataAds, 'template_name', 'id'));
    } finally {
      setLoadingAds(false);
    }
  };

  useEffect(() => {
    // if (formik.values.partnerAdAccessId.length > 0) {
    getOptionsAds();
    // } else {
    //   setAdsOptions([]);
    // }
    //eslint-disable-next-line
  }, [currentAds, currentSite]);

  const getOptionsSite = async (regionIdAccess: string) => {
    const dataSite = await fetchDataSites({ page: 1, pageSize: 20, regionDataInput: regionIdAccess });
    setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  useEffect(() => {
    if (regionIdAccess) {
      getOptionsSite(JSON.stringify(regionIdAccess));
    }
  }, [JSON.stringify(regionIdAccess)]);

  const fieldsWithOptions = partnerFields.map((field) => {
    if (field.name === 'siteId') {
      return { ...field, options: optionSite };
    }
    if (field.name === 'partnerAdAccessId') {
      return {
        ...field,
        options: adsOptions,
        customRender: (formik: any) => (
          <SelectCheckbox
            key={field.name}
            name="partnerAdAccessId"
            field="partnerAdAccessId"
            formik={formik}
            inputLabel={intl.formatMessage({ id: field.label })}
            arrayOption={adsOptions}
            required={field.required}
            md={field.md}
            loading={loadingAds}
          />
        )
      };
    }

    return field;
  });

  const handleClose = () => {
    onClose();
    formik.resetForm();
  };

  return (
    <Dialog
      maxWidth="sm"
      TransitionComponent={PopupTransition}
      keepMounted
      fullWidth
      onClose={handleClose}
      open={open}
      sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
    >
      <Form
        title={record ? intl.formatMessage({ id: 'edit-info-partner' }) : intl.formatMessage({ id: 'add-partner' })}
        onCancel={handleClose}
        fieldConfig={fieldsWithOptions}
        isEditMode={!!record}
        formik={formik}
      />
    </Dialog>
  );
};

export default AdsPartnerDialog;
