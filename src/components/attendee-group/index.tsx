import { convexAction } from '@convex-dev/react-query'
import {
  Avatar,
  AvatarGroup,
  Tooltip,
  type AvatarGroupProps,
} from '@heroui/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'

const ROLE_MESSAGE_MAP = {
  gm: 'Game Master',
  player: 'Player Character',
  observer: 'Observer',
  default: 'Attendee',
} as const

interface AttendeeGroupProps extends AvatarGroupProps {
  attendees: Doc<'attendees'>[]
  disableTooltips?: boolean
  filter?: (attendee: Doc<'attendees'>) => boolean
}

export function AttendeeGroup({
  attendees,
  disableTooltips = false,
  filter,
  ...avatarGroupProps
}: AttendeeGroupProps) {
  const { data: userMap } = useSuspenseQuery(
    convexAction(api.functions.users.getAllAssociatedUsersDataMap, {}),
  )

  const filteredAttendees = filter ? attendees.filter(filter) : attendees

  const attendeeUsers = filteredAttendees.map((attendee) => {
    return { ...userMap[attendee.userId], ...attendee }
  })

  return (
    <AvatarGroup
      {...avatarGroupProps}
      size="sm"
      isBordered
      color="secondary"
      radius="sm"
    >
      {attendeeUsers.length > 0 ? (
        attendeeUsers.map((au) => (
          <Tooltip
            key={au.userId}
            color={'secondary'}
            content={
              <div className="flex flex-col align-center justify-center">
                <span>{au.fullName}</span>
                <span className="text-xs text-muted">
                  {ROLE_MESSAGE_MAP[au.role || 'default']}
                </span>
              </div>
            }
            isDisabled={disableTooltips}
            delay={500}
            closeDelay={1000}
          >
            <Avatar
              color={'secondary'}
              src={au.imageUrl}
              name={au.fullName || ''}
              size="sm"
            />
          </Tooltip>
        ))
      ) : (
        <Tooltip
          content="No attendees"
          isDisabled={disableTooltips}
          delay={500}
          closeDelay={1000}
        >
          <Avatar
            showFallback
            fallback={
              <Icon className="w-6 h-6 text-default-500" icon="lucide:user-x" />
            }
            size="sm"
            aria-label="None found"
          />
        </Tooltip>
      )}
    </AvatarGroup>
  )
}
