import { cn } from "@/shared/lib/utils";

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

interface TimelineBlockProps {
  events: TimelineEvent[];
  detailed?: boolean;
}

export function TimelineBlock({
  events,
  detailed = false,
}: TimelineBlockProps) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="relative pl-10">
            {/* Timeline dot */}
            <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-[#81DFCF]/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#81DFCF]" />
            </div>

            <div
              className={cn("pb-4", index === events.length - 1 ? "pb-0" : "")}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-[#81DFCF]">
                  {event.year}
                </span>
                <h4 className="text-base font-medium">{event.title}</h4>
              </div>
              <p
                className={cn(
                  "mt-1 text-gray-600",
                  detailed ? "text-sm" : "text-xs"
                )}
              >
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
