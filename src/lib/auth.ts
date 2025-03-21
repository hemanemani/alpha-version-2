import axiosInstance from "@/lib/axios";
interface AuthResponse {
  access_token: string;
  user: { 
    status: number;
    access_level: string;
    allowed_pages?: string[];
 };
 status: string;
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
  credentials: { user_name: string; password: string },
  setAccessLevel: (level: string) => void,
  setAllowedPages: (pages: string[]) => void

): Promise<AuthResponse | void> => {
  
  try {
    await getCsrfToken(); 
    const response = await axiosInstance.post('/login', credentials);
    if (response.data.access_token && response.data.user && response.data.status === 'Login successful') {
      const { user } = response.data;
      
      if (user.status === 1) {
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setAccessLevel(user.access_level);
        setAllowedPages(user.allowed_pages || []);
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
