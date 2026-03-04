import { Github, ExternalLink } from "lucide-react";
import SectionBlock from "./SectionBlock";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { playHover, playClick } from "@/hooks/useSoundEffects";

const projects = [
  {
    title: "cashlio",
    isNew: true,
    description:
      "Cashlio is an lonic + Angular personal finance app for tracking credits/debits across profiles, viewing dashboard summaries, and exporting history reports.",
    tags: [
      "Angular",
      "TypeScript",
      "Ionic",
      "SQLite",
      "Capacitor",
      "jsPDF",
    ],
    githubUrl:
      "https://github.com/ML-CoderX/Cashlio"
  },
  {
    title: "DocuAI",
    description:
      "DocuAI is an intelligent clinical support system designed to assist doctors in diagnosis and decision-making. The tool predicts the top 3 likely diseases based on user-input symptoms and patient data, displaying the results with probability percentages.",
    tags: [
      "Python",
      "Scikit-learn",
      "Gemini API",
      "Streamlit",
      "Pandas",
      "HTML/CSS",
    ],
    githubUrl: "https://github.com/subhankalgond/hackprix20",
    liveUrl: "",
  },
  {
    title: "IPL Win Prediction",
    description:
      "Designed a machine learning model to predict the outcome of IPL matches based on the first innings performance. Users can input stats like total runs, wickets fallen, run rate, and overs played, and the model estimates the likelihood of the batting or bowling team winning the match.",
    tags: ["Python", "Scikit-learn", "Pandas", "Streamlit" ],
    githubUrl:
      "https://github.com/ML-CoderX/IPL_win_predictor",
    liveUrl: "https://ipl-win-predictor-2tp0.onrender.com",
  },
  {
    title: "Laptop Price Prediction",
    description:
      "Created a machine learning model to predict laptop prices based on key features like brand, processor, RAM, storage, screen size, and graphics card. The project involved collecting and cleaning real-world data, selecting the best features, and training models like Linear Regression and Random Forest to find patterns in laptop pricing.",
    tags: ["Python", "Scikit-learn", "Pandas", "Streamlit" ],
    githubUrl: "https://github.com/ML-CoderX/Laptop-price-predictor",
    liveUrl: "https://laptop-price-predictor-v64x.onrender.com/",
  },
];

const ProjectsSection = () => (
  <SectionBlock id="projects" title="Projects">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div
          key={project.title}
          onMouseEnter={playHover}
          className="group relative border-2 border-black p-5 flex flex-col justify-between hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300 bg-white"
        >
          {"isNew" in project && project.isNew && (
            <div className="absolute -top-3 -right-3 bg-black text-white px-2 py-1 text-[10px] font-black uppercase tracking-tighter border-2 border-black z-10 rotate-12">
              LATEST WORK
            </div>
          )}
          <div>
            <h3 className="text-xl font-black text-foreground group-hover:underline decoration-4 underline-offset-4">
              {project.title}
            </h3>
            <p className="body-text mt-4 text-sm font-normal">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="font-mono text-[10px] font-bold border border-black/10 px-1.5 py-0"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-black/10">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClick}
              className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-black bg-white text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-black hover:text-white"
            >
              <Github className="w-3.5 h-3.5" />
              Source
            </a>
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playClick}
              className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-black bg-white text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-black hover:text-white"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Demo
            </a>
          </div>
        </div>
      ))}
    </div>
  </SectionBlock>
);

export default ProjectsSection;
