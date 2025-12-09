import { SSIDData } from './SSID';

export interface Passpoint {
  id: string;
  fullname: string;
  token: any;
  email: string;
  url: string;
  phone_number: string;
  status_id: number;
  ssid: SSIDData;
}
