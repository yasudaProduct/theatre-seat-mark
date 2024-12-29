import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-500 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold mb-4">cineposi </h2>
            <p>
              &copy; {new Date().getFullYear()} Cinepoti. All rights reserved.{" "}
              {process.env.NEXT_PUBLIC_STAGE}
            </p>
          </div>
          <div>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/news"
                  className="hover:text-gray-900 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  お知らせ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-gray-900 transition-colors"
                >
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="hover:text-gray-900 transition-colors"
                >
                  利用規約
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
