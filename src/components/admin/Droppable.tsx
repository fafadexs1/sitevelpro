
"use client";

import { Droppable as OriginalDroppable, DroppableProps } from "react-beautiful-dnd";
import { useEffect, useState } from "react";

export const Droppable = ({ children, ...props }: DroppableProps) => {
    const [enabled, setEnabled] = useState(false);
    
    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
            cancelAnimationFrame(animation);
            setEnabled(false);
        };
    }, []);

    if (!enabled) {
        return null;
    }

    return <OriginalDroppable isDropDisabled={false} {...props}>{children}</OriginalDroppable>;
};
