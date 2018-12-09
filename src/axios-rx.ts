import axios, {
    AxiosError,
    AxiosInstance,
    AxiosInterceptorManager,
    AxiosPromise,
    AxiosRequestConfig,
    AxiosResponse,
} from 'axios';
import { Observable, Observer, Subscriber, TeardownLogic } from 'rxjs';
const Axios = (axios as any).Axios;

export interface RxiosInstance {
    defaults: AxiosRequestConfig;
    interceptors: {
        request: AxiosInterceptorManager<AxiosRequestConfig>;
        response: AxiosInterceptorManager<AxiosResponse>;
    };
    request<T = any>(config: AxiosRequestConfig): AxiosObservable<T>;
    get<T = any>(url: string, config?: AxiosRequestConfig): AxiosObservable<T>;
    options<T = any>(url: string, config?: AxiosRequestConfig): AxiosObservable<T>;
    delete(url: string, config?: AxiosRequestConfig): AxiosObservable;
    head(url: string, config?: AxiosRequestConfig): AxiosObservable;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosObservable<T>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosObservable<T>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosObservable<T>;
}

export interface RxiosStatic extends RxiosInstance {
    (config: AxiosRequestConfig): AxiosObservable;
    (url: string, config?: AxiosRequestConfig): AxiosObservable;
    create(config?: AxiosRequestConfig): RxiosInstance;
}

export class AxiosObservable<T = any> extends Observable<AxiosResponse<T>> {
    public constructor(
        subscribe?: (
            this: Observable<AxiosResponse<T>>,
            subscriber: Subscriber<AxiosResponse<T>>
        ) => TeardownLogic
    ) {
        super(subscribe);
    }

    public then(
        onfulfilled?:
            | ((value: AxiosResponse<T>) => AxiosResponse<T> | PromiseLike<AxiosResponse<T>>)
            | undefined
            | null,
        onrejected?: ((reason: any) => AxiosError | PromiseLike<AxiosError>) | undefined | null
    ) {
        return (this.toPromise() as PromiseLike<AxiosResponse<T>>).then<
            AxiosResponse<T>,
            AxiosError
        >(onfulfilled, onrejected);
    }
}

function complete<T>(promise: AxiosPromise<T>, observer: Observer<AxiosResponse<T>>) {
    promise.then(
        response => {
            observer.next(response);
            observer.complete();
        },
        failure => {
            if (axios.isCancel(failure)) {
                observer.complete();
            } else {
                observer.error(failure);
            }
        }
    );
}

const axiosRequest: AxiosInstance['request'] = Axios.prototype.request;

export function rxiosRequest<T = any>(config: AxiosRequestConfig): AxiosObservable<T>;
export function rxiosRequest<T = any>(url: string, config?: AxiosRequestConfig): AxiosObservable<T>;
export function rxiosRequest<T = any>(
    this: RxiosInstance,
    configOrUrl: string | AxiosRequestConfig,
    config?: AxiosRequestConfig
): AxiosObservable<T> {
    if (!config) config = {};
    if (typeof configOrUrl === 'string') {
        config.url = configOrUrl;
    } else {
        config = configOrUrl;
    }
    return new AxiosObservable<T>(observer => {
        const source = axios.CancelToken.source();
        const cancelToken = source.token;
        if (config && config.cancelToken) {
            config.cancelToken.promise.then(x => source.cancel());
            config.cancelToken = cancelToken;
        }

        complete<T>(
            axiosRequest.call<AxiosInstance, [AxiosRequestConfig], AxiosPromise<T>>(
                this as any,
                config!
            ),
            observer
        );

        return () => source.cancel();
    });
}

function Rxios<T = any>(this: any, instanceConfig: AxiosRequestConfig) {
    Axios.call(this, instanceConfig);
}

Object.assign(Rxios.prototype, Axios.prototype);
Rxios.prototype.request = rxiosRequest;

const rxios = (() => {
    function rxios<T = any>(config: AxiosRequestConfig): AxiosObservable<T>;
    function rxios<T = any>(url: string, config?: AxiosRequestConfig): AxiosObservable<T>;
    function rxios<T = any>(
        configOrUrl: string | AxiosRequestConfig,
        config?: AxiosRequestConfig
    ): AxiosObservable<T> {
        return rxiosRequest.call(rxios as any, configOrUrl as any, config) as any;
    }
    Object.assign(rxios, Rxios.prototype);
    rxios.defaults = { ...axios.defaults };
    rxios.interceptors = { request: [], response: [] };
    (rxios as any).create = (config?: AxiosRequestConfig) => new (Rxios as any)(config || {});
    return rxios as any as RxiosStatic;
})();

export default rxios;
