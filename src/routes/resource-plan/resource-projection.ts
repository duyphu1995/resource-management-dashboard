import DefaultLayout from '@/components/common/layout/default-layout';
import ResourceProjectiontPage from '@/pages/resource-plan/resource-projection';
import pathnames from '@/pathnames';
import { IRoute } from '..';
import ConfigurationPage from '@/pages/resource-plan/resource-projection/configuration';

const resourceProjection: IRoute[] = [
    {
        name: pathnames.resourcePlan.resourceProjection.main.name,
        path: pathnames.resourcePlan.resourceProjection.main.path,
        layout: DefaultLayout,
        element: ResourceProjectiontPage
    },
    {
        name: pathnames.resourcePlan.resourceProjection.configuration.name,
        path: pathnames.resourcePlan.resourceProjection.configuration.path,
        layout: DefaultLayout,
        element: ConfigurationPage
    }
];

export default resourceProjection;
