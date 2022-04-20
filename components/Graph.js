import dynamic from 'next/dynamic';
import React from "react";

const Graphviz = dynamic(() => import('graphviz-react'), { ssr: false });

// Renders a graphviz graph
export default function GraphvizPage({data}) {
  if (data.length === 0) {
    data = "digraph {node [style=\"filled\"] NOTFOUND [fillcolor=\"#d62728\"]}";
  }

  return (
    <Graphviz
     dot={data}
     options = {{
       width: "100%",
       height: "80%"}}
    />
  )
}
