import prisma from "@/lib/prisma";
import { ArticleProps } from "@/types/Article";
import { User } from "@/types/User";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import React from "react";
import { authOptions } from "../api/auth/[...nextauth]";
import Router from "next/router";

type Props = {
  article: ArticleProps;
  isBookmarked: boolean;
};

async function addBookmark(id: number): Promise<void> {
  await fetch(process.env.NEXT_PUBLIC_VERCEL_URL + `/api/bookmark/add/${id}`, {
    method: 'PUT',
  });
  Router.push(`/articles/${id}`);
}

async function removeBookmark(id: number): Promise<void> {
  await fetch(process.env.NEXT_PUBLIC_VERCEL_URL + `/api/bookmark/remove/${id}`, {
    method: 'PUT',
  });
  Router.push(`/articles/${id}`);
}

const Article = (props: Props) => {
  return (
    <div className="container mx-auto">
      <div className="my-12 flex justify-center p-12">
        <div className="ml-auto mr-auto w-full lg:w-8/12">
          <div className="text-lightBlue-500 bg-lightBlue-200 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-3 text-center shadow-sm"></div>
          <h3 className="text-3xl font-semibold">{props.article.title}</h3>
          <p className="text-blueGray-500 mt-4 text-lg leading-relaxed">
            {props.article.content}
          </p>
          {props.isBookmarked ? (
            <button
              onClick={() => removeBookmark(props.article.id)}
              type="button"
              className="mt-5 inline-flex items-center rounded-lg bg-red-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800"
            >
              Remove Bookmark
              <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-200 text-xs font-semibold text-red-800">
                {props.article.users.length}
              </span>
            </button>
          ) : (
            <button
              onClick={() => addBookmark(props.article.id)}
              type="button"
              className="mt-5 inline-flex items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Bookmark this article
              <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-200 text-xs font-semibold text-blue-800">
                {props.article.users.length}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Article;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
  res,
}) => {
  const session = await getServerSession( req, res, authOptions );
  if (!session) {
    res.statusCode = 403;
    return { props: { article: null } };
  }
  const data = await prisma.article.findUnique({
    where: {
      id: Number(params?.id),
    },
    include: {
      users: true,
    },
  });

  const article = JSON.parse(JSON.stringify(data));

  const isBookmarked = article.users.some(
    (user: User) => user.email === session.user?.email
  );

  return {
    props: { article, isBookmarked },
  };
};
