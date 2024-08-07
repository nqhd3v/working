"use client";

import { useReady } from "@/hooks/use-ready";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  AdjacentListsSupport,
  Alignment,
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  Indent,
  IndentBlock,
  Italic,
  List,
  ListProperties,
  Paragraph,
  Strikethrough,
  Table,
} from "ckeditor5";

const TaskDescription: React.FC<{
  value?: string;
  onChange?: (value: string) => void;
}> = ({ value, onChange }) => {
  const isReady = useReady();

  if (!isReady) return null;

  return (
    <CKEditor
      editor={ClassicEditor}
      config={{
        toolbar: {
          items: [
            "bold",
            "italic",
            "strikethrough",
            "|",
            "heading",
            "|",
            "numberedList",
            "bulletedList",
            "|",
            "fontfamily",
            "fontsize",
            "highlight",
            "blockQuote",
            "|",
            "alignment",
            "outdent",
            "indent",
            "|",
            "insertTable",
          ],
        },
        plugins: [
          Essentials,
          Bold,
          Italic,
          Paragraph,
          Heading,
          FontSize,
          FontFamily,
          Strikethrough,
          Highlight,
          Indent,
          List,
          AdjacentListsSupport,
          ListProperties,
          IndentBlock,
          BlockQuote,
          Alignment,
          Table,
          Autoformat,
        ],
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
      }}
      data={value}
      onChange={(_, e) => {
        const data = e.getData();
        onChange?.(data);
      }}
    />
  );
};

export default TaskDescription;
