import { formatTime } from '@/utils'
import {
  Card,
  CardBody,
  CardFooter,
  Button,
  Slider,
  Spacer,
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useState, useRef, useEffect } from 'react'

interface AudioPlayerCardProps {
  title: string
  artist: string
  duration: number
  audioSrc: string
  onTimeUpdate?: (time: number) => void
}

export function AudioPlayerCard({
  title,
  artist,
  duration,
  audioSrc,
  onTimeUpdate,
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

  return (
    <Card className="w-full">
      <CardBody className="pb-2">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-md bg-primary-100 flex items-center justify-center">
            <Icon icon="lucide:music" className="text-primary-500 text-2xl" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-lg">{title}</h3>
            <p className="text-default-500">{artist}</p>
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex flex-col pt-0">
        <div className="flex items-center w-full gap-2">
          <span className="text-small text-default-500 w-15 text-right">
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
          <span className="text-small text-default-500 w-15">
            {formatTime(realDuration)}
          </span>
        </div>
        <Spacer y={2} />
        <div className="flex justify-center gap-2">
          <Button
            isIconOnly
            variant="light"
            aria-label="Skip backward"
            onPress={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.max(0, currentTime - 10)
                setCurrentTime(audioRef.current.currentTime)
              }
            }}
          >
            <Icon icon="lucide:rewind" className="text-lg" />
          </Button>
          <Button
            isIconOnly
            color="primary"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onPress={togglePlayPause}
            className="h-12 w-12"
          >
            <Icon
              icon={isPlaying ? 'lucide:pause' : 'lucide:play'}
              className="text-2xl"
            />
          </Button>
          <Button
            isIconOnly
            variant="light"
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
            <Icon icon="lucide:fast-forward" className="text-lg" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
