// /lib/services/categories.js (or .ts)

import api from "../axios";

// // Helper function to create dummy data with consistent structure
// const createDummyCategories = (prefix, count) => {
//     return Array.from({ length: count }, (_, i) => ({
//         _id: `${prefix}_id_${i + 1}`,
//         name: `${prefix}_name_${i + 1}`,
//         label: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Label ${i + 1}`
//     }));
// };

// Category Status (cat_stat)
export const getCategoriesByType = async (type: string, page: string = '1', limit: string = '10', searchTerm: string = '') => {
    try {
        const response = await api.get(`/categories/type/${type}?page=${page}&limit=${limit}&searchTerm=${searchTerm}`);
        console.log("res categories", response);
        return response;
    } catch (error) {
        console.warn('Falling back to mock data for users');
        return {
            count: 0,
            total: 0,
            page: 1,
            limit: 10,
            data: []
        };
    }
};

export const updateCategoriesById = async (id: string, category: any) => {

    try {
        const response = await api.put(`/categories/${id}`, category);
        console.log("res categories", response);

        return response.data;
    } catch (error) {
        console.warn('Falling back to mock data for users');
        return [];
    }
};

export const AddCategory = async (type: string, category: any) => {

    try {
        const response = await api.post(`/categories?type=${type}`, category);
        return response.data;
    } catch (error) {
        console.warn('Falling back to mock data for users');
        return [];
    }
};



export async function deleteCategory(id: string): Promise<void> {
}
