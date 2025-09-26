import DatePicker from '@/components/common/form/date-picker';
import RequiredMark from '@/components/common/form/required-mark';
import BaseSelect from '@/components/common/form/select';
import TreeSelect from '@/components/common/form/tree-select';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseToolTip from '@/components/common/tooltip';
import { selectGroupManagement } from '@/redux/group-managed-slice';
import { useAppSelector } from '@/redux/store';
import UnitService from '@/services/group-management/unit';
import { IUnit, IUnitIndex, IUnitNode } from '@/types/group-management/group-management';
import { formatTime, formatTimeMonthDayYear, validateEnterValidValue } from '@/utils/common';
import { ORG_UNITS, TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { Button, Checkbox, Col, Flex, Form, Input, InputNumber, Row } from 'antd';
import Title from 'antd/es/typography/Title';
import dayjs, { Dayjs } from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

interface ITabInfoProps {
    dataUnit: IUnitNode;
    allOptions: IUnitIndex;
    setIsReload: (params: object) => void;
    activeKeyTab: string;
}

const TabInfo = (props: ITabInfoProps) => {
    const { dataUnit, allOptions, setIsReload, activeKeyTab } = props;
    const {
        unitId,
        parentId,
        unitName,
        isBirthdayGreeting,
        unitTypeName,
        managerId,
        startDate,
        endDate,
        projectContractId,
        projectTypeId,
        marketplaceId,
        projectPrime,
        projectDomainId,
        description,
        technologies,
        isSharedService,
        isGroupByPATool,
        approveEffort,
        projectScope
    } = dataUnit;

    const [formUnit] = Form.useForm();
    const { id } = useParams();
    const { showNotification } = useNotify();
    const { havePermission } = usePermissions('UnitInformation', 'GroupManagement');
    const managedAction = useAppSelector(selectGroupManagement).isManaged;

    const [isEditing, setIsEditing] = useState(false);
    const [showFieldProjectType, setShowFieldProjectType] = useState(false);

    const handleClickEdit = () => {
        setIsEditing(true);
        formUnit.setFieldsValue({
            unitName,
            parentId: parentId?.toString(),
            isBirthdayGreeting,
            unitTypeName,
            managedBy: managerId,
            startDate: startDate && dayjs(startDate, TIME_FORMAT.VN_DATE),
            endDate: endDate && dayjs(endDate, TIME_FORMAT.VN_DATE),
            projectContractId,
            projectTypeId,
            marketplaceId,
            projectPrime,
            projectDomainId,
            description,
            technologies,
            isSharedService,
            isGroupByPATool,
            approveEffort,
            projectScope
        });
    };

    const handleDisableStartDate = (currentDate: Dayjs | null) => {
        const { endDate } = formUnit.getFieldsValue();
        return endDate && currentDate && currentDate > endDate;
    };

    const handleDisableEndDate = (currentDate: Dayjs | null) => {
        const { startDate } = formUnit.getFieldsValue();
        return startDate && currentDate && currentDate < startDate;
    };

    const infoData = [
        {
            name: 'unitName',
            label: 'Unit Name',
            value: isEditing ? <Input placeholder="Enter unit name" /> : renderWithFallback(dataUnit.unitName),
            required: true,
            validation: [validateEnterValidValue]
        },
        {
            name: 'parentId',
            label: 'Parent Unit',
            value: isEditing ? (
                <TreeSelect
                    size="middle"
                    multiple={false}
                    placeholder="Select parent unit"
                    treeData={allOptions?.unitBasicDtos}
                    searchPlaceholder="Search parent unit"
                    treeDefaultExpandAll
                    rootClassName="tree-select-parent-unit"
                    allowClear={false}
                />
            ) : (
                renderWithFallback(dataUnit.parentName)
            )
        },
        ...(dataUnit.unitTypeLevel !== 1
            ? [
                  {
                      label: ' ',
                      value: isEditing ? (
                          <Form.Item name="isBirthdayGreeting" valuePropName="checked">
                              <Checkbox disabled={!isEditing}>Birthday Greeting</Checkbox>
                          </Form.Item>
                      ) : (
                          <Checkbox checked={dataUnit.isBirthdayGreeting} disabled={!isEditing}>
                              Birthday Greeting
                          </Checkbox>
                      )
                  }
              ]
            : []),
        {
            label: 'Unit Type',
            value: renderWithFallback(dataUnit.unitTypeName)
        },
        {
            name: 'managedBy',
            label: 'Managed By',
            value: isEditing ? <BaseSelect options={allOptions?.managers} placeholder="Enter manager by" /> : renderWithFallback(dataUnit.managerName)
        },
        {
            name: 'startDate',
            label: 'Start Date',
            value: isEditing ? (
                <DatePicker allowClear disabledDate={handleDisableStartDate} />
            ) : (
                renderWithFallback(formatTimeMonthDayYear(dataUnit.startDate))
            ),
            required: showFieldProjectType,
            validation: [{ required: showFieldProjectType, message: 'Please enter the valid value' }]
        },
        {
            name: 'endDate',
            label: 'End Date',
            value: isEditing ? (
                <DatePicker allowClear disabledDate={handleDisableEndDate} />
            ) : (
                renderWithFallback(formatTimeMonthDayYear(dataUnit.endDate))
            ),
            required: showFieldProjectType,
            validation: [{ required: showFieldProjectType, message: 'Please enter the valid value' }]
        },
        ...(dataUnit.unitTypeLevel === 1
            ? [
                  {
                      name: 'projectContractId',
                      label: 'Contract ID',
                      value: isEditing ? (
                          <BaseSelect options={allOptions?.projectContractBasicDtos} placeholder="Select contract ID" />
                      ) : (
                          renderWithFallback(dataUnit.projectContractName)
                      )
                  },
                  {
                      name: 'projectTypeId',
                      label: `${ORG_UNITS.Project} Type`,
                      value: isEditing ? (
                          <BaseSelect
                              options={allOptions?.projectTypeBasicDtos}
                              placeholder="Select project type"
                              onChange={item => {
                                  // 1 = "ODC", 2 = "Fixed Price"
                                  setShowFieldProjectType(item === 2);
                              }}
                          />
                      ) : (
                          renderWithFallback(dataUnit.projectTypeName)
                      )
                  },
                  {
                      name: 'marketplaceId',
                      label: 'Market',
                      value: isEditing ? (
                          <BaseSelect options={allOptions?.marketplaceBasicDtos} placeholder="Select market" />
                      ) : (
                          renderWithFallback(dataUnit.marketplaceName)
                      ),
                      required: true,
                      validation: [{ required: true, message: 'Please select the valid value' }]
                  },
                  {
                      name: 'projectPrime',
                      label: `${ORG_UNITS.Project} Prime`,
                      value: isEditing ? (
                          <BaseSelect options={allOptions?.managers} placeholder="Select project prime" />
                      ) : (
                          renderWithFallback(dataUnit.projectPrimeName)
                      )
                  },
                  {
                      label: ' ',
                      value: isEditing ? (
                          <Form.Item name="isSharedService" valuePropName="checked">
                              <Checkbox>Shared Service Unit</Checkbox>
                          </Form.Item>
                      ) : (
                          <Checkbox checked={dataUnit.isSharedService} disabled={!isEditing}>
                              Shared Service Unit
                          </Checkbox>
                      )
                  },
                  {
                      label: ' ',
                      value: isEditing ? (
                          <div className="pa-tool-container">
                              <Form.Item name="isGroupByPATool" valuePropName="checked">
                                  <Checkbox>Dept/TIP/JP project</Checkbox>
                              </Form.Item>
                              <BaseToolTip title="This checkbox will change the scoring rules of the PA tool" />
                          </div>
                      ) : (
                          <>
                              <Checkbox checked={dataUnit.isGroupByPATool} disabled={!isEditing}>
                                  Dept/TIP/JP project
                              </Checkbox>
                              <BaseToolTip title="This checkbox will change the scoring rules of the PA tool" />
                          </>
                      )
                  },
                  {
                      name: 'projectDomainId',
                      label: 'Domain',
                      value: isEditing ? (
                          <BaseSelect options={allOptions.projectDomainBasicDtos} placeholder="Select domain" />
                      ) : (
                          renderWithFallback(dataUnit.projectDomainName)
                      )
                  }
              ]
            : []),
        {
            name: 'approveEffort',
            label: 'Approved Effort (Man-Hours)',
            value: isEditing ? (
                <InputNumber placeholder="Enter approved effort" className="w-100" min={0} step={1} precision={0} />
            ) : (
                renderWithFallback(dataUnit.approveEffort)
            ),
            required: true,
            validation: [{ required: true, message: 'Please enter the valid value' }],
            hidden: !showFieldProjectType
        },
        {
            name: 'projectScope',
            label: 'Project Scope',
            value: isEditing ? <Input placeholder="Enter project scope" /> : renderWithFallback(dataUnit.projectScope),
            hidden: !showFieldProjectType
        }
    ];

    const renderContent = () => {
        const rows = [];
        const updatedArrFields = infoData.filter(item => !item.hidden);

        for (let i = 0; i < updatedArrFields.length; i += 3) {
            const rowData = updatedArrFields.slice(i, i + 3);

            const formItems = rowData.map((item: any, index: number) => {
                const { name, label, value, validation, required, colSpan = 8 } = item;

                const newLabel = required ? (
                    <span>
                        {label}
                        <span style={{ color: 'red', paddingLeft: 4 }}>*</span>
                    </span>
                ) : (
                    <span>{label}</span>
                );

                return (
                    <Col span={colSpan} key={index}>
                        {isEditing ? (
                            <Form.Item name={name} label={label} htmlFor="" rules={validation}>
                                {value}
                            </Form.Item>
                        ) : (
                            <Form.Item label={newLabel} htmlFor="">
                                {value}
                            </Form.Item>
                        )}
                    </Col>
                );
            });

            const row = (
                <Row key={i} gutter={[24, 24]} className="tab-info-row-item">
                    {formItems}
                </Row>
            );

            rows.push(row);
        }

        return rows;
    };

    const renderStaticContent = () => {
        // Extract text area rendering logic to a reusable component
        const renderTextArea = (content: string) => (
            <span>
                {content
                    ? content.split(/\r\n|\n/).map((line, index) => (
                          <React.Fragment key={index}>
                              {line}
                              <br />
                          </React.Fragment>
                      ))
                    : '-'}
            </span>
        );

        // Define common box props to avoid repetition
        const textAreaBoxes = [
            {
                title: 'Description',
                name: 'description',
                placeholder: 'Enter description',
                content: description,
                required: false
            },
            {
                title: 'Technologies',
                name: 'technologies',
                placeholder: 'Enter technologies',
                content: technologies,
                required: true,
                rules: [{ required: true, message: 'Please enter the valid value' }]
            }
        ];

        return (
            <Flex flex={1} gap={12}>
                {textAreaBoxes.map(({ title, name, placeholder, content, required, rules }) => (
                    <div key={name} className="tab-info__box">
                        <div className="tab-info__box--title">
                            {title}
                            {required && <span className="required">*</span>}
                        </div>
                        <Form.Item name={name} rules={rules}>
                            {isEditing ? <Input.TextArea placeholder={placeholder} className="text-area-item" /> : renderTextArea(content)}
                        </Form.Item>
                    </div>
                ))}
            </Flex>
        );
    };

    const clearData = () => {
        formUnit.resetFields();
        setIsEditing(false);
        setShowFieldProjectType(false);
    };

    const formatData = (values: IUnit) => {
        const { startDate, endDate } = values;
        return {
            ...values,
            unitId: unitId,
            parentId: parseInt(values.parentId.toString()),
            startDate: startDate ? formatTime(startDate) : undefined,
            endDate: endDate ? formatTime(endDate) : undefined
        };
    };

    const handleSubmit = async (values: IUnit) => {
        try {
            const res = await UnitService.updateUnit(formatData(values));
            const { succeeded, message, errors } = res;

            if (errors) {
                formUnit.setFields([{ name: 'unitName', errors: [errors[0].Message] }]);
                return;
            }

            showNotification(succeeded, message);
        } catch (error) {
            showNotification(false, 'Save failed');
        }

        clearData();
        setIsReload({});
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        clearData();
    };

    useEffect(() => {
        setShowFieldProjectType(dataUnit.projectTypeId === 2);
    }, [dataUnit, isEditing]);

    useEffect(() => {
        setIsEditing(false);
    }, [id, activeKeyTab]);

    return (
        <Form form={formUnit} name="tab-info-form-edit" onFinish={handleSubmit} requiredMark={RequiredMark}>
            <div className="tab-info-chart__container">
                <Flex justify="space-between" align="flex-end">
                    <Title level={4} style={{ margin: 0 }}>
                        {unitName} Info
                    </Title>
                    {isEditing ? (
                        <Flex gap={8}>
                            <Button type="default" onClick={handleCancelEdit}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Save
                            </Button>
                        </Flex>
                    ) : havePermission('Edit') && managedAction ? (
                        <Button type="primary" onClick={handleClickEdit}>
                            Edit
                        </Button>
                    ) : null}
                </Flex>
                <div className="tab-info__box">
                    <div className="tab-info__box--title">Unit Info</div>
                    {renderContent()}
                </div>
                {renderStaticContent()}
            </div>
        </Form>
    );
};

export default TabInfo;
