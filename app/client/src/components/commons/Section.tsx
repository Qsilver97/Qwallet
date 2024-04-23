import React, { ReactNode } from "react";

type SectionProps = {
    children: ReactNode;
};

const Section: React.FC<SectionProps> = ({ children }) => {
    return (
        <section className="min-h-44 bg-dark rounded-xl p-5 space-y-3">
            {children}
        </section>
    );
};

export default Section;
