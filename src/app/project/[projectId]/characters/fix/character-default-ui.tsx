import { Block } from "@/types/block";
import BasicField from "./defaultBlocks/BasicField";

function indexBlocksByFieldKey(blocks: Block[]): Record<string, Block> {
  return blocks.reduce((acc, block) => {
    if (block.fieldKey) {
      acc[block.fieldKey] = block;
    }
    return acc;
  }, {} as Record<string, Block>);
}

interface CharacterDefaultUiProps {
  defaultBlocks: Block[];
  onPropChange: (id: number, path: (string | number)[], value: any) => void;
}

export default function CharacterDefaultUi({
  defaultBlocks,
  onPropChange,
}: CharacterDefaultUiProps) {
  const blocksByKey = indexBlocksByFieldKey(defaultBlocks);

  const ageBlock = blocksByKey["age"];
  const tribeBlock = blocksByKey["tribe"];

  return (
    <div className="space-y-6 mb-12">
      {ageBlock && (
        <div className="p-4 border rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {ageBlock.title || "나이"}
          </label>
          <BasicField
            block={ageBlock}
            onPropChange={(path, value) =>
              onPropChange(ageBlock.blockId, path, value)
            }
          />
        </div>
      )}
      {tribeBlock && (
        <div className="p-4 border rounded-lg shadow-sm">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {tribeBlock.title || "종족"}
          </label>
          <BasicField
            block={tribeBlock}
            onPropChange={(path, value) =>
              onPropChange(tribeBlock.blockId, path, value)
            }
          />
        </div>
      )}
    </div>
  );
}
