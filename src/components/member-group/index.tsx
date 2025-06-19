import type { PresenceState } from '@convex-dev/presence/react'
import { convexAction, useConvexMutation } from '@convex-dev/react-query'
import {
  Avatar,
  AvatarGroup,
  Badge,
  Tooltip,
  type AvatarGroupProps,
} from '@heroui/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'

const STATUS_COLOR_MAP = {
  pending: 'warning',
  active: 'success',
  inactive: 'default',
  banned: 'danger',
  default: 'default',
} as const

// const STATUS_MESSAGE_MAP = {
//   pending: 'Waiting for approval',
//   active: "I'm a player!",
//   inactive: 'Not playing right now',
//   banned: 'Go away!',
//   default: 'Unknown status',
// } as const

const ROLE_MESSAGE_MAP = {
  admin: 'Campaign Admin',
  session_admin: 'Session Admin',
  member: 'Campaign Member',
  default: 'Campaign Viewer',
} as const

interface MemberGroupProps extends AvatarGroupProps {
  members: Doc<'members'>[]
  presenceState?: PresenceState[]
  disableTooltips?: boolean
  filter?: (member: Doc<'members'>) => boolean
}

export function MemberGroup({
  members,
  presenceState = [],
  disableTooltips = false,
  filter,
  ...avatarGroupProps
}: MemberGroupProps) {
  const { data: userMap } = useSuspenseQuery(
    convexAction(api.functions.users.getMapOfUsersAssociatedWithUser, {}),
  )
  const { mutateAsync: updateMember, isPending } = useMutation({
    mutationFn: useConvexMutation(api.functions.members.updateMembershipById),
  })

  const filteredMembers = filter ? members.filter(filter) : members

  const memberUsers = filteredMembers.map((member) => {
    return { ...userMap[member.userId], ...member }
  })

  const handleUpdateMember = (member: (typeof memberUsers)[number]) => {
    if (member.status === 'banned') return
    updateMember({
      memberId: member._id,
      campaignId: member.campaignId,
      updates: {
        status: member.status === 'active' ? 'inactive' : 'active',
      },
    })
  }

  return (
    <AvatarGroup
      {...avatarGroupProps}
      size="sm"
      isBordered
      color="secondary"
      radius="sm"
    >
      {memberUsers.length > 0 ? (
        memberUsers.map((mu) => {
          const online = presenceState.find(
            (p) => p.userId === mu.userId,
          )?.online

          return (
            <Tooltip
              key={mu.userId}
              color={STATUS_COLOR_MAP[mu.status || 'default']}
              content={
                <div className="flex flex-col align-center justify-center">
                  <span>{mu.fullName}</span>
                  <span className="text-xs text-muted">
                    {ROLE_MESSAGE_MAP[mu.role || 'default']}
                  </span>
                </div>
              }
              isDisabled={disableTooltips}
              delay={500}
              closeDelay={1000}
            >
              <Badge
                isOneChar
                isInvisible={!online}
                placement="bottom-left"
                color="success"
                content={<Icon icon="lucide:radio" />}
              >
                <Avatar
                  className={
                    mu.status === 'pending' ? 'hover:cursor:pointer' : ''
                  }
                  color={STATUS_COLOR_MAP[mu.status || 'default']}
                  src={mu.imageUrl}
                  name={mu.fullName || ''}
                  size="sm"
                  onDoubleClick={() => {
                    handleUpdateMember(mu)
                  }}
                  aria-label={
                    mu.status === 'pending'
                      ? `Double click to allow ${mu.fullName} to join the campaign`
                      : undefined
                  }
                  isDisabled={mu.status === 'pending' || isPending}
                />
              </Badge>
            </Tooltip>
          )
        })
      ) : (
        <Tooltip
          content="No members"
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
