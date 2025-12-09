import { SyntheticEvent, useMemo, useState } from 'react';

// material-ui
import { Box, Button, Tab, Tabs } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { ArrowLeft2 } from 'iconsax-react';
import TabCampaignInfo from 'pages/profile/campaign/TabCampaignInfo';
import { useIntl } from 'react-intl';
import { useLocation, useNavigate, useParams } from 'react-router';
import AdsSamplePage from '../ads-sample/AdsSamplePage';

const CampaignDetailsPage = () => {
  const intl = useIntl();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [value, setValue] = useState(0); // mặc định tab đầu tiên

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Lấy query param adId
  const adId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('adId') ?? undefined;
  }, [location.search]);

  const handleBack = () => {
    // navigate(-1); // quay về trang trước đó
    navigate('/ads/content-moderation');
  };

  if (!id) {
    return null;
  }

  return (
    <MainCard border={false}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="campaign detail tabs">
          <Tab label={intl.formatMessage({ id: 'campaign-info' })} iconPosition="start" />
          <Tab label={intl.formatMessage({ id: 'ad-info' })} iconPosition="start" />
        </Tabs>
      </Box>
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'flex-start' }}>
        <Button variant="text" startIcon={<ArrowLeft2 />} onClick={handleBack}>
          {intl.formatMessage({ id: 'back' })}
        </Button>
      </Box>

      <Box sx={{ mt: 2.5 }}>
        {value === 0 && <TabCampaignInfo initId={id} />}
        {value === 1 && <AdsSamplePage initId={adId} />}
      </Box>
    </MainCard>
  );
};

export default CampaignDetailsPage;
