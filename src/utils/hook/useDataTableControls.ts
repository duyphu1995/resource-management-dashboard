import { initializeShowedColumns } from '@/components/common/list-management/filter/use-filter';
import { searchParamsActions, selectSearchParams } from '@/redux/search-params-slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { ISearchParamsState } from '@/types/filter-redux';
import { ITableShowedColumn } from '@/types/table';
import { useCallback, useEffect, useState } from 'react';
import { getAlwaysShowColumnNames } from '../common';

export const useDataTableControls = (
    section: keyof ISearchParamsState,
    alwaysShowColumnNames?: string[],
    tableColumns?: any[],
    enabledSearch?: string[]
) => {
    const dispatch = useAppDispatch();
    const { showHideColumn: showHideColumnFromRedux } = useAppSelector(selectSearchParams)[section];

    const [showedColumns, setShowedColumns] = useState<ITableShowedColumn[]>(() =>
        initializeShowedColumns(alwaysShowColumnNames || [], tableColumns || [], enabledSearch || [])
    );

    const handlePageChange = useCallback(
        (currentPage: number, pageSize: number) => {
            dispatch(
                searchParamsActions.setPaginationTable({
                    section,
                    paginationTable: { currentPage, pageSize }
                })
            );
        },
        [dispatch, section]
    );

    const setSearchByKeyword = useCallback(
        (search: string) => {
            dispatch(searchParamsActions.setSearchByKeyword({ section, search }));
        },
        [dispatch, section]
    );

    const updateShowedColumns = useCallback(
        (newShowedColumns: ITableShowedColumn[]) => {
            setShowedColumns(newShowedColumns);
            const newAlwaysShowColumnNames = getAlwaysShowColumnNames(newShowedColumns);
            if (newAlwaysShowColumnNames) {
                dispatch(searchParamsActions.setShowHideColumn({ section, columns: newAlwaysShowColumnNames }));
            }
        },
        [dispatch, section]
    );

    useEffect(() => {
        if (showHideColumnFromRedux) {
            setShowedColumns(prevColumns =>
                prevColumns.map(column => ({
                    ...column,
                    show: showHideColumnFromRedux.includes(column.key)
                }))
            );
        }
    }, [showHideColumnFromRedux]);

    return {
        handlePageChange,
        setSearchByKeyword,
        showedColumns,
        updateShowedColumns
    };
};
