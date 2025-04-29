import { useConvexMutation } from '@convex-dev/react-query'
import { Button, Input, Textarea } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import { useState, type FormEvent } from 'react'

interface CreateCampaignFormProps {
  onClose: () => void
}

export function CreateCampaignForm({ onClose }: CreateCampaignFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [gameSystem, setGameSystem] = useState('')
  const createCampaign = useMutation({
    mutationFn: useConvexMutation(api.functions.campaigns.createCampaign),
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await createCampaign.mutate({ name, description, gameSystem })
    setName('')
    setDescription('')
    setGameSystem('')
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <Input
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter campaign name"
        label="Campaign Name"
        required
      />

      <Textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter campaign description"
        label="Description"
        required
      />

      <Input
        id="gameSystem"
        value={gameSystem}
        onChange={(e) => setGameSystem(e.target.value)}
        placeholder="Enter game system"
        label="Game System"
        required
      />

      <Button type="submit" color="primary">
        Create Campaign
      </Button>
    </form>
  )
}
