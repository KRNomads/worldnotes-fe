import { Input } from "@/components/ui/input";
import { Block, TextBlockProperties } from "@/types/block";

interface BasicFieldProps {
  block: Block;
  onPropChange: (path: (string | number)[], value: any) => void;
}

export default function BasicField({ block, onPropChange }: BasicFieldProps) {
  const textProps = block.properties as TextBlockProperties;
  return (
    <Input
      type="text"
      className="w-full border-none focus-visible:ring-0 "
      value={textProps.value || ""}
      onChange={(e) => onPropChange(["value"], e.target.value)}
      placeholder="입력해주세요"
    />
  );
}
