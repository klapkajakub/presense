export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token)
  }
}

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
  }
}

export const isAuthenticated = () => {
  return !!getToken()
}

export const getAuthHeaders = () => {
  const token = getToken()
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
} 