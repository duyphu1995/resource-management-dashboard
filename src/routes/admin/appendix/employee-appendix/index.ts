import { IRoute } from '@/routes';
import certificationRoutes from './certification';
import entryLanguageRoutes from './entry-language';
import languageCertificationRoutes from './language-certification';
import nationalityRoutes from './nationality';
import positionRoutes from './position';
import terminationReasonRoutes from './termination-reason';
import healthTrackingRoutes from './health-tracking';


const employeeAppendixRoutes: IRoute[] = [
    ...positionRoutes,
    ...nationalityRoutes,
    ...languageCertificationRoutes,
    ...entryLanguageRoutes,
    ...terminationReasonRoutes,
    ...certificationRoutes,
    ...healthTrackingRoutes,
];

export default employeeAppendixRoutes;
