// project-imports
import dashboard from './dashboard';
import ACV from './acv';

// types
import { NavItemType } from 'types/menu';

// ==============================|| MENU ITEMS ||============================== //

const menuItems: { items: NavItemType[] } = {
  items: [dashboard, ACV]
};

export default menuItems;
