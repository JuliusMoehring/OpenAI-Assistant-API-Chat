import { env } from "@/env.mjs";
import { useEffect, useState } from "react";

export const useMapPathToAssistantId = (path: string) => {
    const [assistantId, setAssistantId] = useState<string | null>(null);

    useEffect(() => {
        const config = env.NEXT_PUBLIC_ASSISTENT_CONFIG.find((config) => config.path === path);

        if (!config) {
            setAssistantId(null);
            return;
        }

        setAssistantId(config.assistantId);
    }, [path]);

    return assistantId;
};
