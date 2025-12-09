import { useEffect, useState, useRef } from 'react';
import useConfig from 'hooks/useConfig';
import { FormattedMessage } from 'react-intl';
import ReactDOMServer from 'react-dom/server';

//third-party
import vn from 'date-fns/locale/vi';
import L, { Marker as LeafletMarker } from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, AttributionControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';

//project-import
import { Link } from '@mui/material';
import ChipStatus from 'components/atoms/ChipStatus';

//assets
import { HomeWifi } from 'iconsax-react';

//types
import { DataFacilities } from 'types';

const createLeafletIcon = (isOnline: boolean) => {
  const svgString = ReactDOMServer.renderToString(
    isOnline ? <HomeWifi size="32" color="green" variant="Bold" /> : <HomeWifi size="32" color="red" variant="Bold" />
  );

  const encodedSvg = `data:image/svg+xml;base64,${btoa(svgString)}`;

  return new L.Icon({
    iconUrl: encodedSvg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

function MarkerWithPopup({
  facilities,
  selectedFacilities,
  popupVisible
}: {
  facilities: DataFacilities;
  selectedFacilities: DataFacilities | null;
  popupVisible: boolean;
}) {
  const map = useMap();
  const markerRef = useRef<LeafletMarker | null>(null);

  useEffect(() => {
    if (selectedFacilities && selectedFacilities.id === facilities.id) {
      map.flyTo([Number(facilities.lat_location), Number(facilities.long_location)], map.getZoom());
      if (markerRef.current) {
        popupVisible ? markerRef.current.openPopup() : markerRef.current.closePopup();
      }
    }
  }, [selectedFacilities, map, facilities, popupVisible]);

  return (
    <Marker
      ref={markerRef}
      position={[Number(facilities.lat_location), Number(facilities.long_location)]}
      icon={createLeafletIcon(facilities.status_id === 1)}
    >
      <Popup className="!m-0">
        <div className="w-60 mt-6 flex flex-col">
          <header className="w-full py-1 bg-blue-800 text-white font-semibold text-center">
            <Link component="button" className="text-white" variant="h5">
              {facilities.name}
            </Link>
          </header>
          <div className="w-full">
            <div className="flex justify-between items-center font-medium my-1 mt-2 whitespace-nowrap overflow-hidden text-ellipsis w-full">
              <label>
                <FormattedMessage id="facilities-name" />:
              </label>
              <span>
                <Link component="button" className="text-blue-600" variant="body1">
                  {facilities.name}
                </Link>
              </span>
            </div>

            <div className="flex justify-between items-center font-medium my-2">
              <label>
                <FormattedMessage id="facilities-type" />:
              </label>
              <span>{facilities.type}</span>
            </div>

            <div className="flex justify-between items-center font-medium my-2">
              <label>
                <FormattedMessage id="floor" />:
              </label>
              <span>{facilities.floor}</span>
            </div>

            <div className="flex justify-between items-center font-medium my-2">
              <label>
                <FormattedMessage id="desc" />:
              </label>
              <span>{facilities.description}</span>
            </div>

            {/* <div className="flex justify-between items-center font-medium my-2">
              <label>
                <FormattedMessage id="site" />:
              </label>
              <span>{facilities.site_name}</span>
            </div> */}

            <div className="flex justify-between items-center font-medium my-2">
              <label>
                <FormattedMessage id="status" />:
              </label>
              <span>
                <ChipStatus
                  id={facilities.status_id}
                  successLabel="connected"
                  errorLabel="disconnected"
                  warningLabel="pending"
                  dangerLabel="hearbeat_missed"
                  isolatedLabel="isolated"
                />
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
function MapFacilities({
  facilities,
  isShowTime,
  heightFull,
  selectedFacilities,
  popupVisibility
}: {
  facilities: DataFacilities[];
  isShowTime: boolean;
  heightFull?: boolean;
  selectedFacilities: DataFacilities | null;
  popupVisibility: Record<number, boolean>;
}) {
  const [dateTime, setDateTime] = useState('');
  const { i18n } = useConfig();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (i18n === 'vi') {
        const formattedDateTime = format(now, 'EEEE, dd MMMM yyyy HH:mm:ss', { locale: vn });
        setDateTime(formattedDateTime);
      } else {
        const formattedDateTime = format(now, 'EEEE, dd MMMM yyyy HH:mm:ss');
        setDateTime(formattedDateTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [i18n]);

  return (
    <>
      {isShowTime && <h2 className="py-6 font-medium text-xl">{dateTime.toString()}</h2>}
      <MapContainer
        className={`select-none ${heightFull ? 'min-h-[400px] h-full' : 'h-[500px]'} w-full`}
        center={[10.811692, 106.653379]}
        zoom={15}
        attributionControl={false}
      >
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}?apikey=ca52cae166e440f18779607cdbf9221b" />
        <AttributionControl prefix="VTC Telecom" />
        {facilities.map((item) => {
          const isLatValid = !isNaN(Number(item.lat_location));
          const isLongValid = !isNaN(Number(item.long_location));

          if (isLatValid && isLongValid) {
            return (
              <MarkerWithPopup
                key={item.id}
                facilities={item}
                selectedFacilities={selectedFacilities}
                popupVisible={!!popupVisibility[item.id as any]}
              />
            );
          } else {
            return null;
          }
        })}
      </MapContainer>
    </>
  );
}

export default MapFacilities;
