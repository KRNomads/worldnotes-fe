export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface ProjectTagsContextType {
  projectTags: Tag[];
  addProjectTag: (tag: Omit<Tag, "id">) => void;
  deleteProjectTag: (id: string) => void;
  updateProjectTag: (id: string, updates: Partial<Tag>) => void;
}

export interface TagCreateRequest {
  name: string;
  color: string;
}

export interface TagUpdateRequest {
  name: string;
  color: string;
}
