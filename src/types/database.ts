export type AccessRequestStatus = 'pending' | 'approved' | 'rejected'

export interface AccessRequest {
  id: string
  email: string
  status: AccessRequestStatus
  created_at: string
}

export interface User {
  id: string
  email: string
  is_admin: boolean
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      access_requests: {
        Row: AccessRequest
        Insert: Omit<AccessRequest, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<AccessRequest>
      }
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<User>
      }
    }
  }
}
