interface Project {
  id: string;
  title: string;
  description: string;
  coverImage: string;
}

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="mb-6">
      <div className="relative h-40 md:h-60 rounded-lg overflow-hidden mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.coverImage || "/placeholder.svg"}
          alt={project.title}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h1 className="text-2xl md:text-3xl font-bold">{project.title}</h1>
          <p className="mt-1 text-sm md:text-base text-gray-200">
            {project.description}
          </p>
        </div>
      </div>
    </div>
  );
}
