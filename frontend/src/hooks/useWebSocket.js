import { useEffect, useRef, useState, useCallback } from 'react'

export function useWebSocket(url) {
  const [messages, setMessages] = useState([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  const connect = useCallback(() => {
    if (wsRef.current) wsRef.current.close()
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}${url}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        setMessages(prev => [...prev, data])
      } catch {}
    }

    return ws
  }, [url])

  useEffect(() => {
    const ws = connect()
    return () => ws.close()
  }, [connect])

  const clear = useCallback(() => setMessages([]), [])

  return { messages, connected, clear }
}

export function useEventSocket() {
  return useWebSocket('/ws/events')
}
