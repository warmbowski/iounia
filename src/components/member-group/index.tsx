import { convexAction } from '@convex-dev/react-query'
import { Avatar, AvatarGroup, type AvatarGroupProps } from '@heroui/react'
import { useSuspenseQuery } from '@tanstack/react-query'
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

  const memberUsers = members
    .map((member) => {
      const memberId = member.userId.includes('|')
        ? member.userId.split('|')[1]
        : member.userId
      return allMemberUsers.find((user) => user.userId === memberId)!
    })
    .filter(Boolean)

  const filteredUserMembers = memberUsers.filter((member) => {
    if (roleFilter && member.role !== roleFilter) return false
    if (statusFilter && member.status !== statusFilter) return false
    return true
  })

  return (
    <AvatarGroup
      {...avatarGroupProps}
      size="sm"
      isBordered
      color="secondary"
      radius="sm"
    >
      {filteredUserMembers.length > 0
        ? filteredUserMembers.map((member) => (
            <Avatar
              key={member.userId}
              src={member.imageUrl}
              name={member.fullName || ''}
              size="sm"
            />
          ))
        : members.map((member) => <Avatar key={member.userId} size="sm" />)}
    </AvatarGroup>
  )
}
