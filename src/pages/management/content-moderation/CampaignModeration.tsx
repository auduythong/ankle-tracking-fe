import { Box, Tab, Tabs } from '@mui/material';
import { ShieldTick } from 'iconsax-react';
import { enqueueSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

// project import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationDialog from 'components/template/ConfirmationDialog';

// hooks & store
import useHandleAd, { paramsGetAds } from 'hooks/useHandleAds';
import useHandleCampaign from 'hooks/useHandleCampaign';
import { usePermissionChecker } from 'hooks/usePermissionChecker';
import { RootState, useSelector } from 'store';

// api & config
import { adApi } from 'api/ad.api';
import { campaignApi } from 'api/campaign.api';
import { columnsAdModeration, columnsCampaignModeration } from 'components/ul-config/table-config/campaign';

// types
import GeneralizedTableV2 from 'components/organisms/GeneralizedTableV2';
import { DataAds, DataCampaign } from 'types';

const CampaignModeration = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { checkPermissionByAccess } = usePermissionChecker();
  const { canWrite } = checkPermissionByAccess('content-moderation');

  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const currentAds = useSelector((state: RootState) => state.authSlice.user?.currentAds ?? '');

  const [tabIndex, setTabIndex] = useState(0);
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabIndex(newValue);

  // ---- Common state for approve ----
  const [record, setRecord] = useState<DataCampaign | DataAds | null>(null);
  const [openApprove, setOpenApprove] = useState(false);
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);

  // ---- Campaign tab ----
  const {
    fetchDataCampaign,
    totalPages: totalCampaignPages,
    isLoading: isLoadingCampaign,
    totalResults: totalCampaignResults
  } = useHandleCampaign();
  const [campaigns, setCampaigns] = useState<DataCampaign[]>([]);
  const [pageCampaign, setPageCampaign] = useState(1);
  const [pageSizeCampaign, setPageSizeCampaign] = useState(10);
  const [searchCampaign, setSearchCampaign] = useState('');

  const queryCampaign = useMemo(
    () => ({
      page: pageCampaign,
      pageSize: pageSizeCampaign,
      siteId: currentSite,
      filters: searchCampaign,
      statusId: 9,
      adDataInput: JSON.stringify(currentAds)
    }),
    [pageCampaign, pageSizeCampaign, currentSite, searchCampaign, currentAds]
  );

  // ---- Ads tab ----
  const { fetchDataAds, totalPages: totalAdPages, isLoading: isLoadingAd, totalResults: totalAdResults } = useHandleAd();
  const [ads, setAds] = useState<DataAds[]>([]);
  const [pageAd, setPageAd] = useState(1);
  const [pageSizeAd, setPageSizeAd] = useState(10);
  const [searchAd, setSearchAd] = useState('');

  const queryAd: paramsGetAds = useMemo(
    () => ({
      page: pageAd,
      pageSize: pageSizeAd,
      siteId: currentSite,
      filters: searchAd,
      statusId: 9,
      adDataInput: JSON.stringify(currentAds)
    }),
    [pageAd, pageSizeAd, currentSite, searchAd, currentAds]
  );

  // ---- Fetch data by tab ----
  useEffect(() => {
    if (tabIndex === 0) fetchDataCampaign(queryCampaign).then(setCampaigns);
    else fetchDataAds(queryAd).then(setAds);
  }, [tabIndex, queryCampaign, queryAd]);

  // ---- Common handlers ----
  const handleApprove = async (record: DataCampaign | DataAds) => {
    try {
      setIsLoadingApprove(true);
      const api = tabIndex === 0 ? campaignApi : adApi;
      const res = await api.approve({ id: record.id, statusId: 1 });
      if (res.data.code === 0) {
        enqueueSnackbar(intl.formatMessage({ id: 'approve-success' }), { variant: 'success' });
        setOpenApprove(false);
        tabIndex === 0 ? fetchDataCampaign(queryCampaign).then(setCampaigns) : fetchDataAds(queryAd).then(setAds);
      }
    } finally {
      setIsLoadingApprove(false);
    }
  };

  const onViewClick = (record: DataCampaign) => {
    const query = record.ad_id ? `?adId=${record.ad_id}` : '';
    navigate(`/content-moderation/details/${record.id}${query}`);
  };

  const onAdViewClick = (record: DataAds) => {
    navigate(`/ads/ads-management/detail?adId=${record.id}`);
  };

  // ---- Render 2 phần riêng ----
  const renderCampaignTab = () => {
    const columns: any = columnsCampaignModeration({
      currentPage: pageCampaign,
      pageSize: pageSizeCampaign,
      handleOpenApprove: (record: DataCampaign) => {
        setRecord(record);
        setOpenApprove(true);
      },
      setRecord,
      canWrite,
      handleView: onViewClick
    });

    const handlePageChange = (newPage: number, newPageSize: number) => {
      console.log({ newPageSize });
      setPageCampaign(newPage);
      setPageSizeCampaign(newPageSize);
    };

    return (
      <GeneralizedTableV2
        isLoading={isLoadingCampaign}
        columns={columns}
        data={campaigns}
        totalPages={totalCampaignPages}
        totalResults={totalCampaignResults}
        onPageChange={handlePageChange}
        size={pageSizeCampaign}
        currentPage={pageCampaign}
        onRowClick={onViewClick}
        onSearch={(v: string) => {
          setSearchCampaign(v);
          setPageCampaign(1);
        }}
        sortColumns="index"
        isDecrease={false}
        canWrite={canWrite}
      />
    );
  };

  const renderAdTab = () => {
    const columns: any = columnsAdModeration({
      currentPage: pageAd,
      pageSize: pageSizeAd,
      handleOpenApprove: (record: DataAds) => {
        setRecord(record);
        setOpenApprove(true);
      },
      setRecord,
      canWrite,
      handleView: onAdViewClick
    });

    const handlePageChange = (newPage: number, newPageSize: number) => {
      setPageAd(newPage);
      setPageSizeAd(newPageSize);
    };

    return (
      <GeneralizedTableV2
        isLoading={isLoadingAd}
        columns={columns}
        data={ads}
        totalPages={totalAdPages}
        totalResults={totalAdResults}
        onPageChange={handlePageChange}
        size={pageSizeCampaign}
        currentPage={pageCampaign}
        onRowClick={onAdViewClick}
        onSearch={(v: string) => {
          setSearchAd(v);
          setPageAd(1);
        }}
        sortColumns="index"
        isDecrease={false}
        canWrite={canWrite}
      />
    );
  };

  // ---- JSX chính ----
  return (
    <MainCard content={false}>
      <Tabs value={tabIndex} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tab label={intl.formatMessage({ id: 'campaign' })} />
        <Tab label={intl.formatMessage({ id: 'advertisement' })} />
      </Tabs>

      <ScrollX>{tabIndex === 0 ? renderCampaignTab() : renderAdTab()}</ScrollX>

      {record && (
        <ConfirmationDialog
          showItemName
          itemName={'name' in record ? record.name : 'template_name' in record ? record.template_name : ''}
          open={openApprove}
          variant="success"
          titleKey={tabIndex === 0 ? 'alert-approve-campaign' : 'alert-approve-advertisement'}
          description={tabIndex === 0 ? 'alert-approve-campaign-desc' : 'alert-approve-advertisement-desc'}
          confirmLabel="confirm"
          confirmButtonColor="success"
          isLoading={isLoadingApprove}
          onClose={() => setOpenApprove(false)}
          onConfirm={() => handleApprove(record)}
          icon={
            <Box
              sx={{
                width: 72,
                height: 72,
                bgcolor: '#e8f5e9',
                color: '#2e7d32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px'
              }}
            >
              <ShieldTick variant="Bold" size="36" color="currentColor" />
            </Box>
          }
        />
      )}
    </MainCard>
  );
};

export default CampaignModeration;
