// src/widgets/character-block-editor.tsx

import BlockEditor from "@/features/block-editor/ui/block-editor";
import CharacterDefaultUi from "@/features/character/ui/character-default-ui";

export default function CharacterBlockEditor({ noteId }: { noteId: string }) {
  return (
    <BlockEditor
      noteId={noteId}
      placeholder="캐릭터 이름"
      renderDefaultBlocks={(defaultBlocks, onPropChange) => (
        <CharacterDefaultUi
          defaultBlocks={defaultBlocks}
          onPropChange={onPropChange}
        />
      )}
    />
  );
}
