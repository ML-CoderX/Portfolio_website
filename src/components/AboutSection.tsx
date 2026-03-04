import SectionBlock from "./SectionBlock";
import AnimatedAvatar from "./AnimatedAvatar";
import { BookOpen } from "lucide-react";

const AboutSection = () => (
  <SectionBlock id="about" title="About me">
    <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
      <AnimatedAvatar />
      <div className="flex-1">
        <p className="body-text max-w-2xl">
          I'm Saad Beary, a Computer Science student and developer passionate
          about building practical technology solutions. I enjoy turning ideas
          into real products using modern web technologies and intelligent
          systems.
        </p>
        <p className="body-text max-w-2xl mt-6">
          My work focuses on AI and machine learning, full-stack application
          development, and mobile apps using Angular, Ionic, and Node.js.
          I enjoy building systems that are not only functional but also clean,
          efficient, and scalable.
        </p>
        <p className="body-text max-w-2xl mt-6 mb-8">
          I’m especially interested in creating technology that solves real
          problems in areas like healthcare, productivity, and education,
          combining AI, data, and software engineering to build meaningful
          tools.
        </p>
      </div>
    </div>
  </SectionBlock>
);

export default AboutSection;