/* eslint-disable @typescript-eslint/no-unused-vars */
import { IPaginationTable, ISearchParamsState } from '@/types/filter-redux';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

// Optimize the initial state
const initialState: ISearchParamsState = {
    employeeManagement: {},
    onsiteManagementWorking: { filter: { isBrokenCommitment: false } },
    onsiteManagementBroken: { filter: { isBrokenCommitment: true } },
    resignationManagementResigned: { filter: { isCancelled: false } },
    resignationManagementCancelled: { filter: { isCancelled: true } },
    contractManagementActive: { filter: { isDeleted: false } },
    contractManagementDeleted: { filter: { isDeleted: true } },
    managementList: {},
    temporaryLeavesOnGoing: { filter: { isFinish: false } },
    temporaryLeavesFinish: { filter: { isFinish: true } },
    contractorManagement: {},
    documentManagement: {},
    updateIDCardList: {},
    employeeTransferPending: { filter: { isCompletedTransfer: false } },
    employeeTransferCompleted: { filter: { isCompletedTransfer: true } },
    // Admin
    adminPosition: {},
    adminLanguageCertification: { filter: { tabActive: '' } },
    adminLevelCertification: { filter: { tabActive: '' } },
    adminEntryLanguage: {},
    adminCertification: { filter: { tabActive: '' } },
    adminCertificationName: { filter: { tabActive: '' } },
    adminNationality: {},
    adminTerminationReason: {},
    adminHealthTracking: {},
    adminCompany: {},
    adminContractSalary: {},
    adminMarket: {}
};

const searchParamsSlice = createSlice({
    name: 'searchParams',
    initialState,
    reducers: {
        setFilterParamsRedux(state, action: PayloadAction<Partial<ISearchParamsState>>) {
            Object.entries(action.payload).forEach(([key, value]) => {
                const section = key as keyof ISearchParamsState;
                if (value && state[section]) {
                    state[section] = { ...state[section], ...value };
                }
            });
        },
        setShowHideColumn(state, action: PayloadAction<{ section: keyof ISearchParamsState; columns: string[] }>) {
            const { section, columns } = action.payload;
            state[section].showHideColumn = columns;
        },
        setSearchByKeyword(state, action: PayloadAction<{ section: keyof ISearchParamsState; search: string }>) {
            const { section, search } = action.payload;
            state[section].searchByKeyword = search;
        },
        setPaginationTable(state, action: PayloadAction<{ section: keyof ISearchParamsState; paginationTable: IPaginationTable }>) {
            const { section, paginationTable } = action.payload;
            state[section].paginationTable = paginationTable;
        },
        resetFilterParamsRedux(state, action: PayloadAction<keyof ISearchParamsState>) {
            const section = action.payload;
            if (state[section] && state[section].filter) {
                state[section].filter = initialState[section].filter || {};
            }
        },
        resetPaginationParamsRedux(state, action: PayloadAction<keyof ISearchParamsState>) {
            const section = action.payload;
            if (state[section] && state[section].paginationTable) {
                state[section].paginationTable = undefined;
            }
        },
        resetAllSection(state, action: PayloadAction<keyof ISearchParamsState>) {
            const section = action.payload;
            state[section] = initialState[section];
        },
        resetAll(state) {
            Object.keys(state).forEach(key => {
                state[key as keyof ISearchParamsState] = initialState[key as keyof ISearchParamsState];
            });
        }
    }
});

export const selectSearchParams = (state: RootState) => state.searchParams;
export const searchParamsActions = searchParamsSlice.actions;
export const searchParamsReducer = searchParamsSlice.reducer;
