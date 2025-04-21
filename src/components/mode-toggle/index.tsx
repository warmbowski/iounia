import { Button, Tooltip } from '@heroui/react'
import { Icon } from '@iconify/react'
import { useTheme } from '@/hooks/use-theme'
import { THEME_LS_KEY } from '@/constants'

export function ModeToggle() {
  const { theme, setTheme } = useTheme(undefined, THEME_LS_KEY)
  const isDark = theme === 'dark'

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <Tooltip
      content={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      placement="bottom"
    >
      <Button
        isIconOnly
        variant="light"
        onPress={handleToggle}
        className="min-w-unit-10 w-10 h-10"
      >
        <Icon
          icon={isDark ? 'lucide:sun' : 'lucide:moon'}
          className="w-5 h-5 text-primary-500"
        />
      </Button>
    </Tooltip>
  )
}
