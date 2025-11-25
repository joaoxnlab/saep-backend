"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.HttpErrorHandler = exports.HttpError = void 0;
class DatabaseError extends Error {
    constructor(rawError) {
        super(rawError.message);
        // Assign all properties from rawError to this instance
        this.length = rawError.length;
        this.severity = rawError.severity;
        this.code = rawError.code;
        this.detail = rawError.detail;
        this.hint = rawError.hint;
        this.position = rawError.position;
        this.internalPosition = rawError.internalPosition;
        this.internalQuery = rawError.internalQuery;
        this.where = rawError.where;
        this.schema = rawError.schema;
        this.table = rawError.table;
        this.column = rawError.column;
        this.dataType = rawError.dataType;
        this.constraint = rawError.constraint;
        this.file = rawError.file;
        this.line = rawError.line;
        this.routine = rawError.routine;
    }
    static isRawDatabaseError(error) {
        for (const key in this) {
            if (!(key in error))
                return false;
        }
        return true;
    }
}
exports.DatabaseError = DatabaseError;
class HttpError extends Error {
    constructor(statusCode, message, cause) {
        super(message);
        this.name = 'HttpError';
        this.statusCode = statusCode || 500;
        this.message = message || "An unexpected error occurred";
        this.cause = cause;
        if (statusCode && statusCode < 400)
            return new HttpError(500, `Cannot create an HttpError with a non-error status (Status: ${statusCode}).`
                + ` Cause: ` + this.message, this);
    }
    static fromDatabaseError(error) {
        const databaseError = error instanceof DatabaseError ? error : new DatabaseError(error);
        switch (databaseError.code) {
            // Constraint violations (conflicts with existing data)
            case '23505': // unique_violation
                return new HttpError(409, 'Unique constraint violation: ' + databaseError.message, databaseError);
            case '23503': // foreign_key_violation
                return new HttpError(409, 'Foreign key constraint violation: ' + databaseError.message, databaseError);
            case '23514': // check_violation
                return new HttpError(400, 'Check constraint violation: ' + databaseError.message, databaseError);
            case '23502': // not_null_violation
                return new HttpError(400, 'Not-null constraint violation: ' + databaseError.message, databaseError);
            // Syntax/query errors
            case '42601': // syntax_error
                return new HttpError(400, 'Syntax error in SQL query: ' + databaseError.message, databaseError);
            case '42P01': // undefined_table
                return new HttpError(404, 'Table not found: ' + databaseError.message, databaseError);
            case '42703': // undefined_column
                return new HttpError(404, 'Column not found: ' + databaseError.message, databaseError);
            // Authorization errors
            case '42501': // insufficient_privilege
                return new HttpError(403, 'Insufficient privileges: ' + databaseError.message, databaseError);
            // Database integrity errors
            case '40001': // serialization_failure
                return new HttpError(503, 'Transaction serialization failure: ' + databaseError.message, databaseError);
            // Resource limits
            case '53200': // out_of_memory
                return new HttpError(507, 'Out of memory: ' + databaseError.message, databaseError);
            case '53300': // too_many_connections
                return new HttpError(503, 'Too many connections: ' + databaseError.message, databaseError);
            case '53100': // disk_full
                return new HttpError(507, 'Disk is full: ' + databaseError.message, databaseError);
            // Read-only violations
            case '25006': // read_only_sql_transaction
                return new HttpError(403, 'Attempted to write to a read-only database: ' + databaseError.message, databaseError);
            // Operation aborted or interrupted
            case '57014': // query_canceled
                return new HttpError(500, 'Query execution was canceled: ' + databaseError.message, databaseError);
            case '55P03': // lock_not_available
                return new HttpError(503, 'Database resource is temporarily unavailable: ' + databaseError.message, databaseError);
            // Misconfiguration
            case '58P01': // undefined_file
                return new HttpError(500, 'Required file is missing: ' + databaseError.message, databaseError);
            case 'XX000': // internal_error
                return new HttpError(500, 'Internal database error: ' + databaseError.message, databaseError);
            // Default case for unknown errors
            default:
                return new HttpError(500, 'Unknown PostgreSQL Error: ' + databaseError.message, databaseError);
        }
    }
    toString() {
        return `HttpError ${this.statusCode}: ${this.message}
		Cause: ${this.cause}`;
    }
}
exports.HttpError = HttpError;
class HttpErrorHandler {
    constructor(httpError) {
        var _a;
        this.status = httpError.statusCode;
        this.error = HttpErrorHandler.httpStatusNameMap[httpError.statusCode] || "Unknown";
        this.message = httpError.message;
        this.causeName = (_a = httpError.cause) === null || _a === void 0 ? void 0 : _a.name;
    }
}
exports.HttpErrorHandler = HttpErrorHandler;
HttpErrorHandler.httpStatusNameMap = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a Teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required"
};
