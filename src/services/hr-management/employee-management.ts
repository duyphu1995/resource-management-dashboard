import { IResponse } from '@/types/common';
import { IContract } from '@/types/hr-management/contract-management';
import {
    IAchievement,
    ICertificates,
    ICreateComment,
    ICreateEmployee,
    IDocument,
    IEditWorkInformation,
    IEducation,
    IEmployee,
    IEmployeeExport,
    IEmployeeIndexes,
    IEntryLanguage,
    IHealthTracking,
    ILanguageSkills,
    INormalUserComment,
    IOnsiteHistory,
    IPaForeignLanguage,
    IProject,
    IPromotion,
    ISelect,
    ITrainingCourses,
    IUpdatedHistory,
    IWorkingExperienceBeforeTMA
} from '@/types/hr-management/employee-management';
import { ICommitments } from '@/types/hr-management/onsite-management';
import { IQuickFilterData } from '@/types/quick-filter';
import axiosClient from '../axios-client';

const apiURL = '/employee';
const apiComment = '/comment';
const apiQuickFilter = '/quickFilter';
const apiLocation = '/location';
const apiCertificate = '/certificate';
const apiLanguage = '/communication'; // Language skill is DB name 'communication'
const apiLanguageName = 'language'; // get all select language name
const apiEmployment = '/employment';
const apiHealthTracking = '/healthTracking';
const apiEmployeeCertificate = '/employeeCertificate';
const apiEducation = '/education';
const apiTrainingCourse = '/trainingCourse';
const apiPromotion = '/promotionInfo';
const apiProject = '/project';
const apiEmployeeProject = '/employeeProject';

const employeeService = {
    // Get employee
    getAllEmployee: (params: any): Promise<IResponse<IEmployee[]>> => {
        const url = apiURL + '/search';
        return axiosClient.post(url, params);
    },

    getEmployeeDetail: (id: string): Promise<IResponse<IEmployee>> => {
        const url = apiURL + `/${id}`;
        return axiosClient.get(url);
    },

    getCommonInformationEmployee: (id: string, moduleName?: string): Promise<IResponse<IEmployee>> => {
        const url = apiURL + `/${id}` + '/common-information';
        return axiosClient.get(url, { moduleName });
    },

    // tab personal detail
    getPersonalInformation: (id: string, moduleName?: string): Promise<IResponse<IEmployee>> => {
        const url = apiURL + `/${id}` + '/personal-information';
        return axiosClient.get(url, { moduleName });
    },

    getDocuments: (id: string, moduleName?: string): Promise<IResponse<IDocument[]>> => {
        const url = apiURL + `/${id}` + '/documents';
        return axiosClient.get(url, { moduleName });
    },

    getEducations: (id: string, moduleName?: string): Promise<IResponse<IEducation[]>> => {
        const url = apiURL + `/${id}` + '/educations';
        return axiosClient.get(url, { moduleName });
    },

    getHealthTracking: (id: string, moduleName?: string): Promise<IResponse<IHealthTracking[]>> => {
        const url = apiURL + `/${id}` + '/health-tracking';
        return axiosClient.get(url, { moduleName });
    },

    getLanguageSkills: (id: string, moduleName?: string): Promise<IResponse<ILanguageSkills[]>> => {
        const url = apiURL + `/${id}` + '/language-skills';
        return axiosClient.get(url, { moduleName });
    },

    // tab working detail
    getWorkExperience: (id: string, moduleName?: string): Promise<IResponse<IEmployee>> => {
        const url = apiURL + `/${id}` + '/work-experience';
        return axiosClient.get(url, { moduleName });
    },

    getProjects: (id: string, moduleName?: string): Promise<IResponse<IProject[]>> => {
        const url = apiURL + `/${id}` + '/projects';
        return axiosClient.get(url, { moduleName });
    },

    getTemporaryLeaves: (id: string, moduleName?: string): Promise<IResponse<any[]>> => {
        const url = apiURL + `/${id}` + '/temporary-leaves';
        return axiosClient.get(url, { moduleName });
    },

    getOnsiteHistories: (id: string, moduleName?: string): Promise<IResponse<IOnsiteHistory[]>> => {
        const url = apiURL + `/${id}` + '/onsite-histories';
        return axiosClient.get(url, { moduleName });
    },

    getCommitments: (id: string, moduleName?: string): Promise<IResponse<ICommitments[]>> => {
        const url = apiURL + `/${id}` + '/commitments';
        return axiosClient.get(url, { moduleName });
    },

    getContracts: (id: string, moduleName?: string): Promise<IResponse<IContract[]>> => {
        const url = apiURL + `/${id}` + '/contracts';
        return axiosClient.get(url, { moduleName });
    },

    getWorkExperiencesBeforeTMA: (id: string, moduleName?: string): Promise<IResponse<IWorkingExperienceBeforeTMA[]>> => {
        const url = apiURL + `/${id}` + '/work-experiences-before-tma';
        return axiosClient.get(url, { moduleName });
    },

    // tab performance appraisal
    getAchievements: (id: string, moduleName?: string): Promise<IResponse<IAchievement[]>> => {
        const url = apiURL + `/${id}` + '/achievements';
        return axiosClient.get(url, { moduleName });
    },

    getPromotionsBeforePA: (id: string, moduleName?: string): Promise<IResponse<IPromotion[]>> => {
        const url = apiURL + `/${id}` + '/promotions-before-pa';
        return axiosClient.get(url, { moduleName });
    },

    getPAHistories: (id: string, moduleName?: string): Promise<IResponse<any[]>> => {
        const url = apiURL + `/${id}` + '/pa-histories';
        return axiosClient.get(url, { moduleName });
    },

    getPAForeignLanguages: (id: string, moduleName?: string): Promise<IResponse<IPaForeignLanguage[]>> => {
        const url = apiURL + `/${id}` + '/pa-foreign-languages';
        return axiosClient.get(url, { moduleName });
    },

    // tab training
    getTrainingCourses: (id: string, moduleName?: string): Promise<IResponse<ITrainingCourses[]>> => {
        const url = apiURL + `/${id}` + '/training-courses';
        return axiosClient.get(url, { moduleName });
    },

    getCertificates: (id: string, moduleName?: string): Promise<IResponse<ICertificates[]>> => {
        const url = apiURL + `/${id}` + '/certificates';
        return axiosClient.get(url, { moduleName });
    },

    // tab training
    getComments: (id: string, commentTypeId: number, moduleName?: string): Promise<IResponse<INormalUserComment[]>> => {
        const url = `${apiComment}/employee/${id}/commentType/${commentTypeId}`;
        return axiosClient.get(url, { moduleName });
    },

    getAllIndexes: (moduleName: string = 'EmployeeManagement'): Promise<IResponse<IEmployeeIndexes>> => {
        const url = apiURL + '/allIndex';
        return axiosClient.get(url, { moduleName });
    },

    // Check Badge Id
    checkBadgeId: (badgeId: string): Promise<IResponse<boolean>> => {
        const url = apiURL + `/getByBadgeId/${badgeId}`;
        return axiosClient.get(url);
    },
    // Check Email
    checkWorkEmail: (email: string): Promise<IResponse<boolean>> => {
        const url = apiURL + `/getByWorkEmail/${email}`;
        return axiosClient.get(url);
    },

    // Delete employee
    deleteEmployee: (id: number): Promise<IResponse> => {
        const url = `${apiURL}/${id}`;
        return axiosClient.delete(url);
    },

    // Export employees
    exportEmployees: (params: IEmployeeExport): Promise<IResponse> => {
        const url = `${apiURL}/export`;
        return axiosClient.post(url, params, { responseType: 'blob' });
    },

    // Import employees
    importEmployees: (params: any) => {
        const url = `${apiURL}/import`;
        return axiosClient.post(url, params, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    // Download skipper record
    downloadSkipperRecord: (params: any) => {
        const url = `${apiURL}/getAttachment?fileName=${params}`;
        return axiosClient.get(url, { responseType: 'blob' });
    },
    // Upload file employment
    uploadFileEmployee: (params: any, moduleName?: string) => {
        const url = `${apiURL}/uploadFile`;
        return axiosClient.post(url, params, { headers: { 'Content-Type': 'multipart/form-data', 'Module-Name': moduleName } });
    },

    // Comment
    createComment: (params: ICreateComment | undefined, moduleName?: string): Promise<IResponse> => {
        const url = apiComment;
        return axiosClient.post(url, params, { moduleName });
    },

    editComment: (params: ICreateComment | undefined, moduleName?: string): Promise<IResponse> => {
        const url = apiComment + `/${params?.commentId}`;
        return axiosClient.put(url, params, { moduleName });
    },

    deleteComment: (params: number, moduleName?: string): Promise<IResponse> => {
        const url = apiComment + `/${params}`;
        return axiosClient.delete(url, { moduleName });
    },

    // Update history
    getUpdatedHistory: (id: string): Promise<IResponse<IUpdatedHistory[]>> => {
        const url = apiURL + `/${id}/updateHistory`;
        return axiosClient.get(url);
    },

    // Quick filter
    getAllQuickFilter: (): Promise<IResponse<IQuickFilterData[]>> => {
        const url = apiURL + apiQuickFilter + '/getAll';
        return axiosClient.get(url);
    },

    updateQuickFilter: (params: IQuickFilterData): Promise<IResponse> => {
        const url = apiURL + apiQuickFilter + '/' + params.quickFilterId;
        return axiosClient.put(url, params);
    },

    createQuickFilter: (params: IQuickFilterData): Promise<IResponse> => {
        const url = apiURL + apiQuickFilter;
        return axiosClient.post(url, params);
    },

    deleteQuickFilter: (id: number): Promise<IResponse> => {
        const url = apiURL + apiQuickFilter + '/' + id;
        return axiosClient.delete(url);
    },

    // Add new employee
    addNewEmployee: (params: ICreateEmployee): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
    },

    // Edit work information
    editWorkInformation: (params: IEditWorkInformation, moduleName?: string): Promise<IResponse> => {
        const url = apiURL + `/${params.employeeId}/workInformation`;
        return axiosClient.put(url, params, { moduleName });
    },

    // Edit information
    editInformation: (params: IEditWorkInformation, moduleName?: string): Promise<IResponse> => {
        const url = apiURL + `/${params.employeeId}/information`;
        return axiosClient.put(url, params, { moduleName });
    },

    // Location
    getBuildings: (): Promise<IResponse<ISelect[]>> => {
        const url = apiLocation + '/building/getAll';
        return axiosClient.get(url);
    },

    getFloorsByBuilding: (buildingId: string): Promise<IResponse<ISelect[]>> => {
        const url = apiLocation + `/floor/getByBuilding/${buildingId}`;
        return axiosClient.get(url);
    },

    getRoomsByFloor: (floorId: string): Promise<IResponse<ISelect[]>> => {
        const url = apiLocation + `/room/getByFloor/${floorId}`;
        return axiosClient.get(url);
    },

    // Entry language
    getEntryLanguage: (moduleName?: string): Promise<IResponse<IEntryLanguage[]>> => {
        const url = `/entryLanguage/getAll`;
        return axiosClient.get(url, { moduleName });
    },

    // Get all university
    getAllUniversity: (moduleName?: string): Promise<IResponse<ISelect[]>> => {
        const url = apiURL + '/university/getAll';
        return axiosClient.get(url, { moduleName });
    },

    // Get all education ranking
    getAllEducationRanking: (moduleName?: string): Promise<IResponse<ISelect[]>> => {
        const url = apiURL + '/educationRanking/getAll';
        return axiosClient.get(url, { moduleName });
    },

    // Add Education Employee
    addEducationEmployee: (params: IEducation, moduleName?: string): Promise<IResponse> => {
        const url = apiEducation;
        return axiosClient.post(url, params, { moduleName });
    },

    // Update Education Employee
    updateEducationEmployee: (params: IEducation, moduleName?: string): Promise<IResponse> => {
        const url = apiEducation + `/${params.educationId}`;
        return axiosClient.put(url, params, { moduleName });
    },

    // Delete Education Employee
    deleteEducationEmployee: (id: number, moduleName?: string): Promise<IResponse> => {
        const url = apiEducation + `/${id}`;
        return axiosClient.delete(url, { moduleName });
    },

    // Get Health Tracking Employee
    getHealthTrackingEmployee: (moduleName?: string): Promise<IResponse<IHealthTracking[]>> => {
        const url = apiHealthTracking + apiCertificate + '/getAll';
        return axiosClient.get(url, { moduleName });
    },

    // Add Health Tracking Employee
    addHealthTrackingEmployee: (params: IHealthTracking, moduleName?: string): Promise<IResponse> => {
        const url = apiHealthTracking;
        return axiosClient.post(url, params, { moduleName });
    },

    // Update Health Tracking Employee
    updateHealthTrackingEmployee: (params: IHealthTracking, moduleName?: string): Promise<IResponse> => {
        const url = apiHealthTracking + `/${params.employeeCertificateId}`;
        return axiosClient.put(url, params, { moduleName });
    },

    // Delete Health Tracking Employee
    deleteHealthTrackingEmployee: (id: number, moduleName?: string): Promise<IResponse> => {
        const url = apiHealthTracking + `/${id}`;
        return axiosClient.delete(url, { moduleName });
    },

    // Get All Language Skills Employee
    getAllLanguageSkillsEmployee: (moduleName: string = 'LanguageCertification'): Promise<IResponse<ILanguageSkills[]>> => {
        const url = apiLanguageName + '/getAll';
        return axiosClient.get(url, { moduleName });
    },

    // Get all language ranking
    getAllLanguageRanking: (): Promise<IResponse<ILanguageSkills[]>> => {
        const url = apiURL + '/communicationRanking/getAll';
        return axiosClient.get(url);
    },

    // Add Language Skills Employee
    addLanguageSkillsEmployee: (params: ILanguageSkills, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiLanguage;
        return axiosClient.post(url, params, { moduleName });
    },

    // Update Language Skills Employee
    updateLanguageSkillsEmployee: (params: ILanguageSkills, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiLanguage + `/${params.communicationId}`;
        return axiosClient.put(url, params, { moduleName });
    },

    // Delete Language Skills Employee
    deleteLanguageSkillsEmployee: (id: number, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiLanguage + `/${id}`;
        return axiosClient.delete(url, { moduleName });
    },

    // Get certificate type employee
    getCertificateTypeEmployee: (moduleName: string = 'Certification'): Promise<IResponse> => {
        const url = apiCertificate + '/getAllCertificateType';
        return axiosClient.get(url, { moduleName });
    },

    // Get certificate by id
    getCertificateById: (id: number, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiCertificate + `/getByCertificateType/${id}`;
        return axiosClient.get(url, { moduleName });
    },

    // Add certificate employee
    addCertificateEmployee: (params: ICertificates, moduleName?: string): Promise<IResponse> => {
        const url = apiEmployeeCertificate;
        return axiosClient.post(url, params, { moduleName });
    },

    // Update certificate employee
    updateCertificateEmployee: (params: ICertificates, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiEmployeeCertificate + `/${params.employeeCertificateId}`;
        return axiosClient.put(url, params, { moduleName });
    },

    // Delete certificate employee
    deleteCertificateEmployee: (id: number, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiEmployeeCertificate + `/${id}`;
        return axiosClient.delete(url, { moduleName });
    },

    // Add training course employee
    addTrainingCourseEmployee: (params: ITrainingCourses, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiTrainingCourse;
        return axiosClient.post(url, params, { moduleName });
    },

    // Update training course employee
    updateTrainingCourseEmployee: (params: any, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiTrainingCourse + `/${params.trainingCourseId}`;
        return axiosClient.put(url, params, { moduleName });
    },

    // Delete training course employee
    deleteTrainingCourseEmployee: (id: number, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiTrainingCourse + `/${id}`;
        return axiosClient.delete(url, { moduleName });
    },

    // Get working status employee
    getWorkingStatusEmployee: (moduleName?: string): Promise<IResponse> => {
        const url = `${apiEmployment}/workingStatus/getAll`;
        return axiosClient.get(url, { moduleName });
    },

    // Add work experience before TMA employee
    addWorkExperienceBeforeTmaEmployee: (params: IWorkingExperienceBeforeTMA, moduleName?: string): Promise<IResponse> => {
        const url = apiEmployment;
        return axiosClient.post(url, params, { moduleName });
    },

    // Update work experience before TMA employee
    updateWorkExperienceBeforeTmaEmployee: (params: any, moduleName?: string): Promise<IResponse> => {
        const url = apiEmployment + `/${params.employmentId}`;
        return axiosClient.put(url, params, { moduleName });
    },

    // Delete work experience before TMA employee
    deleteWorkExperienceBeforeTmaEmployee: (id: number, moduleName?: string): Promise<IResponse> => {
        const url = `${apiEmployment}/${id}`;
        return axiosClient.delete(url, { moduleName });
    },

    // Add promotion employee
    addPromotionEmployee: (params: IPromotion, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiPromotion;
        return axiosClient.post(url, params, { moduleName });
    },

    // Update promotion employee
    updatePromotionEmployee: (params: IPromotion, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiPromotion + `/${params.promotionInfoId}`;
        return axiosClient.put(url, params, { moduleName });
    },

    // Delete promotion employee
    deletePromotionEmployee: (id: number, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiPromotion + `/${id}`;
        return axiosClient.delete(url, { moduleName });
    },

    // Get all project
    getAllProjects: (): Promise<IResponse> => {
        const url = apiURL + apiProject + '/getAll';
        return axiosClient.get(url);
    },

    // Add employee to project
    addEmployeeProject: (params: IProject, moduleName?: string): Promise<IResponse> => {
        const url = apiEmployeeProject;
        return axiosClient.post(url, params, { moduleName });
    },

    // Update employee to project
    updateEmployeeProject: (params: IProject, moduleName?: string): Promise<IResponse> => {
        const url = apiEmployeeProject + `/${params.employeeUnitId}`;
        return axiosClient.put(url, params, { moduleName });
    },

    // Leave employee to project
    leaveEmployeeProject: (id: number, moduleName?: string): Promise<IResponse> => {
        const url = apiEmployeeProject + `/${id}/leave`;
        return axiosClient.put(url, {}, { moduleName });
    }
};

export default employeeService;
