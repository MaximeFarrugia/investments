import axios from 'axios'

interface LoginPayload {
  email: string
  password: string
}

export const login = (payload: LoginPayload) => {
  return axios.post<void>('/api/user/login', payload)
}

export interface User {
  id: string
  email: string
  password: string
  last_password_update: string
  created_at: string
  updated_at: string
}

export interface UserDetailsResponse {
  user: User
}

export const userDetails = () => {
  return axios.get<UserDetailsResponse>('/api/user')
}
