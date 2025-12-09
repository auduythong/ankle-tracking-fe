import { useTheme } from '@mui/material/styles';
import { EcommerceMetrix } from 'components/organisms/statistics';
import { ActivitiesCampaignData } from 'hooks/useHandleDataLoginV2';
import { Eye, MainComponent, People, Pointer } from 'iconsax-react';
import { useIntl } from 'react-intl';
import { formatNumberWithUnits } from 'utils/handleData';

interface ListWidgetsProps {
  activitiesCampaignData: ActivitiesCampaignData; // Có thể undefined khi loading
  loading?: boolean; // thêm prop loading
}

function ListWidgets({ activitiesCampaignData, loading = false }: ListWidgetsProps) {
  const theme = useTheme();
  const intl = useIntl();

  return (
    <div className="grid grid-cols-4 gap-4 max-2xl:grid-cols-3 max-xl:grid-cols-2 max-md:grid-cols-1">
      <EcommerceMetrix
        loading={loading}
        primary={intl.formatMessage({ id: 'impression' })}
        secondary={formatNumberWithUnits(activitiesCampaignData.impression_count)}
        color={theme.palette.primary.main}
        iconPrimary={Eye}
        unit={` ${intl.formatMessage({ id: 'times' })}`}
      />

      <EcommerceMetrix
        loading={loading}
        primary={intl.formatMessage({ id: 'click' })}
        secondary={formatNumberWithUnits(activitiesCampaignData.click_count)}
        color={theme.palette.info.main}
        iconPrimary={Pointer}
        unit={` ${intl.formatMessage({ id: 'times' })}`}
      />

      <EcommerceMetrix
        loading={loading}
        primary={intl.formatMessage({ id: 'ctr' })}
        secondary={activitiesCampaignData.ctr_count.toFixed(2)}
        color={theme.palette.warning.main}
        iconPrimary={MainComponent}
        unit={'%'}
      />

      <EcommerceMetrix
        loading={loading}
        primary={intl.formatMessage({ id: 'new-user' })}
        secondary={formatNumberWithUnits(activitiesCampaignData.unique_user_count)}
        color={theme.palette.success.main}
        iconPrimary={People}
        unit={` ${intl.formatMessage({ id: 'people' })}`}
      />
    </div>
  );
}

export default ListWidgets;
