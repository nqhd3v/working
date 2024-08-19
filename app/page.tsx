"use client";
import BlpSetupCard from "@/components/blp";
import JiraSetupCard from "@/components/jira";
import JiraToBlp from "@/components/jira-blp";
import Newbie from "@/components/newbie";
import TourGuide from "@/components/tour-guide";
import Link from "next/link";

export default function Home() {
  return (
    <TourGuide>
      <main className="p-5 bg-gray-200 w-full min-h-screen">
        <div className="grid grid-cols-2 gap-5 mb-5">
          <JiraSetupCard />
          <BlpSetupCard />
        </div>
        <JiraToBlp />
        <div className="p-5 text-center text-gray-400 text-xs">
          <div>
            Developed by{" "}
            <Link
              href="https://github.com/nqhd3v"
              target="_blank"
              className="!text-gray-600 underline"
            >
              @nqhd3v
            </Link>
          </div>
          <div>
            UI/UX is not OK? Want to improve? Create pull request{" "}
            <Link
              href="https://github.com/nqhd3v/working"
              target="_blank"
              className="text-gray-600 underline"
            >
              here
            </Link>
            !
          </div>
        </div>
      </main>
      <Newbie />
    </TourGuide>
  );
}
