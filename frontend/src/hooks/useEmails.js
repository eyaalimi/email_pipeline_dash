import { useState, useEffect, useCallback } from 'react'
import { getEmails } from '../services/api'

export function useEmails(initialParams = {}) {
  const [data, setData] = useState({ items: [], total: 0, page: 1, per_page: 15 })
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState({ page: 1, per_page: 15, ...initialParams })

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''))
      const result = await getEmails(cleanParams)
      setData(result)
    } catch (e) {
      console.error('Failed to fetch emails', e)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => { fetch() }, [fetch])

  return { ...data, loading, params, setParams, refetch: fetch }
}
