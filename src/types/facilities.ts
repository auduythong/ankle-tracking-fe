export interface NewFacilities {
  id: number;
  name: string;
  description: string;
  airportId: string;
  type: string;
  imageLink: string;
  latLocation: string;
  longLocation: string;
  floor: string;
}

export interface DataFacilities {
  id: number;
  name: string;
  description: string;
  airport_id: string;
  type: string;
  image_link: string;
  lat_location: string;
  long_location: string;
  status_id: number;
  floor: string;
}
