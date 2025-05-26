import { Link, useMatches } from '@tanstack/react-router'
import { Breadcrumbs, BreadcrumbItem } from '@heroui/react'

export function BreadcrumbsBar() {
  const matches = useMatches()
  const crumbs = matches
    .filter((match) => !!match.loaderData?.crumb)
    .map((match) => match.loaderData!.crumb)

  return (
    <Breadcrumbs className="bg-content px-4 py-2">
      {crumbs.map((crumb, index) => (
        <BreadcrumbItem key={crumb.title || '' + index}>
          <Link to={crumb.to} params={crumb.params}>
            {crumb.title}
          </Link>
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  )
}
