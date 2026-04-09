export interface AlertListItem {
  id: number
  status: number
  note: string
  alert_type: string
  asset: Asset
  pre_use_answers_id: any
  maintenance_answers_id: number
  asset_alert_image: string
  assigned_by: AssignedBy
  created_at: string
  updated_at: string
}

export interface Asset {
  id: number
  tag: Tag
  name: string
  location: Location
  batch_code: string
  image: string
  status: number
}

export interface Tag {
  id: number
  uid: string
  tag_type: string
}

export interface Location {
  id: number
  location_name: string
}

export interface AssignedBy {
  id: number
  firstname: string
  lastname: string
  email: string
}
