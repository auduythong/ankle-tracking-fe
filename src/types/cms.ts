export interface NewCMS {
  id: number;
  title: string;
  description: string;
  expiredAt: string;
  mediaUrl: string;
  type: string;
  facilityId: number | null;
  airportId: number;
  statusId: number;
  priority: number;
}

export interface DataCMS {
  id: number;
  title: string;
  description: string;
  expired_at: string;
  media_url: string;
  type: string;
  facility_id: number | null;
  airport_id: number;
  status_id: number;
  priority: number;
}
