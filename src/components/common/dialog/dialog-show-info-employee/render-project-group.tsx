import pathnames from '@/pathnames';
import { IEmployeeContactUnitDtos } from '@/types/hr-management/employee-management';
import { Flex } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

interface IRenderProjectGroupProps {
    items: IEmployeeContactUnitDtos[];
}

const unitDescriptors = [
    { key: 'projectId', nameKey: 'projectName', label: 'Project' },
    { key: 'programId', nameKey: 'programName', label: 'Program' },
    { key: 'dcId', nameKey: 'dcName', label: 'DC' },
    { key: 'dgId', nameKey: 'dgName', label: 'BU' },
    { key: 'buId', nameKey: 'buName', label: 'BG' }
];

const RenderProjectGroup = (props: IRenderProjectGroupProps) => {
    const { items } = props;
    return (
        <>
            {items &&
                items.map((item: IEmployeeContactUnitDtos, index: number) => {
                    let hasValidLink = false;

                    return (
                        <Flex key={index} wrap>
                            {unitDescriptors.map(descriptor => {
                                const id = item[descriptor.key];
                                const name = item[descriptor.nameKey];

                                if (id && name) {
                                    hasValidLink = true;
                                    return (
                                        <React.Fragment key={descriptor.key}>
                                            <div style={{ padding: '0 5px' }}>-</div>
                                            <Link to={id ? `${pathnames.groupManagement.main.path}/${id}` : ''} className="underline" target="_blank">
                                                {name}
                                            </Link>
                                        </React.Fragment>
                                    );
                                }

                                return null;
                            })}
                            {!hasValidLink && <div style={{ padding: '0 10px' }}>-</div>}
                        </Flex>
                    );
                })}
        </>
    );
};

export default RenderProjectGroup;
