import {Alert, ErrorAlert} from "./alerts";
import {Client} from "./api";
import {ResponseError} from "./errors";

export interface IObservable<T> {
    notify(message: T): void;
    register(observer: IObserver<T>): void;
    remove(observer: IObserver<T>): void;
}

export interface IObserver<T> {
    update(message: T): void;
}

export abstract class BaseObservable<T> implements IObservable<T> {
    protected _observers: IObserver<T>[];

    protected constructor() {
        this._observers = [];
    }

    public notify(message: T): void {
        for (const observer of this._observers) {
            observer.update(message);
        }
    }

    public register(observer: IObserver<T>): void {
        this._observers.push(observer);
    }

    public remove(observer: IObserver<T>): void {
        for (let i = 0; i < this._observers.length; ++i) {
            if (this._observers[i] === observer) {
                this._observers.splice(i, 1);
                break;
            }
        }
    }
}

export interface IMessage<T> {
    readonly data?: T;
    readonly alerts: Alert[];
}

export class Message<T> implements IMessage<T> {
    public readonly data?: T;
    public readonly alerts: Alert[];

    constructor(args: Partial<IMessage<T>>) {
        this.data = args.data;
        this.alerts = args.alerts ?? [];
    }
}

export abstract class AlertingObservable<T> extends BaseObservable<Message<T>> {
    public notify(message: Partial<IMessage<T>>) {
        super.notify(new Message<T>(message));
    }
}

export abstract class APIObservable<T> extends AlertingObservable<T> {
    protected abstract readonly _api: Client;

    protected _notifyResponseError(e: Error) {
        let msg;
        try {
            if (e instanceof ResponseError) {
                msg = e.message;
            } else {
                msg = "An internal error occurred!";
                throw e;
            }
        } finally {
            if (msg) {
                const alert = new ErrorAlert(msg);
                this.notify(new Message<T>({alerts: [alert]}));
            }
        }
    }
}