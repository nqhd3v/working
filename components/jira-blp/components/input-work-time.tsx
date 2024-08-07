import { convertJiraTimeToHours } from "@/utils/mapping-data";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Input, InputProps, Tooltip } from "antd";
import { round } from "lodash";
import { useMemo } from "react";
import { twMerge } from "tailwind-merge";

const InputWorkTime: React.FC<InputProps> = (props) => {
  const hours = useMemo(
    () => convertJiraTimeToHours(props.value as string),
    [props.value]
  );

  return (
    <Input
      {...props}
      className={twMerge("w-full", props.className)}
      suffix={
        hours === null ? (
          <Tooltip
            color="white"
            title={
              <div className="text-gray-500">
                <div>
                  <span className="font-bold">w</span> - weeks
                </div>
                <div>
                  <span className="font-bold">d</span> - days
                </div>
                <div>
                  <span className="font-bold">h</span> - hours
                </div>
                <div>
                  <span className="font-bold">m</span> - minutes
                </div>

                <div>
                  <span className="font-bold">Example:</span>{" "}
                  <code>1h 30m</code>
                </div>
              </div>
            }
          >
            <ExclamationCircleOutlined className="!text-red-400" />
          </Tooltip>
        ) : (
          <span className="text-gray-400">{round(hours, 2)}h</span>
        )
      }
    />
  );
};

export default InputWorkTime;
