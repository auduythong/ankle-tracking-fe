import { useMemo } from 'react';

// material-ui
import { Drawer, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project-imports
import DrawerContent from './DrawerContent';
import DrawerHeader from './DrawerHeader';
import MiniDrawerStyled from './MiniDrawerStyled';

import { Box } from '@mui/material';
import { DRAWER_WIDTH } from 'config';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react';
import { dispatch, useSelector } from 'store';
import { openDrawer } from 'store/reducers/menu';

// ==============================|| MAIN LAYOUT - DRAWER ||============================== //

interface Props {
  window?: () => Window;
}

const MainDrawer = ({ window }: Props) => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { drawerOpen } = useSelector((state) => state.menu);

  // responsive drawer container
  const container = window !== undefined ? () => window().document.body : undefined;

  // header content
  const drawerContent = useMemo(() => <DrawerContent />, []);
  const drawerHeader = useMemo(() => <DrawerHeader open={drawerOpen} />, [drawerOpen]);

  return (
    <div className="lg:pl-5">
      {!downLG ? (
        <MiniDrawerStyled
          variant="permanent"
          open={drawerOpen}
          sx={{
            '& .MuiDrawer-paper': {
              position: 'fixed',
              top: '20px',
              left: '20px',
              bottom: '20px',
              height: 'calc(100vh - 40px)',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: `1px solid ${theme.palette.divider}`
            }
          }}
        >
          {/* Toggle Button */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: -16,
              zIndex: 20,
              transform: 'translateY(-50%)',
              bgcolor: theme.palette.primary.main,
              borderRadius: '50%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-50%) scale(1.1)',
                bgcolor: theme.palette.primary.dark
              }
            }}
            onClick={() => dispatch(openDrawer(!drawerOpen))}
          >
            {!drawerOpen ? (
              <ArrowRight2 size="20" color="#fff" className="transition-transform duration-300" />
            ) : (
              <ArrowLeft2 size="20" color="#fff" className="transition-transform duration-300" />
            )}
          </Box>
          {drawerHeader}
          {drawerContent}
        </MiniDrawerStyled>
      ) : (
        <Drawer
          container={container}
          variant="temporary"
          open={drawerOpen}
          onClose={() => dispatch(openDrawer(!drawerOpen))}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${theme.palette.divider}`,
              backgroundImage: 'none',
              boxShadow: 'inherit',
              overflowX: 'hidden'
            }
          }}
        >
          {drawerHeader}
          {drawerContent}
        </Drawer>
      )}
    </div>
  );
};

export default MainDrawer;
