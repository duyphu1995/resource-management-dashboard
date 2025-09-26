import { HeaderMenu } from '@/components/common/layout/default-layout/header-menu-data';
import { convertFilterValueToString, convertStringToFilterValue } from '@/components/common/list-management/filter/use-filter';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import { IRoute } from '@/routes';
import { IAdminPosition } from '@/types/admin';
import { IPermission } from '@/types/auth';
import { IFilterData } from '@/types/filter';
import { ITableShowedColumn } from '@/types/table';
import { FormInstance } from 'antd';
import CryptoJS from 'crypto-js';
import dayjs, { Dayjs } from 'dayjs';
import jsPDF from 'jspdf';
import React from 'react';
import { TIME_FORMAT } from './constants';

const secretKey = 'pJPTWL9I6CZTxFhEDMgay4iBgnfVyi5K';

const today = dayjs();

// Validate work email
export const validateWorkEmail = (value: string) => {
    if (!value) {
        return Promise.reject('Please enter valid value');
    } else if (value.endsWith('@tma.com.vn')) {
        return Promise.resolve();
    } else {
        return Promise.reject('Please enter correct format email. example:"admin@tma.com.vn"');
    }
};

export const handleValidateName = (value: string) => {
    if (!value) {
        return Promise.reject('Please enter the valid value');
    }
    if (value.length > 50) {
        return Promise.reject('Please enter no more than 50 characters');
    }
    return Promise.resolve();
};

export const validateRange0To1000 = (name?: string) => ({
    validator(_: any, value: any) {
        if (value < 0 || value > 1000) {
            return Promise.reject(new Error(name || 'Please adjust effort so that effort is greater than 0 and less than or equal to 1000!'));
        }
        return Promise.resolve();
    }
});

// Handle validate age
export const handleValidateAge = (value: string, age: number = 18) => {
    const eighteenYearsAgo = dayjs().subtract(age, 'years');
    const selectedDate = dayjs(value);

    if (value && !selectedDate.isBefore(eighteenYearsAgo)) {
        return Promise.reject('You must be at least 18 years old.');
    }
    return Promise.resolve();
};

// Validate value
export const validateRequiredValue = (message: string = '') => ({
    required: true,
    validator: (_: any, value: string) => (value && String(value).trim() ? Promise.resolve() : Promise.reject(message))
});
export const validateMaxLengthCharacters = (maxLength: number = 500) => ({ max: maxLength, message: validateMaxLengthCharactersMessage(maxLength) });

export const validateMaxLengthCharactersMessage = (maxLength: number = 500) => `Please enter no more than ${maxLength} characters`;
export const validateSelectValidValueMessage = 'Please select valid value';
export const validateEnterValidValueMessage = 'Please enter valid value';

export const validateSelectValidValue = validateRequiredValue(validateSelectValidValueMessage);
export const validateEnterValidValue = validateRequiredValue(validateEnterValidValueMessage);
export const validate500Characters = validateMaxLengthCharacters(500);
export const validate1000Characters = validateMaxLengthCharacters(1000);
export const phoneValidatePattern = /^0\d{3}\s\d{3}\s\d{3}$/;

// Format current number
export const formatCurrencyNumber = (value: string | number) => {
    return value?.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ');
};

// Format data tabled
// Add key for row in data table
export const formatDataTable = (data: any[] = []) => {
    return data?.map((item, index: number) => ({ key: index, ...item })) || [];
};

export const formatDataTableFromOne = (data: any[] = []) => {
    return data?.map((item, index: number) => ({ key: index + 1, ...item })) || [];
};

// Generate number to vietnamese string
export const numberToVietnamese = (number: number, currency: string = 'đồng'): string => {
    let vietnameseText = '';

    // Dictionaries and constants for text representations are defined.
    const default_numbers = ' hai ba bốn năm sáu bảy tám chín';
    const dict = {
        units: ('? một' + default_numbers).split(' '),
        tens: ('lẻ mười' + default_numbers).split(' '),
        hundreds: ('không một' + default_numbers).split(' ')
    };
    const tram = 'trăm';
    const digits = 'x nghìn triệu tỉ nghìn'.split(' ');

    // The tenth function handles the conversion of a two-digit block, considering special cases for numbers like 5, 1, and greater than 1.
    const tenth = (block_of_2: string[]) => {
        let sl1 = dict.units[Number(block_of_2[1])];
        const result = [dict.tens[Number(block_of_2[0])]];
        if (block_of_2[0] > '0' && block_of_2[1] === '5') sl1 = 'lăm';
        if (block_of_2[0] > '1') {
            result.push('mươi');
            if (block_of_2[1] === '1') sl1 = 'mốt';
        }
        if (sl1 !== '?') result.push(sl1);
        return result.join(' ');
    };
    // The block_of_three function manages the conversion of a three-digit block, utilizing a switch statement to determine the length of the block.
    const block_of_three = (block: string) => {
        switch (block.length) {
            case 1:
                if (block === '0') return 'không';
                return dict.units[Number(block)];

            case 2:
                return tenth(block.split(''));

            case 3: {
                const result = [dict.hundreds[Number(block[0])], tram];
                if (block.slice(1, 3) !== '00') {
                    const sl12 = tenth(block.slice(1, 3).split(''));
                    result.push(sl12);
                }
                return result.join(' ');
            }
        }
        return '';
    };

    // The digit_counting function returns the corresponding power of 10 based on the provided index.
    const digit_counting = (i: number) => {
        return digits[i];
    };

    // The toVietnamese function is the core of the conversion process, taking a numeric input string and currency, and returning the corresponding Vietnamese text.
    const toVietnamese = (input: string, currency: string) => {
        const str = parseInt(input) + '';
        let index = str.length;
        if (index === 0 || str === 'NaN') return '';
        let i = 0;
        const arr: string[] = [];
        const result: string[] = [];

        // The input string is broken into three-digit blocks.
        while (index >= 0) {
            arr.push(str.substring(index, Math.max(index - 3, 0)));
            index -= 3;
        }

        let digit_counter = 0;
        let digit;
        // The main loop iterates through the blocks in reverse order, handling special cases for consecutive blocks of '000'.
        for (i = arr.length - 1; i >= 0; i--) {
            if (arr[i] == '000') {
                digit_counter += 1;
                if (i === 2 && digit_counter === 2) {
                    result.push(digit_counting(i + 1));
                }
            } else if (arr[i] !== '') {
                digit_counter = 0;
                result.push(block_of_three(arr[i]));
                digit = digit_counting(i);
                if (digit && digit !== 'x') result.push(digit);
            }
        }

        // The currency unit is appended if provided.
        if (currency) result.push(currency);

        // The final Vietnamese text is constructed by joining the result array.
        return result.join(' ');
    };

    if (number !== null) {
        vietnameseText = toVietnamese(number.toString(), currency);
    }

    return vietnameseText;
};

export const numberToCurrency = (number: number) => {
    const currencyText = new Intl.NumberFormat('vi-VN').format(number).replace(/\D/g, ' ');
    return currencyText;
};

// Handle disable future date
export const handleDisableFutureDate = (current: Dayjs) => {
    return current && current.isAfter(today.endOf('day'));
};

// Format Year yyyy
export const formatYear = (date: number) => {
    return dayjs(date).format('YYYY');
};

export const formatTime = (time: any) => {
    if (time) {
        return dayjs(time).format(TIME_FORMAT.DATE);
    }
    return undefined;
};

// format time MMM DD, YYYY
export const formatTimeMonthDayYear = (time: any, formatType: string = TIME_FORMAT.VN_DATE) => {
    if (time) {
        return dayjs(time, formatType).format(TIME_FORMAT.US_DATE);
    }
    return null;
};

// Function to filter null properties
export const filterNullProperties = (obj: any) => {
    const filteredObj: any = {};
    for (const key in obj) {
        if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
            filteredObj[key] = obj[key];
        }
    }
    return filteredObj;
};

// Upload file employee
export const handleUploadFile = async (
    uploadFile: any,
    changeFileUpload: boolean,
    dynamicApi: (arg: { file: File }, moduleName?: string) => Promise<any>,
    moduleName?: string
) => {
    if (uploadFile.length > 0 && changeFileUpload) {
        const resUploadFile = await dynamicApi({ file: uploadFile[0] }, moduleName);
        return resUploadFile.data || '';
    } else if (uploadFile[0]?.attachment) {
        return uploadFile[0].attachment;
    }
    return '';
};

// Function append form data T
export const appendFormData = <T>(data: T) => {
    const formData = new FormData();
    for (const key in data) {
        if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key] as string | Blob);
        }
    }
    return formData;
};

export const downloadFile = (data: any, fileName: string) => {
    const href = URL.createObjectURL(data);

    // Create "a" HTML element with href to file & click
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    // Clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
};

export const handleDownloadFileFromUrl = async (url?: string, fileName?: string) => {
    if (!url || !fileName) return;

    try {
        const response = await fetch(url);
        const blob = await response.blob();

        downloadFile(blob, fileName);
    } catch (error) {
        console.error('Error downloading the file:', error);
    }
};

export const formatSizeUnits = (bytes: any) => {
    if (bytes >= 1073741824) {
        bytes = (bytes / 1073741824).toFixed(2) + ' GB';
    } else if (bytes >= 1048576) {
        bytes = (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
        bytes = (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes > 1) {
        bytes = bytes + ' bytes';
    } else if (bytes == 1) {
        bytes = bytes + ' byte';
    } else {
        bytes = '0 bytes';
    }
    return bytes;
};

export const remapUnits: any = (units: any = []) => {
    return units.map((unit: any) => ({
        label: unit.unitName,
        value: unit.unitId.toString(),
        children: unit?.children ? remapUnits(unit?.children) : undefined
    }));
};

export const formatPositionList = (data: IAdminPosition[]) => {
    if (!data) return [];
    return data.map((item: IAdminPosition) => {
        const { positionName, positionId, minGrade, maxGrade } = item;
        return {
            minGrade,
            maxGrade,
            label: positionName,
            value: positionId
        };
    });
};

export const formatMappingKey = (key: string) => {
    if (!key) return '';
    return key.toLowerCase().replace(/\s+/g, '');
};

const greenStatus = { colorText: '#00A811', colorBr: '#00A811', colorBg: '#E6F6E7' };
const redStatus = { colorText: '#EA4343', colorBr: '#EA4343', colorBg: '#FDECEC' };
const yellowStatus = { colorText: '#E66F00', colorBr: '#E66F00', colorBg: '#FDF1E6' };
const grayStatus = { colorText: '#767676', colorBr: '#767676', colorBg: '#f1f1f1' };
const blueStatus = { colorText: '#1E6D98', colorBr: '#1E6D98', colorBg: '#EAF5FB' };
const lightBlueStatus = { colorText: '#01BAD3', colorBr: '#01BAD3', colorBg: '#EEFDFF' };

export const statusMapping: { [key: string]: { colorText: string; colorBr: string; colorBg: string } } = {
    approved: greenStatus,
    rejected: redStatus,
    pending: yellowStatus,
    reviewing: yellowStatus,
    working: greenStatus,
    leave: grayStatus,
    fulltime: blueStatus,
    parttime: lightBlueStatus,
    active: greenStatus,
    inactive: grayStatus
};

export const convertToSimpleText = (str: string = '') => {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

export const randomNumber = (number: number = 10000) => {
    return Math.floor(Math.random() * number);
};

export const getRandomKey = (index: number) => randomNumber() + '-' + index;

export const renderValueTable = (value: string | number, type?: 'string' | 'number') => {
    if (typeof value === 'number' && type === 'number') {
        if (value > 0) return renderWithFallback(value, false);
        return React.createElement('span', { className: 'danger' }, renderWithFallback(value, false));
    }
    return renderWithFallback(value);
};

export const dateMappings: { [key: string]: string } = {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December'
};

//#region export file png, jpeg, svg, pdf from html
const convertBase64ToPNG = (dataChart: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = dataChart;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (ctx) {
                canvas.width = img.width;
                canvas.height = img.height;

                ctx.fillStyle = '#f7f6f6';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.drawImage(img, 0, 0);

                const pngURL = canvas.toDataURL('image/png');
                resolve(pngURL);
            } else {
                reject('Canvas context not available');
            }
        };

        img.onerror = error => {
            reject(`Error loading image: ${error}`);
        };
    });
};

const handleDownloadImagePNG_JPEG = (dataChart: string, format: 'png' | 'jpeg') => {
    if (!dataChart) return;

    convertBase64ToPNG(dataChart)
        .then(imageURL => {
            const fileName = `chart.${format}`;
            const link = document.createElement('a');
            link.href = format === 'jpeg' ? imageURL.replace('image/png', 'image/jpeg') : imageURL;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch(error => console.error(error));
};

const handleDownloadPDF = (dataChart: string) => {
    if (!dataChart) return;

    convertBase64ToPNG(dataChart)
        .then(imageURL => {
            const img = new Image();
            img.src = imageURL;

            img.onload = () => {
                const imgWidth = img.width * 0.264583;
                const imgHeight = img.height * 0.264583;
                const orientation = imgWidth > imgHeight ? 'l' : 'p';

                const pdfDoc = new jsPDF(orientation, 'mm', [imgWidth, imgHeight]);

                pdfDoc.addImage(imageURL, 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
                pdfDoc.save('chart.pdf');
            };
        })
        .catch(error => console.error(error));
};

const handleDownloadSVG = (dataChart: string) => {
    if (dataChart) {
        const link = document.createElement('a');
        link.download = 'chart.svg';
        link.href = dataChart;
        link.click();
    }
};

export const handleDownloadImage = (dataChart: string, fileType: 'png' | 'jpeg' | 'svg' | 'pdf') => {
    if (!dataChart) return;
    switch (fileType) {
        case 'png':
        case 'jpeg':
            handleDownloadImagePNG_JPEG(dataChart, fileType);
            break;
        case 'pdf':
            handleDownloadPDF(dataChart);
            break;
        case 'svg':
            handleDownloadSVG(dataChart);
            break;

        default:
            console.error('Unsupported image format');
            return;
    }
};
//#endregion

export const getWeekOptions = (startWeek: number, startYear: number, startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) => {
    const newOptions: { label: string; value: string }[] = [];
    let year = startYear;
    let week = startWeek;

    while (year <= endDate.year()) {
        const totalWeeksInYear = dayjs(year.toString(), 'YYYY').isoWeeksInYear();

        while (week <= totalWeeksInYear) {
            let weekStart = dayjs().year(year).isoWeek(week).startOf('isoWeek');
            let weekEnd = dayjs().year(year).isoWeek(week).endOf('isoWeek');

            // Handle cross-year week
            if (weekEnd.isAfter(dayjs(`${year}-12-31`))) {
                // Push week 52 as the last week of the current year
                if (week == 52) {
                    weekEnd = dayjs(`${year}-12-31`);
                } else {
                    year++;
                    week = 1;
                    weekStart = dayjs().year(year).isoWeek(week).startOf('isoWeek');
                    weekEnd = dayjs().year(year).isoWeek(week).endOf('isoWeek');
                }
            }

            if (weekStart.isAfter(endDate)) break;
            if (weekEnd.isBefore(startDate)) {
                week++;
                continue;
            }

            const displayEnd = weekEnd.isAfter(endDate) ? endDate : weekEnd;

            const label = `Week ${week} - ${displayEnd.format('YYYY')}`;
            const value = `${week}-${displayEnd.format('YYYY')}`;

            newOptions.push({ label, value });

            week++;
        }

        year++;
        week = 1;
    }

    return newOptions;
};

// summary function
export const sumTotalEmployees = (dataList: any[]) => dataList?.reduce((sum, item) => sum + item.totalEmployee, 0);

export const handleClickViewListOfNewWindow = async (url: string) => {
    const newWindow = window.open(url, '_blank', 'width=1400,height=800');

    if (newWindow) {
        newWindow.onload = () => {
            newWindow.document.body.style.marginBottom = '24px';
            newWindow.document.body.style.backgroundColor = 'white';
        };
    }
};

// Calculate difference between current and previous days
export const calculateDaysBetween = (startDate: string, endDate: string) => {
    const start = dayjs(startDate, TIME_FORMAT.VN_DATE);
    const end = dayjs(endDate, TIME_FORMAT.VN_DATE);
    const diffDays = end.diff(start, 'day');
    return diffDays;
};

export const capitalizeFirstLetterOfWord = (str: string) => {
    if (!str) return str;
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export const formatGender = (gender?: string) => {
    return gender === 'Male' ? 'Nam' : 'Nữ';
};

export const isEmpty = (value: any): boolean => {
    if (value == null) {
        return true;
    }

    if (typeof value === 'string' || Array.isArray(value)) {
        return value.length === 0;
    }

    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }

    return false;
};

export const formatNumberWithDecimalPlaces = (value: number = 0, decimalPlaces: number = 2): number => {
    if (Number.isInteger(value)) {
        return value;
    }

    return Number(value?.toFixed(decimalPlaces));
};

/**
 * Removes special characters and whitespace from a string to create a valid CSS selector.
 *
 * @param selector - The input string to be cleaned.
 * @returns The cleaned string with special characters and whitespace removed.
 */
export const escapeSelector = (selector: string) => {
    // eslint-disable-next-line no-useless-escape
    return selector?.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~\s]/g, '');
};

export const formatCurrencyVND = (value: number | string | undefined) => {
    if (!value) return;
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    const formattedValue = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(numberValue);

    // Remove the "₫" symbol at the end
    return formattedValue.replace('₫', '').trim();
};

export const getMaxGradeIndex = (data: any[], keyPrefix: string) => {
    if (data.length === 0) return 0;

    const firstItemKeys = Object.keys(data[0]).filter(key => key.startsWith(keyPrefix));

    return firstItemKeys.reduce((max, key) => {
        const index = parseInt(key.replace(keyPrefix, ''), 10);
        return index > max ? index : max;
    }, 0);
};

export const getAlwaysShowColumnNames = (columns: ITableShowedColumn[]): string[] => {
    return columns.filter(column => column.show).map(column => column.key);
};

// Function to generate dataReduxSearchParams from filterData and filterForm
export const generateReduxSearchParams = (filterData: any[], filterForm: any): Record<string, any> => {
    return filterData.reduce((params, item) => {
        const { key: itemKey } = item;
        const stringValue = convertFilterValueToString(filterForm, item);
        const itemValue = convertStringToFilterValue(stringValue, item);

        if (itemValue !== null) {
            if (typeof itemValue === 'object' && ('fromDate' in itemValue || 'toDate' in itemValue)) {
                const capitalizedKey = itemKey.charAt(0).toUpperCase() + itemKey.slice(1);
                if (itemValue.fromDate) {
                    params[`from${capitalizedKey}`] = dayjs(itemValue.fromDate).format(TIME_FORMAT.DATE);
                }
                if (itemValue.toDate) {
                    params[`to${capitalizedKey}`] = dayjs(itemValue.toDate).format(TIME_FORMAT.DATE);
                }
            } else if (dayjs.isDayjs(itemValue)) {
                params[itemKey] = itemValue.format(TIME_FORMAT.DATE);
            } else {
                params[itemKey] = itemValue;
            }
        }
        return params;
    }, {});
};

export const processFilterParams = (params: Record<string, any>) => {
    return Object.entries(params).reduce(
        (processedParams, [key, value]) => {
            if (key.startsWith('from') || key.startsWith('to')) {
                const isFromDate = key.startsWith('from');
                const baseKey = key.slice(isFromDate ? 4 : 2);
                const newKey = baseKey.charAt(0).toLowerCase() + baseKey.slice(1);

                processedParams[newKey] = {
                    ...processedParams[newKey],
                    [isFromDate ? 'fromDate' : 'toDate']: dayjs(value as string)
                };

                if (!processedParams[newKey][isFromDate ? 'toDate' : 'fromDate']) {
                    processedParams[newKey][isFromDate ? 'toDate' : 'fromDate'] = null;
                }
            } else {
                processedParams[key] = value;
            }

            return processedParams;
        },
        {} as Record<string, any>
    );
};

export const hasPermission = (permissionTree: IPermission[], permissionName: string): boolean => {
    for (const permission of permissionTree) {
        if (permission.name.startsWith(permissionName)) {
            return true;
        }
        if (permission.sections && permission.sections.length > 0) {
            for (const section of permission.sections) {
                if (section.name.startsWith(permissionName)) {
                    return true;
                }
            }
        }
        if (permission.children && permission.children.length > 0) {
            const found = hasPermission(permission.children, permissionName);
            if (found) return true;
        }
    }
    return false;
};

export const filterRoutesByPermission = (routes: IRoute[], permissionTree: IPermission[]): IRoute[] => {
    return routes.filter(route => {
        if (!route.permission) return true;
        return hasPermission(permissionTree, route.permission);
    });
};

export const filterMenuByPermissionTree = (headerMenu: HeaderMenu[], permission: IPermission[]): HeaderMenu[] => {
    return headerMenu.reduce<HeaderMenu[]>((filteredMenu, menu) => {
        const permissionNode = permission?.find(node => node.name === menu.permission);

        if (permissionNode) {
            const newMenu: HeaderMenu = { ...menu };

            if (menu.children && permissionNode.children) {
                newMenu.children = filterMenuByPermissionTree(menu.children, permissionNode.children);
            }

            if (!menu.children || (newMenu.children && newMenu.children?.length > 0)) {
                filteredMenu.push(newMenu);
            }
        }
        return filteredMenu;
    }, []);
};

// Main function to find a section by name within a tree, starting from a specific root node
export const findSectionByNameSection = (tree: any[], sectionNode: string, rootNode: string): any | null => {
    // Iterate through each node in the tree
    for (const node of tree) {
        // If the current node matches the specified root name
        if (node.name === rootNode) {
            // Search for the section within this node
            const foundSection = findSectionInTree(node, sectionNode);
            if (foundSection) {
                return foundSection;
            }
        }

        // If the node has children, recursively search in the child nodes
        if (node.children?.length > 0) {
            const foundInChildren = findSectionByNameSection(node.children, sectionNode, rootNode);
            if (foundInChildren) {
                return foundInChildren;
            }
        }
    }

    // If no matching section is found, return null
    return null;
};

// Recursive helper function to search for the section within a node
const findSectionInTree = (node: any, sectionNode: string): any | null => {
    // If the current node matches the sectionName directly (without needing to check sections)
    if (node.name === sectionNode) {
        return node;
    }

    // Check for any matching sections in the node's children
    if (node.children?.length > 0) {
        for (const child of node.children) {
            const foundInChildren = findSectionInTree(child, sectionNode);
            if (foundInChildren) {
                return foundInChildren; // Return the found section in children
            }
        }
    }

    // If no match is found in this node or its children, return null
    return null;
};

type TreeNode = { [key: string]: any };
export const findInTree = <T extends TreeNode>(tree: T[], matchCondition: (node: T) => boolean, childrenKey: keyof T = 'children'): T | null => {
    for (const node of tree) {
        if (matchCondition(node)) {
            return node;
        }

        const children = node[childrenKey] as unknown as T[] | undefined;
        if (children) {
            const foundNode = findInTree(children, matchCondition, childrenKey);
            if (foundNode) {
                return foundNode;
            }
        }
    }

    return null;
};

export const recursiveFind = (treeData: any[], value: number): any | undefined => {
    for (const item of treeData) {
        if (item.value === value) {
            return item;
        }

        if (item.subMenus?.length) {
            const found = recursiveFind(item.subMenus, value);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
};

export const encryptData = (data: string) => {
    return CryptoJS.AES.encrypt(data, secretKey).toString();
};

// Function to decrypt data
export const decryptData = (ciphertext: string) => {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export const setEncryptedItem = (key: string, value: any) => {
    const encryptedValue = encryptData(JSON.stringify(value));
    sessionStorage.setItem(key, encryptedValue);
};

export const getDecryptedItem = (key: string) => {
    const encryptedValue = sessionStorage.getItem(key);
    if (!encryptedValue) return null;

    const decryptedValue = decryptData(encryptedValue);
    return JSON.parse(decryptedValue);
};

export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, delay);
    };
}

export const handleRemoveValuesFilterHidden = (valuesForm: IFilterData, filterForm: FormInstance, controls: IFilterData[]): Partial<IFilterData> => {
    return controls.reduce((newValues, item) => {
        const { key, show, alwaysShow, childrenKey } = item;

        if (show || alwaysShow) {
            newValues[key as keyof IFilterData] = valuesForm[key as keyof IFilterData];
            childrenKey?.forEach(childKey => {
                newValues[childKey as keyof IFilterData] = valuesForm[childKey as keyof IFilterData];
            });
        } else {
            filterForm.setFieldValue(key, undefined);
            childrenKey?.forEach(childKey => filterForm.setFieldValue(childKey, undefined));
        }

        return newValues;
    }, {} as Partial<IFilterData>);
};

let previousId: number | null = null;

export const generateUniqueId = (): number => {
    let newId: number;

    do {
        newId = Math.floor(Math.random() * 9) + 1;
    } while (newId === previousId);

    previousId = newId;
    return newId;
};

export const formatTreeData: any = (tree: any) => {
    return tree.map((item: any) => ({
        ...item,
        disabled: !!item?.subMenus?.length,
        children: item?.subMenus?.length ? formatTreeData(item?.subMenus) : []
    }));
};
