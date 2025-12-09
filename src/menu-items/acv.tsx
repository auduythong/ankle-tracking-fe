// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Devices, Briefcase, Mobile, Airplane, Building, People, Bookmark, Warning2, Bag2 } from 'iconsax-react';
import { TailAirplane } from 'components/atoms/icon';
// type
import { NavItemType } from 'types';

// icons
const icons = {
  deviceList: Devices,
  partner: Briefcase,
  mobile: Mobile,
  flight: Airplane,
  facility: Building,
  user: People,
  productService: Briefcase,
  cms: Bookmark,
  airline: TailAirplane,
  warning: Warning2,
  order: Bag2
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const ACV: NavItemType = {
  id: 'acv',
  // title: <FormattedMessage id="management" />,
  type: 'group',
  children: [
    {
      id: 'vtc-digital-map',
      title: 'VTC Digital Map',
      type: 'collapse',
      icon: icons.mobile,
      children: [
        // {
        //   id: 'flight-management',
        //   title: <FormattedMessage id="flight-management" />,
        //   type: 'item',
        //   icon: icons.flight,
        //   url: '/vtc-digital-map/flight-management'
        // },
        {
          id: 'facilities-management',
          title: <FormattedMessage id="facilities-management" />,
          type: 'item',
          icon: icons.facility,
          url: '/vtc-digital-map/facilities-management'
        },
        {
          id: 'airport-management',
          title: <FormattedMessage id="airport-management" />,
          type: 'item',
          icon: icons.flight,
          url: '/vtc-digital-map/airport-management'
        },
        {
          id: 'airline-management',
          title: <FormattedMessage id="airline-management" />,
          type: 'item',
          icon: icons.airline,
          url: '/vtc-digital-map/airline-management'
        },
        {
          id: 'cms-management',
          title: <FormattedMessage id="cms-management" />,
          type: 'item',
          icon: icons.cms,
          url: '/vtc-digital-map/cms-management'
        },
        {
          id: 'user-management',
          title: <FormattedMessage id="user-management" />,
          type: 'item',
          icon: icons.user,
          url: '/vtc-digital-map/user-management'
        },
        {
          id: 'product-service-management',
          title: <FormattedMessage id="product-service-management" />,
          type: 'item',
          icon: icons.productService,
          url: '/vtc-digital-map/product-service-management'
        },
        {
          id: 'incident-feedback-management',
          title: <FormattedMessage id="incident-feedback-management" />,
          type: 'item',
          icon: icons.warning,
          url: '/vtc-digital-map/incident-feedback-management'
        },
        {
          id: 'order-management-digital',
          title: <FormattedMessage id="order-management" />,
          type: 'item',
          icon: icons.order,
          url: '/vtc-digital-map/order-management-digital'
        }
      ]
    }
  ]
};

export default ACV;
