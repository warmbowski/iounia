import { getUsersListByMembersFn } from '@/integrations/clerk/auth'
import { Avatar, AvatarGroup, type AvatarGroupProps } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import type { Doc } from 'convex/_generated/dataModel'

interface MemberGroupProps extends AvatarGroupProps {
  campaign: Doc<'campaigns'> & {
    members: Doc<'members'>[]
  }
  roleFilter?: 'owner' | 'member' | 'guest'
  statusFilter?: 'active' | 'inactive' | 'pending'
}

export function MemberGroup({
  campaign,
  roleFilter,
  statusFilter,
  ...avatarGroupProps
}: MemberGroupProps) {
  const { data: userMembers } = useQuery({
    queryKey: ['activeMembers', campaign._id],
    enabled: campaign.members.length > 0,
    queryFn: () =>
      getUsersListByMembersFn({
        data: campaign.members,
      }),
    initialData: [],
  })

  const filteredUserMembers = userMembers.filter((member) => {
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
        : campaign.members.map((member) => (
            <Avatar key={member.userId} size="sm" />
          ))}
    </AvatarGroup>
  )
}
