import prisma from "@/lib/prisma";
import { TheaterProps } from "@/types/Theater";
import { GetStaticProps } from "next";
import Router from "next/router";
import React from "react";

type Props = {
  theaters: TheaterProps[];
};

const Theaters = (props: Props) => {
  return (
    <div className="container mx-auto">
      <div className="mt-10 w-full px-8">
        <div className="flex flex-wrap">
          {props.theaters.map((theater) => (
            <div
              key={theater.id}
              className="w-full cursor-pointer px-2 lg:w-4/12"
              onClick={() => Router.push(`/theaters/${theater.id}`)}
            >
              <div className="relative mt-4 flex flex-col border">
                <div className="flex-auto px-4 py-5">
                  <h6 className="mb-1 text-xl font-semibold">{theater.name}</h6>
                  <p className="text-blueGray-500 mb-4 truncate hover:text-clip">
                    {theater.address}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Theaters;

export const getStaticProps: GetStaticProps = async () => {
  const theaters = await prisma.theater.findMany();
  return {
    props: { theaters: theaters },
  };
};