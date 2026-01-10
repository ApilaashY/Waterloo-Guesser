import { Metadata } from "next";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";

export const metadata: Metadata = {
    title: "About - UW Guesser",
    description: "Meet the team behind UW Guesser: Senthil Kirthieswar and Apilaash Yoharan.",
};

const TEAM_MEMBERS = [
    {
        name: "Apilaash Yoharan",
        role: "Co-Creator & Full Stack Developer",
        bio: "Computational Mathematics major at the University of Waterloo. I think he likes to code",
        links: {
            github: "https://github.com/ApilaashY",
            linkedin: "https://www.linkedin.com/in/apilaash-yoharan-b820b6332/",
        },
        color: "from-purple-400 to-pink-500",
    },
    {
        name: "Senthil Kirthieswar",
        role: "Co-Creator & Full Stack Developer",
        bio: "Geography and Environmental Management student at the University of Waterloo. I think he also likes to code",
        links: {
            github: "https://github.com/SenthilArun8",
            linkedin: "https://www.linkedin.com/in/senthil-kirthi/",
        },
        color: "from-green-400 to-green-700",
    },
];

const TECH_STACK = [
    "Next.js 16",
    "TypeScript",
    "Tailwind CSS",
    "Socket.io",
    "MongoDB",
    "Node.js",
    "Docker",
    "AWS EC2",
    "Cloudinary CDN",
];

export default function AboutPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 px-6">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto space-y-24">
                {/* Mission Section */}
                <section className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-block px-4 py-1.5 rounded-full border border-accent-primary/30 bg-accent-primary/10 text-accent-primary text-xs font-bold tracking-widest uppercase">
                        The Project
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight text-glow">
                        About UW Guesser
                    </h1>
                    <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
                        Born from a love for the University of Waterloo campus, UW Guesser is a
                        community-driven game designed to test your knowledge of our sprawling
                        grounds. Whether you're a first-year navigating ring road or an alumni
                        reminiscing about MC, this project is for you.
                    </p>
                </section>

                {/* Team Section */}
                <section className="space-y-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-white">
                            The Team
                        </h2>
                        <p className="text-secondary max-w-xl mx-auto">
                            Built by two students looking to leave their mark (and distractions) on campus.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {TEAM_MEMBERS.map((member, idx) => (
                            <div
                                key={member.name}
                                className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-accent-primary/30 transition-all duration-300 backdrop-blur-sm overflow-hidden"
                            >
                                {/* Hover Gradient */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                                />

                                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                                    {/* Avatar Placeholder */}
                                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${member.color} p-1 shadow-lg shadow-black/50`}>
                                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                                            {/* You can replace this with <Image /> if you have photos */}
                                            {member.name.charAt(0)}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                                        <div className={`text-sm font-medium bg-gradient-to-r ${member.color} bg-clip-text text-transparent`}>
                                            {member.role}
                                        </div>
                                    </div>

                                    <p className="text-secondary leading-relaxed">
                                        {member.bio}
                                    </p>

                                    {/* Social Links */}
                                    <div className="flex gap-6 pt-4">
                                        <a
                                            href={member.links.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-secondary hover:text-white transition-colors transform hover:scale-110 duration-200"
                                            aria-label={`${member.name}'s GitHub`}
                                        >
                                            <Github className="w-6 h-6" />
                                        </a>
                                        <a
                                            href={member.links.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-secondary hover:text-white transition-colors transform hover:scale-110 duration-200"
                                            aria-label={`${member.name}'s LinkedIn`}
                                        >
                                            <Linkedin className="w-6 h-6" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tech Stack Section */}
                <section className="space-y-12 pb-12 border-t border-white/10 pt-12">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold text-white">Built With</h2>
                    </div>
                    <div className="flex flex-wrapjustify-center gap-4 max-w-4xl mx-auto justify-center">
                        {TECH_STACK.map((tech) => (
                            <span
                                key={tech}
                                className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-secondary text-sm font-medium hover:border-accent-primary/50 hover:text-accent-primary transition-colors cursor-default"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
