import { SSIDData } from './SSID';

// Định nghĩa các enum
export enum CodeForm {
  NumbersOnly = 0,
  NumbersAndLetters = 1
}

export enum LimitType {
  LimitedUsageCounts = 0,
  LimitedOnlineUsers = 1,
  Unlimited = 2
}

export enum DurationType {
  ClientDuration = 0,
  VoucherDuration = 1
}

export enum TimingType {
  TimingByTime = 0,
  TimingByUsage = 1
}

export enum RateLimitMode {
  CustomRateLimit = 0,
  RateLimitProfiled = 1
}

export enum TrafficLimitFrequency {
  Option0 = 0,
  Option1 = 1
}

export enum ValidityType {
  AnyTime = 0,
  BetweenEffectiveAndExpirationTime = 1,
  SpecificTimePeriod = 2
}

export interface NewVoucherGroup {
  id: string;
  name: string; // 1-32 ký tự
  siteId: string;
  amount: number; // 1-5000
  codeLength: number; // 6-10
  codeForm: CodeForm;
  limitType: LimitType;
  limitNum?: number; // Bắt buộc khi limitType là 0 hoặc 1, 1-999
  durationType: DurationType;
  duration: number; // 1-1440000 (giây)
  timingType: TimingType;
  rateLimitMode: RateLimitMode;
  rateLimitId?: number; // Bắt buộc khi rateLimitMode là 1
  customRateLimitDownEnable: 'true' | 'false';
  customRateLimitDown?: number; // 0-10485760 (Kbps), bắt buộc khi customRateLimitDownEnable là true
  customRateLimitUpEnable: 'true' | 'false';
  customRateLimitUp?: number; // 0-10485760 (Kbps), bắt buộc khi customRateLimitUpEnable là true
  trafficLimitEnable: 'true' | 'false';
  trafficLimit?: number; // 0-10485760 (Kbps), bắt buộc khi trafficLimitEnable là true
  trafficLimitFrequency?: TrafficLimitFrequency; // Bắt buộc khi trafficLimitEnable là true
  unitPrice: number; // 1-999999999
  currency: string;
  applyToAllPortals: 'true' | 'false';
  portals?: string[]; // Bắt buộc khi applyToAllPorts là false
  expirationTime: number; // 1-999999999
  effectiveTime?: number; // 1-999999999, bắt buộc khi validityType là 1
  logout?: string;
  description?: string;
  validityType: ValidityType;
  ssidId: number[];
}

export interface Voucher {
  id: number;
  voucher_groups_hardware_id: string;
  name: string;
  amount: number;
  code_length: number;
  code_form: CodeForm;
  limit_type: number;
  limit_num: number;
  duration_type: number;
  duration: number;
  timing_type: number;
  rate_limit_mode: number;
  rate_limit_id: any;
  custom_ratelimit_down_enable: string;
  custom_ratelimit_down: number;
  custom_ratelimit_up_enable: string;
  custom_ratelimit_up: number;
  traffic_limit_enable: string;
  traffic_limit: number;
  traffic_limit_frequency: number;
  unit_price: number;
  currency: string;
  apply_to_all_portals: string;
  portals: string;
  expiration_time: string;
  effective_time: string;
  log_out: string;
  description: string;
  validity_type: ValidityType;
  ssid_id: number;
  status_id: number;
  site_id: string;
  ssid: SSIDData;
}
