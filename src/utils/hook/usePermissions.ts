import { findSectionByNameSection, getDecryptedItem } from '@/utils/common';
import { useMemo } from 'react';

const usePermissions = (sectionName: string, rootName: string) => {
    const { permission = [] } = getDecryptedItem('permission') || {};
    const section = useMemo(() => findSectionByNameSection(permission, sectionName, rootName), [permission, sectionName, rootName]);

    const {
        userOperations = [],
        fieldsForSensitiveData = null,
        fieldsForRestrictData = null,
        fieldsForEditData = null,
        isLimitEditData = false
    } = section || {};

    const havePermission = useMemo(() => {
        return (key: string) => userOperations?.find((item: string) => item === key);
    }, [userOperations]);

    return { havePermission, section, fieldsForSensitiveData, fieldsForRestrictData, fieldsForEditData, isLimitEditData };
};

export default usePermissions;
