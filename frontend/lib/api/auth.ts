import apiClient from "./client";

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  try {
    const { data } = await apiClient.post("/auth/register", { name, email, password });
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
}
