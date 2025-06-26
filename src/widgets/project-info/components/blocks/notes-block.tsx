import { Card, CardContent, CardHeader } from "@/shared/ui/card";

interface NotesBlockProps {
  title?: string;
  content: string;
  detailed?: boolean;
}

export function NotesBlock({
  title,
  content,
  detailed = false,
}: NotesBlockProps) {
  const formattedContent = content.includes("\n")
    ? content.split("\n").map((line, i) => (
        <p key={i} className="mb-1">
          {line}
        </p>
      ))
    : content;

  if (detailed) {
    return (
      <Card className="h-full">
        {title && (
          <CardHeader className="p-4 pb-0">
            <h4 className="text-lg font-semibold">{title}</h4>
          </CardHeader>
        )}
        <CardContent className="p-4">
          <div className="text-sm text-gray-600">{formattedContent}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-3 rounded-lg bg-gray-50 w-full">
      <p className="text-sm text-gray-600">{content}</p>
    </div>
  );
}
