import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, onChange, value, ...props }, ref) => {
  // 내부에서 사용할 ref. forwarded ref와 동기화합니다.
  const localRef = React.useRef<HTMLTextAreaElement>(null);

  // forwarded ref (부모 컴포넌트에서 전달된 ref)와 localRef를 연결합니다.
  React.useImperativeHandle(ref, () => localRef.current as HTMLTextAreaElement);

  // 높이 조절 함수
  const adjustHeight = React.useCallback(() => {
    if (localRef.current) {
      localRef.current.style.height = "auto";
      localRef.current.style.height = `${localRef.current.scrollHeight}px`;
    }
  }, []);

  React.useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "overflow-y-hidden",
        "resize-none",
        className
      )}
      ref={localRef}
      onChange={handleInputChange}
      value={value}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
