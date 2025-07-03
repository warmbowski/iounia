import { Link, useMatches } from '@tanstack/react-router'
import { Breadcrumbs, BreadcrumbItem } from '@heroui/react'

export function BreadcrumbsBar() {
  const matches = useMatches()
  const crumbs = matches
    .filter((match) => !!match.loaderData?.crumb)
    .map((match) => match.loaderData!.crumb)

  if (crumbs.length === 0) {
    return null
  }

  return (
    <Breadcrumbs className=" glass3d bg-[transparent] w-fit px-2 m-2 rounded-md">
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
