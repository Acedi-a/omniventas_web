import { useEffect } from 'react'

type ToastProps = {
  message: string
  tone?: 'success' | 'error'
  onClose: () => void
}

const Toast = ({ message, tone = 'success', onClose }: ToastProps) => {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 2400)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return <div className={`toast ${tone}`}>{message}</div>
}

export default Toast
