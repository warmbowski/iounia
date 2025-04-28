/**
 * customized version of HeroUI Link component that implement tanstack router Link component props
 * link for info: https://github.com/TanStack/router/discussions/3154
 */
import { Link } from '@heroui/react'
import { createLink } from '@tanstack/react-router'
import { forwardRef } from 'react'
import type { PropsWithoutRef } from 'react'
import type { LinkComponent } from '@tanstack/react-router'
import type { LinkProps } from '@heroui/react'

type HeroUILinkProps = Omit<PropsWithoutRef<LinkProps>, 'href'>

const HeroUILinkComponent = forwardRef<HTMLAnchorElement, HeroUILinkProps>(
  ({ onClick, ...props }, ref) => {
    return <Link ref={ref} {...props} />
  },
)

const RouterLinkComponent = createLink(HeroUILinkComponent)
export type RouterLinkProps = LinkComponent<typeof HeroUILinkComponent>

export const RouterLink: RouterLinkProps = (props) => {
  return <RouterLinkComponent {...props} />
}
