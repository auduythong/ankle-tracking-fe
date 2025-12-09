// material-ui
import { useMediaQuery } from '@mui/material';
import { Theme } from '@mui/material/styles';

// project-imports
// import Search from './Search';
// import Message from './Message';
import Localization from './Localization';
import Notification from './Notification';
import Profile from './Profile';
// import MegaMenuSection from './MegaMenuSection';

import useConfig from 'hooks/useConfig';
import DrawerHeader from 'layout/MainLayout/Drawer/DrawerHeader';

// type
import DateTimeDisplay from 'components/atoms/DateTimeDisplay';
import { MenuOrientation } from 'types/config';
import ToggleThemeButton from 'components/molecules/button/ToggleThemeButton';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const { menuOrientation } = useConfig();

  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  return (
    <>
      <div>{menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}</div>
      {/* {!downLG && <NameApp />} */}
      {/* {!downLG && megaMenu} */}
      <div className="flex items-center gap-2 md:gap-3">
        <DateTimeDisplay />
        <Localization />
        <ToggleThemeButton />
        <Notification />
        <Profile />
      </div>
    </>
  );
};

export default HeaderContent;
