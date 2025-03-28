import axios from "@/lib/axios";

export const getProjectStats = async () => {
  try {
    const response = await axios.get('/api/projects/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching project stats:", error);
    throw error;
  }
};

export const getTaskStats = async () => {
  try {
    const response = await axios.get('/api/tasks/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching task stats:", error);
    throw error;
  }
};

export const getOrderStats = async () => {
  try {
    const response = await axios.get('/api/orders/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching order stats:", error);
    throw error;
  }
};

export const getClientContactStats = async () => {
  try {
    const response = await axios.get('/api/clients/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching client contact stats:", error);
    throw error;
  }
};
