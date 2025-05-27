import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, Github, ExternalLink, Mail, Linkedin, Twitter } from "lucide-react";

// Mock data for projects - replace with data from Firestore later
const mockProjects = [
  {
    id: "1",
    title: "E-commerce Platform",
    description: "A full-featured e-commerce platform with Next.js, Stripe, and Firebase.",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "online shopping",
    projectUrl: "#",
    repoUrl: "#",
    technologies: ["Next.js", "Stripe", "Firebase", "Tailwind CSS"],
  },
  {
    id: "2",
    title: "Task Management App",
    description: "A collaborative task management tool built with React and Node.js.",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "productivity tool",
    projectUrl: "#",
    repoUrl: "#",
    technologies: ["React", "Node.js", "Express", "MongoDB"],
  },
  {
    id: "3",
    title: "Personal Blog CMS",
    description: "This very Prolific app! A blog and portfolio CMS built with Next.js.",
    imageUrl: "https://placehold.co/600x400.png",
    dataAiHint: "content management",
    projectUrl: "/",
    repoUrl: "#",
    technologies: ["Next.js", "Firebase", "Tailwind CSS", "Genkit"],
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-muted/50 rounded-lg shadow-sm">
        <div className="container mx-auto px-4 text-center">
          <Image
            src="https://placehold.co/150x150.png"
            alt="Your Name"
            width={150}
            height={150}
            className="rounded-full mx-auto mb-6 shadow-lg"
            data-ai-hint="profile picture"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            John Doe {/* Replace with actual name */}
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
            Full-stack developer passionate about creating modern, responsive web applications. Specialized in Next.js, React, and cloud technologies. Let's build something amazing together!
          </p>
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="#projects">
                <Briefcase className="mr-2 h-5 w-5" />
                View Projects
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/blog">
                Read My Blog
              </Link>
            </Button>
          </div>
           <div className="mt-8 flex justify-center space-x-4">
            <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile">
              <Button variant="ghost" size="icon">
                <Github className="h-6 w-6 text-foreground/70 hover:text-primary" />
              </Button>
            </Link>
            <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile">
              <Button variant="ghost" size="icon">
                <Linkedin className="h-6 w-6 text-foreground/70 hover:text-primary" />
              </Button>
            </Link>
             <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter Profile">
              <Button variant="ghost" size="icon">
                <Twitter className="h-6 w-6 text-foreground/70 hover:text-primary" />
              </Button>
            </Link>
            <Link href="mailto:your.email@example.com" aria-label="Email">
              <Button variant="ghost" size="icon">
                <Mail className="h-6 w-6 text-foreground/70 hover:text-primary" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-primary">
          Featured Projects
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockProjects.map((project) => (
            <Card key={project.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-56 w-full">
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  className="rounded-t-lg"
                  data-ai-hint={project.dataAiHint}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{project.title}</CardTitle>
                <CardDescription className="text-sm h-16 overflow-hidden text-ellipsis"> {/* Fixed height for description */}
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-1">Technologies:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0 border-t mt-auto"> {/* Footer pushed to bottom */}
                <div className="flex justify-start space-x-3 mt-4">
                  {project.projectUrl && (
                    <Button asChild variant="outline" size="sm">
                      <Link href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                      </Link>
                    </Button>
                  )}
                  {project.repoUrl && (
                    <Button asChild variant="ghost" size="sm">
                      <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" /> View Code
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
