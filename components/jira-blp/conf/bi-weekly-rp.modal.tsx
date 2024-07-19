import { useValidJSONArray } from "@/hooks/use-valid-json-array";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Input, Modal, ModalProps } from "antd";
import Link from "next/link";
import React, { useState } from "react";
import {
  EBiWeeklyReportMode,
  TGCalendarEvent,
  transformGoogleEvents,
} from "../utils";

const BiWeeklyElement = () => {
  const [mode, setMode] = useState<EBiWeeklyReportMode>(
    EBiWeeklyReportMode.INIT
  );
  const [jsonData, setJsonData] = useState("");
  const { error, data: jsonParsed } =
    useValidJSONArray<TGCalendarEvent>(jsonData);

  if (mode === EBiWeeklyReportMode.DATA) {
    const events = transformGoogleEvents(jsonParsed);
    return (
      <>
        <div className="text-gray-400 mb-2">
          <span
            className="text-gray-600 underline"
            onClick={() => setMode(EBiWeeklyReportMode.INIT)}
          >
            Update JSON data?
          </span>
        </div>
        <div className="text-gray-600 max-h-[600px] overflow-y-auto overflow-x-hidden px-10 py-5 rounded-md bg-gray-100">
          <ul className="!list-disc">
            {events.map((event) => (
              <React.Fragment key={event.k}>
                <li className="font-bold">{event.d.format("DD/MM/YYYY")}</li>
                <ul className="!list-disc pl-5">
                  {event.e.map((sub) => (
                    <li key={sub.title + sub.startTime.toISOString()}>
                      {sub.title} - ({sub.startTime.format("HH:mm")} -{" "}
                      {sub.endTime.format("HH:mm")})
                    </li>
                  ))}
                </ul>
              </React.Fragment>
            ))}
          </ul>
        </div>
      </>
    );
  }

  return (
    <div className="text-gray-400 relative">
      Paste your JSON data to the textbox below to get the report content
      <Input.TextArea
        autoSize={{ minRows: 10 }}
        placeholder="[{..somethings here}]"
        className="!pb-10"
        value={jsonData}
        onChange={({ target }) => setJsonData(target.value)}
      />
      <div className="absolute bottom-0 h-12 w-[calc(100%-24px)] flex items-center left-3">
        {error ? (
          <div className="flex items-center gap-1 text-red-500">
            <ExclamationCircleOutlined />
            <span>{error} activity! Check again!</span>
          </div>
        ) : null}
        <Button
          className="ml-auto"
          type="primary"
          onClick={() => setMode(EBiWeeklyReportMode.DATA)}
          disabled={!!error}
        >
          Get content
        </Button>
      </div>
    </div>
  );
};

const ModalBiWeeklyReport: React.FC<Omit<ModalProps, "title" | "children">> = (
  props
) => {
  return (
    <Modal title="Bi-weekly report" footer={null} {...props}>
      <div className="text-gray-400 mb-2">
        Follow{" "}
        <Link
          href="https://github.com/nqhd3v/crazy/docs/bi-weekly-gen-rp.md"
          target="_blank"
          className="!text-gray-500 underline"
        >
          this document
        </Link>{" "}
        to get your meetings & time.
      </div>

      <BiWeeklyElement />
    </Modal>
  );
};

export default ModalBiWeeklyReport;
