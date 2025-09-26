import DefaultLayout from '@/components/common/layout/default-layout';
import EmailSubscriptionPage from '@/pages/admin/email-subscription';
import AddEmailSubscriptionPage from '@/pages/admin/email-subscription/email-subscription-add';
import DetailEmailSubscriptionPage from '@/pages/admin/email-subscription/email-subscription-detail';
import EditEmailSubscriptionPage from '@/pages/admin/email-subscription/email-subscription-edit';
import pathnames from '@/pathnames';
import { IRoute } from '@/routes';

const emailSubscriptionRoutes: IRoute[] = [
    {
        name: pathnames.admin.emailSubscription.main.name,
        path: pathnames.admin.emailSubscription.main.path,
        layout: DefaultLayout,
        element: EmailSubscriptionPage
    },
    {
        name: pathnames.admin.emailSubscription.add.name,
        path: pathnames.admin.emailSubscription.add.path,
        layout: DefaultLayout,
        element: AddEmailSubscriptionPage
    },
    {
        name: pathnames.admin.emailSubscription.detail.name,
        path: pathnames.admin.emailSubscription.detail.path + '/:id',
        layout: DefaultLayout,
        element: DetailEmailSubscriptionPage
    },
    {
        name: pathnames.admin.emailSubscription.edit.name,
        path: pathnames.admin.emailSubscription.edit.path + '/:id',
        layout: DefaultLayout,
        element: EditEmailSubscriptionPage
    }
];

export default emailSubscriptionRoutes;
