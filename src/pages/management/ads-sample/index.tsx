import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import TabbedCard from 'components/organisms/Tab';
// import MainCard from 'components/MainCard';
import { GalleryEdit, VideoPlay, DocumentText1 } from 'iconsax-react';

function AdsSample() {
  const { id } = useParams();
  const location = useLocation();

  const tabsConfig = [
    { label: 'Banner', to: `/ad-handle/${id ? 'edit' : 'add'}/ad-banner${id ? `/${id}` : ''}`, icon: <GalleryEdit /> },
    { label: 'Video', to: `/ad-handle/${id ? 'edit' : 'add'}/ad-video${id ? `/${id}` : ''}`, icon: <VideoPlay /> },
    { label: 'Survey', to: `/ad-handle/${id ? 'edit' : 'add'}/ad-survey${id ? `/${id}` : ''}`, icon: <DocumentText1 /> },
    { label: 'App', to: `/ad-handle/${id ? 'edit' : 'add'}/ad-app${id ? `/${id}` : ''}`, icon: <DocumentText1 /> }
  ];

  const findTabIndex = (path: string) => {
    const match = tabsConfig.findIndex((tab) => path.startsWith(tab.to));
    return match === -1 ? 0 : match; // Default to the first tab if no match is found
  };

  const [selectedTab, setSelectedTab] = useState(findTabIndex(location.pathname));

  useEffect(() => {
    const tabIndex = findTabIndex(location.pathname);
    setSelectedTab(tabIndex);
    //eslint-disable-next-line
  }, [location.pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return <TabbedCard tabs={tabsConfig} value={selectedTab} handleChange={handleChange} sx={{ display: 'none' }} />;
}

export default AdsSample;
