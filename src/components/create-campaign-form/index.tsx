import { useConvexMutation } from '@convex-dev/react-query'
import { Button, Chip, DatePicker, Input, Textarea } from '@heroui/react'
import {
  getLocalTimeZone,
  parseAbsoluteToLocal,
  type DateValue,
} from '@internationalized/date'
import { useMutation } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useState, type FormEvent } from 'react'

interface CreateCampaignFormProps {
  campaign?: Doc<'campaigns'>
  onClose: () => void
}

export function CreateCampaignForm({
  campaign,
  onClose,
}: CreateCampaignFormProps) {
  const [name, setName] = useState(campaign?.name || '')
  const [date, setDate] = useState<DateValue | null>(
    campaign?.startDate ? parseAbsoluteToLocal(campaign.startDate) : null,
  )
  const [description, setDescription] = useState(campaign?.description || '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(campaign?.tags || [])
  const createCampaign = useMutation({
    mutationFn: useConvexMutation(api.functions.campaigns.createCampaign),
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const isoDate = date ? date?.toDate(getLocalTimeZone()).toISOString() : ''
    await createCampaign.mutate({ name, description, tags, startDate: isoDate })
    setName('')
    setDate(null)
    setDescription('')
    setTagInput('')
    setTags([])
    onClose()
  }

  const handleTagInput = (value: string) => {
    setTagInput(value)

    // Check if the last character is a comma
    if (value.endsWith(',') || value.endsWith(' ')) {
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
        isRequired
        autoFocus
        autoComplete="off"
      />

      <DatePicker
        id="date"
        granularity="day"
        value={date}
        onChange={setDate}
        label="Start Date"
        isRequired
      />

      <div className="flex flex-col gap-2">
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => handleTagInput(e.target.value)}
          placeholder="Enter tags"
          label="Tags"
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
