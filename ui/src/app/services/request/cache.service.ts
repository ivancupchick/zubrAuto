import { Injectable, Injector } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

export enum RequestType {
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Delete = 'delete',
  Patch = 'patch',
}

export type ZAResponose = any;
export interface CacheItem {
  url: string;
  body: any;
  type: RequestType;
  response: ZAResponose | Subject<ZAResponose>;
}

const serviceUrl = 'url';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private cache = new Map<string, CacheItem[]>();

  constructor() { }

  get(
    url: string,
    type: RequestType,
    body: any,
  ): ZAResponose | Subject<ZAResponose> | null {
    if (this.cache.has(serviceUrl)) {
      const request = this.cache.get(serviceUrl)!.find((item) => item.url === url && type === item.type && JSON.stringify(body) === JSON.stringify(item.body));
      if (request) {
        // if (!environment.production) {
        //   if (request.response instanceof Subject) {
        //     console.log('the same request is already in progress', url);
        //   } else {
        //     console.log('returning saved request', url);
        //   }
        // }

        return request.response;
      }
    }
    return null;
  }

  put(url: string, type: RequestType, body: any, response: ZAResponose | Subject<ZAResponose>): void {
    let requests = this.cache.has(serviceUrl) ? this.cache.get(serviceUrl)! : [];
    requests = requests.filter((item) => item.url !== url || type !== item.type || JSON.stringify(body) !== JSON.stringify(item.body));
    requests.push({ url, type, body, response });

    // if (!environment.production) {
    //   console.log('saved request', url);
    // }
    this.cache.set(serviceUrl, requests);
  }

  dropCacheSection(serviceUrl: string) {
    this.cache.delete(serviceUrl);
  }

  dropAllCache() {
    this.cache = new Map();
  }
}

export const cacheService = Injector.create({
  providers: [
    { provide: CacheService },
  ],
}).get(CacheService);
