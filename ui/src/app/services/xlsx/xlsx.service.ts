import { Injectable } from '@angular/core';
import { WorkBook, WorkSheet, read, utils } from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class XlsxService {
  onFileChange(event: any, callback: (list: any) => void) {
    const target: DataTransfer = event.target as DataTransfer;
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: WorkBook = read(bstr, { type: 'binary', cellDates: true });
      const wsname: string = wb.SheetNames[0];
      const ws: WorkSheet = wb.Sheets[wsname];
      const list = utils.sheet_to_json(ws);
      callback(list);
    };
    reader.readAsBinaryString(target.files[0]);
  }
}
