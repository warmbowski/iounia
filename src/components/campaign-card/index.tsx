import { getMemberListFn } from '@/integrations/clerk/auth'
import {
  Card,
  CardBody,
  CardFooter,
  Avatar,
  AvatarGroup,
  Chip,
} from '@heroui/react'
import { Icon } from '@iconify/react'
import { useQuery } from '@tanstack/react-query'
import type { Doc, Id } from 'convex/_generated/dataModel'

const formatDate = (date: string | number) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface CampaignCardProps {
  campaign: Doc<'campaigns'> & {
    members: Array<string>
  }
  onPress?: (campaignId: Id<'campaigns'>) => void
}

export function CampaignCard({ campaign, onPress }: CampaignCardProps) {
  const { data: members } = useQuery({
    queryKey: ['members', campaign._id],
    queryFn: () =>
      getMemberListFn({
        data: campaign.members,
      }),
    initialData: [],
  })

  const owner = members?.find((member) =>
    campaign.ownerId.includes(member.userId),
  )

  return (
    <Card
      className="w-full"
      onPress={onPress ? () => onPress(campaign._id) : undefined}
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
              src={owner?.imageUrl}
              name={owner?.fullName}
              size="sm"
              isBordered
              color="primary"
            />
            <span className="text-sm text-default-600">
              {owner?.fullName?.split(' ')[0] || 'Unknown'}'s Campaign
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
        <div className="flex items-center gap-3">
          <Icon icon="lucide:calendar" className="text-default-500" />
          <span className="text-sm text-default-500">
            Started {formatDate(campaign._creationTime)}
          </span>
        </div>
        <AvatarGroup max={5} size="sm" isBordered color="secondary" radius="sm">
          {members && members.length > 0
            ? members.map((member) => (
                <Avatar
                  key={member.userId}
                  src={member.imageUrl}
                  name={member.fullName}
                  size="sm"
                />
              ))
            : campaign.members.map((member) => (
                <Avatar key={member} size="sm" />
              ))}
        </AvatarGroup>
      </CardFooter>
    </Card>
  )
}
