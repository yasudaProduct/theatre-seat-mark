export type ApiErrorResponse = {
    code: ApiResponseCode;
    message: string;
};

export enum ApiResponseCode {
    SUCCESS = 'success',
    INTERNAL_SERVER_ERROR = 'Internal Server Error',
    ARGUMENT_PARAMETER_ERROR = 'Argument Parameter Error',
}