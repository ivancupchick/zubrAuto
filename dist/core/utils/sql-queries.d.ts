export type ExpressionHash<T> = {
    [P in keyof Partial<T>]: string[];
} & Object;
export declare const getGetAllQuery: (tableName: string) => string;
export declare const getGetSortedAllQuery: (tableName: string, sortField: string, sortOrder: string) => string;
export declare const getGetByIdQuery: (tableName: string, id: number) => string;
export declare const getDeleteByIdQuery: (tableName: string, id: number) => string;
export declare const getDeleteByAndExpressions: <T>(tableName: string, expressions: ExpressionHash<T>) => string;
export declare const getUpdateByIdQuery: <T>(tableName: string, id: number, entity: Partial<Omit<T, "id">>, isField?: boolean) => string;
export declare const getUpdateByAndExpressionQuery: <T>(tableName: string, entity: Partial<Omit<T, "id">>, expressions: ExpressionHash<Omit<T, "id">>, isField?: boolean) => string;
export declare function getInsertOneQuery<T>(tableName: string, entity: Omit<T, 'id'>): string;
export declare function getResultInsertOneQuery<T>(tableName: string, id: any): string;
export declare const getGetAllByOneColumnExpressionQuery: <T>(tableName: string, expressions: ExpressionHash<T>) => string;
export declare const getGetAllByExpressionAndQuery: <T>(tableName: string, expressions: ExpressionHash<T>) => string;
export declare const getGetSortedAllByExpressionAndQuery: <T>(tableName: string, expressions: ExpressionHash<T>, sortField: string, sortOrder: string) => string;
export declare const getGetAllByExpressionOrQuery: <T>(tableName: string, expressions: ExpressionHash<T>) => string;
