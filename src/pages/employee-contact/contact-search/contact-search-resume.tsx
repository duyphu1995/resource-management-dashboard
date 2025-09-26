import Avatar from '@/components/common/avatar';
import { renderBooleanStatus, renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import contactSearchService from '@/services/employee-contact/contact-search';
import { IField } from '@/types/common';
import {
    IContactSearchResumeEducation,
    IContactSearchResumeProject,
    IContactSearchResumeTrainingCourse,
    IContactSearchResumeWorkExperience
} from '@/types/employee-contact/contact-search';
import { IEmployee } from '@/types/hr-management/employee-management';
import { formatDataTable, formatTimeMonthDayYear, getRandomKey } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { Button, Flex, Spin } from 'antd';
import { ColumnType } from 'antd/es/table';
import { TableLocale } from 'antd/es/table/interface';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './contact-search-resume.scss';

const ContactSearchResumePage = () => {
    const { employeeId = '0' } = useParams();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IEmployee | null>(null);

    // Fetch resume data
    useEffect(() => {
        const fetchResumeDetail = async () => {
            turnOnLoading();
            try {
                const res = await contactSearchService.getResume(parseInt(employeeId));
                const { succeeded = false, data = null } = res;

                if (succeeded && data) setData(data);
            } catch (error) {
                showNotification(false, 'Failed to fetch data');
            } finally {
                turnOffLoading();
            }
        };

        fetchResumeDetail();
    }, [employeeId, turnOnLoading, turnOffLoading, showNotification]);

    const projectColumns: ColumnType<IContactSearchResumeProject>[] = [
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: 'Project Name',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'startDate',
            key: 'startDate',
            title: 'From Date',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'endDate',
            key: 'endDate',
            title: 'To Date',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        }
    ];

    const educationColumns: ColumnType<IContactSearchResumeEducation>[] = [
        {
            dataIndex: 'universityName',
            key: 'universityName',
            title: 'Institution',
            render: item => renderWithFallback(item)
        },
        {
            title: 'Year Of Attendance',
            render: (record: IContactSearchResumeEducation) =>
                renderWithFallback(record.fromYear && record.toYear && record.fromYear + ' - ' + record.toYear)
        },
        {
            dataIndex: 'degree',
            key: 'degree',
            title: 'Certificate',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'majorField',
            key: 'majorField',
            title: 'Major Field',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'rankName',
            key: 'rankName',
            title: 'Ranking',
            render: item => renderWithFallback(item)
        }
    ];

    const trainingCourseColumns: ColumnType<IContactSearchResumeTrainingCourse>[] = [
        {
            dataIndex: 'year',
            key: 'year',
            title: 'Year',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'courseName',
            key: 'courseName',
            title: 'Course Name',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'locationName',
            key: 'locationName',
            title: 'Location',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'organizedBy',
            key: 'organizedBy',
            title: 'Organized By',
            render: item => renderWithFallback(item)
        }
    ];

    const information: IField[] = [
        {
            label: 'Full Name',
            value: data?.fullName
        },
        {
            label: 'Date Join TMA',
            value: formatTimeMonthDayYear(data?.joinDate)
        },
        {
            label: 'Badge ID',
            value: data?.badgeId
        },
        {
            label: 'Nationality',
            value: data?.nationalityName
        },
        {
            label: 'Date Of Birth',
            value: formatTimeMonthDayYear(data?.birthday)
        },
        {
            label: 'Position',
            value: data?.positionName
        },
        {
            label: 'Project/Department',
            value: data?.projectName
        },
        {
            label: 'Current DC',
            value: data?.dcName
        }
    ];

    const workExperienceColumns: ColumnType<IContactSearchResumeWorkExperience>[] = [
        {
            dataIndex: 'company',
            key: 'company',
            title: 'Company',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'fromDate',
            key: 'fromDate',
            title: 'From',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'toDate',
            key: 'toDate',
            title: 'To',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'project',
            key: 'project',
            title: ORG_UNITS.Project,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'position',
            key: 'position',
            title: 'Position',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'statusName',
            key: 'statusName',
            title: 'Working Type',
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'isContractor',
            key: 'isContractor',
            title: 'Contractor',
            align: 'center',
            render: item => renderBooleanStatus(item, 'isContractor')
        }
    ];

    const personalFields: IField[] = [
        {
            label: 'Gender',
            value: data?.genderName
        },
        {
            label: 'Marital Status',
            value: data?.maritalStatusName
        },
        {
            label: 'Correspondence Address',
            value: data?.contactAddress
        },
        {
            label: 'Home Phone',
            value: data?.homePhone
        },
        {
            label: 'Cellphone Number',
            value: data?.mobilePhone
        },
        {
            label: 'E-mail Address',
            value: data?.workEmail
        }
    ];

    const tableLocale: TableLocale = { emptyText: <></> };

    const onGoTop = () => {
        const body = document.querySelector('#id-body');
        if (body) {
            body.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="contact-search-resume" id="resume">
            {/* TITLE */}
            <div className="resume-title">RÉSUMÉ</div>

            {/* INFORMATION */}
            <div className="resume-container">
                <Spin spinning={isLoading}>
                    <div className="resume-profile">
                        <div className="resume-profile-title">EMPLOYEE PROFILE</div>

                        <Flex gap="48px" justify="space-between">
                            {/* Content start */}
                            <div className="info">
                                {information.map((item, index) => (
                                    <div className="info-item" key={index}>
                                        <div className="info-item-title">{item.label}:</div>
                                        <div className="info-item-value">{renderWithFallback(item.value)}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Content end */}
                            <div>
                                <div className="resume-last-updated">
                                    <i>Last Updated:</i> {renderWithFallback(data?.lastModifiedOn)}
                                </div>
                                <Avatar src={data?.employeeImageUrl} shape="square" size={200} />
                            </div>
                        </Flex>
                    </div>

                    <div>
                        {/* TMA project history */}
                        <div className="section">
                            <div className="section-header">TMA Project History</div>
                            <BaseTable
                                pagination={false}
                                columns={projectColumns}
                                dataSource={formatDataTable(data?.projects || [])}
                                locale={tableLocale}
                                scroll={{ x: 'max-content' }}
                                bordered
                            />
                        </div>

                        {/* Education */}
                        <div className="section">
                            <div className="section-header">Education</div>
                            <BaseTable
                                pagination={false}
                                columns={educationColumns}
                                dataSource={formatDataTable(data?.educations || [])}
                                locale={tableLocale}
                                scroll={{ x: 'max-content' }}
                                bordered
                            />
                        </div>

                        {/* Courses/Workshops attended */}
                        <div className="section">
                            <div className="section-header">Courses/Workshops Attended</div>
                            <BaseTable
                                pagination={false}
                                columns={trainingCourseColumns}
                                dataSource={formatDataTable(data?.trainingCourses || [])}
                                locale={tableLocale}
                                scroll={{ x: 'max-content' }}
                                bordered
                            />
                        </div>

                        {/* Communication skills */}
                        <div className="section">
                            <div className="section-header">Communication Skills</div>
                            <div className="section-body">
                                {data?.communications && data.communications.length > 0
                                    ? data?.communications.map(item => (
                                          <div className="section-item" key={item.communicationId}>
                                              <div className="section-item-title">{item.languageName}:</div>
                                              <div className="section-item-value">{item.rankName}</div>
                                          </div>
                                      ))
                                    : '-'}
                            </div>
                        </div>

                        {/* Work experience before TMA */}
                        <div className="section">
                            <div className="section-header">Work Experience Before TMA</div>
                            <BaseTable
                                pagination={false}
                                columns={workExperienceColumns}
                                dataSource={formatDataTable(data?.employments || [])}
                                locale={tableLocale}
                                scroll={{ x: 'max-content' }}
                                bordered
                            />
                        </div>

                        {/* Personal information */}
                        <div className="section">
                            <div className="section-header">Personal Information</div>
                            <div className="section-body">
                                {personalFields.map((item, index) => (
                                    <div className="section-item" key={getRandomKey(index)}>
                                        <div className="section-item-title">{item.label}:</div>
                                        <div className="section-item-value">{renderWithFallback(item.value)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Go Top Button */}
                        <Flex justify="end">
                            <Button type="primary" className="button-go-top" onClick={onGoTop}>
                                Go Top
                            </Button>
                        </Flex>
                    </div>
                </Spin>
            </div>
        </div>
    );
};

export default ContactSearchResumePage;
