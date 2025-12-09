import { Grid } from '@mui/material';
import AdPreview from 'components/organisms/adManagement/AdPreview';
import AdTypeVideo from 'components/organisms/adManagement/AdTypeVideo';
import { useState } from 'react';
import { useIntl } from 'react-intl';
import { VideoAds } from 'types/Ads';

interface AdSettings extends VideoAds {
  type: 'banner' | 'video';
}

function AdsBanner() {
  const intl = useIntl();
  const [adSettings, setAdSettings] = useState<AdSettings>({
    type: 'video',
    videoUrl: 'https://www.youtube.com/watch?v=JL_AUSdqwg4&ab_channel=VTCTelecom',
    bannerUrl: '',
    nonSkip: false,
    maxLength: 10,
    backgroundColor: '#000000',
    buttonText: '',
    destinationUrl: 'https://www.vtctelecom.com.vn/'
  });

  const handleSave = async () => {
    try {
      // const data = {
      //   type: 'video',
      //   videoUrl: adSettings.videoUrl,
      //   bannerUrl: adSettings.bannerUrl,
      //   non_skip: adSettings.nonSkip,
      //   max_length: adSettings.maxLength,
      //   buttonText: adSettings.buttonText
      // };

      //   const response = await axios.post('https://wifi.vtctelecom.com.vn/api/vtc_wifi_management/v1/ad_management/add_ad', data);
      alert('Ad settings saved successfully:');

      // console.log('Ad settings saved successfully:', response.data);
      // Xử lý dữ liệu trả về nếu cần
    } catch (error) {
      alert('Error saving ad settings:');

      // console.error('Error saving ad settings:', error);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <AdTypeVideo
          settings={{
            videoUrl: adSettings.videoUrl || '',
            bannerUrl: adSettings.bannerUrl || '',
            nonSkip: adSettings.nonSkip || false,
            maxLength: adSettings.maxLength || 10,
            backgroundColor: adSettings.backgroundColor || '#000000',
            buttonText: adSettings.buttonText || '#000000',
            destinationUrl: adSettings.destinationUrl || ''
          }}
          onUpdate={(updated) => setAdSettings({ ...adSettings, ...updated })}
        />
        <button
          onClick={handleSave}
          className="mt-4 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {intl.formatMessage({ id: 'save' })}
        </button>
      </Grid>
      <Grid item xs={6}>
        <AdPreview settings={adSettings} />
      </Grid>
    </Grid>
  );
}

export default AdsBanner;
