import { ChatGPT } from "@/app/icons";
import { FC, useEffect, useState } from "react";

const messages = [
    "Warming up the circuits! Prepare for a touch of light-heartedness.",
    "Loading... Just like waiting for your friend's text, this might take a moment.",
    "Reticulating splines and brewing a hint of humor. Almost there!",
    "Grab your metaphorical popcorn! The AI light comedy show is about to begin. Loading...",
    "Hold onto your composure, we're about to share a subtle smile in 3... 2... 1...",
    "Caffeinating the processors... Because even machines need a gentle wake-up!",
    "Spinning up a touch of amusement. Warning: May induce mild grins.",
    "Assembling light-hearted modules. Stand by for a virtual pleasant moment.",
    "Just a moment, recalibrating for a touch of humor. Prepare for a light chuckle!",
    "Loading charm.exe... If a warm feeling persists for more than 4 hours, consider it a success.",
    "Initiating a gentle laughter sequence. Please keep a positive mindset inside the dialogue.",
    "Hold tight! We're booting up faster than a morning routine on a good day.",
    "Adjusting pleasantness levels... Warning: Dad jokes at a friendly level.",
    "Preparing to bring a subtle smile to your face. It's nearly time!",
    "Brace yourself for a pleasantly amusing experience. System update: Friendly banter installed successfully.",
];

const getRandomMessage = () => {
    return messages[Math.floor(Math.random() * messages.length)];
};

export const InitializeChat: FC = () => {
    const [message, setMessage] = useState(getRandomMessage());

    useEffect(() => {
        const interval = setInterval(() => {
            setMessage(getRandomMessage());
        }, 5_000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-[35vh] flex w-full flex-col items-center gap-4 px-4">
            <ChatGPT className="h-20 w-20 text-primary" />
            <p className="prose text-center">{message}</p>
        </div>
    );
};
