import { Progress, Select, SelectItem } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useNavigate, useRouterState } from '@tanstack/react-router'

import { RouterLink } from '@/components/router-link'
import { TopNav } from '@/components/topnav'
import type { Doc, Id } from 'convex/_generated/dataModel'

interface AppLayoutProps {
  children: React.ReactNode
  campaigns?: Doc<'campaigns'>[]
  selectedCampaignId?: Id<'campaigns'>
}

export const AppLayout = ({ children, campaigns = [] }: AppLayoutProps) => {
  const { isLoading } = useRouterState()
  const navigate = useNavigate()

  const handleSelectChange = (id: string) => {
    navigate({
      to: '/app/$campaignId',
      params: { campaignId: id as Id<'campaigns'> },
    })
  }

  return (
    <div>
      <div className="flex h-screen bg-content1">
        {/* Sidebar */}
        <aside className="w-64 flex flex-col justify-between border-r border-divider">
          {/* Logo */}

          {/* Navigation Links */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li key="campaigns">
                <Select
                  label="Select Campaign"
                  onChange={(e) => handleSelectChange(e.target.value)}
                  items={
                    campaigns?.map((campaign) => ({
                      label: campaign.name,
                      key: campaign._id,
                    })) || []
                  }
                  className="w-full"
                >
                  {(camp) => <SelectItem>{camp.label}</SelectItem>}
                </Select>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
