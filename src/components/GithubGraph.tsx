import React from "react";
import { GitHubCalendar } from "react-github-calendar";

const GithubGraph = () => {
  return (
    <div className="border-2 border-white/20 p-4 bg-card/85 backdrop-blur-md text-white hover:border-white hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.15)] transition-all duration-300">
      <h3 className="font-mono text-xl font-bold mb-4 border-b border-white/10 pb-2 uppercase tracking-tighter">
        GitHub Activity_
      </h3>
      <div className="flex justify-center overflow-x-auto pb-2">
        <GitHubCalendar
          username="ML-CoderX"
          colorScheme="dark"
          style={{
            fontFamily: "monospace",
          }}
          theme={{
            dark: ["#0f172a", "#0e3a5a", "#0284c7", "#38bdf8", "#7dd3fc"],
          }}
          blockSize={12}
          blockMargin={4}
          fontSize={12}
        />
      </div>
      <div className="mt-2 text-right font-mono text-xs text-white/40">
        // contribs over last year
      </div>
    </div>
  );
};

export default GithubGraph;
