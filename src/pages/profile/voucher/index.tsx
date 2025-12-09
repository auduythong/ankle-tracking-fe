import { SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';

// material-ui
import { Box, Tab, Tabs } from '@mui/material';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { Chart1, InfoCircle, TableDocument } from 'iconsax-react';
import { useIntl } from 'react-intl';

const VoucherDetailsPage = () => {
  const intl = useIntl();
  const { id } = useParams();
  const { pathname } = useLocation();

  const selectedTab = useMemo(() => {
    switch (pathname) {
      case `/voucher/report/${id}`:
        return 2;
      case `/voucher/vouchers-list/${id}`:
        return 1;
      case `/voucher/details/${id}`:
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
            to={`/voucher/details/${id}`}
            icon={<InfoCircle />}
            iconPosition="start"
          />
          <Tab
            label={intl.formatMessage({ id: 'vouchers-list' })}
            component={Link}
            to={`/voucher/vouchers-list/${id}`}
            icon={<TableDocument />}
            iconPosition="start"
          />
          <Tab
            label={intl.formatMessage({ id: 'report' })}
            component={Link}
            to={`/voucher/report/${id}`}
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

export default VoucherDetailsPage;
