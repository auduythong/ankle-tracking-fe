import { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

// material-ui
import { Box, Divider, Grid, MenuItem, Select, Typography } from '@mui/material';
import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import { useTheme } from '@mui/material/styles';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { ArrowRight2, Building4, Buildings2, Calendar, Clock, CloseCircle, Home3, Location } from 'iconsax-react';

// types
import { NavItemType } from 'types/menu';
import { OverrideIcon } from 'types/root';

//third-party
import { Stack } from '@mui/material';
import dayjs from 'dayjs';
import useConfig from 'hooks/useConfig';
import useHandleRegion from 'hooks/useHandleRegion';
import useHandleSite from 'hooks/useHandleSites';
import { useIntl } from 'react-intl';
import { dispatch } from 'store';
import { setCurrentRegion, setCurrentSite } from 'store/reducers/auth';
import { OptionList } from 'types';
import { SYSTEM_SITE_ID } from 'utils/constant';
import { getOption } from 'utils/handleData';
// import useHandleSite from 'hooks/useHandleSites';

// ==============================|| BREADCRUMBS ||============================== //

export interface BreadCrumbSxProps extends CSSProperties {
  mb?: string;
  bgcolor?: string;
}

interface Props {
  card?: boolean;
  divider?: boolean;
  icon?: boolean;
  icons?: boolean;
  maxItems?: number;
  navigation?: { items: NavItemType[] };
  rightAlign?: boolean;
  separator?: OverrideIcon;
  title?: boolean;
  titleBottom?: boolean;
  sx?: BreadCrumbSxProps;
}

const Breadcrumbs = ({
  card,
  divider = true,
  icon,
  icons,
  maxItems,
  navigation,
  rightAlign,
  separator,
  title,
  titleBottom,
  sx,
  ...others
}: Props) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const location = useLocation();
  const [main, setMain] = useState<NavItemType | undefined>();
  const [item, setItem] = useState<NavItemType>();
  const [optionRegion, setOptionRegion] = useState<OptionList[]>([]);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);

  const intl = useIntl();
  const now = dayjs();
  const { i18n } = useConfig();

  const currentMonth = now.format('MM');
  const currentYear = now.format('YYYY');

  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  const { fetchDataRegion } = useHandleRegion();
  const { fetchDataSites } = useHandleSite();
  // const sites = useSelector((state) => state.authSlice.user?.sites);

  const getOptionRegion = async () => {
    const dataRegion = await fetchDataRegion({ pageSize: 100 });
    setOptionRegion(getOption(dataRegion, 'name', 'id'));
  };

  const getOptionSite = async (regionId: string) => {
    if (!regionId) {
      setOptionSite([]);
      setSelectedSite('');
      return;
    }
    const regionInput = [regionId];
    const dataSite = await fetchDataSites({
      pageSize: 100,
      regionDataInput: JSON.stringify(regionInput),
      regionId: regionId
    });
    const newOptionSite = getOption(dataSite, 'name', 'id');
    setOptionSite(newOptionSite);
    if (newOptionSite.length === 0 || !newOptionSite.some((site) => site.value === selectedSite)) {
      setSelectedSite('');
    }
  };

  useEffect(() => {
    getOptionRegion();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    const systemRegion = optionRegion?.find((region) => typeof region.label === 'string' && region.label.toLowerCase() === 'system');
    if (systemRegion && !selectedRegion) {
      setSelectedRegion(systemRegion.value as string);
      dispatch(setCurrentRegion({ regionId: systemRegion.value as string }));
      getOptionSite(systemRegion.value as string); // Gọi ngay khi thiết lập region mặc định
    }
    //eslint-disable-next-line
  }, [optionRegion, dispatch, setCurrentRegion]);

  const iconSX = {
    marginRight: theme.spacing(0.75),
    marginTop: `-${theme.spacing(0.25)}`,
    width: '1rem',
    height: '1rem',
    color: theme.palette.secondary.main
  };

  useEffect(() => {
    navigation?.items?.map((menu: NavItemType, index: number) => {
      if (menu.type && menu.type === 'group') {
        getCollapse(menu as { children: NavItemType[]; type?: string });
      }
      return false;
    });
  });

  let customLocation = location.pathname;

  // only used for component demo breadcrumbs
  if (customLocation.includes('/components-overview/breadcrumbs')) {
    customLocation = '/apps/kanban/board';
  }

  if (customLocation.includes('/apps/kanban/backlogs')) {
    customLocation = '/apps/kanban/board';
  }

  useEffect(() => {
    if (customLocation.includes('/apps/profiles/user/payment')) {
      setItem(undefined);
    }
  }, [item, customLocation]);

  // set active item state
  const getCollapse = (menu: NavItemType) => {
    if (menu.children) {
      menu.children.filter((collapse: NavItemType) => {
        if (collapse.type && collapse.type === 'collapse') {
          getCollapse(collapse as { children: NavItemType[]; type?: string });
          if (collapse.url === customLocation) {
            setMain(collapse);
            setItem(collapse);
          }
        } else if (collapse.type && collapse.type === 'item') {
          if (customLocation === collapse.url) {
            setMain(menu);
            setItem(collapse);
          }
        }
        return false;
      });
    }
  };

  // item separator
  const SeparatorIcon = separator!;
  const separatorIcon = separator ? <SeparatorIcon size={12} /> : <ArrowRight2 size={12} />;

  let mainContent;
  let itemContent;
  let breadcrumbContent: ReactElement = <Typography />;
  let itemTitle: NavItemType['title'] = '';
  let CollapseIcon;
  let ItemIcon;

  // collapse item
  if (main && main.type === 'collapse' && main.breadcrumbs === true) {
    CollapseIcon = main.icon ? main.icon : Buildings2;
    mainContent = (
      <Typography
        component={Link}
        to={document.location.pathname}
        variant="h6"
        sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
        color="secondary"
      >
        {icons && <CollapseIcon style={iconSX} />}
        {main.title}
      </Typography>
    );
    breadcrumbContent = (
      <MainCard
        border={card}
        sx={card === false ? { mb: 3, bgcolor: 'transparent', ...sx } : { mb: 3, ...sx }}
        {...others}
        content={card}
        boxShadow={false}
      >
        <Grid
          container
          direction={rightAlign ? 'row' : 'column'}
          justifyContent={rightAlign ? 'space-between' : 'flex-start'}
          alignItems={rightAlign ? 'center' : 'flex-start'}
          spacing={0.5}
        >
          <Grid item xs={6}>
            <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems || 8} separator={separatorIcon}>
              <Typography
                component={Link}
                to="/"
                variant="h6"
                sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                color="textPrimary"
              >
                {icons && <Home3 style={iconSX} />}
                {icon && !icons && <Home3 variant="Bold" style={{ ...iconSX, marginRight: 0 }} />}
                {(!icon || icons) && intl.formatMessage({ id: 'home' })}
              </Typography>

              {mainContent}
            </MuiBreadcrumbs>
          </Grid>
          <Grid item xs={12} sm={6} display="flex" justifyContent="flex-end" alignItems="center" gap={1.5}>
            {/* Location Icon */}
            <Location size={16} color="#6d6d6d" className="max-sm:hidden" />
            {/* Region Select */}
            <Select
              value={selectedRegion}
              onChange={(e) => {
                const newRegionId = e.target.value;
                getOptionSite(newRegionId);
                setSelectedRegion(newRegionId);
                dispatch(setCurrentRegion({ regionId: newRegionId }));
              }}
              renderValue={(selected) => {
                const selectedItem = optionRegion?.find((r) => r.value === selected);
                return (
                  <Typography variant="subtitle2" fontSize={12}>
                    {selectedItem?.label || ''}
                  </Typography>
                );
              }}
              sx={{
                minWidth: 120,
                fontSize: 12,
                color: '#6d6d6d',
                backgroundColor: 'transparent',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiSelect-select': {
                  padding: '0 24px 0 5px',
                  height: 'auto',
                  overflow: 'hidden'
                },
                '& .MuiSvgIcon-root': {
                  color: '#6d6d6d'
                }
              }}
            >
              {optionRegion?.map((region) => (
                <MenuItem key={region.value} value={region.value}>
                  {region.label}
                </MenuItem>
              ))}
            </Select>
            {/* Site Select */}
            <Select
              value={selectedSite}
              onChange={(e) => {
                const newSiteId = e.target.value;
                setSelectedSite(newSiteId);
                dispatch(setCurrentSite({ siteId: newSiteId }));
              }}
              renderValue={(selected) => {
                const selectedItem = optionSite?.find((s) => s.value === selected);
                return (
                  <Typography variant="subtitle2" fontSize={12}>
                    {selectedItem?.label || ''}
                  </Typography>
                );
              }}
              sx={{
                minWidth: 120,
                fontSize: 12,
                color: '#6d6d6d',
                backgroundColor: 'transparent',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '& .MuiSelect-select': {
                  padding: '0 24px 0 5px',
                  height: 'auto',
                  overflow: 'hidden'
                },
                '& .MuiSvgIcon-root': {
                  color: '#6d6d6d'
                }
              }}
            >
              {optionSite?.map((site) => (
                <MenuItem key={site.value} value={site.value}>
                  {site.label}
                </MenuItem>
              ))}
            </Select>
            {/* Clock + Date */}
            <Clock size={16} color="#6d6d6d" className="max-sm:hidden" />
            <Typography variant="body2" color="GrayText" sx={{ marginLeft: 0.5, display: { xs: 'none', sm: 'block' } }}>
              {intl.formatMessage({ id: 'month' })} {currentMonth}
            </Typography>
            <Typography variant="body2" color="GrayText" sx={{ marginX: 0.75, display: { xs: 'none', sm: 'block' } }}>
              {intl.formatMessage({ id: 'year' })} {currentYear}
            </Typography>
            <Typography variant="body2" color="GrayText" sx={{ marginX: 0.5, display: { xs: 'block', sm: 'none' } }}>
              {currentMonth}/{currentYear}
            </Typography>
          </Grid>
          {/* {title && titleBottom && (
            <Grid item xs={12} sx={{ mt: card === false ? 0 : 1 }}>
              <Typography variant="h2" sx={{ fontWeight: 700 }}>
                {main.title}
              </Typography>
            </Grid>
          )} */}
        </Grid>
        {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
      </MainCard>
    );
  }

  // items
  if (item && item.type === 'item') {
    itemTitle = item.title;

    ItemIcon = item.icon ? item.icon : Buildings2;
    itemContent = (
      <Typography variant="h6" color="secondary" sx={{ display: 'flex', alignItems: 'center' }}>
        {icons && <ItemIcon style={iconSX} />}
        {itemTitle}
      </Typography>
    );

    // main
    if (item.breadcrumbs !== false) {
      breadcrumbContent = (
        <MainCard
          border={card}
          sx={card === false ? { mb: 3, bgcolor: 'transparent', ...sx } : { mb: 3, ...sx }}
          {...others}
          content={card}
          boxShadow={false}
        >
          <div className="flex gap-5 flex-col md:flex-row md:items-center justify-between">
            {/* {title && !titleBottom && (
              <Grid item>
                <Typography variant="h2" sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
              </Grid>
            )} */}
            <div>
              <MuiBreadcrumbs aria-label="breadcrumb" maxItems={maxItems || 8} separator={separatorIcon}>
                <Typography
                  component={Link}
                  to="/"
                  color="textPrimary"
                  variant="h6"
                  sx={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                >
                  {icons && <Home3 style={iconSX} />}
                  {icon && !icons && <Home3 variant="Bold" style={{ ...iconSX, marginRight: 0 }} />}
                  {(!icon || icons) && intl.formatMessage({ id: 'home' })}
                </Typography>
                {mainContent}
                {itemContent}
              </MuiBreadcrumbs>
            </div>
            <div>
              <Stack direction="row" alignItems="center" className="flex-nowrap gap-4">
                <div className="flex-1 min-w-0 flex items-center gap-4">
                  {/* Region Selector */}
                  <Box
                    className="flex w-1/2 md:w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors"
                    sx={{
                      bgcolor: isDark ? theme.palette.background.paper : 'grey.100'
                    }}
                  >
                    <Building4 size={16} className={isDark ? 'text-white' : 'text-gray-500'} />

                    <Box className="flex-1">
                      <Select
                        displayEmpty
                        value={selectedRegion}
                        onChange={(e) => {
                          if (selectedSite) {
                            dispatch(setCurrentSite({ siteId: '' }));
                            setSelectedSite('');
                          }
                          const newRegionId = e.target.value;
                          getOptionSite(newRegionId);
                          setSelectedRegion(newRegionId);
                          dispatch(setCurrentRegion({ regionId: newRegionId }));
                        }}
                        renderValue={(selected) => {
                          if (!selected) {
                            return (
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontStyle: 'italic',
                                  color: theme.palette.text.disabled,
                                  fontSize: 12
                                }}
                              >
                                {intl.formatMessage({ id: 'select-region' })}
                              </Typography>
                            );
                          }

                          const selectedItem = optionRegion?.find((r) => r.value === selected);
                          return (
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: isDark ? theme.palette.text.primary : theme.palette.text.secondary
                              }}
                            >
                              {selectedItem?.label || ''}
                            </Typography>
                          );
                        }}
                        disableUnderline
                        className="w-full"
                        variant="standard"
                        sx={{
                          fontSize: 12,
                          minWidth: 100,
                          color: isDark ? theme.palette.text.primary : theme.palette.text.secondary,
                          backgroundColor: 'transparent',
                          padding: 0,
                          '&::before, &::after': { display: 'none' },
                          '& .MuiSelect-select': {
                            padding: 0,
                            paddingRight: '20px',
                            height: 'auto',
                            display: 'flex',
                            alignItems: 'center'
                          },
                          '& .MuiSvgIcon-root': {
                            color: theme.palette.text.primary,
                            fontSize: 18
                          },
                          '& .MuiInputBase-input:focus': {
                            backgroundColor: 'transparent'
                          }
                        }}
                      >
                        {optionRegion?.map((region) => (
                          <MenuItem
                            key={region.value}
                            value={region.value}
                            sx={{
                              color: isDark ? theme.palette.text.primary : theme.palette.text.secondary,
                              bgcolor: 'transparent',
                              '&:hover': {
                                bgcolor: isDark ? theme.palette.action.hover : theme.palette.primary[50]
                              }
                            }}
                          >
                            {region.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                  </Box>

                  {/* Site Selector */}
                  <Box
                    className="flex w-1/2 md:w-full items-center gap-2 rounded-lg px-3 py-2 transition-colors"
                    sx={{
                      bgcolor: isDark ? theme.palette.background.paper : 'grey.100'
                    }}
                  >
                    <Location size={16} className={isDark ? 'text-white' : 'text-gray-500'} />
                    <div className="flex-1 min-w-0">
                      <Select
                        displayEmpty
                        disabled={!selectedRegion}
                        value={selectedSite}
                        onChange={(e) => {
                          const newSiteId = e.target.value;
                          setSelectedSite(newSiteId);
                          if (newSiteId === SYSTEM_SITE_ID) {
                            dispatch(setCurrentSite({ siteId: '' }));
                            return;
                          }
                          dispatch(setCurrentSite({ siteId: newSiteId }));
                        }}
                        renderValue={(selected) => {
                          if (selected.length === 0) {
                            return (
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontStyle: 'italic',
                                  color: theme.palette.text.secondary,
                                  fontSize: 12
                                }}
                              >
                                {intl.formatMessage({ id: 'select-site' })}
                              </Typography>
                            );
                          }

                          const selectedItem = optionSite?.find((s) => s.value === selected);
                          return (
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: isDark ? theme.palette.text.primary : theme.palette.text.secondary
                              }}
                              variant="subtitle2"
                            >
                              {selectedItem?.label || ''}
                            </Typography>
                          );
                        }}
                        className="min-w-[140px] gap-2 w-full"
                        disableUnderline
                        variant="standard"
                        sx={{
                          fontSize: 12,
                          minWidth: 100,
                          color: isDark ? theme.palette.text.primary : theme.palette.text.secondary,
                          backgroundColor: 'transparent',
                          padding: 0,
                          '&::before, &::after': { display: 'none' },
                          '& .MuiSelect-select': {
                            padding: 0,
                            paddingRight: '20px',
                            height: 'auto',
                            display: 'flex',
                            alignItems: 'center'
                          },
                          '& .MuiSvgIcon-root': {
                            color: theme.palette.text.primary,
                            fontSize: 18
                          },
                          '& .MuiInputBase-input:focus': {
                            backgroundColor: 'transparent'
                          }
                        }}
                        IconComponent={(props) => (
                          <>
                            {selectedSite && (
                              <div
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation(); // ngăn mở dropdown
                                  setSelectedSite('');
                                  dispatch(setCurrentSite({ siteId: '' }));
                                }}
                              >
                                <CloseCircle size={16} />
                              </div>
                            )}
                            {/* icon mặc định dropdown */}
                            <svg {...props} />
                          </>
                        )}
                      >
                        {optionSite?.map((site) => (
                          <MenuItem
                            key={site.value}
                            value={site.value}
                            sx={{
                              color: isDark ? theme.palette.text.primary : theme.palette.text.primary,
                              bgcolor: 'transparent',
                              '&:hover': {
                                bgcolor: isDark ? theme.palette.action.hover : theme.palette.primary[50]
                              }
                            }}
                          >
                            {site.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </div>
                  </Box>
                </div>

                {/* Date Display */}
                <div className="md:flex hidden items-center justify-center md:gap-2 py-2">
                  <Calendar size={18} color={theme.palette.primary.main} />
                  <div className="flex items-center space-x-1">
                    <Typography
                      sx={{ color: theme.palette.primary.main }}
                      variant="body2"
                      className="hidden sm:block text-sm leading-[18px]  font-medium"
                    >
                      {
                        i18n === 'vi'
                          ? now.format('[Tháng] MM [năm] YYYY') // => "tháng 08 năm 2025"
                          : now.format('MMMM YYYY') // => "August 2025"
                      }
                    </Typography>
                  </div>
                </div>
              </Stack>
            </div>

            {/* {title && titleBottom && (
              <Grid item xs={12} sx={{ mt: card === false ? 0 : 1 }}>
                <Typography variant="h2" sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
              </Grid>
            )} */}
          </div>
          {card === false && divider !== false && <Divider sx={{ mt: 2 }} />}
        </MainCard>
      );
    }
  }

  return breadcrumbContent;
};

export default Breadcrumbs;
