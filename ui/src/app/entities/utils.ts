import * as moment from "moment"

export namespace DateUtils {
  export function getFormatedDate(timestamp: number) {
    return moment(new Date(timestamp)).format('DD/MM/YYYY');
  }
}
