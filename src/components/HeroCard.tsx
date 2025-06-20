import Image from "next/image";
import Link from "next/link";
import React from "react";
import Button from "./Button";

const PANELS = [
  {
    title: "Lightning Fast",
    image: "/lightningBolt.svg",
    subTitle:
      "Generate professional photos in under 30 seconds. No more waiting days for photoshoots.",
  },
  {
    title: "Studio Quality",
    image: "/cameraSvg.svg",
    subTitle:
      "AI-generated images that look like they were shot in a professional studio with perfect lighting.",
  },
  {
    title: "High Resolution",
    image: "/download.svg",
    subTitle:
      "Download high-quality images perfect for e-commerce, print, and digital marketing.",
  },
];

function HeroCard() {
  return (
    <div className="flex justify-center">
      <div className="item-center">
        <div className="flex justify-center">
          <div className="my-4 rounded-2xl bg-gradient-to-r from-sky-100  to-purple-100 p-0.5 shadow-2xs max-w-72">
            <Image
              src="/star.svg"
              alt="icon"
              width={15}
              height={15}
              className="inline mx-3"
            />
            <text className="text-sm font-semibold text-sky-700 mr-2">
              AI-Powered Product Photography
            </text>
          </div>
        </div>
        <div className="flex justify-center">
          <div>
            <text className="block text-5xl font-bold my-1">
              Professional product photos
            </text>
            <text className="text-5xl text-sky-600 font-bold my-1">
              in seconds, not hours
            </text>
          </div>
        </div>
        <div className="flex justify-center my-4">
          <text className="font-light text-2xl text-gray-400">
            Transform your ordinary product images into stunning professional
            <br /> photoshoots with our AI. Perfect for e-commerce, social
            media, and
            <br />
            marketing.
          </text>
        </div>

        <div className="flex justify-center mt-4">
          <div className="mx-4 bg-gray-50 rounded-2xl px-2 py-0.5 border-2 border-gray-200">
            <Image
              src="/lightningBolt.svg"
              width={20}
              height={20}
              alt="icon"
              className="inline"
            />
            <text className="ml-2 text-sky-400">Generate in 30 seconds</text>
          </div>
          <div className="mx-4 bg-gray-50 rounded-2xl px-2 py-0.5 border-2 border-gray-200">
            <Image
              src="/download.svg"
              width={20}
              height={20}
              alt="icon"
              className="inline"
            />
            <text className="ml-2 text-sky-400">High-resolution downloads</text>
          </div>
          <div className="mx-4 bg-gray-50 rounded-2xl px-2 py-0.5 border-2 border-gray-200">
            <Image
              src="/cameraSvg.svg"
              width={20}
              height={20}
              alt="icon"
              className="inline"
            />
            <text className="ml-2 text-sky-400">Studio-quality results</text>
          </div>
        </div>

        <div className="flex justify-center mt-20">
          <text className="text-3xl font-bold">
            {" "}
            Ready to transform your product photos?
          </text>
        </div>
        <div className="flex justify-center mt-2">
          <text className="text-gray-400  font-extralight">
            Join thousands of e-commerce businesses using AI to create stunning
            <br />
            product photography that drives sales.
          </text>
        </div>
        <div className="flex justify-center mt-8">
          <Link href={"/generate"}>
            <Button text="Shoot N Sell" styles={{}} />
          </Link>
        </div>

        <div className="flex justify-center mt-20">
          <text className="text-3xl font-bold">Why Choose PhotoAI Studio?</text>
        </div>
        <div className="flex justify-center mt-2">
          <text className="text-gray-400  font-extralight">
            Professional results without the professional cost
          </text>
        </div>
        <div className="grid grid-cols-3 my-10">
          {PANELS.map((panel, index) => (
            <div
              key={index}
              className=" items-center my-8 p-4 w-100 h-40 mx-12 bg-white rounded-lg shadow-md"
            >
              <Image
                src={panel.image}
                alt={panel.title}
                width={30}
                height={30}
                className="mx-auto rounded-2xl bg-sky-100 w-10 p-1 my-1"
              />

              <text className="block text-lg font-semibold text-center my-1">
                {panel.title}
              </text>
              <text className="block text-gray-500 text-center my-1">
                {panel.subTitle}
              </text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroCard;
