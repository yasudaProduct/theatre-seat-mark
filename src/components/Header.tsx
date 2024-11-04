import React from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import DropdownMenu from "./DropdownMenu";
import { Film } from "lucide-react";

const Header = () => {
  const { data: session, status } = useSession();
  return (
    <>
      <div className="bg-gray-900">
        <div className="container mx-auto flex max-w-4xl items-center px-2 py-7">
          <div className="mx-auto flex w-full flex-wrap items-center">
            <div className="flex w-full justify-center font-extrabold text-white lg:w-1/2 lg:justify-start">
              <Link legacyBehavior href="/">
                <a className="text-2xl text-gray-900 no-underline hover:text-gray-900 hover:no-underline flex items-center">
                  <Film className="w-6 h-6 mr-2 text-gray-200" />
                  <span className=" text-gray-200">シネポジ</span>
                </a>
              </Link>
            </div>
            <div className="flex w-full content-center justify-between pt-2 lg:w-1/2 lg:justify-end lg:pt-0">
              <ul className="list-reset flex flex-1 items-center justify-center lg:flex-none">
                <li className="py-1 px-4 text-white no-underline">
                  <Link legacyBehavior href="/reviews/search-reviews">
                    <a>検索</a>
                  </Link>
                </li>
                <li className="py-1 px-4 text-white no-underline">
                  <Link legacyBehavior href="/reviews/register-review">
                    <a>登録</a>
                  </Link>
                </li>
                {status !== "loading" && session && (
                  <li className="py-1 px-4 text-white no-underline">
                    <DropdownMenu
                      userImage={session.user?.image || ""}
                      aliasId={session.user?.aliasId || ""}
                    />
                  </li>
                )}
                {status !== "loading" && !session && (
                  <li className="py-1 px-4 text-white no-underline">
                    <button onClick={() => signIn()}>
                      <a>ログイン</a>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
