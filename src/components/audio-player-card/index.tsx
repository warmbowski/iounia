import { formatTime } from '@/utils'
import { Card, CardBody, Button, Slider } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useState, useRef, useEffect } from 'react'

interface AudioPlayerCardProps {
  title: string
  date?: string
  duration: number
  audioSrc: string
  onTimeUpdate?: (time: number) => void
  seekTo?: number | null
  onSeeked?: () => void
}

export function AudioPlayerCard({
  title,
  date,
  duration,
  audioSrc,
  onTimeUpdate,
  seekTo,
  onSeeked,
}: AudioPlayerCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [realDuration, setRealDuration] = useState(duration)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<number | null>(null)

  const startTimer = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = window.setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime)
      }
    }, 1000)
  }

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    } else {
      audioRef.current.play()
      startTimer()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSliderChange = (value: number | number[]) => {
    if (!audioRef.current) return

    let newTime = 0
    if (typeof value === 'number') {
      newTime = value
    } else if (Array.isArray(value)) {
      newTime = value[0]
    }

    setCurrentTime(newTime)
    audioRef.current.currentTime = newTime
  }

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(audioSrc)

    // Set up event listeners
    const audio = audioRef.current
    audio.preload = 'metadata'

    const handleMetadata = (e: Event) => {
      const target = e.target as HTMLAudioElement
      const duration = target.duration
      setRealDuration(duration)
    }
    audio.addEventListener('loadedmetadata', handleMetadata)

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    audio.addEventListener('ended', handleEnded)

    // Clean up
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('loadedmetadata', handleMetadata)
        audioRef.current.removeEventListener('ended', handleEnded)
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [audioSrc])

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(currentTime)
    }
  }, [currentTime, onTimeUpdate])

  useEffect(() => {
    if (seekTo != null && audioRef.current) {
      audioRef.current.currentTime = seekTo
      setCurrentTime(seekTo)
      if (onSeeked) onSeeked()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seekTo])

  return (
    <Card className="w-full shadow-lg">
      <CardBody className="py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              aria-label="Skip backward"
              onPress={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.max(0, currentTime - 10)
                  setCurrentTime(audioRef.current.currentTime)
                }
              }}
            >
              <Icon icon="lucide:rewind" className="text-base" />
            </Button>
            <Button
              isIconOnly
              color="primary"
              size="sm"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onPress={togglePlayPause}
            >
              <Icon
                icon={isPlaying ? 'lucide:pause' : 'lucide:play'}
                className="text-lg"
              />
            </Button>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              aria-label="Skip forward"
              onPress={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = Math.min(
                    duration,
                    currentTime + 10,
                  )
                  setCurrentTime(audioRef.current.currentTime)
                }
              }}
            >
              <Icon icon="lucide:fast-forward" className="text-base" />
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h4>{title}</h4>
              <p className="text-secondary-500">{date}</p>
            </div>
            <div className="flex items-center w-full gap-2 mt-2">
              <span className="text-tiny text-primary-500 w-18 text-right">
                {formatTime(currentTime)}
              </span>
              <Slider
                aria-label="Audio progress"
                size="sm"
                color="primary"
                step={1}
                maxValue={realDuration}
                minValue={0}
                value={[currentTime]}
                className="flex-1"
                onChange={handleSliderChange}
              />
              <span className="text-tiny text-primary-500 w-18 text-left">
                {formatTime(realDuration)}
              </span>
            </div>
          </div>

          <div className="h-12 w-12 rounded-md bg-primary-100 flex items-center justify-center">
            <Icon icon="lucide:book" className="text-primary-500 text-xl" />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
