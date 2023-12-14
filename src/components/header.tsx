import { FC } from "react";
import { GithubIcon, VercelIcon } from "../app/icons";

export const Header: FC = () => (
    <header className="absolute top-5 hidden w-full items-center justify-between bg-gray-200 px-5 sm:sticky sm:top-0 sm:flex">
        <a
            href="/deploy"
            target="_blank"
            className="rounded-lg p-2 transition-colors duration-200 hover:bg-stone-100 sm:bottom-auto"
        >
            <VercelIcon />
        </a>

        <a
            href="/github"
            target="_blank"
            className="rounded-lg p-2 transition-colors duration-200 hover:bg-stone-100 sm:bottom-auto"
        >
            <GithubIcon />
        </a>
    </header>
);
