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
    const response = await axiosInstance.get('/sanctum/csrf-cookie');
    console.log('CSRF token fetched successfully');
  } catch (error) {
    console.error('Error fetching CSRF token', error);
    throw new Error('Failed to fetch CSRF token');
  }
};

export const authLogin = async (
  credentials: { user_name: string; password: string },
  setAccessLevel: (level: string) => void,
  setAllowedPages: (pages: string[]) => void
): Promise<AuthResponse | void> => {
  try {
    // Step 1: Fetch CSRF token
    await getCsrfToken();

    // Step 2: Make login request
    const response = await axiosInstance.post('/login', credentials);
    console.log('Login response:', response.data);

    // Step 3: Validate response structure
    if (
      response.data.access_token &&
      response.data.user &&
      response.data.status === 'Login successful'
    ) {
      const { user } = response.data;

      // Step 4: Check user status
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
