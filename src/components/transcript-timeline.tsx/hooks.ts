import { useInfiniteQuery } from '@tanstack/react-query'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { ConvexHttpClient } from 'convex/browser'
import { useCallback, useEffect, useRef } from 'react'

const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL)

interface GetTranscriptParts {
  itemsPerPage?: number
  nextCursor?: string | null
  authToken: string
  recordingId: Id<'recordings'>
}

const getTranscriptParts = async ({
  itemsPerPage = 100,
  nextCursor = null,
  authToken,
  recordingId,
}: GetTranscriptParts) => {
  console.log(
    `Fetching transcript parts for recording ${recordingId} with cursor ${nextCursor} and itemsPerPage ${itemsPerPage}`,
  )
  client.setAuth(authToken)
  const results = await client.query(
    api.functions.transcripts.listAllTranscriptParts,
    {
      recordingId,
      paginationOpts: { numItems: itemsPerPage, cursor: nextCursor },
    },
  )

  return results
}

interface InitinteTranscriptProps {
  authToken: string
  recordingId: Id<'recordings'>
  itemsPerPage?: number
}

export const useInfiniteTranscript = ({
  recordingId,
  authToken,
  itemsPerPage,
}: InitinteTranscriptProps) => {
  const result = useInfiniteQuery({
    queryKey: ['transcriptParts', recordingId],
    queryFn: ({ pageParam }) =>
      getTranscriptParts({
        recordingId,
        nextCursor: pageParam,
        itemsPerPage,
        authToken,
      }),
    getNextPageParam: (lastPage) => {
      return !lastPage.isDone ? lastPage.continueCursor : null
    },
    initialPageParam: null as string | null,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
    // refetchOnWindowFocus: false,
    // refetchOnReconnect: false,
  })

  return {
    ...result,
    data: result.data?.pages.flatMap((page) => page.page) || [],
  }
}

export const useInfiniteLoader = (fetchData: () => void, hasMore: boolean) => {
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const isIntersecting = entries[0]?.isIntersecting
      if (isIntersecting && hasMore) {
        fetchData()
      }
    },
    [fetchData, hasMore],
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '-200px 0px 0px 0px',
    })

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [handleIntersection])

  return loadMoreRef
}
