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