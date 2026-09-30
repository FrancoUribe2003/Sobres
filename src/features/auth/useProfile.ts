import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/database.types'
import { useAuth } from './useAuth'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export function useProfile() {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .maybeSingle()

      if (error) {
        throw error
      }

      return data
    },
    enabled: Boolean(session),
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: ProfileUpdate): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .not('id', 'is', null)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(['profile'], updatedProfile)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    refetch: profileQuery.refetch,
  }
}
