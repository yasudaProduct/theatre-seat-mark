import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Film, House, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Header = () => {
  const { data: session, status } = useSession();
  return (
    <>
      <div className="bg-gray-900">
        <div className="container mx-auto flex max-w-4xl items-center px-2 py-3">
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
                  <Link legacyBehavior href="/theaters">
                    <a>映画館検索</a>
                  </Link>
                </li>
                <li className="py-1 px-4 text-white no-underline">
                  <Link legacyBehavior href="/reviews/search-reviews">
                    <a>レビュー検索</a>
                  </Link>
                </li>
                <li className="py-1 px-4 text-white no-underline">
                  <Link legacyBehavior href="/reviews/register-review">
                    <a>レビュー登録</a>
                  </Link>
                </li>
                {status !== "loading" && session && (
                  <li className="py-1 px-4 text-white no-underline">
                    <DropdownMenu
                      userImage={session.user?.image || ""}
                      aliasId={session.user?.aliasId || ""}
                      userName={session.user?.name || ""}
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
        <Avatar className="w-24 h-24">
          <AvatarImage src={userImage || undefined} alt={userName || "User"} />
          <AvatarFallback>{userName.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      </button>
      {isOpen && (
        <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
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
