import { Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useRouterState } from '@tanstack/react-router'

import { RouterLink } from '@/components/router-link'
import type { Doc } from 'convex/_generated/dataModel'

const getNavigationItems = (campaignId: string) => [
  {
    name: 'Overview',
    path: `/app/${campaignId}`,
    icon: 'lucide:home',
  },
  {
    name: 'Sessions',
    path: `/app/${campaignId}/sessions`,
    icon: 'lucide:folder',
  },
]

interface CampaignLayoutProps {
  children: React.ReactNode
  campaign: Doc<'campaigns'>
}

export const CampaignLayout = ({ children, campaign }: CampaignLayoutProps) => {
  const { location } = useRouterState()

  return (
    <div className="flex h-screen bg-content">
      <aside className="w-64 flex flex-col justify-between border-r border-divider">
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li key="campaigns">
              <h2>{campaign.name}</h2>
            </li>
            {campaign._id &&
              getNavigationItems(campaign._id).map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Button
                      as={RouterLink}
                      to={item.path}
                      variant="flat"
                      color={isActive ? 'primary' : 'default'}
                      className="w-full justify-start"
                    >
                      <Icon icon={item.icon} className="text-lg mr-2" />
                      {item.name}
                    </Button>
                  </li>
                )
              })}
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
