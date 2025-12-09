// import logoDev from 'assets/logo/logo192.png';
import logoStaging from 'assets/logo/MobiFone_logo.svg';
import logoProd from 'assets/logo/vnpt-vtc.svg';

export const ENV = import.meta.env.VITE_APP_ENV;

export default {
  isDev: import.meta.env.DEV,
  logoDefault: ENV === 'staging' ? logoStaging : logoProd
};
