import { DataDevice, DeviceConfig } from "./devices";

export interface DataRegion {
  id: string;
  name: string;
  description: string;
  address: string;
  lat_location: string;
  long_location: string;
  status_id: number;
  controller: DataDevice | null;
  device_configs: DeviceConfig | null;
  partner_id: number;
}

export interface NewRegion {
  id: string;
  name: string;
  description: string;
  address: string;
  latLocation?: string;
  longLocation?: string;
  location?: number[] | string[] | null

}
