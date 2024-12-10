import React from "react";

export default function Component() {
  return (
    // <div className="flex h-screen w-full items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
      <p className="text-gray-500 dark:text-gray-400">読み込み中...</p>
    </div>
    // </div>
  );
}
