"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

import { FaRegBell } from "react-icons/fa6";
import { LuBookMinus } from "react-icons/lu";
import { LuHome } from "react-icons/lu";

function SidebarItems() {
  const searchParams = useSearchParams();
  const params = searchParams.get("page");
  const router = useRouter();

  useEffect(() => {
    const params = searchParams.get("page");

    if (!params) {
      router.push("/workspaces?page=home");
    }
  }, []);

  function handleRouting(item: any) {
    const params = new URLSearchParams(searchParams);
    params.delete("projects");
    params.set("page", item);

    const newUrl = `/workspaces?${params.toString()}`;
    router.replace(newUrl);
  }

  return (
    <div className="mt-8 border-b pb-4">
      <div
        onClick={() => handleRouting("home")}
        className={`flex items-center justify-between mt-1 hover:bg-gray-100 rounded-lg py-1.5 hover:cursor-pointer ${
          params?.toString() === "home" ? "bg-gray-100" : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2">
          <LuHome className="text-gray-500 text-lg ml-2" />
          <p className="text-[15px] text-gray-700">Home</p>
        </div>
      </div>
      <div
        onClick={() => handleRouting("activity")}
        className={`flex items-center justify-between mt-1 hover:bg-gray-100 rounded-lg py-1.5 hover:cursor-pointer ${
          params?.toString() === "activity" ? "bg-gray-100" : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2">
          <FaRegBell className="text-gray-500 text-lg ml-2" />
          <span className="absolute bg-red-500 w-4 h-4 text-[13px] rounded-full flex items-center ml-4 mb-2 justify-center text-white">3</span>
          <p className="text-[15px] text-gray-700">Activity</p>
        </div>
      </div>
      <div
        onClick={() => handleRouting("schedule")}
        className={`flex items-center justify-between mt-1 hover:bg-gray-100 rounded-lg py-1.5 hover:cursor-pointer ${
          params?.toString() === "schedule" ? "bg-gray-100" : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2">
          <LuBookMinus className="text-gray-500 text-lg ml-2" />
          <p className="text-[15px] text-gray-700">Schedule</p>
        </div>
      </div>
    </div>
  );
}

export default SidebarItems;
