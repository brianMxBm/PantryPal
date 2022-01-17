import {NonUndefinedProps} from "./type.js";

export function removeUndefined<T>(obj: T): NonUndefinedProps<T> {
    const ret: Record<string, any> = {};

    Object.keys(obj)
        .filter((key) => obj[key as keyof T] !== undefined)
        .forEach((key) => (ret[key] = obj[key as keyof T]));

    return ret as NonUndefinedProps<T>;
}