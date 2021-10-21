interface StringHash {
  [key: string]: string
}

export namespace FieldNames {
  export enum Client {
    date = 'date',
    source = 'source',
    name = 'name',
    number = 'number',
    email = 'email',
    paymentType = 'payment-type',
    tradeInAuto = 'trade-in-auto'
  }

  export enum Car {
    status = 'status',
    // name = 'name',
    // email = 'email',
    // paymentType = 'payment-type',
    // tradeInAuto = 'trade-in-auto'
  }
}
