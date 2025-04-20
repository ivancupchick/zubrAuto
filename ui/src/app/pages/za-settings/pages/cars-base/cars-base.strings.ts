import { FieldType } from 'src/app/entities/field';

interface StringHash {
  [key: string]: string;
}

export const settingsCarsStrings: StringHash = {
  id: '№',
  date: 'Дата',
  ownerNumber: 'Телефон',
  status: 'Статус',
  brandAndModel: 'Автомобиль',
  engine: 'Мотор',
  engineCapacity: 'Объём',
  mileage: 'Пробег',
  year: 'Год',
  mark: 'Марка',
  model: 'Модель',
  transmission: 'Коробка',
  color: 'Цвет',
  driveType: 'Привод',
  linkToAd: 'Ссылка',
  carOwnerPrice: 'Цена',
  trueCarPrice: 'Цена на руки',
  commission: 'Комиссия',
  comment: 'Комментарии',
  dateOfLastStatusChange: 'Дата действия',
  dateOfNextAction: 'Дата действия',
  worksheet: 'Анкета',
  bargain: 'Торг',
  adPrice: 'Цена на сайте',
  shootingDate: 'Дата съёмки',
  shootingTime: 'Время съёмки',
  ourLinks: 'Опубликовано объявлений',
  ownerName: 'Имя',
  contactCenterSpecialistId: 'Специалист ОКЦ',
  carShootingSpecialistId: 'Специалист ОСА',
  source: 'Источник',
  photos: 'Фото',
  photo360: 'Фото 360',
  linkToVideo: 'Видео',
  bodyType: 'Кузов',
  dateOfLastCustomerCall: 'Дата последнего звонка',

  // nextAction: 'Следующее действие',
};

export const CarBaseFilterFormsInitialState = {
  mark: '',
  status: '',
  selectedContactCenterUser: '',
  date: '',
  number: '',
};

export type UIFilter = {
  title: string;
  name: string;
} & (
  | {
      type: FieldType.Text;
      value: string;
      defaultValue: string;
    }
  | {
      type: FieldType.Dropdown;
      value: string;
      defaultValue: string;
      variants: { label: string | 'Все'; value: string | 'Все' }[];
    }
  | {
      type: FieldType.Number;
      values: [number, number];
      defaultValues: [number, number];
      max: number;
      min: number;
      step: number;
    }
  | {
      type: FieldType.Multiselect;
      value: string[];
      defaultValue: string[];
      variants: { label: string; value: string }[];
    }
);

export type TextUIFilter = UIFilter & {
  type: FieldType.Text;
  value: string;
  defaultValue: string;
};

export type DropdownUIFilter = UIFilter & {
  type: FieldType.Dropdown;
  value: string;
  defaultValue: string;
  variants: { label: string | 'Все'; value: string | 'Все' }[];
};

export type NumberUIFilter = UIFilter & {
  type: FieldType.Number;
  values: [number, number];
  defaultValues: [number, number];
  max: number;
  min: number;
  step: number;
};

export type MultiselectUIFilter = UIFilter & {
  type: FieldType.Multiselect;
  value: string[];
  defaultValue: string[];
  variants: { label: string; value: string }[];
};
