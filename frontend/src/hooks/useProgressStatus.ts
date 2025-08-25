import { useCallback, useEffect, useRef, useState } from 'react'

export interface ProgressStep {
    atMs: number
    text: string
}

const defaultSteps: ProgressStep[] = [
    { atMs: 0, text: 'Thinking…' },
    { atMs: 1200, text: 'Composing answer…' },
    { atMs: 3000, text: 'Refining details…' },
    { atMs: 5500, text: 'Preparing audio…' },
    { atMs: 7500, text: 'Almost there…' }
]

interface UseProgressStatusReturn {
    text: string
    isActive: boolean
    start: (steps?: ProgressStep[]) => void
    finish: () => void
    fail: (message?: string, autoHideMs?: number) => void
    reset: () => void
}

export const useProgressStatus = (): UseProgressStatusReturn => {
    const [text, setText] = useState<string>('')
    const [isActive, setIsActive] = useState<boolean>(false)
    const timersRef = useRef<number[]>([])
    const finishedRef = useRef<boolean>(false)

    const clearTimers = useCallback(() => {
        timersRef.current.forEach(id => clearTimeout(id))
        timersRef.current = []
    }, [])

    const reset = useCallback(() => {
        clearTimers()
        finishedRef.current = false
        setIsActive(false)
        setText('')
    }, [clearTimers])

    const start = useCallback((steps?: ProgressStep[]) => {
        reset()
        const phases = (steps && steps.length > 0 ? steps : defaultSteps)
            .slice()
            .sort((a, b) => a.atMs - b.atMs)
        setIsActive(true)

        phases.forEach(({ atMs, text: phaseText }) => {
            const id = window.setTimeout(() => {
                if (!finishedRef.current) {
                    setText(phaseText)
                }
            }, Math.max(0, atMs))
            timersRef.current.push(id)
        })
    }, [reset])

    const finish = useCallback(() => {
        finishedRef.current = true
        clearTimers()

        const id = window.setTimeout(() => {
            setIsActive(false)
            setText('')
        }, 300)
        timersRef.current.push(id)
    }, [clearTimers])

    const fail = useCallback((message?: string, autoHideMs: number = 5000) => {
        finishedRef.current = false
        clearTimers()
        setIsActive(true)
        setText(message || 'Something went wrong. Please try again.')
        const id = window.setTimeout(() => {
            setIsActive(false)
            setText('')
        }, Math.max(0, autoHideMs))
        timersRef.current.push(id)
    }, [clearTimers])

    useEffect(() => {
        return () => {
            clearTimers()
        }
    }, [clearTimers])

    return { text, isActive, start, finish, fail, reset }
}

export default useProgressStatus


