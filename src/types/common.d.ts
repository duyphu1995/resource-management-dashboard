import { FormRule } from 'antd';
import { ReactNode } from 'react';
import { IEducation, IHealthTracking } from './hr-management/employee-management';
import { IContract } from './hr-management/contract-management';

export interface IDataBreadcrumb {
    title: string;
    href?: string;
    path?: string;
    key?: string;
}

export interface IResponseError {
    FieldName: string;
    Message: string;
}

export interface IResponse<T = null> {
    status?: number;
    succeeded?: boolean;
    message: string;
    errors?: IResponseError[];
    data?: T;
    title?: string;
}

export interface ICheckbox {
    key: string;
    checked: boolean;
    label: string;
}

export interface IField {
    colSpan?: number;
    name?: any;
    label?: any;
    required?: boolean;
    value?: ReactNode;
    validation?: FormRule[];
    initValue?: any;
    valuePropName?: string;
    hidden?: boolean;
    effort?: number;
    dataValue?: string;
    className?: string;
}

export interface IFieldValueForm {
    requestDate?: string;
    receivedDate?: string;
    notes?: string;
    type?: string;
    rankTypeName?: string;
}

export interface IRenderItemForm {
    label: string;
    value: string | number | IFieldValueForm;
}

export interface IRenderItemFormValidate extends IRenderItemForm {
    name?: string;
    validation?: any;
    render?: ReactNode;
}

export interface IDialogCommonProps {
    open: boolean;
    onClose: () => void;
    title: string;
    content: ReactNode;
    icon?: string;
    // Button
    buttonType?: 'default-primary' | 'default-danger';
    buttonLeft?: string;
    buttonRight?: string;
    hiddenButtonLeft?: boolean;
    hiddenButtonRight?: boolean;
    buttonLeftClick?: () => void;
    buttonRightClick?: () => void;
}

export interface ITableHaveActionAddProps<T> {
    dataProps?: T;
    isReload?: any;
    setIsReload?: (params: object) => void;
    statusName?: string;
    healthTrackings?: IHealthTracking[];
    educations?: IEducation[];
    contracts?: IContract[];
    moduleName?: string;
}

export interface IUploadFile {
    name: string;
    attachment?: string;
    size?: number;
    type?: string;
    uid?: string;
    lastModified?: number;
    lastModifiedDate?: Date;
    webkitRelativePath?: string;
}

export interface IValidationRule {
    max: number;
    message: string;
}

export interface ITabUpdateHistory {
    time: string;
    fieldName: string;
    from: string;
    to: string;
    byPeople: string;
}

export interface IInfoAttachment {
    attachment?: string;
    attachmentName?: string;
    attachmentUrl?: string;
}
