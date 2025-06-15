import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

interface CharacterBlockProps {
  name: string;
  description: string;
  image: string;
  detailed?: boolean;
}

export function CharacterBlock({
  name,
  description,
  image,
  detailed = false,
}: CharacterBlockProps) {
  if (detailed) {
    return (
      <Card className="overflow-hidden h-full">
        <div className="aspect-square overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="object-cover w-full h-full"
          />
        </div>
        <CardHeader className="p-4 pb-0">
          <h4 className="text-lg font-semibold">{name}</h4>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors",
        "w-full md:w-auto"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image || "/placeholder.svg"}
        alt={name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div>
        <h4 className="font-medium">{name}</h4>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
}
