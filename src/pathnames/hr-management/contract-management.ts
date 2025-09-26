const main = {
    name: 'Contract Management',
    path: '/contract-management'
};
const detail = {
    name: 'Contract Details',
    path: '/contract-detail'
};
const add = {
    name: 'Add New Contract',
    path: '/contract-add'
};
const edit = {
    name: 'Edit Contract',
    path: '/contract-edit'
};
const print = {
    name: 'Print Labour Contract',
    path: '/contract-print'
};
const printLiquidation = {
    name: 'Print Liquidation Contract',
    path: print.path + '/contract-liquidation'
};

const contractManagement = {
    main,
    detail,
    add,
    edit,
    print,
    printLiquidation
};

export default contractManagement;
