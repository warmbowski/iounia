import { formatDate } from '@/utils'
import { Card, CardBody, CardFooter } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import type { Doc, Id } from 'convex/_generated/dataModel'
import { AttendeeGroup } from '../attendee-group'

interface SessionCardProps {
  session: Doc<'sessions'> & {
    attendees: Array<string>
  }
  onPress?: (sessionId: Id<'sessions'>) => void
  onHover?: (sessionId: Id<'sessions'>) => void
}

export function SessionCard({ session, onPress, onHover }: SessionCardProps) {
  const { data: attendees } = useQuery({
    queryKey: ['attendeeUsers', session._id],
    queryFn: () => [],
    initialData: [],
  })

  return (
    <Card
      className="min-w-[200px] max-w-[400px] bg-content2 text-content-foreground2 border-2"
      onPress={onPress ? () => onPress(session._id) : undefined}
      onMouseOver={onHover ? () => onHover(session._id) : undefined}
      isPressable={!!onPress}
    >
      <CardBody className="p-0">
        <div className="relative h-48 w-full">
          <img
            src="/campaign-placeholder-image.jpg"
            alt={session.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">
            Session - {session.name}
          </h3>
        </div>
      </CardBody>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-3 text-primary-700">
          <Icon icon="lucide:calendar" />
          <span className="text-sm ">{formatDate(session.date)}</span>
        </div>
        <AttendeeGroup attendees={attendees} max={3} disableTooltips />
      </CardFooter>
    </Card>
  )
}
