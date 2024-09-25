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
  dateOfLastCustomerCall: 'Дата последнего звонка'

  // nextAction: 'Следующее действие',
};

export const CarBaseFilterFormsInitialState = {
  carModel: '',
  carStatus: '',
  selectedContactCenterUser: '',
  date: '',
  number: '',
}