import SectionBlock from "./SectionBlock";

const education = [
  {
    degree:
      "Bachelor in Computer Science and Engineering (B.Tech)",
    college: "Anjuman Institute of Technology and Management, Bhatkal",
    year: "2024 – 2028(Pursuing)",
  },
  {
    degree:
      "Pre University Course (PCMC)",
    school: "Green Valley international school and junior college, Shiroor",
    year: "2022 – 2024",
  },
];

const EducationSection = () => (
  <SectionBlock id="education" title="Education">
    <div className="space-y-10">
      {education.map((item) => (
        <div
          key={item.degree}
          className="border-l-2 border-black/10 pl-6 py-2 hover:border-black transition-colors duration-300"
        >
          <h3 className="text-lg md:text-xl font-bold text-foreground">
            {item.degree}
          </h3>
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mt-2">
            <span className="text-foreground font-medium">{item.school}</span>
            <span className="hidden md:inline text-foreground/20">•</span>
            <span className="font-mono text-sm text-foreground/60">
              {item.year}
            </span>
          </div>
        </div>
      ))}
    </div>
  </SectionBlock>
);

export default EducationSection;
