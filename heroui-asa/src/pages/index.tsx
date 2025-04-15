import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import {Card, CardFooter, Image, Button, CardHeader} from "@heroui/react";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import {GithubIcon} from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title({ color: "pink" })}>Asa&nbsp;</span>
          <span className={title()}>Masterson&nbsp;</span>
          <br />
          <span className={title()}>
            University Student
          </span>
          <br />
          <span className={title()}>Aspiring&nbsp;</span>
          <span className={title({ color: "pink" })}>Software Developer&nbsp;</span>
          <br />
          <div className="mt-4">
            <Snippet hideCopyButton hideSymbol variant="bordered">
            <span>
              Oxford, UK
            </span>
            </Snippet>
          </div>
          <div className={subtitle({ class: "mt-4" })}>
            Beautiful, fast and modern React UI library.
          </div>
        </div>

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
          <Card isFooterBlurred className="w-full h-[300px] col-span-12 sm:col-span-7">
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
                  <p className="text-tiny text-white/60">View all of my recent projects.</p>
                </div>
              </div>
              <Button radius="full" size="sm">
                👉 View
              </Button>
            </CardFooter>
          </Card>
          <Card isFooterBlurred className="w-full h-[300px] col-span-12 sm:col-span-5">
            <Image
                removeWrapper
                alt="Card example background"
                className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
                src="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/mobileasaturkey.jpg"
            />
            <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
              <div>
                <p className="text-black text-tiny">NN1.dev</p>
                <p className="text-black text-tiny">A short interview about me & tech.</p>
              </div>
              <Button className="text-tiny" color="primary" radius="full" size="sm">
                🧾 Read more
              </Button>
            </CardFooter>
          </Card>
          <Card isFooterBlurred className="w-full h-[300px] col-span-12 sm:col-span-5">
            <Image
                removeWrapper
                alt="Card example background"
                className="z-0 w-full h-full scale-125 -translate-y-6 object-cover"
                src="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/asa-flannel-college.webp"
            />
            <CardFooter className="absolute bg-white/30 bottom-0 border-t-1 border-zinc-100/50 z-10 justify-between">
              <div>
                <p className="text-black text-tiny">Medium.com</p>
                <p className="text-black text-tiny">A post about my T-Levels experience.</p>
              </div>
              <Button className="text-tiny" color="primary" radius="full" size="sm">
                🧾 Read more
              </Button>
            </CardFooter>
          </Card>
          <Card isFooterBlurred className="w-full h-[300px] col-span-12 sm:col-span-7">
            <Image
                removeWrapper
                alt="Relaxing app background"
                className="z-0 w-full h-full object-cover"
                src="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/pink-screenshot.png"
            />
            <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
              <div className="flex flex-grow gap-2 items-center">
                <Image
                    alt="Asa Masterson"
                    src="https://minio-s3.bigfluffy.monster/pigsare-pink/assets/openmoji-pig.svg"
                    width={32}
                />
                <div className="flex flex-col">
                  <p className="text-tiny white/60">Pigsare.pink</p>
                  <p className="text-tiny text-white/60">My online portfolio.</p>
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
      </section>
    </DefaultLayout>
  );
}
