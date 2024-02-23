import * as moment from "moment"

export namespace DateUtils {
  export function getFormatedDate(timestamp: number) {
    return timestamp === 0
      ? ''
      : moment(new Date(timestamp)).format('DD.MM.YYYY');
  }
}
