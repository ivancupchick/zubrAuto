"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldsUtils = exports.getFieldsWithValues = exports.getFieldChainsValue = void 0;
const fields_1 = require("../fields/fields");
const getFieldChainsValue = (query, fields) => {
    fields.forEach(f => {
        if (f.type === fields_1.FieldType.Dropdown || f.type === fields_1.FieldType.Multiselect) {
            const needVariants = Array.isArray(query[f.name]) ? query[f.name] : query[f.name].split(',');
            query[f.name] = needVariants.map(v => {
                if (f.variants) {
                    const index = f.variants.split(',').findIndex(vValue => vValue === v);
                    return `${f.name}-${index}`;
                }
                return query[f.name];
            }).join(',');
        }
    });
    const queryValues = fields.map(f => f.name).map(k => Array.isArray(query[k]) ? query[k] : query[k].split(','));
    const rValues = [];
    queryValues.forEach(queryValue => {
        queryValue.forEach(vv => rValues.push(vv));
    });
    return rValues;
};
exports.getFieldChainsValue = getFieldChainsValue;
const getFieldsWithValues = (chainedFields, chaines, sourceId) => {
    return chainedFields
        .map(cf => {
        return {
            id: cf.id,
            name: cf.name,
            flags: cf.flags,
            type: cf.type,
            domain: cf.domain,
            variants: cf.variants,
            showUserLevel: cf.showUserLevel,
            value: chaines.find(c => c.fieldId === cf.id && c.sourceId === sourceId)?.value || ''
        };
    });
};
exports.getFieldsWithValues = getFieldsWithValues;
class FieldsUtils {
    static getDropdownValue(entity, fieldName) {
        const field = entity.fields.find(f => f.name === fieldName);
        return !field
            ? ''
            : field.variants.split(',').find((variant, index) => `${fieldName}-${index}` === field.value) || '';
    }
    static setDropdownValue(field, fieldValue) {
        const newField = {
            ...field,
            value: field.variants.split(',').map((variant, index) => ({ key: `${field.name}-${index}`, value: variant })).find((variantEntity) => variantEntity.value === fieldValue)?.key || ''
        };
        return newField;
    }
    static setFieldValue(field, fieldValue) {
        const newField = {
            ...field,
            value: fieldValue
        };
        return newField;
    }
    static getFields(entityOrFieldsArray) {
        return Array.isArray(entityOrFieldsArray)
            ? entityOrFieldsArray
            : entityOrFieldsArray.fields;
    }
    static getField(entityOrFieldsArray, name) {
        if (!name || !entityOrFieldsArray) {
            return null;
        }
        const fields = this.getFields(entityOrFieldsArray);
        if (!fields || fields.length < 1) {
            return null;
        }
        for (const field of fields) {
            if (field.name === name) {
                return field;
            }
        }
        return null;
    }
    static getFieldValue(entityOrFieldsArray, name) {
        const field = this.getField(entityOrFieldsArray, name);
        if (field == null) {
        }
        if (field && (field.value || field.value === '')) {
            return field.value;
        }
        return '';
    }
    static getFieldBooleanValue(entityOrFieldsArray, name) {
        const field = this.getField(entityOrFieldsArray, name);
        if (field == null) {
        }
        return (!!field && !!+field.value);
    }
    static getFieldNumberValue(entityOrFieldsArray, name) {
        const field = this.getField(entityOrFieldsArray, name);
        if (field == null) {
        }
        return field && field.value ? +field.value : 0;
    }
    static getFieldStringValue(entityOrFieldsArray, name) {
        const field = this.getField(entityOrFieldsArray, name);
        return field && field.value != null ? field.value + '' : '';
    }
}
exports.FieldsUtils = FieldsUtils;
//# sourceMappingURL=field.utils.js.map