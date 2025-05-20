import { getUsersListByIdsFn } from '@/integrations/clerk/auth'
import { formatDate } from '@/utils'
import { Card, CardBody, CardFooter, Avatar, AvatarGroup } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import type { Doc, Id } from 'convex/_generated/dataModel'

interface SessionCardProps {
  session: Doc<'sessions'> & {
    attendees: Array<string>
  }
  onPress?: (sessionId: Id<'sessions'>) => void
}

export function SessionCard({ session, onPress }: SessionCardProps) {
  const { data: attendees } = useQuery({
    queryKey: ['attendees', session._id],
    queryFn: () =>
      getUsersListByIdsFn({
        data: session.attendees,
      }),
    initialData: [],
  })

  return (
    <Card
      className="min-w-[200px] max-w-[400px] bg-content2 text-content-foreground2 border-2"
      onPress={onPress ? () => onPress(session._id) : undefined}
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
        <AvatarGroup max={5} size="sm" isBordered color="secondary" radius="sm">
          {attendees && attendees.length > 0
            ? attendees.map((attendee) => (
                <Avatar
                  key={attendee.userId}
                  src={attendee.imageUrl}
                  name={attendee.fullName}
                  size="sm"
                />
              ))
            : session.attendees.map((attendee) => (
                <Avatar key={attendee} size="sm" />
              ))}
        </AvatarGroup>
      </CardFooter>
    </Card>
  )
}
