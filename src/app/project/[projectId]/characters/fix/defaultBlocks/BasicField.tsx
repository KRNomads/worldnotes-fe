import { Block, TextBlockProperties } from "@/types/block";

interface BasicFieldProps {
  block: Block;
  onPropChange: (path: (string | number)[], value: any) => void;
}

export default function BasicField({ block, onPropChange }: BasicFieldProps) {
  const textProps = block.properties as TextBlockProperties;
  return (
    <input
      type="text"
      className="w-full p-2 border rounded"
      value={textProps.value || ""}
      onChange={(e) => onPropChange(["value"], e.target.value)}
    />
  );
}
