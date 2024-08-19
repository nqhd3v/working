import { Button, Modal } from "antd";
import { useEffect, useState } from "react";
import { useTourGuideActions } from "./tour-guide";

const Newbie = () => {
  const [isShowGuide, setIsShowGuide] = useState(false);
  const { start } = useTourGuideActions();

  useEffect(() => {
    const isExp = localStorage.getItem("cr@zy_experienced");
    if (isExp) return;

    setIsShowGuide(true);
  }, []);

  return (
    <Modal
      title={null}
      footer={null}
      width={320}
      className="!absolute !top-auto !pb-0 !left-5 !bottom-5 !m-0"
      open={isShowGuide}
      closable={false}
      onClose={() => setIsShowGuide(false)}
    >
      <div className="text-gray-500 mb-2">
        Start a tour to know how to use this crazy app now?
      </div>
      <div className="flex items-center justify-between">
        <Button
          type="primary"
          onClick={() => {
            setIsShowGuide(false);
            start();
          }}
        >
          Start!
        </Button>
        <span
          className="text-gray-400 cursor-pointer"
          onClick={() => {
            localStorage.setItem("cr@zy_experienced", "");
            setIsShowGuide(false);
          }}
        >
          already used before?
        </span>
      </div>
    </Modal>
  );
};

export default Newbie;
