import { useState, SyntheticEvent, useMemo, useEffect } from 'react';
import { useLocation, Link, Outlet, useParams } from 'react-router-dom';

// material-ui
import { Box, Tab, Tabs } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Chart1, InfoCircle } from 'iconsax-react';
import { useIntl } from 'react-intl';

const CampaignDetailsPage = () => {
  const intl = useIntl();
  const { id } = useParams();
  const { pathname } = useLocation();

  const selectedTab = useMemo(() => {
    switch (pathname) {
      case `/campaign/report/${id}`:
        return 1;
      // case `/campaign/user-access/${id}`:
      //   return 1;
      case `/campaign/details/${id}`:
      default:
        return 0;
    }
  }, [pathname, id]);

  const [value, setValue] = useState(selectedTab);

  useEffect(() => {
    setValue(selectedTab);
  }, [selectedTab]);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <MainCard border={false}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
          <Tab
            label={intl.formatMessage({ id: 'info' })}
            component={Link}
            to={`/campaign/details/${id}`}
            icon={<InfoCircle />}
            iconPosition="start"
          />
          <Tab
            label={intl.formatMessage({ id: 'user-traffic' })}
            component={Link}
            to={`/campaign/report/${id}`}
            icon={<Chart1 />}
            iconPosition="start"
          />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        <Outlet />
      </Box>
    </MainCard>
  );
};

export default CampaignDetailsPage;
