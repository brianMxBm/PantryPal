export const enum Severity {
    WARNING,
    ERROR,
}

export abstract class Alert {
    public readonly message: string;
    public readonly severity: Severity;

    protected constructor(message: string, severity: Severity) {
        this.message = message;
        this.severity = severity;
    }
}

export class WarningAlert extends Alert {
    constructor(message: string) {
        super(message, Severity.WARNING);
    }
}

export class ErrorAlert extends Alert {
    constructor(message: string) {
        super(message, Severity.ERROR);
    }
}