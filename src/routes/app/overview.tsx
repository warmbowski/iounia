import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/app/overview')({
  component: Overview,
})

export function Overview() {
  const { data } = useQuery({
    queryKey: ['people'],
    queryFn: () =>
      fetch('https://swapi.dev/api/people')
        .then((res) => res.json())
        .then((d) => d.results as Array<{ name: string }>),
    initialData: [],
  })

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Campaign Overview</h1>
      <ul>
        {data.map((d, i) => (
          <li key={i}>{d.name}</li>
        ))}
      </ul>
    </div>
  )
}
