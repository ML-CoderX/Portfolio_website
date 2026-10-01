import SectionBlock from "./SectionBlock";
import GithubGraph from "./GithubGraph";

const skillCategories = [
  {
  title: "Frontend",
  skills: [
    "Angular",
    "Ionic Framework",
    "JavaScript",
    "HTML",
    "CSS",
  ],
},
{
  title: "Backend",
  skills: [
    "Node.js",
    "Express.js",
    "REST APIs",
  ],
},
{
  title: "AI / Machine Learning",
  skills: [
    "Python",
    "Pandas",
    "NumPy",
    "Scikit-learn",
    "Data Analysis",
    "Model Training",
  ],
},
{
  title: "Database",
  skills: [
    "MySQL",
    "PostgreSQL",
  ],
},
{
  title: "Hardware / IoT",
  skills: [
    "Arduino",
    "Arduino Nano",
    "Sensor Integration",
    "Bluetooth Communication",
  ],
},
{
  title: "Tools",
  skills: [
    "Git",
    "GitHub",
    "VS Code",
  ],
},
];

const SkillsSection = () => (
  <SectionBlock id="skills" title="Technical Skills">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {skillCategories.map((category, idx) => (
        <div
          key={category.title}
          className="group opacity-0 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards"
          style={{
            animationDelay: `${idx * 100}ms`,
            animationDuration: "600ms",
            animationFillMode: "forwards",
          }}
        >
          <div className="flex flex-col h-full border-t-2 border-white/20 pt-4">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] mb-6 text-foreground/40 group-hover:text-foreground transition-colors duration-300">
              {category.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 border border-white/10 bg-card/60 backdrop-blur-sm text-xs font-medium hover:border-white hover:bg-white hover:text-black transition-all duration-300 cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="w-full pt-12 border-t border-white/10">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-foreground/40">
            Activity Graph
          </h3>
          <div className="h-[1px] flex-1 bg-white/10 mx-6"></div>
        </div>
        <GithubGraph />
      </div>
    </div>
  </SectionBlock>
);

export default SkillsSection;
