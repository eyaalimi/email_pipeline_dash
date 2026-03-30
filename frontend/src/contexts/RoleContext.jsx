import { createContext, useContext, useState } from 'react'

const RoleContext = createContext()

export function RoleProvider({ children }) {
  const [role, setRole] = useState('admin') // 'admin' | 'client'
  return (
    <RoleContext.Provider value={{ role, setRole, isAdmin: role === 'admin' }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
