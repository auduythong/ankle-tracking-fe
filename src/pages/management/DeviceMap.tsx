import { Box, FormControl, Grid, Select, Tab, Tabs } from '@mui/material';
import MainCard from 'components/MainCard';
// import Map from 'components/organisms/Map';
import * as MapxusMap from '@mapxus/mapxus-map';
import '@mapxus/mapxus-map/dist/index.css';
import { InputLabel, MenuItem } from '@mui/material';
import ChipStatus from 'components/atoms/ChipStatus';
import EditDeviceDialog from 'components/organisms/EditDeviceDialog';
import Map from 'components/organisms/Map';
import SidebarList from 'components/organisms/SidebarList';
import TopologyView from 'components/organisms/TopologyView';
import { useFormik } from 'formik';
import useHandleDevice from 'hooks/useHandleDevice';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { FormattedMessage, IntlProvider, useIntl } from 'react-intl';
import { useLocation } from 'react-router';
import { ENV } from 'settings';
import { RootState, useSelector } from 'store';
import 'styles/map-popup.css';
import { DataDevice, DeviceStatus, NewDevice } from 'types';
// import markerImg from '../../assets/images/ap-icon.jpg';

interface LocationPoint {
  featureId: number;
  point: { lngLat: [number, number]; floorId: string; floorName: string } | null;
  markerProperties: any;
  value: string;
  active: boolean;
}

interface Building {
  poiId: string;
  buildingId: string;
  name: { [key: string]: string };
  location: { lngLat: { lat: number; lon: number }; address: { [key: string]: string } };
  image?: string;
  rating?: number;
  reviewCount?: number;
}

const DeviceMap = () => {
  const intl = useIntl();
  const location = useLocation();
  const [dataDevice, setDataDevice] = useState<DataDevice[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<MapxusMap.Map | null>(null);
  const [maplibreMap, setMaplibreMap] = useState<maplibregl.Map | null>(null);

  const [pageIndex, setPageIndex] = useState(1);
  const currentSite = useSelector((state: RootState) => state.authSlice.user?.currentSites ?? '');
  const [isPlanning, setIsPlanning] = useState(false);
  const [distance, setDistance] = useState('');
  const [errorTip, setErrorTip] = useState('');
  // const [showDirectionsPopup, setShowDirectionsPopup] = useState(false);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [routePainter, setRoutePainter] = useState<MapxusMap.RoutePainter | null>(null);
  const [isDirectionsMode, setIsDirectionsMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  // const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  // const [optionRegion, setOptionRegion] = useState<OptionList[]>([]);
  const [filters, setFilters] = useState<{ site?: string; region?: string; floor: string }>({ floor: '1' });
  const user = useSelector((state: RootState) => state.authSlice.user);
  // const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const [selectedType, setSelectedType] = useState<string>();
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DataDevice>();
  const [activeTab, setActiveTab] = useState<number>(0);

  const [openEditDevice, setOpenEditDevice] = useState(false);

  const markersRef = useRef<MapxusMap.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [fromLocation, setFromLocation] = useState<LocationPoint>({
    featureId: 1,
    point: null,
    markerProperties: null,
    value: '',
    active: false
  });
  const [toLocation, setToLocation] = useState<LocationPoint>({
    featureId: 2,
    point: null,
    markerProperties: null,
    value: '',
    active: false
  });

  const { fetchDataDevice, handleUpdateLocation } = useHandleDevice({});

  const clearRouteState = () => {
    routePainter?.remove();
    // setInstructions([]);
    // setDistance('');
    // setErrorTip('');
    setIsPlanning(false);
    if (maplibreMap?.getLayer('step-circle-layer')) {
      maplibreMap.removeLayer('step-circle-layer');
    }
    if (maplibreMap?.getSource('step-circle-source')) {
      maplibreMap.removeSource('step-circle-source');
    }
  };

  // const closeDetail = () => {
  //   setSelectedBuilding(null);
  //   setShowDirectionsPopup(false);
  // };

  const formik = useFormik({
    initialValues: {
      lat: selectedDevice?.device_lat,
      lng: selectedDevice?.device_lng,
      location: [selectedDevice?.device_lat, selectedDevice?.device_lng]
    } as NewDevice,
    // validationSchema: DeviceSchema,
    onSubmit: async (values: any, { resetForm }) => {
      const { lat, lng } = values;
      const res = await handleUpdateLocation({ lat: +lat, lng: +lng });
      if (res.code === 0) {
        const updatedDevices = dataDevice.map((device) =>
          device.id === values.id ? ({ ...device, ...values, device_lat: values.lat, device_lng: values.lng } as DataDevice) : device
        );

        setDataDevice(updatedDevices);
        setOpenEditDevice(false);

        if (maplibreMap && map && isMapReady) {
          renderPopup(maplibreMap, { device_lat: values.lat as number, device_lng: values.lng as number } as DataDevice);
          renderDeviceMarkers(updatedDevices, maplibreMap, map);
          if (values.lat && values.lng) {
            maplibreMap.flyTo({ center: [+values.lat, +values.lng], zoom: 18, speed: 1.2 });
          }
        }
      }
      resetForm();
    },
    enableReinitialize: true
  });

  // const getOptionsSite = async (regionId: string) => {
  //   const siteList = [];
  //   siteList.push(String(regionId));
  //   const dataSite = await fetchDataSites({ page: 1, pageSize: 100, regionDataInput: JSON.stringify(siteList) });
  //   // setOptionSite(getOption(dataSite, 'name', 'id'));
  // };

  // const fetchOptionSettings = async () => {
  //   const dataRegion = await fetchDataRegion({ page: 1, pageSize: 20, regionDataInput: JSON.stringify(regionIdAccess) });

  //   // setOptionRegion(getOption(dataRegion, 'name', 'id'));
  // };

  // useEffect(() => {
  //   if (filters.region) {
  //     getOptionsSite(filters.region);
  //   } else {
  //     // setOptionSite([]);
  //   }
  //   //eslint-disable-next-line
  // }, [filters.region]);

  // useEffect(() => {
  //   fetchOptionSettings();

  //   //eslint-disable-next-line
  // }, []);

  const handlePlanRoute = async () => {
    const routeService = new MapxusMap.RouteService();
    if (!fromLocation.point || !toLocation.point) {
      // setErrorTip('Please select both From and To points.');
      return;
    }

    if (isPlanning) clearRouteState();
    setIsLoading(true);
    // setErrorTip('');

    const points = [
      { lat: fromLocation.point.lngLat[1], lon: fromLocation.point.lngLat[0], floorId: fromLocation.point.floorId },
      { lat: toLocation.point.lngLat[1], lon: toLocation.point.lngLat[0], floorId: toLocation.point.floorId }
    ];

    try {
      const res = await routeService.search({
        points,
        vehicle: MapxusMap.VehicleType.FOOT,
        locale: MapxusMap.PresetLanguage.ENGLISH
      });
      const path = res.data.result.paths[0];
      routePainter?.render(
        path,
        points.map((p) => [p.lon, p.lat])
      );
      routePainter?.setFilterByVenue(map?.venue?.properties?.id, map?.floor?.ordinal);
      renderInstructions(path);
      setIsPlanning(true);
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data
      ) {
        setErrorTip((err.response as any).data.message || 'Failed to plan route.');
      } else {
        setErrorTip('Failed to plan route.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getDirectIconClass = (sign: number, index: number) => {
    if (index === 0) return 'instruction-start';
    switch (sign) {
      case 4:
        return 'instruction-end';
      case -100:
        return 'instruction-down';
      case -8:
      case 8:
        return 'instruction-turn_around';
      case -7:
        return 'instruction-left_straight';
      case -1:
        return 'instruction-slight_left';
      case -2:
        return 'instruction-turn_left';
      case -3:
        return 'instruction-sharp_left';
      case 0:
      case 100:
      case 301:
        return 'instruction-straight';
      case 7:
        return 'instruction-right_straight';
      case 1:
        return 'instruction-slight_right';
      case 2:
        return 'instruction-turn_right';
      case 3:
        return 'instruction-sharp_right';
      case 200:
      case 300:
        return 'instruction-switch';
      case 202:
        return 'instruction-turnstile';
      case 104:
        return 'instruction-bus';
      case 105:
        return 'instruction-waiting';
      case 106:
      case 107:
        return 'instruction-station';
      case 5:
        return 'instruction-stop';
      case -98:
        return 'instruction-u_turn';
      default:
        return 'instruction-straight';
    }
  };
  console.log(instructions);

  const renderInstructions = (path: any) => {
    const {
      time,
      distance: pathDistance,
      instructions,
      points: { coordinates }
    } = path;
    setDistance(`${pathDistance.toFixed(1)}m, ${(time / 60 / 1000).toFixed(1)}min`);
    const steps = instructions.map(({ text, distance: stepDistance, interval, sign }: any, index: number) => ({
      text,
      distance: stepDistance,
      iconClass: getDirectIconClass(sign, index),
      stepStartIndex: interval[0],
      lngLat: coordinates[interval[0]]
    }));
    setInstructions(steps);

    // Add step circles
    const stepData = steps.map((step: { lngLat: [number, number]; stepStartIndex: number }) => ({
      lngLat: step.lngLat,
      properties: { index: step.stepStartIndex }
    }));

    console.log(distance);
    console.log(stepData);
    console.log(errorTip);
    console.log(selectedBuilding);

    if (maplibreMap) {
      maplibreMap.addSource('step-circle-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: stepData.map((step: { lngLat: [number, number]; properties: { index: number } }) => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: step.lngLat },
            properties: step.properties
          }))
        }
      });
      maplibreMap.addLayer({
        id: 'step-circle-layer',
        source: 'step-circle-source',
        type: 'circle',
        paint: {
          'circle-radius': 3.5,
          'circle-color': '#ed6e69',
          'circle-stroke-width': 2,
          'circle-stroke-color': 'yellow'
        }
      });
      maplibreMap.setFilter('step-circle-layer', ['==', 'index', -1]);
    }
  };

  const getQueryParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      fromLat: params.get('fromLat') ? parseFloat(params.get('fromLat')!) : null,
      fromLng: params.get('fromLng') ? parseFloat(params.get('fromLng')!) : null,
      fromFloorId: params.get('fromFloorId') || '',
      fromFloorName: params.get('fromFloorName') || '',
      toLat: params.get('toLat') ? parseFloat(params.get('toLat')!) : null,
      toLng: params.get('toLng') ? parseFloat(params.get('toLng')!) : null,
      toFloorId: params.get('toFloorId') || '',
      toFloorName: params.get('toFloorName') || '',
      buildingId: params.get('buildingId') || '',
      facility: params.get('facility') || ''
    };
  };

  const getDataDevice = useCallback(async (pageIndex: number, filters: Record<string, any>, siteId: string) => {
    try {
      setIsLoading(true);

      const payload = {
        page: pageIndex,
        pageSize: 5,
        siteId: siteId || '',
        filters: filters.search || '',
        statusId: filters.status,
        typeOptional: filters.type,
        floor: ENV === 'staging' ? null : filters.floor
      };

      const data = await fetchDataDevice(payload);

      if (pageIndex === 1) {
        setDataDevice(data);
      } else {
        setDataDevice((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === 5);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getDataDevice(pageIndex, filters, currentSite);
    //eslint-disable-next-line
  }, [pageIndex, filters, currentSite]);

  useEffect(() => {
    if (dataDevice && maplibreMap && map && isMapReady) {
      renderDeviceMarkers(dataDevice, maplibreMap, map);
    }
  }, [dataDevice, map, maplibreMap, isMapReady]);

  const updateLocationPoint = (setter: React.Dispatch<React.SetStateAction<LocationPoint>>, point: any, value: string) => {
    setter((prev) => {
      // const marker = markersRef.current[prev.featureId - 1];
      const markerProperties = [
        {
          lngLat: point.lngLat,
          properties: {
            ordinal: point.floorId || String(map?.floor?.ordinal ?? ''),
            venueId: String(map?.venue?.properties?.id ?? '')
          },
          featureId: prev.featureId
        }
      ];

      // if (maplibreMap?.getSource(marker.sourceId)) {
      //   marker.updateData({ remove: [prev.featureId], add: markerProperties });
      // } else {
      //   marker.create(markerProperties);
      // }

      return {
        ...prev,
        point,
        value,
        markerProperties,
        active: false
      };
    });
  };

  const isRegionAccessible = useMemo(() => {
    const bypassRegionIds = ['9DCC0798-75F8-4A0A-9F0F-C3BD1F7A7467', 'CAE63880-DFFB-4E6E-99D2-284D9B3A4452']; // Id của System và T3

    return user?.regions?.some((region) => bypassRegionIds.includes(region.region_id) || region.region_id === filters.region);
  }, [filters.region, user?.regions]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const mlMap = new maplibregl.Map({
      container: mapContainer.current,
      zoom: 17
    });

    const mxMap = new MapxusMap.Map({
      map: mlMap,
      appId: import.meta.env.VITE_APP_MAP_APPID || '',
      secret: import.meta.env.VITE_APP_MAP_SECRET || '',
      buildingId: import.meta.env.VITE_APP_BUILDING_ID || '',
      fitBuildingBounds: true,
      mapxusLogoEnabled: false
    });

    console.log(getQueryParams());

    const painter = new MapxusMap.RoutePainter(mlMap);
    setMaplibreMap(mlMap);
    setMap(mxMap);
    setRoutePainter(painter);

    // Initialize markers
    // markersRef.current = [new MapxusMap.Marker(mlMap), new MapxusMap.Marker(mlMap)];
    // markersRef.current[0].setIcon("poi-02"); // From marker
    // markersRef.current[1].setIcon("poi-02"); // To marker

    mxMap.renderComplete(async () => {
      setIsMapReady(true);
      mxMap.onMapClickListener(({ coordinate: { lng, lat }, venue, floor }) => {
        console.log({ lng, lat, floor });
        if (fromLocation.active || toLocation.active) {
          if (isPlanning) clearRouteState();
          const point = {
            lngLat: [lng, lat],
            floorId: floor.id || '',
            floorName: floor.code || ''
          };
          const inputTxt = `${floor.code ? `(${floor.code}) ` : ''}${lng.toFixed(8)}, ${lat.toFixed(8)}`;
          updateLocationPoint(fromLocation.active ? setFromLocation : setToLocation, point, inputTxt);

          // If in directions mode and "From" was just set, plan route
          if (isDirectionsMode && fromLocation.active) {
            setIsDirectionsMode(false);
            handlePlanRoute();
          }
        }
      });

      mxMap.onPoiClickListener(({ coordinate, poi, floor }) => {
        const lng = coordinate.lng ?? (Array.isArray(coordinate) ? coordinate[0] : 0);
        const lat = coordinate.lat ?? (Array.isArray(coordinate) ? coordinate[1] : 0);

        const building: Building = {
          poiId: poi.id ? String(poi.id) : '',
          buildingId: poi.properties.buildingId || '',
          name: {
            default: poi.properties.name || 'Unknown',
            en: poi.properties.name || 'Unknown'
          },
          location: {
            lngLat: { lat, lon: lng },
            address: {
              default: poi.properties.address || 'No address available',
              en: poi.properties.address || 'No address available'
            }
          },
          image: poi.properties.image || 'https://via.placeholder.com/300x192',
          rating: poi.properties.rating || 4.4,
          reviewCount: poi.properties.reviewCount || 146
        };

        setSelectedBuilding(building);
        mlMap.flyTo({ center: [lng, lat], zoom: 18 });

        // Set location point if picking
        if (fromLocation.active || toLocation.active) {
          if (isPlanning) clearRouteState();
          const point = {
            lngLat: [lng, lat],
            floorId: poi.properties.floorId || floor.id || '',
            floorName: poi.properties.floorName || floor.code || ''
          };
          const inputTxt = poi.properties.name || `${lng.toFixed(8)}, ${lat.toFixed(8)}`;
          updateLocationPoint(fromLocation.active ? setFromLocation : setToLocation, point, inputTxt);

          // If in directions mode and "From" was just set, plan route
          if (isDirectionsMode && fromLocation.active) {
            setIsDirectionsMode(false);
            handlePlanRoute();
          }
        }
      });

      // Filter markers on venue/floor change
      mxMap.onMapChangeListener(({ venue, floor }) => {
        if (floor.ordinal) {
          handleFilterChange('floor', (Number(floor.ordinal) + 1).toString());
        }

        const venueId = venue?.properties?.id;
        const ordinal = floor.ordinal;
        // markersRef.current.forEach((marker) => marker.setOpacityByVenue(venueId, ordinal));

        if (isPlanning) {
          routePainter?.setFilterByVenue(venueId, ordinal);
        }
      });
    });

    return () => {
      mlMap.remove();
      routePainter?.remove();
    };
  }, [isPlanning, isRegionAccessible]);

  // const handleSelectDevice = (device: DataDevice) => {
  //   console.log({ device });
  //   setSelectedDevice(device);
  //   const currentVisibility = !!popupVisibility[device.id];
  //   setPopupVisibility({
  //     ...popupVisibility,
  //     [device.id]: !currentVisibility
  //   });
  // };

  const renderPopup = (mapInstance: maplibregl.Map, device: DataDevice) => {
    const { device_lng, device_lat } = device;
    if (popupRef.current) popupRef.current.remove();

    const popupContainer = document.createElement('div');

    const root = createRoot(popupContainer);
    root.render(
      <IntlProvider locale={intl.locale} messages={intl.messages} defaultLocale={intl.defaultLocale}>
        <PopupContent device={device} />
      </IntlProvider>
    );

    const popup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '400px',
      className: 'custom-popup'
    })
      .setLngLat([device_lng, device_lat])
      .setDOMContent(popupContainer)
      .addTo(mapInstance);

    popupRef.current = popup;
  };

  const handleSelectDevice = (device: DataDevice) => {
    if (popupRef.current) popupRef.current.remove();
    if (!maplibreMap || !map) return;
    const { device_lat, device_lng } = device;
    if (device_lat && device_lng) {
      maplibreMap.flyTo({ center: [device_lng, device_lat], zoom: 18, speed: 1.2 });

      const onMoveEnd = () => {
        renderPopup(maplibreMap, device);
        maplibreMap.off('moveend', onMoveEnd);
      };

      maplibreMap.off('moveend', onMoveEnd); // Phòng tránh đăng ký trùng
      maplibreMap.on('moveend', onMoveEnd);
    }
  };

  const loadMoreDevice = () => {
    if (!isLoading && hasMore) {
      setPageIndex((prev) => prev + 1);
    }
  };

  const renderDeviceMarkers = (devices: DataDevice[], mlMap: any, map: any) => {
    // Xoá tất cả marker cũ
    markersRef.current.forEach((marker) => {
      marker.remove();
    });
    markersRef.current = [];

    // Tạo lại marker mới
    devices.forEach((device) => {
      const { device_lat, device_lng } = device;
      if (device_lat && device_lng) {
        const marker = new MapxusMap.Marker(mlMap);

        marker.create([
          {
            lngLat: [device_lng, device_lat],
            properties: {
              buildingId: import.meta.env.VITE_APP_BUILDING_ID || ''
              // floorId
            }
          }
        ]);

        marker.on('click', () => {
          renderPopup(mlMap, device);
        });

        // Lưu vào ref để sau này xóa
        markersRef.current.push(marker);
      }
    });
  };

  const statusOptions = [
    { label: intl.formatMessage({ id: 'online' }), value: DeviceStatus.Online },
    { label: intl.formatMessage({ id: 'offline' }), value: DeviceStatus.Offline },
    { label: intl.formatMessage({ id: 'pending' }), value: DeviceStatus.Pending },
    { label: intl.formatMessage({ id: 'hearbeat_missed' }), value: DeviceStatus.HeartbeatMissed },
    { label: 'Isolated', value: DeviceStatus.Isolated }
  ];

  const typeOptions = [
    { label: 'ap', value: 'ap' },
    { label: 'switch', value: 'switch' },
    { label: intl.formatMessage({ id: 'unknown' }), value: 'unknown' }
  ];

  // const fieldsWithOptions = [
  //   { name: 'location', label: 'location', type: 'map' as const, required: false, md: 12 },
  //   {
  //     name: 'lat',
  //     label: 'latitude',
  //     type: 'text' as const,
  //     placeholder: 'enter-latitude',
  //     required: false,
  //     md: 6
  //   },
  //   {
  //     name: 'lng',
  //     label: 'longitude',
  //     type: 'text' as const,
  //     placeholder: 'enter-longitude',
  //     required: false,
  //     md: 6
  //   }
  // ];

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value ?? ''
    }));
    setPageIndex(1);
  };

  return (
    <MainCard>
      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} aria-label="device map tabs">
          <Tab label={intl.formatMessage({ id: 'map-view' })} />
          <Tab label={intl.formatMessage({ id: 'topology-view' })} />
        </Tabs>
      </Box>

      {/* Tab Content: Map View */}
      {activeTab === 0 && (
        <Grid container spacing={2} className="md:h-[calc(100dvh-255px)]">
          <Grid item xs={12} xl={isRegionAccessible ? 8 : 12} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* <Autocomplete
                className="w-full md:w-[200px]"
                size="medium"
                options={optionRegion}
                sx={{ height: '40px' }}
                getOptionLabel={(option) => option.label as string}
                renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'region' })} variant="outlined" />}
                onChange={(event, value) => handleFilterChange('region', value?.value)}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />

              <Autocomplete
                className="w-full md:w-[200px]"
                disabled={!filters.region}
                size="medium"
                options={optionSite}
                sx={{ height: '40px' }}
                getOptionLabel={(option) => option.label as string}
                renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'site' })} variant="outlined" />}
                onChange={(event, value) => handleFilterChange('site', value?.value)}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              /> */}

              <FormControl className="w-full md:w-auto" sx={{ minWidth: 200 }}>
                <InputLabel id="status-filter-label">{intl.formatMessage({ id: 'status' })}</InputLabel>
                <Select
                  sx={{ height: 40 }}
                  labelId="status-filter-label"
                  value={selectedStatusId ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : Number(e.target.value);
                    setSelectedStatusId(value);
                    handleFilterChange('status', value);
                  }}
                  label="Status"
                >
                  <MenuItem value="">{intl.formatMessage({ id: 'all' })}</MenuItem>
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl className="w-full md:w-auto" sx={{ minWidth: 200 }}>
                <InputLabel id="type-filter-label">{intl.formatMessage({ id: 'type' })}</InputLabel>
                <Select
                  sx={{ height: 40 }}
                  labelId="type-filter-label"
                  value={selectedType ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedType(value);
                    handleFilterChange('type', value);
                  }}
                  label="type"
                >
                  <MenuItem value="">{intl.formatMessage({ id: 'all' })}</MenuItem>
                  {typeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* <Map device={dataDevice} selectedDevice={selectedDevice} popupVisibility={popupVisibility} isShowTime={false} heightFull /> */}
            <div className="flex-1">
              {ENV === 'staging' ? (
                <Map devices={dataDevice} fullHeight zoom={11}></Map>
              ) : (
                <>
                  {isRegionAccessible ? (
                    <div id="map" ref={mapContainer} className="w-full h-[calc(100vh-300px)]" />
                  ) : (
                    <div
                      className="justify-center text-gray-500 italic 
        h-[calc(100vh-300px)] flex items-center"
                    >
                      <FormattedMessage id="map-unavailable" />
                    </div>
                  )}
                </>
              )}
            </div>
          </Grid>
          {isRegionAccessible && (
            <Grid item xs={12} xl={4}>
              <SidebarList
                hasMore={hasMore}
                devices={dataDevice}
                searchBox={(value) => handleFilterChange('search', value)}
                loadMoreDevices={loadMoreDevice}
                isLoading={isLoading}
                selectedDevice={handleSelectDevice}
                onEditLocation={(device) => {
                  setOpenEditDevice(true);
                  formik.setValues({ id: device.id, lat: device.device_lat, lng: device.device_lng } as NewDevice);
                  setSelectedDevice(device);
                }}
              />
            </Grid>
          )}
        </Grid>
      )}

      {/* Tab Content: Topology View */}
      {activeTab === 1 && <TopologyView regionId={filters.region} siteId={filters.site} includeClients={true} />}

      <EditDeviceDialog
        openEditDevice={openEditDevice}
        onClose={() => {
          formik.setValues({ id: '', lat: '', lng: '' } as NewDevice);
          setSelectedDevice(undefined);
          setOpenEditDevice(false);
        }}
        formik={formik}
      />
    </MainCard>
  );
};

export default DeviceMap;

const PopupContent = ({ device }: { device: DataDevice }) => {
  const { device_lng, device_lat, name, ip_address, mac_address, status_id, model } = device;

  return (
    <div className="popup-content">
      <div className="popup-header">
        <h3>
          <FormattedMessage id="device-info" />
        </h3>
      </div>
      <div className="popup-body">
        <div className="info-item">
          <span className="label">
            <FormattedMessage id="device-name" />:
          </span>
          <span className="value">{name}</span>
        </div>
        <div className="info-item">
          <span className="label">
            <FormattedMessage id="model" />:
          </span>
          <span className="value">{model}</span>
        </div>
        <div className="info-item">
          <span className="label">
            <FormattedMessage id="ip_address" />:
          </span>
          <span className="value">{ip_address}</span>
        </div>
        <div className="info-item">
          <span className="label">
            <FormattedMessage id="mac_address" />:
          </span>
          <span className="value">{mac_address}</span>
        </div>
        <div className="info-item">
          <span className="label">
            <FormattedMessage id="longitude" />:
          </span>
          <span className="value">{device_lng}</span>
        </div>
        <div className="info-item">
          <span className="label">
            <FormattedMessage id="latitude" />:
          </span>
          <span className="value">{device_lat}</span>
        </div>

        <div className="info-item">
          <span className="label">
            <FormattedMessage id="status" />:
          </span>
          <span className="value">
            <ChipStatus
              id={status_id}
              successLabel="online"
              errorLabel="offline"
              warningLabel="pending"
              dangerLabel="hearbeat_missed"
              isolatedLabel="isolated"
            />
          </span>
        </div>
      </div>
    </div>
  );
};
