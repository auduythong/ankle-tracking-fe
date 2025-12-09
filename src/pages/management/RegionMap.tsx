import { Grid } from '@mui/material';
import MainCard from 'components/MainCard';
import { useEffect, useState } from 'react';
import { DataRegion } from 'types';
import useHandleRegion from 'hooks/useHandleRegion';
import MapRegion from 'components/organisms/MapRegion';
import SidebarListRegion from 'components/organisms/SidebarListRegion';

const RegionMap = () => {
  const [dataRegion, setDataRegion] = useState<DataRegion[]>([]);
  const [search, setSearch] = useState('');
  const [popupVisibility, setPopupVisibility] = useState<Record<string, boolean>>({});
  const [selectedRegion, setSelectedRegion] = useState<DataRegion | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [pageIndex, setPageIndex] = useState(1);

  const { fetchDataRegion, isLoading } = useHandleRegion();

  const getDataRegion = async (pageIndex: number, search?: string) => {
    const data = await fetchDataRegion({ page: pageIndex, pageSize: 5, filters: search });
    if (data.length > 0) {
      setDataRegion((prev) => [...prev, ...data]);
    } else {
      setHasMore(false);
    }
  };

  useEffect(() => {
    getDataRegion(pageIndex, search);
    //eslint-disable-next-line
  }, [pageIndex, search]);

  const handleSelectRegion = (region: DataRegion) => {
    setSelectedRegion(region);
    const currentVisibility = !!popupVisibility[region.id];
    setPopupVisibility({
      ...popupVisibility,
      [region.id]: !currentVisibility
    });
  };

  const loadMoreRegion = () => {
    if (!isLoading && hasMore) {
      setPageIndex((prev) => prev + 1);
    }
  };

  return (
    <MainCard>
      <Grid container spacing={2}>
        <Grid item xs={12} xl={8}>
          <MapRegion region={dataRegion} selectedRegion={selectedRegion} popupVisibility={popupVisibility} isShowTime={false} heightFull />
        </Grid>
        <Grid item xs={12} xl={4}>
          <SidebarListRegion
            hasMore={hasMore}
            region={dataRegion}
            searchBox={setSearch}
            loadMoreRegions={loadMoreRegion}
            isLoading={isLoading}
            selectedRegion={handleSelectRegion}
          />
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default RegionMap;
