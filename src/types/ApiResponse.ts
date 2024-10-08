export type ApiErrorResponse = {
    code: ApiResponseCode;
    message: string;
};

export enum ApiResponseCode {
    SUCCESS = 'success',
    INTERNAL_SERVER_ERROR = 'Internal Server Error',
    ARGUMENT_PARAMETER_ERROR = 'Argument Parameter Error',
    METHOD_NOT_ALLOWED = 'Method Not Allowed',
    RESOURCE_NOT_FOUND = 'Resource Not Found',
    INVALID_REQUEST_DATA = 'Invalid Request Data',
    UNAUTHORIZED = 'Unauthorized',
}