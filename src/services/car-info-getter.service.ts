import request from 'request-promise';
import { ServerCar } from '../entities/Car';
import { RealField, ServerField } from '../entities/Field';
import { FieldNames } from '../entities/FieldNames';
import { StringHash } from '../utils/sql-queries';

// const CARS_INFO_LINK = process.env.CARS_INFO_LINK;
const getPhoneLink = (id: number) => {
  return `${process.env.CARS_PHONE_LINK}/${id}/phones`
}

enum PropertyName {
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

interface ICarsInfo {
  adverts: ICar[];
  advertsPerPage: number;
  count: number;
  page: number;
  pageCount: number;
}

interface ICar {
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
  status: 'active' | 'draft' | 'paused' | string;
  videoUrl: string;
  videoUrlId: string;
  year: number;
}

interface ICarMetadata {
  brandSlug: string;
  modelSlug: string;
}

interface IPhoto {
  height: number;
  url: string;
  width: number;
}
interface IPrice<T> {
  amount: number;
  currency: T
}
interface ICarProperty {
  fallbackType: 'string' | 'boolean' | 'int' | string;
  id: number;
  name: PropertyName,
  value: boolean | string | number;
}

class CarInfoGetter {

  private async post<T>(url: string, body: Object, headers: StringHash = {'Content-Type': 'application/json'}): Promise<T> {
    return request.post(url, {
      headers,
      body: JSON.stringify(body)
    })
    .then(result => JSON.parse(result))
    .catch(err => {
      console.log('error')
      console.log(err.message);
    });
  }

  private async getOurAdverts(apiKey: string, status: number, page: number): Promise<ICarsInfo> {
    const CARS_INFO_LINK = process.env.AV_ORGANIZATION_CARS_URL;

    return request.post(`${CARS_INFO_LINK}`, {
      headers : {
        "X-Api-Key": `${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page: page,
        limit: 100,
        // offset: 2,
        // sorting: 0,
        properties: {
          // brand: 0,
          // model: 0,
          private_status: status
        }
      })
    }).then(res => JSON.parse(res))
      .catch(err => {
        console.log(err);
        return err
      });
  }

  async loginToAv(): Promise<string> {
    const url = process.env.AV_LOGIN_URL;
    const res = await this.post<{ apiKey: string }>(url, {
      login: process.env.AV_LOGIN,
      password: process.env.AV_PASSWORD
    });

    return res.apiKey;
  }

  async receiveCarsFromAv(
    carFieldConfigs: ServerField.Response[],
    carOwnerFieldConfigs: ServerField.Response[],
  ) {
    const apiKey = await this.loginToAv();

    const carsInfo = await this.getOurAdverts(apiKey, 1, 0);
    let otherPages: number[] = [];
    for (let i = 2; i < carsInfo.pageCount + 1; i++) {
      otherPages.push(i);
    }
    let additionalInform: ICarsInfo[] = [];
    if (otherPages.length > 0) {
      additionalInform = await Promise.all(otherPages.map(pageNumber => this.getOurAdverts(apiKey, 1, pageNumber)))
    }
    const allCars: ICar[] = carsInfo.adverts;
    additionalInform.forEach(info => { allCars.push(...info.adverts); })

    const carsInfo2 = await this.getOurAdverts(apiKey, 2, 0);
    const carsInfo3 = await this.getOurAdverts(apiKey, 3, 0);
    const carsInfo4 = await this.getOurAdverts(apiKey, 4, 0);

    allCars.push(...carsInfo2.adverts);
    allCars.push(...carsInfo3.adverts);
    allCars.push(...carsInfo4.adverts);

    const ids: number[] = allCars.map(car => car.id);

    const result = this.converCarsInfoToServerCars(
      allCars,
      [],
      carFieldConfigs,
      carOwnerFieldConfigs,
      0,
      true
    );

    return result;
  }

  async getCarsInfo(
    queries: string,
    carFieldConfigs: ServerField.Response[],
    carOwnerFieldConfigs: ServerField.Response[],
    userId: number
  ): Promise<ServerCar.CreateRequest[]> {
    const CARS_INFO_LINK = process.env.CARS_INFO_LINK;
    // this.startTime = new Date().getTime();
    const firstQueries = queries.split('&').filter(query => !query.match('page')).join('&');
    const carsInfo = await this.get<ICarsInfo>(`${CARS_INFO_LINK}?${firstQueries}`);

    let otherQueries: string[] = [];

    for (let i = 2; i < carsInfo.pageCount + 1; i++) {
      otherQueries.push(`${CARS_INFO_LINK}?${firstQueries}&page=${i}`);
    }

    let additionalInform: ICarsInfo[] = [];

    if (otherQueries.length > 0) {
      additionalInform = await Promise.all(otherQueries.map((link, i) => this.getResponseFromLink<ICarsInfo>(link, i * 300)))
    }

    const statuses = ['removed', 'archived', 'purged'];
    const allCars: ICar[] = carsInfo.adverts.filter(car => !(car.organizationId || car.organizationTitle) && !statuses.includes(car.status));
    additionalInform.forEach(info => { allCars.push(...info.adverts.filter(car => !(car.organizationId || car.organizationTitle) && !statuses.includes(car.status))); })

    const ids: number[] = allCars.map(car => car.id);

    const numbers = await Promise.all(
      ids
        .map(
          (id, i) => this.getResponseFromLink<{ id: number, number: string, country: { id: number } }[]>(
            getPhoneLink(id),
            i * 100
          ).then(res => {
            const number = res.find(num => num.country.id === 1)?.number || 0;
            return { id, number }
          })
        )
    );

    const result = this.converCarsInfoToServerCars(
      allCars,
      numbers.map(num => ({ id: num.id, number: +num.number })),
      carFieldConfigs,
      carOwnerFieldConfigs,
      userId,
      false
    );

    return result;
  }

  private async getResponseFromLink<T>(link: string, timeout: number): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // console.log(timeout);
        this.get<T>(link)
          .then(res => {
            // console.log(((new Date().getTime()) - this.startTime) / 1000);

            resolve(res);
          })
          .catch(e => {
            reject(e);
          });
      }, timeout);
    })
  }

  private async get<T>(link: string): Promise<T> {
    return await request.get(link).then(res => JSON.parse(res));
  }

  private converCarsInfoToServerCars(
    cars: ICar[],
    phoneNumbers: { id: number, number: number }[],
    carFieldConfigs: ServerField.Response[],
    carOwnerFieldConfigs: ServerField.Response[],
    userId: number,
    newes: boolean
  ): ServerCar.CreateRequest[] {
    return cars.map(carInfo => {
      let number = phoneNumbers.length > 0
        ? phoneNumbers.find(num => num.id === carInfo.id)?.number || 0
        : 296205678;

      if (!number) {
        return null;
      }

      return {
        ownerNumber: `+375${number}`,
        fields: [...carFieldConfigs, ...carOwnerFieldConfigs].map(fieldConfig => {
          return {
            id: fieldConfig.id,
            name: fieldConfig.name,
            value: this.getCarFieldValue(fieldConfig, carInfo, newes ? carInfo : null, userId)
          } as RealField.Request
        })
      }
    }).filter(c => !!c);
  }

  private getCarFieldValue(fieldConfig: ServerField.Response, car: ICar, carInfo: ICar | null, userId?: number): string {
    const name = fieldConfig.name as FieldNames.Car | FieldNames.CarOwner;
    switch (name) {
      case FieldNames.Car.engine: {
        const value = `${car.properties.find(property => property.name === this.getPropertyName(name))?.value || ''}`;
        const engineValue = this.convertEngineType(value);
        const variantId = fieldConfig.variants.split(',').findIndex(variant => variant === engineValue);

        if (variantId === -1) {
          return '';
        }

        return `${FieldNames.Car.engine}-${variantId}`;
      }
      case FieldNames.Car.engineCapacity: {
        const value = `${car.properties.find(property => property.name === this.getPropertyName(name))?.value || ''}`;
        const engineCapacity = this.convertEngineCapacity(value);
        return engineCapacity; // TODO may be replace to usual algo
      }
      case FieldNames.Car.transmission: {
        const value = `${car.properties.find(property => property.name === this.getPropertyName(name))?.value || ''}`;
        const transmission = this.convertTransmission(value);
        const variantId = fieldConfig.variants.split(',').findIndex(variant => variant === transmission);

        if (variantId === -1) {
          return '';
        }

        return `${FieldNames.Car.transmission}-${variantId}`;
      }
      case FieldNames.Car.bodyType: {
        const value = `${car.properties.find(property => property.name === this.getPropertyName(name))?.value || ''}`;
        const bodyType = value; // this.convertTransmission(value);
        const variantId = fieldConfig.variants.split(',').findIndex(variant => variant === bodyType);

        if (variantId === -1) {
          return '';
        }

        return `${FieldNames.Car.bodyType}-${variantId}`;
      }
      case FieldNames.Car.driveType: {
        const value = `${car.properties.find(property => property.name === this.getPropertyName(name))?.value || ''}`;
        const driveType = this.convertDriveType(value);
        const variantId = fieldConfig.variants.split(',').findIndex(variant => variant === driveType);

        if (variantId === -1) {
          return '';
        }

        return `${FieldNames.Car.driveType}-${variantId}`;
      }
      case FieldNames.Car.linkToAd: {
        return car.publicUrl;
      }
      case FieldNames.Car.carOwnerPrice: {
        return `${car.price.usd.amount}`;
      }
      case FieldNames.Car.contactCenterSpecialistId: {
        return userId ? `${userId}` : '0';
      }
      case FieldNames.CarOwner.name: {
        return `${car.sellerName}`;
      }
      case FieldNames.Car.status: {
        return !carInfo
          ? 'status-0'
          : carInfo.status === 'paused'
            ? 'status-10'
            : 'status-9'
      }
      case FieldNames.Car.source: {
        // const reg = /^(?:https?:\/\/).*?([^.\r\n\/]+\.)?([^.\r\n\/]+\.[^.\r\n\/]{2,6}(?:\.[^.\r\n\/]{2,6})?).*$/g;
        // const arr = reg.exec(car.publicUrl);
        // return arr[arr.length - 1]
        return ['a','v','.','b','y'].join('');
      }
    }

    return `${car.properties.find(property => property.name === this.getPropertyName(name))?.value || ''}`;
  }

  getPropertyName(name: FieldNames.Car | FieldNames.CarOwner): PropertyName | string {
    switch (name) {
      case FieldNames.Car.mark: return PropertyName.brand;
      case FieldNames.Car.model: return PropertyName.model;
      case FieldNames.Car.driveType: return PropertyName.drive_type;
      case FieldNames.Car.bodyType: return PropertyName.body_type
      case FieldNames.Car.engine: return PropertyName.engine_type;
      case FieldNames.Car.engineCapacity: return PropertyName.engine_capacity;
      case FieldNames.Car.mileage: return PropertyName.mileage_km;
      case FieldNames.Car.year: return PropertyName.year;
      case FieldNames.Car.transmission: return PropertyName.transmission_type;
      case FieldNames.Car.color: return PropertyName.color;
      // case FieldNames.Car.linkToAd: return PropertyName.abs; // need custom converter
      // case FieldNames.Car.carOwnerPrice: return PropertyName.abs; // need custom converter
      // case FieldNames.Car.contactCenterSpecialistId: return PropertyName.model; // need custom converter
    }

    return ''
  }

  private convertEngineType(value: string): string {
    // switch (value) {
    //   case 'дизель': return 'Дизель';
    //   case 'дизель (гибрид)': return 'Дизель';
    //   case 'бензин': return 'Бензин';
    //   case 'бензин (пропан-бутан)': return 'Бензин';
    //   case 'бензин (метан)': return 'Бензин';
    //   case 'бензин (гибрид)': return 'Бензин';
    //   case 'электро': return 'Электро';
    // }
    return value;
  }

  private convertEngineCapacity(value: string): string {
    return value;
  }

  private convertTransmission(value: string): string {
    switch (value) {
      case 'автомат': return 'Автомат';
      case 'механика': return 'Механика';
    }

    return value;
  }

  private convertDriveType(value: string): string {
    switch (value) {
      case 'передний привод': return 'Передний';
      case 'задний привод': return 'Задний';
      case 'подключаемый полный привод': return 'Полный';
      case 'постоянный полный привод': return 'Полный';
    }

    return value;
  }
}



export = new CarInfoGetter();
