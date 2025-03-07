import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { House, LogIn, LogOut, Wrench } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "next/navigation";

const Header = () => {
  const { data: session, status } = useSession();
  return (
    <>
      <div className="bg-[#524FFF] max-h-20">
        <div className="container mx-auto flex items-center px-2 py-3">
          <div className="mx-auto flex w-full flex-wrap items-center">
            <div className="flex w-full justify-center font-extrabold text-white lg:w-1/2 lg:justify-start">
              <Link legacyBehavior href="/">
                <a className="text-2xl text-gray-900 no-underline hover:text-gray-900 hover:no-underline flex items-center">
                  <img
                    src="/images/icon-sineposi.svg"
                    alt="シネポジ"
                    className="h-8 mr-2"
                  />
                  <span className="text-gray-200 text-sm">ver.beta</span>
                </a>
              </Link>
            </div>
            <div className="flex w-full content-center justify-between pt-2 lg:w-1/2 lg:justify-end lg:pt-0">
              <ul className="list-reset flex flex-1 items-center justify-center lg:flex-none">
                <li className="py-1 px-4 text-white no-underline">
                  <Link legacyBehavior href="/theaters">
                    <a>映画館検索</a>
                  </Link>
                </li>
                {status !== "loading" && session && (
                  <li className="py-1 px-4 text-white no-underline z-50">
                    <DropdownMenu
                      userImage={session.user?.image || ""}
                      aliasId={session.user?.aliasId || ""}
                      userName={session.user?.name || ""}
                    />
                  </li>
                )}
                {status !== "loading" && !session && (
                  <li className="py-1 px-4 text-black no-underline">
                    <button
                      className="flex items-center bg-white rounded-md p-2 hover:bg-gray-100"
                      onClick={() => signIn()}
                    >
                      <LogIn className="w-6 h-6 mr-2" />
                      ログイン
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

interface DropdownMenuProps {
  userImage: string;
  aliasId: string;
  userName: string;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  userImage,
  aliasId,
  userName,
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      setIsOpen(false);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleMenuItemClick = () => {
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className="focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Avatar className="">
          <AvatarImage
            src={userImage || undefined}
            alt={userName || "User"}
            className="bg-white"
          />
          <AvatarFallback>{userName.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      </button>
      {isOpen && (
        <div className="absolute left-1/2 transform -translate-x-[90%] mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <Link legacyBehavior href={"/" + aliasId}>
              <a
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                role="menuitem"
                onClick={handleMenuItemClick}
              >
                <House className="w-6 h-6 mr-2" />
                マイページ確認
              </a>
            </Link>
            <Link legacyBehavior href={"/settings"}>
              <a
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                role="menuitem"
                onClick={handleMenuItemClick}
              >
                <Wrench className="w-6 h-6 mr-2" />
                設定
              </a>
            </Link>
            {session?.user?.role === "admin" && (
              <Link legacyBehavior href={"/maintenances"}>
                <a
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center"
                  role="menuitem"
                  onClick={() => {
                    router.push("/maintenances");
                  }}
                >
                  <Wrench className="w-6 h-6 mr-2" />
                  メンテナンス
                </a>
              </Link>
            )}
            <button
              onClick={() => {
                signOut();
                handleMenuItemClick();
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              <span className=" flex items-center">
                <LogOut className="w-6 h-6 mr-2" />
                ログアウト
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
