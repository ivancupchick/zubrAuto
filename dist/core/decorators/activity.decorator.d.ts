import { Models } from 'src/temp/entities/Models';
import { ActivityType } from '../enums/activity-type.enum';
export declare function ControllerActivity(object: {
    type: ActivityType;
    sourceName: Models.Table;
}): (target: Object, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) => void;
