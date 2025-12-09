import React, { useEffect, useRef } from 'react';
import { DataRegion } from 'types';
import {
  Box,
  List,
  ListItem,
  Divider,
  // ListItemText,
  Typography,
  CircularProgress
} from '@mui/material';

import ChipStatus from 'components/atoms/ChipStatus';
import { GlobalFilter } from 'utils/react-table';

const SidebarListRegion = ({
  region,
  searchBox,
  loadMoreRegions,
  isLoading,
  selectedRegion,
  hasMore
}: {
  region: DataRegion[];
  searchBox: (content: string) => void;
  loadMoreRegions: () => void;
  isLoading: boolean;
  selectedRegion: (device: DataRegion) => void;
  hasMore: boolean;
}) => {
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Infinite Scroll: Quan sát phần tử cuối cùng trong danh sách
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          loadMoreRegions();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
    //eslint-disable-next-line
  }, [isLoading, hasMore]);

  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: '#fff',
        height: '100vh',
        borderLeft: '1px solid #e0e0e0',
        overflowY: 'auto',
        paddingX: 2
      }}
    >
      <GlobalFilter
        searchFilter={searchBox}
        sx={{
          width: '100%'
        }}
      />
      <Divider sx={{ mb: 1 }} />
      <List>
        {region.map((region) => (
          <React.Fragment key={region.id}>
            <ListItem
              button
              sx={{
                borderRadius: 1,
                mb: 2,
                boxShadow: 1,
                ':hover': { backgroundColor: '#f5f5f5' }
              }}
              onClick={() => {
                selectedRegion(region);
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h5" component="div">
                    {region.name}
                  </Typography>
                  <ChipStatus
                    id={region.status_id}
                    successLabel="connected"
                    errorLabel="disconnected"
                    warningLabel="pending"
                    dangerLabel="hearbeat_missed"
                    isolatedLabel="isolated"
                  />
                </Box>
              </Box>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      {isLoading && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={30} />
        </Box>
      )}

      {/* Observer Target */}
      {hasMore && <div ref={observerRef} style={{ height: '10px' }}></div>}
    </Box>
  );
};

export default SidebarListRegion;
