import {OrganizationsOnGithub} from "@/components/OrganizationsOnGithub";
import React from "react";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between md:p-12 font-mono">
            <OrganizationsOnGithub/>
        </main>
    )
}
