// src/components/shared/RequireAuth.jsx
// Guard component — redirect ke /login kalau belum login
// Usage: <RequireAuth><ProfilePage /></RequireAuth>

import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getCachedSession } from '../../features/auth/auth'

export default function RequireAuth({ children }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [checked, setChecked] = useState(false)

    useEffect(() => {
        const session = getCachedSession()
        if (!session) {
            // Simpan intended URL supaya bisa redirect balik setelah login
            navigate('/login', {
                replace: true,
                state: { from: location.pathname },
            })
        } else {
            setChecked(true)
        }
    }, [navigate, location])

    if (!checked) return null
    return children
}