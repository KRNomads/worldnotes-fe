import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import { Clock } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  coverImage: string;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md hover:border-[#81DFCF]/50 h-full">
      <div className="aspect-video overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.coverImage || "/placeholder.svg"}
          alt={project.title}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold">{project.title}</h3>
        <p className="mt-2 text-sm text-gray-600 ">{project.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 text-xs text-gray-500 ">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          마지막 수정: {project.lastUpdated}
        </div>
      </CardFooter>
    </Card>
  );
}
