import axiosInstance from "@/lib/axios";
interface AuthResponse {
  access_token: string;
  user: { status: number };
}


export const getCsrfToken = async (): Promise<void> => {
  try {
    await axiosInstance.get('/sanctum/csrf-cookie');
  } catch (error) {
    console.error('Error fetching CSRF token', error);
    throw error;
  }
};

export const authLogin = async (
  credentials: { user_name: string; password: string }
): Promise<AuthResponse | void> => {
  
  try {
    await getCsrfToken(); 
    const response = await axiosInstance.post('/login', credentials);
    if (response.data.access_token && response.data.user && response.data.status === 'Login successful') {
      const userStatus = response.data.user.status;
      
      if (userStatus === 1) {
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
                
        return response.data;
      } else {
        throw new Error('User is not authorized to login');
      }
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};
