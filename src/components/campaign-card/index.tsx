import { formatDate } from '@/utils'
import { Card, CardBody, CardFooter, Avatar, Chip } from '@heroui/react'
import { Icon } from '@iconify/react'
import type { Id } from 'convex/_generated/dataModel'
import { MemberGroup } from '../member-group'
import { api } from 'convex/_generated/api'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexAction } from '@convex-dev/react-query'

interface CampaignCardProps {
  campaign: typeof api.functions.campaigns.readCampaignWithMembers._returnType
  onPress?: (campaignId: Id<'campaigns'>) => void
  onHover?: (campaignId: Id<'campaigns'>) => void
}

export function CampaignCard({
  campaign,
  onPress,
  onHover,
}: CampaignCardProps) {
  const { data: userMap } = useSuspenseQuery(
    convexAction(api.functions.users.getMapOfUsersAssociatedWithUser, {}),
  )
  const ownerUser = userMap[campaign.ownerId]

  return (
    <Card
      className="min-w-[200px] max-w-[400px] bg-content4 text-content-foreground2 border-2"
      onPress={onPress ? () => onPress(campaign._id) : undefined}
      onMouseEnter={onHover ? () => onHover(campaign._id) : undefined}
      isPressable={!!onPress}
    >
      <CardBody className="p-0">
        <div className="relative h-48 w-full">
          <img
            src="/campaign-placeholder-image.jpg"
            alt={campaign.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar
              src={ownerUser?.imageUrl}
              name={ownerUser?.fullName || ''}
              size="sm"
              isBordered
              color="primary"
            />
            <span className="text-sm text-default-700">
              {ownerUser?.fullName?.split(' ')[0] || 'Unknown'}'s Campaign
            </span>
          </div>
          <h3 className="text-xl font-semibold mb-2">{campaign.name}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {campaign.tags?.map((tag) => (
              <Chip key={tag} size="sm" variant="solid" color="primary">
                {tag}
              </Chip>
            ))}
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-3 text-primary-700">
          <Icon icon="lucide:calendar" />
          <span className="text-sm" suppressHydrationWarning>
            Started {formatDate(campaign._creationTime)}
          </span>
        </div>
        <MemberGroup
          members={campaign.members}
          filter={(member) => member.status === 'active'}
          max={3}
          disableTooltips
        />
      </CardFooter>
    </Card>
  )
}
