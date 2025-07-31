export interface RetryErrors {
    results?:           any[];
    totalFiles?:        number;
    successfulRetries?: number;
    failedRetries?:     number;
    message?:           string;
    timestamp?:         Date;
}
