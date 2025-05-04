import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { useEffect, useState } from "react";
import {
  Card,
  CardFooter,
  Image,
  Button,
  CardBody,
  Progress,
} from "@heroui/react";
import { button as buttonStyles } from "@heroui/theme";

import PinkLogoUrl from "../images/openmoji-pig.svg";
import PinkScreenshotUrl from "../images/pink-screenshot.png";
import TheGameUrl from "../images/the_game.png";
import ToruLogoUrl from "../images/toru_digital_logo.jpg";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import { GithubIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const [viewCount, setViewCount] = useState<string | null>("Loading...");

  const fetchViewCount = () => {
    fetch("https://counter.bigfluffy.monster/id/demo01")
      .then((response) => response.json())
      .then((data) => {
        setViewCount("Views - " + data.Users);
      })
      .catch(function () {
        setViewCount(null);
      });
  };

  useEffect(() => {
    fetchViewCount();
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title({ color: "pink" })}>Asa&nbsp;</span>
          <span className={title()}>Masterson&nbsp;</span>
          <br />
          <span className={title()}>University Student</span>
          <br />
          <span className={title()}>Aspiring&nbsp;</span>
          <span className={title({ color: "pink" })}>
            Software Developer&nbsp;
          </span>
          <br />
          <div className="mt-4">
            <Snippet hideCopyButton hideSymbol variant="bordered">
              <span>Oxford, UK</span>
            </Snippet>
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title()}>About&nbsp;</span>
          <span className={title({ color: "pink" })}>Me.&nbsp;</span>
          <br />
          <div className={subtitle({ class: "mt-4" })}>
            Want to learn more... Why not check out an article?
          </div>
        </div>

        <div className="max-w-[900px] gap-2 grid grid-cols-12 grid-rows-2 px-8">
          <Card
            isFooterBlurred
            className="w-full h-[300px] col-span-12 sm:col-span-7"
          >
            <Image
              removeWrapper
              alt="Relaxing app background"
              className="z-0 w-full h-full object-cover"
              src="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/GITHUB-1.png"
            />
            <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
              <div className="flex flex-grow gap-2 items-center">
                <Image
                  alt="Github Logo"
                  src="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/github-mark-white.svg"
                  width={32}
                />
                <div className="flex flex-col">
                  <p className="text-tiny white/60">Github.com</p>
                  <p className="text-tiny text-white/60">
                    View all of my recent projects.
                  </p>
                </div>
              </div>
              <Button radius="full" size="sm">
                👉 View
              </Button>
            </CardFooter>
          </Card>
          <Card
            isFooterBlurred
            className="w-full h-[300px] col-span-12 sm:col-span-5"
          >
            <Image
              removeWrapper
              alt="Card example background"
              className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
              src="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/mobileasaturkey.jpg"
            />
            <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
              <div>
                <p className="text-black text-tiny">NN1.dev</p>
                <p className="text-black text-tiny">
                  A short interview about me & tech.
                </p>
              </div>
              <Button
                className="text-tiny"
                color="primary"
                radius="full"
                size="sm"
              >
                🧾 Read more
              </Button>
            </CardFooter>
          </Card>
          <Card
            isFooterBlurred
            className="w-full h-[300px] col-span-12 sm:col-span-5"
          >
            <Image
              removeWrapper
              alt="Card example background"
              className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
              src="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/asa-flannel-college.webp"
            />
            <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
              <div>
                <p className="text-black text-tiny">Medium.com</p>
                <p className="text-black text-tiny">
                  A post about my T-Levels experience.
                </p>
              </div>
              <Button
                className="text-tiny"
                color="primary"
                radius="full"
                size="sm"
              >
                🧾 Read more
              </Button>
            </CardFooter>
          </Card>
          <Card
            isFooterBlurred
            className="w-full h-[300px] col-span-12 sm:col-span-7"
          >
            <Image
              removeWrapper
              alt="Relaxing app background"
              className="z-0 w-full h-full object-cover"
              src={PinkScreenshotUrl}
            />
            <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
              <div className="flex flex-grow gap-2 items-center">
                <Image alt="Asa Masterson" src={PinkLogoUrl} width={32} />
                <div className="flex flex-col">
                  <p className="text-tiny white/60">Pigsare.pink</p>
                  <p className="text-tiny text-white/60">
                    My online portfolio.
                  </p>
                </div>
              </div>
              <Button radius="full" size="sm">
                👉 View
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title({ color: "pink" })}>My&nbsp;</span>
          <span className={title()}>Projects.&nbsp;</span>
          <br />
          <div className={subtitle({ class: "mt-4" })}>
            A small overview of what I have been working on.
          </div>
        </div>

        <div className="max-w-[900px] gap-2 grid grid-cols-12 grid-rows-1 px-8 text">
          <Card
            isPressable
            className="col-span-12 sm:col-span-4"
            shadow="sm"
            onPress={() =>
              window.open(
                "https://web.archive.org/web/20240405063310/https://asamasterson.com/",
                "_blank",
              )
            }
          >
            <CardBody className="overflow-visible p-0">
              <Image
                alt='A screenshot of a simple game called "The Game"'
                className="w-full object-cover h-[140px]"
                radius="lg"
                shadow="sm"
                src={TheGameUrl}
                width="100%"
              />
              <div className="text-justify px-2 py-4">
                <b>Take a trip back in time.</b>
                <p className="text-default-500">
                  Why not play the games that got us through secondary school?
                  And see the progression since!
                </p>
              </div>
            </CardBody>
            <CardFooter className="text-small text-center">
              <p className="text-default-500">Internet Archive</p>
            </CardFooter>
          </Card>
          <Card
            isPressable
            className="col-span-12 sm:col-span-4"
            shadow="sm"
            onPress={() =>
              window.open(
                "https://web.archive.org/web/20240405063310/https://asamasterson.com/",
                "_blank",
              )
            }
          >
            <CardBody className="overflow-visible p-0">
              <div className="w-full h-[140px] flex flex-col items-center justify-center bg-gray-100 rounded-lg shadow-sm">
                {viewCount && (
                  <div className="text-2xl font-bold text-primary">
                    {viewCount}
                  </div>
                )}
                <Button
                  className="mt-2"
                  color="primary"
                  size="sm"
                  onClick={fetchViewCount}
                >
                  👉 Increase Count
                </Button>
              </div>
              <div className="text-justify px-2 py-4">
                <b>PageViews Counter.</b>
                <p className="text-default-500">
                  A simple application written in fastapi/python using a Redis
                  Database to track the views of anything!
                </p>
              </div>
            </CardBody>
            <CardFooter className="text-small text-center">
              <button onClick={methodDoesNotExist}>Break the world</button>;
              <p className="text-default-500">Github</p>
            </CardFooter>
          </Card>
          <Card
            isPressable
            className="col-span-12 sm:col-span-4"
            shadow="sm"
            onPress={() =>
              window.open(
                "https://web.archive.org/web/20240405063310/https://asamasterson.com/",
                "_blank",
              )
            }
          >
            <CardBody className="overflow-visible p-0">
              <Image
                alt='A screenshot of a simple game called "The Game"'
                className="w-full object-cover h-[140px]"
                radius="lg"
                shadow="sm"
                src={ToruLogoUrl}
                width="100%"
              />
              <div className="text-justify px-2 py-4">
                <b>Toru Challenge Event.</b>
                <p className="text-default-500">
                  For this hackathon I created a fastapi backend to handle
                  reviews and ecommerce query&#39;s. This is running using
                  docker to also host the MySql Database.
                </p>
              </div>
            </CardBody>
            <CardFooter className="text-small text-center">
              <p className="text-default-500">Github</p>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title({ color: "pink" })}>My&nbsp;</span>
          <span className={title()}>Languages.&nbsp;</span>
          <br />
          <div className={subtitle({ class: "mt-4" })}>
            A quick rundown of my skills.
          </div>
        </div>
        <div className="flex flex-col gap-6 w-full max-w-md">
          <div className="flex items-center gap-4">
            <span className="w-20 text-right font-medium">Python</span>
            <Progress
              aria-label="Python skill"
              className="flex-1"
              color="warning"
              value={90}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-20 text-right font-medium">PHP</span>
            <Progress
              aria-label="PHP skill"
              className="flex-1"
              color="success"
              value={80}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-20 text-right font-medium">SQL</span>
            <Progress
              aria-label="SQL skill"
              className="flex-1"
              color="default"
              value={75}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-20 text-right font-medium">JavaScript</span>
            <Progress
              aria-label="JavaScript skill"
              className="flex-1"
              color="danger"
              value={75}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-20 text-right font-medium">React</span>
            <Progress
              aria-label="React skill"
              className="flex-1"
              color="secondary"
              value={65}
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-20 text-right font-medium">Docker</span>
            <Progress
              aria-label="Docker skill"
              className="flex-1"
              color="primary"
              value={60}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title({ color: "pink" })}>My&nbsp;</span>
          <span className={title()}>Education.&nbsp;</span>
          <br />
          <div className={subtitle({ class: "mt-4" })}>
            An overview of my education and qualifications.
          </div>
        </div>

        <div className="max-w-[900px] gap-2 grid grid-cols-12 grid-rows-1 px-8 text">
          <Card
            isPressable
            className="col-span-12 p-2"
            shadow="sm"
            onPress={() =>
              window.open(
                "https://web.archive.org/web/20240405063310/https://asamasterson.com/",
                "_blank",
              )
            }
          >
            <CardBody className="overflow-visible p-0">
              <div className="text-justify px-2 py-4">
                <b>City Of Oxford College.</b>
                <p className="text-default-500">
                  Merit, Digital Production, Design and Development
                </p>
              </div>
            </CardBody>
          </Card>
          <Card
            isPressable
            className="col-span-12 p-2"
            shadow="sm"
            onPress={() =>
              window.open(
                "https://web.archive.org/web/20240405063310/https://asamasterson.com/",
                "_blank",
              )
            }
          >
            <CardBody className="overflow-visible p-0">
              <div className="text-justify px-2 py-4">
                <b>Gosford Hill School.</b>
                <p className="text-default-500">8, GCSE Computer Science</p>
                <p className="text-default-500">6, GCSE Mathematics</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      <div className="flex gap-3">
        <Link
          isExternal
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
          href={siteConfig.links.docs}
        >
          Documentation
        </Link>
        <Link
          isExternal
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={siteConfig.links.github}
        >
          <GithubIcon size={20} />
          GitHub
        </Link>
      </div>
    </DefaultLayout>
  );
}
