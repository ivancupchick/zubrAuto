export enum PropertyName {
  brand = 'brand',
  model = 'model',
  generation = 'generation',
  year = 'year',
  engine_capacity = 'engine_capacity',
  engine_type = 'engine_type',
  transmission_type = 'transmission_type',
  generation_with_years = 'generation_with_years',
  railings = 'railings',
  abs = 'abs',
  esp = 'esp',
  anti_slip_system = 'anti_slip_system',
  immobilizer = 'immobilizer',
  alarm = 'alarm',
  front_safebags = 'front_safebags',
  side_safebags = 'side_safebags',
  rear_safebags = 'rear_safebags',
  rain_detector = 'rain_detector',
  rear_view_camera = 'rear_view_camera',
  parktronics = 'parktronics',
  mirror_dead_zone_control = 'mirror_dead_zone_control',
  interior_color = 'interior_color',
  interior_material = 'interior_material',
  drive_auto_start = 'drive_auto_start',
  cruise_control = 'cruise_control',
  steering_wheel_media_control = 'steering_wheel_media_control',
  electro_seat_adjustment = 'electro_seat_adjustment',
  front_glass_lift = 'front_glass_lift',
  rear_glass_lift = 'rear_glass_lift',
  seat_heating = 'seat_heating',
  front_glass_heating = 'front_glass_heating',
  mirror_heating = 'mirror_heating',
  autonomous_heater = 'autonomous_heater',
  climate_control = 'climate_control',
  aux_ipod = 'aux_ipod',
  bluetooth = 'bluetooth',
  cd_mp3_player = 'cd_mp3_player',
  usb = 'usb',
  media_screen = 'media_screen',
  navigator = 'navigator',
  xenon_lights = 'xenon_lights',
  fog_lights = 'fog_lights',
  led_lights = 'led_lights',
  body_type = 'body_type',
  drive_type = 'drive_type',
  color = 'color',
  mileage_km = 'mileage_km',
  condition = 'condition',
}

export interface ICarsInfo {
  adverts: ICar[];
  advertsPerPage: number;
  count: number;
  page: number;
  pageCount: number;
}

export interface ICar {
  exchange: {
    exchangeAllowed: 'denied' | string;
  };
  id: number;
  locationName: string;
  shortLocationName: string;
  metadata: ICarMetadata;
  organizationId: number;
  organizationTitle: string;
  originalDaysOnSale: number;
  photos: {
    big: IPhoto;
    extrasmall: IPhoto;
    id: number;
    main: boolean;
    medium: IPhoto;
    mimeType: "image/jpeg" | string;
    small: IPhoto;
  }[];
  price: {
    byn: IPrice<'byn'>;
    eur: IPrice<'eur'>;
    rub: IPrice<'rub'>;
    usd: IPrice<'usd'>;
  }
  properties: ICarProperty[];
  publicStatus: {
    label: string;
    name: 'active' | string;
  }
  publicUrl: string;
  publishedAt: string;
  refreshedAt: string;
  sellerName: string;
  status: 'active' | string;
  videoUrl: string;
  videoUrlId: string;
  year: number;
}

export interface ICarMetadata {
  brandSlug: string;
  modelSlug: string;
}

export interface IPhoto {
  height: number;
  url: string;
  width: number;
}
export interface IPrice<T> {
  amount: number;
  currency: T
}
export interface ICarProperty {
  fallbackType: 'string' | 'boolean' | 'int' | string;
  id: number;
  name: PropertyName,
  value: boolean | string | number;
}
