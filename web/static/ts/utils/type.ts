export type GetKeys<T> = {[P in keyof T]: P}[keyof T];

export type MandateProps<T extends {}, U> = Omit<T, GetKeys<U>> &
    {
        [Property in keyof U]-?: U[Property];
    };

export type NonUndefinedProps<T> = {
    [Property in keyof T]: T[Property] extends undefined ? never : Property;
};

export type CreateImmutable<T> = {
    readonly [Property in keyof T]: T[Property];
};