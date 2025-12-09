export class API_PATH_AUTHENTICATE {
  static loginUser = '/v1/auth_management/login_admin';
  static registerUser = '/v1/auth_management/register';
  static verifyLogin = '/v1/auth_management/verify_login';
  static verifyEmail = '/v1/auth_management/verify_email';
  static resetPassword = '/v1/auth_management/reset_password';
  static logout = '/v1/auth_management/logout';
  static refreshToken = '/v1/auth_management/refresh_token';
}

export class API_PATH_MANAGEMENT {
  static chartLogin = '/v1/login_wifi/chart_login';
  static dataLogin = '/v1/login_wifi/data_login';
  static dataActivities = '/v1/login_wifi/data_activities';
  static dataLoginCount = '/v1/login_wifi/data_login_count';
  static recordLogin = '/v1/login_wifi/data_login_count';
  static top3 = '/v1/login_wifi/data_top_3';
  static campaignActivities = '/v1/login_wifi/data_activities_campaign';
}

export class API_PATH_ADS {
  static getAd = '/v1/ad_management/data_ads';
  static configAd = '/v1/ad_management/config_ad';
  static addAD = '/v1/ad_management/add_ad';
  static editAd = '/v1/ad_management/edit_ad';
  static changeStatus = '/v1/ad_management/change_status';
  static deleteAd = '/v1/ad_management/delete_ad';

  //upload
  static uploadBackground = '/v1/ad_management/upload_background';
  static uploadBanner = '/v1/ad_management/upload_banner';
  static uploadImg = '/v1/ad_management/upload_img';
  static uploadImgTablet = '/v1/ad_management/upload_img_tablet';
  static uploadImgDesktop = '/v1/ad_management/upload_img_desktop';
  static uploadLogo = '/v1/ad_management/upload_logo';
  static uploadVideo = '/v1/ad_management/upload_video';
}

export class API_PATH_NETWORK {
  static chartSession = '/v1/network_management/chart_session';
  static chartNetwork = '/v1/network_management/chart_network';
  static dataSession = '/v1/network_management/data_session';
  static dataUserAccess = '/v1/network_management/data_user_access';
  static dataSurvey = '/v1/network_management/data_survey';
  static addSurvey = '/v1/network_management/add_survey';
}

export class API_PATH_USER {
  static dataUser = '/v1/user_management/data_user';
  static addUser = '/v1/user_management/add_user';
  static editUser = '/v1/user_management/edit_user';
  static deleteUser = '/v1/user_management/delete_user';
  static changePassword = '/v1/user_management/change_password';
  static changeStatus = '/v1/user_management/change_status';
}

export class API_PATH_SITES {
  static dataSites = '/v1/site_management/data_sites';
  static addSite = '/v1/site_management/add_sites';
  static editSite = '/v1/site_management/edit_sites';
  static deleteSite = '/v1/site_management/delete_sites';
  static dataScenario = '/v1/site_management/data_scenario';
  static refresh = '/v1/site_management/refresh_sites';
}

export class API_PATH_PARTNER {
  static dataPartner = '/v1/partner_management/data_partners';
  static addPartner = '/v1/partner_management/add_partner';
  static editPartner = '/v1/partner_management/edit_partner';
  static deletePartner = '/v1/partner_management/delete_partner';
}

export class API_PATH_SSID {
  static dataSSID = '/v1/ssid_management/data_ssids';
  static addSSID = '/v1/ssid_management/add_ssid';
  static editSSID = '/v1/ssid_management/edit_ssid';
  static editRateLimitSSID = '/v1/ssid_management/edit_ssid_rate_limit';
  static deleteSSID = '/v1/ssid_management/delete_ssid';
  static refreshSSID = '/v1/ssid_management/refresh_ssid';
}

export class API_PATH_SSID_CLIENT {
  static blockClientSSID = '/v1/ssid_client_management/block_client';
  static deleteClientSSID = '/v1/ssid_client_management/delete_client';
  static dataClientSSID = '/v1/ssid_client_management/data_ssid_client';
  static refreshClientSSID = '/v1/ssid_client_management/refresh_clients';
  static unblockClientSSID = '/v1/ssid_client_management/unblock_client';
}

export class API_PATH_EXCEL_MANAGEMENT {
  static exportExcel = '/v1/excel_management/export_excel';
}

export class API_PATH_DEVICES {
  static dataDevice = '/v1/device_management/data_devices';
  static addDevice = '/v1/device_management/add_device';
  static editDevice = '/v1/device_management/edit_device';
  static deleteDevice = '/v1/device_management/delete_device';
  static refreshDevice = '/v1/device_management/refresh_devices';
  static rebootDevice = '/v1/device_management/reboot_device';
  static diagramDevice = '/v1/device_management/data_diagram_network';
  static trafficDevice = '/v1/device_management/data_traffic_network';
  static refreshTrafficDevice = '/v1/device_management/refresh_traffic_network';
  static refreshDiagramDevice = '/v1/device_management/refresh_diagrams';
  static topology = '/v1/device_management/topology';
}

export class API_PATH_ROLE {
  static dataRole = '/v1/role_management/data_role';
  static addRole = '/v1/role_management/add_role';
  static editRole = '/v1/role_management/edit_role';
  static deleteRole = '/v1/role_management/delete_role';
}

export class API_PATH_RADIUS {
  static dataRadius = '/v1/radius_management/data_radius';
  static addRadius = '/v1/radius_management/add_radius';
  static editRadius = '/v1/radius_management/edit_radius';
  static deleteRadius = '/v1/radius_management/delete_radius';
  static refresh = '/v1/radius_management/refresh_radius';
}

export class API_PATH_RESTRICTION {
  static dataDomain = '/v1/blacklist_url_management/data_url';
  static addDomain = '/v1/blacklist_url_management/add_url';
  static editDomain = '/v1/blacklist_url_management/edit_url';
  static deleteDomain = '/v1/blacklist_url_management/delete_url';
  static refreshDomain = '/v1/blacklist_url_management/refresh_url';

  static dataDevice = '/v1/blacklist_mac_management/data_mac';
  static addDevice = '/v1/blacklist_mac_management/add_mac';
  static editDevice = '/v1/blacklist_mac_management/edit_mac';
  static deleteDevice = '/v1/blacklist_mac_management/delete_mac';
  static refreshDevice = '/v1/blacklist_mac_management/refresh_mac';
}

export class API_PATH_LOGS {
  static software = '/v1/log_system/data_system';
}

export class API_PATH_WLAN {
  static dataWLAN = '/v1/wlan_management/data_wlans';
  static addWLAN = '/v1/wlan_management/add_wlan';
  static editWLAN = '/v1/wlan_management/edit_wlan';
  static deleteWLAN = '/v1/wlan_management/delete_wlan';
  static refresh = '/v1/wlan_management/refresh_wlan';
}

export class API_PATH_FACILITIES {
  static dataFacilities = '/v1/facilities_management/data_facilities';
  static addFacilities = '/v1/facilities_management/add_facilities';
  static editFacilities = '/v1/facilities_management/edit_facilities';
  static deleteFacilities = '/v1/facilities_management/delete_facilities';
}

export class API_PATH_ORDERS {
  static dataOrders = '/v1/orders_management/data_orders';
  static dataStatusOrders = '/v1/orders_management/data_status_orders';
  static updateOrderStatus = '/v1/orders_management/update_order_status';
  static updatePaymentStatus = '/v1/orders_management/update_payment_status';
}

export class API_PATH_AIRLINE {
  static dataAirlines = '/v1/airlines_management/data_airlines';
  static addAirlines = '/v1/airlines_management/add_airlines';
  static editAirlines = '/v1/airlines_management/edit_airlines';
  static deleteAirlines = '/v1/airlines_management/delete_airlines';
}

export class API_PATH_AIRPORT {
  static dataAirports = '/v1/airports_management/data_airports';
  static addAirport = '/v1/airports_management/add_airport';
  static editAirport = '/v1/airports_management/edit_airport';
  static deleteAirport = '/v1/airports_management/delete_airport';
}

export class API_PATH_PRODUCT_VIP {
  static dataProducts = '/v1/products_management/data_products';
  static addProduct = '/v1/products_management/add_product';
  static editProduct = '/v1/products_management/edit_product';
  static deleteProduct = '/v1/products_management/delete_product';
  static uploadImage = '/v1/products_management/upload_images';
}

export class API_PATH_CMS {
  static dataCMS = '/v1/cms_management/data_cms';
  static addCMS = '/v1/cms_management/add_cms';
  static editCMS = '/v1/cms_management/edit_cms';
  static deleteCMS = '/v1/cms_management/delete_cms';
  // static uploadImage = '/v1/cms_management/upload_media_url';
}

export class API_PATH_REGION {
  static dataRegions = '/v1/region_management/data_regions';
  static addRegion = '/v1/region_management/add_regions';
  static editRegion = '/v1/region_management/edit_regions';
  static deleteRegion = '/v1/region_management/delete_regions';
}

export class API_PATH_CAMPAIGN {
  static dataCampaign = '/v1/ad_campaign/data_campaigns';
  static addCampaign = '/v1/ad_campaign/add_campaign';
  static editCampaign = '/v1/ad_campaign/edit_campaign';
  static deleteCampaign = '/v1/ad_campaign/delete_campaign';
}

export class API_PATH_RATELIMIT {
  static dataRatelimit = '/v1/ratelimit_management/data_ratelimit';
  static addRatelimit = '/v1/ratelimit_management/add_ratelimit';
  static editRatelimit = '/v1/ratelimit_management/edit_ratelimit';
  static deleteRatelimit = '/v1/ratelimit_management/delete_ratelimit';
  static refreshRatelimit = '/v1/ratelimit_management/refresh_ratelimit';
}

export class API_PATH_PORTAL {
  static dataPortal = '/v1/portal_management/data_portals';
  static addPortal = '/v1/portal_management/add_portal';
  static editPortal = '/v1/portal_management/edit_portal';
  static deletePortal = '/v1/portal_management/delete_portal';
  static refreshPortal = '/v1/portal_management/refresh_portal';
}

export class API_PATH_PASSPOINT {
  static dataPassPoint = '/v1/passpoint_management/data_passpoint';
}

export class API_PATH_VLAN {
  static dataVLAN = '/v1/lan_management/data_lans';
  static refreshVLAN = '/v1/lan_management/refresh_lan';
}

export class API_PATH_VOUCHER_GROUP {
  static dataVoucherGroup = '/v1/voucher_management/data_vouchers';
  static addVoucherGroup = '/v1/voucher_management/add_voucher';
  static editVoucherGroup = '/v1/voucher_management/edit_voucher';
  static refreshVoucherGroup = '/v1/voucher_management/refresh_voucher';
  static deleteVoucherGroup = '/v1/voucher_management/delete_voucher';
}

export class API_PATH_ORDER_PREMIUM {
  static dataOrderList = '/v1/order_management/data_orders';
  static dataChartOrder = '/v1/order_management/chart_orders';
}

export class API_PATH_VOUCHER {
  static dataVoucherList = '/v1/voucher_management/data_voucher_details';
  static addVoucher = '/v1/voucher_management/add_voucher';
  static editVoucher = '/v1/voucher_management/edit_voucher';
  static deleteVoucher = '/v1/voucher_management/delete_voucher';
}

export class API_PATH_NOTIFICATION {
  static notificationData = '/v1/notification_management/data_notification'; // done
  static markRead = '/v1/notification_management/mark_read'; // done
}

export const DEVICE_SIZES = {
  mobile: { width: '375px', height: 'auto' },
  tablet: { width: '768px', height: 'auto' },
  laptop: { width: '1024px', height: 'auto' }
};


export const SYSTEM_REGION_ID = "9DCC0798-75F8-4A0A-9F0F-C3BD1F7A7467"

export const SYSTEM_SITE_ID = "CC417C14-856C-4E88-A9A5-115E17CF1717"