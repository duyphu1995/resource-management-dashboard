import BaseBreadcrumb from '@/components/common/breadcrumb';
import LeftContent from '@/components/group-management/left-content';
import RightContent from '@/components/group-management/right-content';
import pathnames from '@/pathnames';
import { selectAuth } from '@/redux/auth-slice';
import { groupManagedSliceActions } from '@/redux/group-managed-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import UnitService from '@/services/group-management/unit';
import { IStructureNode } from '@/types/group-management/group-management';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { convertToTreeStructure } from '@/utils/tree-utils';
import { Flex, Select } from 'antd';
import Title from 'antd/es/typography/Title';
import { useEffect, useRef, useState } from 'react';
import { useResizable } from 'react-resizable-layout';
import { useNavigate, useParams } from 'react-router-dom';
import './index.scss';
import SampleSplitter from './sample-splitter/sample-splitter';

export interface IStructureTreeOptions {
    label: string;
    value: string;
    level: string;
    children: IStructureTreeOptions[];
}

const GroupManagement = () => {
    const { id } = useParams();
    const navigation = useNavigate();
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectAuth).currentUser;
    const containerRef = useRef<HTMLDivElement>(null);

    const [selectedUnitId, setSelectedUnitId] = useState<number[]>([1]);
    const [treeData, setTreeData] = useState<IStructureNode[]>([]);
    const [activeSearch, setActiveSearch] = useState(false);
    const [allOptions, setAllOptions] = useState<any>({});
    const [isReloadAPI, setIsReloadAPI] = useState({});
    const { havePermission: haveOrgStructPermission } = usePermissions('OrganizationStructure', 'GroupManagement');

    const {
        isDragging: isFileDragging,
        position: fileW,
        separatorProps: fileDragBarProps
    } = useResizable({
        axis: 'x',
        initial: 342,
        min: 194,
        max: 653,
        containerRef: containerRef
    });

    const breadcrumbItems = [{ title: pathnames.home.name }, { title: pathnames.groupManagement.main.name }];

    const [heightBody, setHeightBody] = useState(document.getElementById('id-body')?.clientHeight || 0);
    const [heightLeftContent, setHeightLeftContent] = useState(document.getElementById('id-right-content')?.clientHeight || 0);
    const [onChange, setOnChange] = useState('1');
    const [selectedValue, setSelectedValue] = useState<number | null>(null);

    const selectUnitIdTree = (id: number | string) => {
        navigation(pathnames.groupManagement.main.path + '/' + id);
        setSelectedUnitId([Number(id)]);
        // Add a permission key based on "managed
        dispatch(
            groupManagedSliceActions.setGroupManaged({
                isManaged: treeData?.find(item => item.unitId === Number(id))?.isManaged || false
            })
        );
    };

    const onSelectUnitId = (id: string) => {
        selectUnitIdTree(id);
        setSelectedValue(null);
        setOnChange('1');
    };

    const handleSelectChange = (data: { value: number }) => {
        selectUnitIdTree(data.value);
        setSelectedValue(data.value);
    };

    // Update height when tab changes
    useEffect(() => {
        const updateHeights = () => {
            // Update height body
            setHeightBody(document.getElementById('id-body')?.clientHeight || 0);

            // Update height content left when tab changes
            if (!isLoading) {
                const updateHeightRightContent = () => {
                    setHeightLeftContent(document.getElementById('id-right-content')?.clientHeight || 0);
                };

                const timeoutId = setTimeout(updateHeightRightContent, 100);

                const handleResize = () => {
                    updateHeightRightContent();
                    setHeightBody(document.getElementById('id-body')?.clientHeight || 0);
                };

                window.addEventListener('resize', handleResize);

                return () => {
                    window.removeEventListener('resize', handleResize);
                    clearTimeout(timeoutId);
                };
            }
        };

        updateHeights();
    }, [isLoading, heightBody, onChange, selectedUnitId, heightLeftContent]);

    const fetchAllIndex = async () => {
        const response = await UnitService.getAllIndex();
        return response;
    };

    const fetchStructureTree = async () => {
        const response = await UnitService.getStructureTree();
        return response;
    };

    const getOrganizationTreePermission = () => {
        return [haveOrgStructPermission('Add'), haveOrgStructPermission('Edit'), haveOrgStructPermission('Delete')];
    };

    useEffect(() => {
        if (!currentUser) return;
        if (!id) {
            navigation(pathnames.groupManagement.main.path + `/${currentUser?.projectId}`);
            setSelectedUnitId([Number(currentUser?.projectId)]);
            return;
        }
        if (Object.keys(allOptions).length > 0 && !isReloadAPI) return;
        if (treeData.length > 0 && !isReloadAPI) return;

        const remapUnits: any = (units: IStructureTreeOptions[] = []) => {
            return units.map((unit: any) => ({
                label: unit.unitName,
                value: unit.unitId.toString(),
                level: unit.unitTypeLevel,
                children: unit?.children ? remapUnits(unit?.children) : undefined
            }));
        };

        setSelectedUnitId([Number(id)]);

        const fetchData = async () => {
            turnOnLoading();

            try {
                const indexData = await fetchAllIndex();
                const { succeeded, data } = indexData;

                if (succeeded && data) {
                    const {
                        managers,
                        unitTypeBasicDtos,
                        unitBasicDtos,
                        projectContractBasicDtos,
                        marketplaceBasicDtos,
                        projectTypeBasicDtos,
                        projectDomainBasicDtos
                    } = data;

                    const managerList = managers?.map(item => ({ label: item.fullName, value: item.employeeId }));
                    const unitTypeList = unitTypeBasicDtos?.map(item => ({
                        label: item.unitTypeName,
                        value: item.unitTypeId,
                        level: item.unitTypeLevel
                    }));
                    const unitDataList = unitBasicDtos ? remapUnits(unitBasicDtos) : [];
                    const contractList = projectContractBasicDtos?.map(item => ({
                        label: item.projectContractName,
                        value: item.projectContractId
                    }));
                    const marketplaceList = marketplaceBasicDtos?.map(item => ({ label: item.marketplaceName, value: item.marketplaceId }));
                    const projectTypeList = projectTypeBasicDtos?.map(item => ({ label: item.projectTypeName, value: item.projectTypeId }));
                    const projectDomainList = projectDomainBasicDtos?.map(item => ({
                        label: item.projectDomainName,
                        value: item.projectDomainId
                    }));

                    setAllOptions({
                        managers: managerList,
                        unitTypeBasicDtos: unitTypeList,
                        unitBasicDtos: unitDataList,
                        projectContractBasicDtos: contractList,
                        marketplaceBasicDtos: marketplaceList,
                        projectTypeBasicDtos: projectTypeList,
                        projectDomainBasicDtos: projectDomainList
                    });
                }
            } catch (error) {
                showNotification(false, 'Fetching index data failed');
            }

            try {
                if (haveOrgStructPermission('View')) {
                    const structureData = await fetchStructureTree();
                    structureData.data && setTreeData(structureData.data);

                    // Add a permission key based on "managed
                    dispatch(
                        groupManagedSliceActions.setGroupManaged({
                            isManaged: structureData.data?.find(item => item.unitId === Number(id))?.isManaged || false
                        })
                    );
                } else {
                    showNotification(false, 'You do not have permission to view the organization structure.');
                }
            } catch (error) {
                showNotification(false, 'Fetching structure data failed');
            }
            turnOffLoading();
            setIsReloadAPI(false);
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, id, navigation, isReloadAPI, showNotification, turnOnLoading, turnOffLoading]);

    return (
        <>
            <BaseBreadcrumb dataItem={breadcrumbItems} />
            <Title level={3} style={{ marginBottom: 24 }}>
                Group Management
            </Title>
            <div className="chart-management">
                {haveOrgStructPermission('View') ? (
                    <div className="chart-left-content" ref={containerRef} style={{ width: fileW, minWidth: fileW, maxWidth: fileW }}>
                        <Title level={4} className="overFlow-ellipsis" style={{ marginBottom: 24 }}>
                            Organization Structure
                        </Title>
                        <Flex className="box-search">
                            <div className={`box-search-icon ${activeSearch ? 'box-search-active' : ''}`}>
                                <img src="/media/icons/search-gray.svg" alt="search-icon" />
                            </div>
                            <Select
                                className="box-search-input"
                                showSearch
                                placeholder={`Search by ${ORG_UNITS.DG}, ${ORG_UNITS.DC}, ${ORG_UNITS.Project}`}
                                labelInValue
                                suffixIcon={null}
                                onChange={handleSelectChange}
                                value={selectedValue ? { value: selectedValue } : undefined}
                                options={treeData.map(d => ({
                                    label: d.unitName,
                                    value: d.unitId
                                }))}
                                filterOption={(input: any, option: any) => {
                                    return option?.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                                }}
                                onMouseDown={() => setActiveSearch(true)}
                                onBlur={() => setActiveSearch(false)}
                            />
                        </Flex>

                        {isLoading ? (
                            <LeftContent.Skeleton />
                        ) : (
                            <LeftContent
                                treeData={convertToTreeStructure(treeData || [])}
                                selectedKeys={selectedUnitId}
                                setSelectedUnitId={id => onSelectUnitId(id)}
                                height={heightLeftContent - 172}
                                allOptions={allOptions}
                                setIsReload={setIsReloadAPI}
                                userPermissions={getOrganizationTreePermission()}
                            />
                        )}
                    </div>
                ) : (
                    <div />
                )}
                <SampleSplitter isDragging={isFileDragging} {...fileDragBarProps} />
                <div
                    id="id-right-content"
                    className="chart-right-content"
                    style={{ width: `calc(100% - ${fileW}px)`, minHeight: `calc(${heightBody}px - 150px)` }}
                >
                    <RightContent
                        allOptions={allOptions}
                        onChangeTab={key => {
                            setOnChange(key);
                        }}
                        setIsReload={setIsReloadAPI}
                    />
                </div>
            </div>
        </>
    );
};

export default GroupManagement;
