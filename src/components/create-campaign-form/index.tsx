import { useConvexMutation } from '@convex-dev/react-query'
import { Button, Chip, Input, Textarea } from '@heroui/react'
import { useMutation } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import { useState, type FormEvent } from 'react'

interface CreateCampaignFormProps {
  onClose: () => void
}

export function CreateCampaignForm({ onClose }: CreateCampaignFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const createCampaign = useMutation({
    mutationFn: useConvexMutation(api.functions.campaigns.createCampaign),
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await createCampaign.mutate({ name, description, tags })
    setName('')
    setDescription('')
    setTagInput('')
    setTags([])
    onClose()
  }

  const handleTagInput = (value: string) => {
    setTagInput(value)

    // Check if the last character is a comma
    if (value.endsWith(',')) {
      const newTag = value.slice(0, -1).trim()
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
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

      <div className="flex flex-col gap-2">
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => handleTagInput(e.target.value)}
          placeholder="Enter tags"
          label="Tags"
          required
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Chip
                key={tag}
                onClose={() => handleRemoveTag(tag)}
                variant="flat"
                size="sm"
              >
                {tag}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <Textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter campaign description"
        label="Description"
        required
      />

      <Button type="submit" color="primary">
        Create Campaign
      </Button>
    </form>
  )
}
