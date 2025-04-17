export declare enum FieldDomains {
    'Car' = 0,
    'CarOwner' = 1,
    'Client' = 2,
    'User' = 3,
    'Role' = 4
}
export declare enum FieldType {
    'Boolean' = 0,
    'Radio' = 1,
    'Text' = 2,
    'Multiselect' = 3,
    'Number' = 4,
    'Dropdown' = 5,
    'Date' = 6,
    'Textarea' = 7
}
export declare function getDomainByTableName(tableName: string): FieldDomains;
