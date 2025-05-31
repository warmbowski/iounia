import { convexAction, useConvexMutation } from '@convex-dev/react-query'
import { Avatar, AvatarGroup, type AvatarGroupProps } from '@heroui/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'

interface MemberGroupProps extends AvatarGroupProps {
  members: Doc<'members'>[] | Doc<'attendees'>[]
  roleFilter?: 'owner' | 'member' | 'guest'
  statusFilter?: 'active' | 'inactive' | 'pending'
}

export function MemberGroup({
  members,
  roleFilter,
  statusFilter,
  ...avatarGroupProps
}: MemberGroupProps) {
  const { data: allMemberUsers } = useSuspenseQuery(
    convexAction(
      api.functions.members.listAllAssociatedMembersWithUserData,
      {},
    ),
  )
  const { mutateAsync: approveMembership, isPending } = useMutation({
    mutationFn: useConvexMutation(api.functions.members.updateMembershipById),
  })

  const memberUsers = members
    .map((member) => {
      return allMemberUsers.find((user) => user.userId === member.userId)!
    })
    .filter(Boolean)

  const filteredUserMembers = memberUsers.filter((member) => {
    let allowed = true
    if (roleFilter && member.role !== roleFilter) allowed = false
    if (statusFilter && member.status !== statusFilter) allowed = false
    return allowed
  })

  const handleAddPendingMember = (member: (typeof allMemberUsers)[number]) => {
    if (member.status === 'pending') {
      approveMembership({
        memberId: member.memberId,
        campaignId: member.campaignId,
        updates: {
          status: 'active',
        },
      })
    }
  }

  return (
    <AvatarGroup
      {...avatarGroupProps}
      size="sm"
      isBordered
      color="secondary"
      radius="sm"
    >
      {filteredUserMembers.length > 0 ? (
        filteredUserMembers.map((member) => (
          <Avatar
            className={
              member.status === 'pending' ? 'hover:cursor:pointer' : ''
            }
            color={member.status === 'pending' ? 'warning' : 'secondary'}
            key={member.userId}
            src={member.imageUrl}
            name={member.fullName || ''}
            size="sm"
            onDoubleClick={() => handleAddPendingMember(member)}
            aria-label={
              member.status === 'pending'
                ? `Double click to allow ${member.fullName} to join the campaign`
                : undefined
            }
            isDisabled={member.status === 'pending' && isPending}
          />
        ))
      ) : (
        <Avatar
          showFallback
          fallback={
            <Icon className="w-6 h-6 text-default-500" icon="lucide:user-x" />
          }
          size="sm"
          aria-label="None found"
        />
      )}
    </AvatarGroup>
  )
}
