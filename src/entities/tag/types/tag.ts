export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface TagCreateRequest {
  name: string;
  color: string;
}

export interface TagUpdateRequest {
  name: string;
  color: string;
}
