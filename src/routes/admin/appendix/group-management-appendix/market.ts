import DefaultLayout from '@/components/common/layout/default-layout';
import MarketPage from '@/pages/admin/appendix/group-management-appendix/market';
import MarketAddPage from '@/pages/admin/appendix/group-management-appendix/market/market-add';
import MarketDetailPage from '@/pages/admin/appendix/group-management-appendix/market/market-detail';
import MarketEditPage from '@/pages/admin/appendix/group-management-appendix/market/market-edit';
import pathnames from '@/pathnames';
import { IRoute } from '@/routes';

const MarketRoutes: IRoute[] = [
    {
        name: pathnames.admin.appendix.groupManagementAppendix.market.main.name,
        path: pathnames.admin.appendix.groupManagementAppendix.market.main.path,
        layout: DefaultLayout,
        element: MarketPage,
        permission: 'Market'
    },
    {
        name: pathnames.admin.appendix.groupManagementAppendix.market.add.name,
        path: pathnames.admin.appendix.groupManagementAppendix.market.add.path,
        layout: DefaultLayout,
        element: MarketAddPage,
        permission: 'AddMarketAppendix'
    },
    {
        name: pathnames.admin.appendix.groupManagementAppendix.market.detail.name,
        path: pathnames.admin.appendix.groupManagementAppendix.market.detail.path + '/:marketplaceId',
        layout: DefaultLayout,
        element: MarketDetailPage,
        permission: 'DetailsMarketAppendix'
    },
    {
        name: pathnames.admin.appendix.groupManagementAppendix.market.edit.name,
        path: pathnames.admin.appendix.groupManagementAppendix.market.edit.path + '/:marketplaceId',
        layout: DefaultLayout,
        element: MarketEditPage,
        permission: 'EditMarketAppendix'
    }
];

export default MarketRoutes;
